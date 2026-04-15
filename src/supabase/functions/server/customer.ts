import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const customerApp = new Hono();

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
  }
  return supabaseAdmin;
}

// Middleware to verify user authentication
async function verifyUser(c: any) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return { error: 'No authorization token provided', status: 401 };
  }
  
  const accessToken = authHeader.split(' ')[1];
  
  if (!accessToken) {
    return { error: 'No authorization token provided', status: 401 };
  }
  
  // Check if the token is the anon key (not a user token)
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (accessToken === anonKey) {
    console.error('Auth error: Anon key provided instead of user access token');
    return { error: 'Invalid authorization token - user access token required', status: 401 };
  }
  
  const supabase = getSupabaseAdmin();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.error('Auth error:', error?.message || 'No user found');
      return { error: 'Invalid or expired authorization token', status: 401 };
    }
    
    return { user };
  } catch (error: any) {
    console.error('Auth exception:', error?.message || error);
    return { error: 'Authorization failed', status: 401 };
  }
}

// Get customer profile data
customerApp.get('/make-server-3e3a9cd7/customer/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const verification = await verifyUser(c);
    
    if (verification.error) {
      return c.json({ error: verification.error }, verification.status);
    }
    
    // Ensure user can only access their own data
    if (verification.user.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    // Get user's saved addresses
    const addresses = await kv.getByPrefix(`customer:${userId}:address:`);
    
    // Get user's orders using customer-specific index (avoids loading all orders)
    const userOrderIds = await kv.get(`customer:${userId}:orders`) || [];
    const userOrders = [];
    
    // Load only the user's orders individually (max 50 most recent)
    const recentOrderIds = userOrderIds.slice(0, 50);
    for (const orderId of recentOrderIds) {
      try {
        const order = await kv.get(`order:${orderId}`);
        if (order) {
          // Remove image data to reduce payload size
          if (order.orderDetails?.image?.data) {
            order.orderDetails.image.data = '[REDACTED]';
          }
          userOrders.push(order);
        }
      } catch (err) {
        console.error(`Failed to load order ${orderId}:`, err);
      }
    }
    
    return c.json({
      userId: userId,
      email: verification.user.email,
      savedAddresses: addresses || [],
      orders: userOrders,
    });
  } catch (error: any) {
    console.error('Error fetching customer data:', error);
    return c.json({ error: 'Failed to fetch customer data', details: error.message }, 500);
  }
});

// Link an order to a customer account (for guest checkout -> login)
customerApp.post('/make-server-3e3a9cd7/customer/:userId/order', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { orderId } = await c.req.json();
    const verification = await verifyUser(c);
    
    if (verification.error) {
      return c.json({ error: verification.error }, verification.status);
    }
    
    // Ensure user can only access their own data
    if (verification.user.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    if (!orderId) {
      return c.json({ error: 'Order ID is required' }, 400);
    }
    
    // Get the order
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    // Verify the order belongs to this user (by email match)
    if (order.customerEmail !== verification.user.email) {
      return c.json({ error: 'This order does not belong to you' }, 403);
    }
    
    // Link the order to the user account
    order.userId = userId;
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    console.log(`✅ Linked order ${orderId} to user ${userId}`);
    
    return c.json({ success: true, message: 'Order linked to account' });
  } catch (error: any) {
    console.error('Error linking order:', error);
    return c.json({ error: 'Failed to link order', details: error.message }, 500);
  }
});

