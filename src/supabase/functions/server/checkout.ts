import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { ORIGIN_ADDRESS, getShippingSpec, calculateCustomShipping, toEasyPostParcel, filterRates, sortRates } from './shipping-config.ts';

const checkoutApp = new Hono();

// Lazy-load Stripe
let stripeInstance: any = null;

async function getStripe() {
  if (!stripeInstance) {
    const Stripe = (await import('npm:stripe@17.4.0')).default;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe not configured');
    }
    stripeInstance = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  }
  return stripeInstance;
}

// Helper: Update order index (lightweight metadata only)
async function updateOrderIndex(order: any) {
  try {
    const index = await kv.get('order-index') || [];
    
    const orderMeta = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || `${order.shippingAddress?.name}`,
      customerEmail: order.customerEmail,
      status: order.status,
      amount: order.amount || order.total || 0,  // Use 'amount' for consistency
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      paymentIntentId: order.paymentIntentId,
      trackingNumber: order.trackingNumber,
    };
    
    // Remove old entry if exists
    const filtered = index.filter((o: any) => o.id !== orderMeta.id);
    
    // Add new entry at beginning
    filtered.unshift(orderMeta);
    
    // Keep only last 500 orders in index
    const trimmed = filtered.slice(0, 500);
    
    await kv.set('order-index', trimmed);
  } catch (error) {
    console.error('Error updating order index:', error);
    // Don't fail the request if index update fails
  }
}

