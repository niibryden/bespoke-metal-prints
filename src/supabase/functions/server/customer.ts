import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { S3Client, GetObjectCommand } from 'npm:@aws-sdk/client-s3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner';

const customerApp = new Hono();

// Helper: Generate signed URLs for S3 images
async function generateSignedUrl(s3Url: string | null | undefined): Promise<string> {
  try {
    // Handle null/undefined URLs
    if (!s3Url) {
      console.warn('generateSignedUrl: URL is null or undefined');
      return '';
    }
    
    // Extract the S3 key from the URL
    // Format: https://bucket.s3.region.amazonaws.com/key
    const urlMatch = s3Url.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/(.+)/);
    if (!urlMatch) {
      // Not an S3 URL, return as-is (might be admin photo or other source)
      return s3Url;
    }
    
    const [, bucket, region, key] = urlMatch;
    
    // Get AWS credentials
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials not configured');
      return s3Url; // Return original URL as fallback
    }
    
    // Create S3 client
    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    
    // Generate signed URL (expires in 1 hour)
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: decodeURIComponent(key),
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return s3Url || ''; // Return original URL as fallback
  }
}

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
    
    // Map to the format expected by the frontend and generate signed URLs for marketplace photos
    const formattedCollections = await Promise.all(
      collections.map(async (col: any) => {
        // Generate signed URLs for all photos in the collection
        const photosWithSignedUrls = await Promise.all(
          (col.images || []).map(async (img: any) => {
            // Check if this is a marketplace photo (has S3 URL pattern)
            const url = img.url || img.originalUrl || '';
            const isS3Url = url.includes('.s3.') && url.includes('.amazonaws.com');
            
            // Generate signed URL for S3 photos (marketplace photos)
            const signedUrl = isS3Url ? await generateSignedUrl(url) : url;
            
            return {
              id: img.id,
              url: signedUrl, // Use signed URL for marketplace photos
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
            };
          })
        );
        
        return {
          id: col.id || col.name, // Use name as fallback ID for backward compatibility
          title: col.name,
          description: col.description || '',
          hidden: col.hidden || false,
          photos: photosWithSignedUrls,
        };
      })
    );
    
    const totalPhotos = formattedCollections.reduce((sum: number, col: any) => sum + col.photos.length, 0);
    console.log(`📷 Returning ${formattedCollections.length} collections with ${totalPhotos} total photos (with signed URLs)`);
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

// Sign up route - creates new customer account
customerApp.post('/make-server-3e3a9cd7/signup', async (c) => {
  try {
    console.log('📝 POST /signup called');
    
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }
    
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Create the user account
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });
    
    if (error) {
      console.error('❌ Failed to create user:', error);
      return c.json({ error: error.message }, 400);
    }
    
    console.log('✅ User created successfully:', data.user?.id);
    
    // Sign in the user to get access token
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.error('❌ Failed to sign in new user:', signInError);
      // User was created but auto-signin failed - that's ok, they can manually sign in
      return c.json({ 
        success: true,
        message: 'Account created successfully. Please sign in.',
        userId: data.user?.id
      });
    }
    
    console.log('✅ User signed in successfully');
    
    // Return the access token so frontend can set the session
    return c.json({
      success: true,
      access_token: sessionData.session?.access_token,
      refresh_token: sessionData.session?.refresh_token,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      }
    });
  } catch (error: any) {
    console.error('❌ Signup error:', error);
    return c.json({ error: error.message || 'Failed to create account' }, 500);
  }
});

export default customerApp;