// Get all addresses for a customer
customerApp.get('/make-server-3e3a9cd7/customer/:userId/address', async (c) => {
  try {
    const userId = c.req.param('userId');
    const verification = await verifyUser(c);
    
    if (verification.error) {
      return c.json({ error: verification.error }, verification.status);
    }
    
    // Ensure user can only access their own addresses
    if (verification.user.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const addresses = await kv.getByPrefix(`customer:${userId}:address:`);
    return c.json(addresses || []);
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return c.json({ error: 'Failed to fetch addresses', details: error.message }, 500);
  }
});

// Get all orders for a customer
customerApp.get('/make-server-3e3a9cd7/customer/:userId/orders', async (c) => {
  try {
    const userId = c.req.param('userId');
    const verification = await verifyUser(c);
    
    if (verification.error) {
      return c.json({ error: verification.error }, verification.status);
    }
    
    // Ensure user can only access their own orders
    if (verification.user.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    // Get user's orders using customer-specific index (avoids loading all orders)
    const userOrderIds = await kv.get(`customer:${userId}:orders`) || [];
    const customerOrders = [];
    
    // Load only the user's orders individually (max 50 most recent)
    const recentOrderIds = userOrderIds.slice(0, 50);
    for (const orderId of recentOrderIds) {
      try {
        const order = await kv.get(`order:${orderId}`);
        if (order && order.customerEmail === verification.user.email) {
          // Remove image data to reduce payload size
          if (order.orderDetails?.image?.data) {
            order.orderDetails.image.data = '[REDACTED]';
          }
          customerOrders.push(order);
        }
      } catch (err) {
        console.error(`Failed to load order ${orderId}:`, err);
      }
    }
    
    // Sort by creation date (newest first)
    customerOrders.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`✅ Found ${customerOrders.length} orders for user ${userId}`);
    return c.json(customerOrders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders', details: error.message }, 500);
  }
});

// Create a new address
customerApp.post('/make-server-3e3a9cd7/customer/:userId/address', async (c) => {
  try {
    const userId = c.req.param('userId');
    const verification = await verifyUser(c);
    
    if (verification.error) {
      return c.json({ error: verification.error }, verification.status);
    }
    
    // Ensure user can only create addresses for themselves
    if (verification.user.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const addressData = await c.req.json();
    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // If this address is set as default, unset all other default addresses
    if (addressData.isDefault) {
      const allAddresses = await kv.getByPrefix(`customer:${userId}:address:`);
      for (const addr of allAddresses) {
        if (addr.isDefault) {
          addr.isDefault = false;
          addr.updatedAt = new Date().toISOString();
          await kv.set(`customer:${userId}:address:${addr.id}`, addr);
        }
      }
    }
    
    const address = {
      id: addressId,
      ...addressData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`customer:${userId}:address:${addressId}`, address);
    
    console.log(`✅ Created address ${addressId} for user ${userId}`);
    return c.json(address);
  } catch (error: any) {
    console.error('Error creating address:', error);
    return c.json({ error: 'Failed to create address', details: error.message }, 500);
  }
});

// Update an address
customerApp.put('/make-server-3e3a9cd7/customer/:userId/address/:addressId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const addressId = c.req.param('addressId');
    const verification = await verifyUser(c);
    
    if (verification.error) {
      return c.json({ error: verification.error }, verification.status);
    }
    
    // Ensure user can only update their own addresses
    if (verification.user.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const existingAddress = await kv.get(`customer:${userId}:address:${addressId}`);
    
    if (!existingAddress) {
      return c.json({ error: 'Address not found' }, 404);
    }
    
    const addressData = await c.req.json();
    
    // If this address is being set as default, unset all other default addresses
    if (addressData.isDefault && !existingAddress.isDefault) {
      const allAddresses = await kv.getByPrefix(`customer:${userId}:address:`);
      for (const addr of allAddresses) {
        if (addr.id !== addressId && addr.isDefault) {
          addr.isDefault = false;
          addr.updatedAt = new Date().toISOString();
          await kv.set(`customer:${userId}:address:${addr.id}`, addr);
        }
      }
    }
    
    const updatedAddress = {
      ...existingAddress,
      ...addressData,
      id: addressId,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`customer:${userId}:address:${addressId}`, updatedAddress);
    
    console.log(`✅ Updated address ${addressId} for user ${userId}`);
    return c.json(updatedAddress);
  } catch (error: any) {
    console.error('Error updating address:', error);
    return c.json({ error: 'Failed to update address', details: error.message }, 500);
  }
});

// Delete an address
customerApp.delete('/make-server-3e3a9cd7/customer/:userId/address/:addressId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const addressId = c.req.param('addressId');
    const verification = await verifyUser(c);
    
    if (verification.error) {
      return c.json({ error: verification.error }, verification.status);
    }
    
    // Ensure user can only delete their own addresses
    if (verification.user.id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const existingAddress = await kv.get(`customer:${userId}:address:${addressId}`);
    
    if (!existingAddress) {
      return c.json({ error: 'Address not found' }, 404);
    }
    
    await kv.del(`customer:${userId}:address:${addressId}`);
    
    console.log(`✅ Deleted address ${addressId} for user ${userId}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return c.json({ error: 'Failed to delete address', details: error.message }, 500);
  }
});

// Get tracking info by order ID
customerApp.get('/make-server-3e3a9cd7/order/:orderId/tracking', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    console.log(`📦 Fetching tracking for order: ${orderId}`);
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ 
        error: 'Order not found',
        details: 'This order ID was not found in our system.'
      }, 404);
    }
    
    return c.json({
      success: true,
      orderId: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber || null,
      trackingCarrier: order.trackingCarrier || null,
      trackingUrl: order.trackingUrl || null,
      shippedAt: order.shippedAt || null,
      deliveredAt: order.deliveredAt || null,
      shippingAddress: order.shippingAddress || null,
      message: order.trackingNumber ? null : 'Your order is being prepared and will ship soon!'
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return c.json({ error: 'Failed to fetch tracking information' }, 500);
  }
});

// Get tracking info by tracking number
customerApp.get('/make-server-3e3a9cd7/tracking/:trackingNumber', async (c) => {
  try {
    const trackingNumber = c.req.param('trackingNumber');
    console.log(`📦 Looking up tracking number: ${trackingNumber}`);
    
    // Check if it's an order ID
    if (trackingNumber.startsWith('ord_') || trackingNumber.startsWith('order_')) {
      const order = await kv.get(`order:${trackingNumber}`);
      
      if (!order) {
        return c.json({ 
          error: 'Order not found',
          details: 'This order ID was not found in our system.'
        }, 404);
      }
      
      return c.json({
        success: true,
        orderId: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber || null,
        trackingCarrier: order.trackingCarrier || null,
        trackingUrl: order.trackingUrl || null,
        shippedAt: order.shippedAt || null,
        deliveredAt: order.deliveredAt || null,
        shippingAddress: order.shippingAddress || null,
        message: order.trackingNumber ? null : 'Your order is being prepared and will ship soon!'
      });
    }
    
    // Look up by tracking number
    let trackingIndex = await kv.get(`tracking:${trackingNumber}`);
    
    // Fallback: Search orders directly
    if (!trackingIndex?.orderId) {
      console.log(`⚠️ Tracking index not found, searching orders...`);
      
      const supabase = getSupabaseAdmin();
      const { data: orderData } = await supabase
        .from("kv_store_3e3a9cd7")
        .select("key, value")
        .like("key", "order:%")
        .limit(500);
      
      if (orderData) {
        for (const item of orderData) {
          const order = item.value;
          if (order.trackingNumber === trackingNumber) {
            trackingIndex = { orderId: order.id };
            
            // Create missing index
            try {
              await kv.set(`tracking:${trackingNumber}`, {
                orderId: order.id,
                createdAt: new Date().toISOString()
              });
            } catch (e) {
              console.warn('Failed to create tracking index:', e);
            }
            break;
          }
        }
      }
      
      if (!trackingIndex?.orderId) {
        return c.json({ 
          error: 'Tracking number not found',
          details: 'This tracking number was not found in our system.'
        }, 404);
      }
    }
    
    const order = await kv.get(`order:${trackingIndex.orderId}`);
    
    if (!order) {
      return c.json({ 
        error: 'Order not found',
        details: 'We found this tracking number but the order could not be loaded.'
      }, 404);
    }
    
    return c.json({
      success: true,
      orderId: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      trackingCarrier: order.trackingCarrier || null,
      trackingUrl: order.trackingUrl || null,
      shippedAt: order.shippedAt || null,
      deliveredAt: order.deliveredAt || null,
      shippingAddress: order.shippingAddress || null,
    });
  } catch (error: any) {
    console.error('Error looking up tracking number:', error);
    return c.json({ 
      error: 'Failed to fetch tracking information',
      details: error.message
    }, 500);
  }
});

// Get live tracking from EasyPost
customerApp.get('/make-server-3e3a9cd7/tracking/:trackingNumber/live', async (c) => {
  try {
    const trackingNumber = c.req.param('trackingNumber');
    const easypostApiKey = Deno.env.get('EASYPOST_API_KEY');
    
    if (!easypostApiKey) {
      return c.json({ 
        error: 'EasyPost API key not configured',
        details: 'Live tracking is not available at this time.'
      }, 500);
    }
    
    console.log(`📦 Fetching live tracking from EasyPost for: ${trackingNumber}`);
    
    // Fetch tracking info from EasyPost
    const response = await fetch(`https://api.easypost.com/v2/trackers?tracking_code=${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${easypostApiKey}`,
      },
    });
    
    if (!response.ok) {
      console.error(`EasyPost API error: ${response.status}`);
      return c.json({ 
        error: 'Failed to fetch live tracking',
        details: 'The tracking service is temporarily unavailable.'
      }, response.status);
    }
    
    const data = await response.json();
    
    return c.json({
      success: true,
      tracking: data
    });
  } catch (error: any) {
    console.error('Error fetching live tracking:', error);
    return c.json({ 
      error: 'Failed to fetch live tracking',
      details: error.message
    }, 500);
  }
});