// Get shipping rates from EasyPost
checkoutApp.post('/make-server-3e3a9cd7/checkout/shipping-rates', async (c) => {
  try {
    const { shippingAddress, size } = await c.req.json();
    
    if (!shippingAddress || !size) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get shipping specifications
    let shippingSpec = getShippingSpec(size);
    
    if (!shippingSpec) {
      // Parse custom size (e.g., "18\" x 24\"")
      const match = size.match(/(\d+).*?x.*?(\d+)/);
      if (match) {
        const width = parseInt(match[1]);
        const height = parseInt(match[2]);
        shippingSpec = calculateCustomShipping(width, height);
      } else {
        return c.json({ error: 'Invalid size format' }, 400);
      }
    }

    const parcel = toEasyPostParcel(shippingSpec);
    
    const apiKey = Deno.env.get('EASYPOST_API_KEY');
    if (!apiKey) {
      throw new Error('EasyPost not configured');
    }
    
    // Log API key format for debugging (without exposing the full key)
    console.log('🔑 EasyPost API Key format check:');
    console.log('   - Key length:', apiKey.length);
    console.log('   - Key prefix:', apiKey.substring(0, 7) + '...');
    console.log('   - Is test key:', apiKey.startsWith('EZTEST'));
    console.log('   - Is prod key:', apiKey.startsWith('EZAK'));

    // Create shipment to get rates
    const response = await fetch('https://api.easypost.com/v2/shipments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shipment: {
          to_address: {
            name: shippingAddress.name,
            street1: shippingAddress.street1,
            street2: shippingAddress.street2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zip,
            country: shippingAddress.country || 'US',
          },
          from_address: ORIGIN_ADDRESS,
          parcel: parcel,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ EasyPost API Error (Status:', response.status, ')');
      console.error('❌ EasyPost Error Response:', errorText);
      
      // Try to parse the error response
      let errorMessage = 'Failed to get shipping rates';
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Parsed EasyPost Error:', errorData);
        
        // Extract the actual error message from EasyPost
        if (errorData.error) {
          if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
        }
        
        // Provide more helpful error messages for common issues
        if (errorMessage.includes('Job Not Found') || errorMessage.includes('API key')) {
          errorMessage = 'Shipping service temporarily unavailable. Please contact support if this persists.';
          console.error('🚨 EASYPOST API KEY ISSUE - Check environment variable EASYPOST_API_KEY');
        }
      } catch (parseError) {
        console.error('Could not parse EasyPost error:', parseError);
        errorMessage = `Shipping service error: ${errorText.substring(0, 100)}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Filter and sort rates (USPS Priority only)
    let rates = data.rates || [];
    rates = filterRates(rates);
    rates = sortRates(rates);

    console.log(`✅ Got ${rates.length} shipping rates`);

    return c.json({
      success: true,
      rates: rates.map((rate: any) => ({
        id: rate.id,
        service: rate.service,
        carrier: rate.carrier,
        rate: rate.rate,
        delivery_days: rate.delivery_days,
        delivery_date: rate.delivery_date,
      })),
      shipmentId: data.id,
    });

  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return c.json({ error: error.message || 'Failed to get shipping rates' }, 500);
  }
});

// Validate discount code
checkoutApp.post('/make-server-3e3a9cd7/checkout/validate-discount', async (c) => {
  try {
    const { code } = await c.req.json();
    
    if (!code) {
      return c.json({ error: 'Discount code is required' }, 400);
    }

    const discountCode = await kv.get(`discount:${code.toUpperCase()}`);
    
    if (!discountCode) {
      return c.json({ valid: false, error: 'Invalid discount code' }, 404);
    }

    if (!discountCode.active) {
      return c.json({ valid: false, error: 'This discount code has expired' }, 400);
    }

    return c.json({
      valid: true,
      discount: {
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
      },
    });

  } catch (error) {
    console.error('Error validating discount:', error);
    return c.json({ error: 'Failed to validate discount code' }, 500);
  }
});

// Create Stripe payment intent (for Payment Elements)
checkoutApp.post('/make-server-3e3a9cd7/create-payment-intent', async (c) => {
  try {
    const { amount, currency = 'usd', metadata, userId, customerEmail, customerName, customerPhone } = await c.req.json();
    
    if (!amount) {
      return c.json({ error: 'Amount is required' }, 400);
    }

    const stripe = await getStripe();

    // Build shipping details if we have customer name and address info from metadata
    const shipping = (customerName && metadata?.address) ? {
      name: customerName,
      address: {
        line1: metadata.address.line1 || metadata.address.address1 || '',
        line2: metadata.address.line2 || metadata.address.address2 || '',
        city: metadata.address.city || '',
        state: metadata.address.state || '',
        postal_code: metadata.address.zip || metadata.address.postal_code || '',
        country: metadata.address.country || 'US',
      },
      phone: customerPhone || undefined,
    } : undefined;

    // Convert metadata to string values (Stripe only accepts strings)
    const stripeMetadata: Record<string, string> = {};
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        if (value !== null && value !== undefined) {
          // If it's an object (like address), convert to JSON string
          if (typeof value === 'object') {
            stripeMetadata[key] = JSON.stringify(value);
          } else {
            // Otherwise, convert to string
            stripeMetadata[key] = String(value);
          }
        }
      }
    }

    // Create payment intent with customer information
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: stripeMetadata,
      receipt_email: customerEmail,
      shipping: shipping,
      // Include customer name and phone in description for better Stripe dashboard UX
      description: customerName 
        ? `Order from ${customerName}${customerPhone ? ` (${customerPhone})` : ''}` 
        : `Order from ${customerEmail}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`✅ Created payment intent: ${paymentIntent.id} for customer: ${customerName || customerEmail}`);

    return c.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return c.json({ error: error.message || 'Failed to create payment intent' }, 500);
  }
});