// Track orders by email (public endpoint - for guest checkout)
customerApp.post('/make-server-3e3a9cd7/tracking/by-email', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email || !email.includes('@')) {
      return c.json({ 
        error: 'Valid email address is required'
      }, 400);
    }
    
    console.log(`📧 Looking up orders for email: ${email}`);
    
    // Search for all orders with this email
    const supabase = getSupabaseAdmin();
    const { data: orderData } = await supabase
      .from("kv_store_3e3a9cd7")
      .select("key, value")
      .like("key", "order:%")
      .limit(1000);
    
    if (!orderData || orderData.length === 0) {
      return c.json({ 
        error: 'No orders found',
        details: 'No orders found for this email address.'
      }, 404);
    }
    
    // Filter orders by email and sort by date (newest first)
    const matchingOrders = orderData
      .map(item => item.value)
      .filter(order => order.customerEmail?.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(order => ({
        orderId: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber || null,
        trackingCarrier: order.trackingCarrier || null,
        trackingUrl: order.trackingUrl || null,
        shippedAt: order.shippedAt || null,
        deliveredAt: order.deliveredAt || null,
        createdAt: order.createdAt,
        amount: order.amount,
        shippingAddress: order.shippingAddress || null,
        orderDetails: {
          finish: order.orderDetails?.finish,
          size: order.orderDetails?.size,
          mountType: order.orderDetails?.mountType,
          frame: order.orderDetails?.frame,
        }
      }));
    
    if (matchingOrders.length === 0) {
      return c.json({ 
        error: 'No orders found',
        details: 'No orders found for this email address.'
      }, 404);
    }
    
    console.log(`✅ Found ${matchingOrders.length} orders for ${email}`);
    
    return c.json({
      success: true,
      orders: matchingOrders,
      count: matchingOrders.length
    });
  } catch (error: any) {
    console.error('❌ Error looking up orders by email:', error);
    return c.json({ 
      error: 'Failed to fetch orders',
      details: error.message
    }, 500);
  }
});