// Create order (separate from payment intent)
checkoutApp.post('/make-server-3e3a9cd7/create-order', async (c) => {
  try {
    const {
      orderId, // Now accepts predefined order ID from frontend
      paymentIntentId,
      customerEmail,
      shippingAddress,
      orderDetails,
      amount,
      basePrice,
      shippingRate,
      shipmentId,
      discount,
      smsConsent, // Add SMS consent
      imageUrl, // Print-ready image URL (already uploaded to S3)
    } = await c.req.json();

    if (!paymentIntentId || !customerEmail) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Use provided order ID or generate new one
    const finalOrderId = orderId || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Extract SMS phone number if consent given
    const smsPhone = (smsConsent && shippingAddress?.phone) ? shippingAddress.phone : null;

    // Create order record
    const order = {
      id: finalOrderId,
      paymentIntentId: paymentIntentId,
      customerEmail: customerEmail,
      shippingAddress: shippingAddress,
      orderDetails: {
        ...orderDetails,
        imageUrl: imageUrl || null, // Store image URL in orderDetails for admin panel
        image: imageUrl || null, // Also store in 'image' field for backward compatibility
      },
      amount: amount,
      basePrice: basePrice,
      shippingRate: shippingRate,
      shipmentId: shipmentId,
      discount: discount || null,
      smsConsent: smsConsent || false, // Save SMS consent preference
      smsPhone: smsPhone, // Save phone number for SMS (only if consent given)
      imageUrl: imageUrl || null, // Also store at root level for webhook compatibility
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order:${finalOrderId}`, order);
    
    // Create index for payment intent -> order lookup
    await kv.set(`payment-intent:${paymentIntentId}`, { orderId: finalOrderId });
    
    // Update order index
    await updateOrderIndex(order);
    
    // Log SMS consent status
    if (smsConsent && smsPhone) {
      console.log(`📱 SMS consent granted for order ${finalOrderId}: ${smsPhone}`);
    } else {
      console.log(`📵 No SMS consent for order ${finalOrderId}`);
    }
    
    // Log image upload status
    if (imageUrl) {
      console.log(`🖼️ Print-ready image stored for order ${finalOrderId}: ${imageUrl.substring(0, 80)}...`);
    } else {
      console.warn(`⚠️ No print-ready image URL for order ${finalOrderId}`);
    }
    
    console.log(`✅ Created order: ${finalOrderId} for payment intent: ${paymentIntentId}`);

    return c.json({
      success: true,
      orderId: finalOrderId,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ error: error.message || 'Failed to create order' }, 500);
  }
});

// Create Stripe checkout session
checkoutApp.post('/make-server-3e3a9cd7/checkout/create-session', async (c) => {
  try {
    const {
      amount,
      basePrice,
      customerEmail,
      shippingAddress,
      orderDetails,
      shippingRate,
      shipmentId,
      discount,
    } = await c.req.json();

    const stripe = await getStripe();

    // Create order ID
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${orderDetails.size || 'Custom'} Metal Print`,
              description: `${orderDetails.finish || 'Matte'} finish, ${orderDetails.mountType || 'Stick Tape'} mounting`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${c.req.header('origin') || 'http://localhost:3000'}/confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${c.req.header('origin') || 'http://localhost:3000'}/checkout?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId,
      },
    });

    // Create order record
    const order = {
      id: orderId,
      stripeCheckoutSessionId: session.id,
      paymentIntentId: session.payment_intent,
      customerEmail: customerEmail,
      shippingAddress: shippingAddress,
      orderDetails: orderDetails,
      amount: amount,
      basePrice: basePrice,
      shippingRate: shippingRate,
      shipmentId: shipmentId,
      discount: discount || null,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);
    console.log(`✅ Created order: ${orderId}`);

    return c.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: orderId,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return c.json({ error: error.message || 'Failed to create checkout session' }, 500);
  }
});