// Get all stock photo collections (public endpoint)
customerApp.get('/make-server-3e3a9cd7/collections', async (c) => {
  try {
    console.log('📷 Fetching stock photo collections...');
    
    // Use the unified stock:collections key (supports both stock photos and marketplace photos)
    const collections = await kv.get('stock:collections') || [];
    
    console.log(`📷 Found ${collections.length} collections from unified system`);
    
    // Map to the format expected by the frontend
    const formattedCollections = collections.map((col: any) => ({
      id: col.id || col.name, // Use name as fallback ID for backward compatibility
      title: col.name,
      description: col.description || '',
      hidden: col.hidden || false,
      photos: (col.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        originalUrl: img.originalUrl || img.url,
        s3Key: img.s3Key || '',
        fileName: img.name || img.title || '',
        uploadDate: img.uploadedAt || img.uploadDate || new Date().toISOString(),
        // Preserve marketplace metadata
        photographerId: img.photographerId,
        photographerName: img.photographerName,
        isMarketplacePhoto: img.isMarketplacePhoto || false,
        royaltyRate: img.royaltyRate,
        title: img.title || img.name || '',
        description: img.description || '',
        tags: img.tags || [],
      })),
    }));
    
    console.log(`📷 Returning ${formattedCollections.length} collections with ${formattedCollections.reduce((sum: number, col: any) => sum + col.photos.length, 0)} total photos`);
    return c.json(formattedCollections);
  } catch (error: any) {
    console.error('❌ Error fetching collections:', error);
    return c.json({ 
      error: 'Failed to fetch collections',
      details: error.message
    }, 500);
  }
});

// Get photos from a specific collection (public endpoint)
customerApp.get('/make-server-3e3a9cd7/stock-photos/:collectionName', async (c) => {
  try {
    const collectionName = c.req.param('collectionName');
    console.log(`📸 Fetching photos for collection: "${collectionName}"`);
    
    const collections = await kv.get('stock:collections') || [];
    
    // Find the requested collection
    const collection = collections.find((col: any) => col.name === collectionName);
    
    if (!collection) {
      console.log(`❌ Collection not found: "${collectionName}"`);
      return c.json({ error: 'Collection not found' }, 404);
    }
    
    console.log(`✅ Found collection with ${collection.images?.length || 0} images`);
    
    // Map images to photos format expected by frontend
    const photos = (collection.images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      originalUrl: img.originalUrl || img.url,
      s3Key: img.s3Key || '',
      fileName: img.name || img.title || '',
      uploadDate: img.uploadedAt || img.uploadDate || new Date().toISOString(),
      photographerId: img.photographerId,
      photographerName: img.photographerName,
      isMarketplacePhoto: img.isMarketplacePhoto || false,
      royaltyRate: img.royaltyRate,
      title: img.title || img.name || '',
      description: img.description || '',
      tags: img.tags || [],
    }));
    
    console.log(`📷 Returning ${photos.length} photos from collection "${collectionName}"`);
    return c.json({ photos });
  } catch (error: any) {
    console.error('❌ Failed to fetch photos for collection:', error);
    return c.json({ 
      error: 'Failed to fetch photos',
      details: error.message
    }, 500);
  }
});

export default customerApp;