// Purchase shipping label
checkoutApp.post('/make-server-3e3a9cd7/checkout/purchase-label', async (c) => {
  try {
    const { orderId, rateId } = await c.req.json();

    if (!orderId || !rateId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const apiKey = Deno.env.get('EASYPOST_API_KEY');
    if (!apiKey) {
      throw new Error('EasyPost not configured');
    }

    // Purchase the shipping label
    const response = await fetch(`https://api.easypost.com/v2/shipments/${order.shipmentId}/buy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rate: { id: rateId },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('EasyPost purchase error:', error);
      throw new Error(`Failed to purchase shipping label: ${error}`);
    }

    const shipment = await response.json();

    // Update order with tracking info
    order.trackingNumber = shipment.tracking_code;
    order.trackingCarrier = shipment.selected_rate?.carrier || 'USPS';
    order.trackingUrl = shipment.tracker?.public_url || `https://tools.usps.com/go/TrackConfirmAction?tLabels=${shipment.tracking_code}`;
    order.labelUrl = shipment.postage_label?.label_url;
    order.updatedAt = new Date().toISOString();

    await kv.set(`order:${orderId}`, order);

    // Create tracking index
    await kv.set(`tracking:${shipment.tracking_code}`, {
      orderId: orderId,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Purchased label for order ${orderId}, tracking: ${shipment.tracking_code}`);

    return c.json({
      success: true,
      trackingNumber: shipment.tracking_code,
      labelUrl: shipment.postage_label?.label_url,
    });

  } catch (error) {
    console.error('Error purchasing shipping label:', error);
    return c.json({ error: error.message || 'Failed to purchase shipping label' }, 500);
  }
});

// Get order by ID
checkoutApp.get('/make-server-3e3a9cd7/checkout/order/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    return c.json({ success: true, order });

  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Update order with image URL after payment
checkoutApp.post('/make-server-3e3a9cd7/update-order', async (c) => {
  try {
    const { orderId, imageUrl } = await c.req.json();

    if (!orderId) {
      return c.json({ error: 'Order ID is required' }, 400);
    }

    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Update order with image URL and image metadata
    if (imageUrl) {
      if (!order.orderDetails) {
        order.orderDetails = {};
      }
      
      order.orderDetails.imageUrl = imageUrl;
      order.orderDetails.image = imageUrl; // Also store in 'image' field for backward compatibility
      order.imageUrl = imageUrl; // Also store at root level for consistency
      order.updatedAt = new Date().toISOString();
      
      console.log(`✅ Updated order ${orderId} with image URL: ${imageUrl.substring(0, 80)}...`);
    }

    await kv.set(`order:${orderId}`, order);
    await updateOrderIndex(order);

    return c.json({ success: true });

  } catch (error) {
    console.error('Error updating order:', error);
    return c.json({ error: error.message || 'Failed to update order' }, 500);
  }
});

// Update order status
checkoutApp.post('/make-server-3e3a9cd7/update-order-status', async (c) => {
  try {
    const { orderId, status, paymentStatus } = await c.req.json();

    if (!orderId || !status) {
      return c.json({ error: 'Order ID and status are required' }, 400);
    }

    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Update order status
    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();
    
    console.log(`✅ Updated order ${orderId} status to: ${status}${paymentStatus ? ` (payment: ${paymentStatus})` : ''}`);

    await kv.set(`order:${orderId}`, order);
    await updateOrderIndex(order);

    return c.json({ success: true });

  } catch (error) {
    console.error('Error updating order status:', error);
    return c.json({ error: error.message || 'Failed to update order status' }, 500);
  }
});

// Upload print-ready image to S3
checkoutApp.post('/make-server-3e3a9cd7/upload-image', async (c) => {
  try {
    const { imageData, fileName } = await c.req.json();
    
    if (!imageData || !fileName) {
      return c.json({ error: 'Missing imageData or fileName' }, 400);
    }

    console.log('📤 Uploading image to S3:', fileName);

    // Get AWS credentials
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const AWS_S3_BUCKET_NAME = Deno.env.get('AWS_S3_BUCKET_NAME');
    const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
      console.error('❌ AWS credentials not configured');
      return c.json({ error: 'AWS S3 not configured' }, 500);
    }

    // Import AWS SDK
    const { S3Client, PutObjectCommand } = await import('npm:@aws-sdk/client-s3@3');

    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: imageBuffer,
      ContentType: 'image/png',
      ACL: 'private', // Private - will use signed URLs
    });

    await s3Client.send(command);

    const imageUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    console.log('✅ Image uploaded successfully:', imageUrl);

    return c.json({ 
      success: true, 
      url: imageUrl 
    });

  } catch (error: any) {
    console.error('❌ Upload image error:', error);
    console.error('Error stack:', error.stack);
    return c.json({ 
      error: 'Failed to upload image to S3', 
      details: error.message,
      errorType: error.name || 'Unknown'
    }, 500);
  }
});

export default checkoutApp;