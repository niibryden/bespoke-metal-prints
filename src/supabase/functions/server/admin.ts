import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { sendShippingNotificationSMS } from './sms-service.ts';

const adminApp = new Hono();

// Enable CORS for admin routes
adminApp.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Admin-Email'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Bootstrap endpoint - Create first admin user (no auth required)
// This endpoint can only create a user if NO admin users exist yet
adminApp.post('/make-server-3e3a9cd7/admin/bootstrap', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    console.log('🚀 Bootstrap: Attempting to create first admin user...');
    
    // Check if any admin users already exist in KV store
    const existingAdmins = await kv.getByPrefix('admin:config:');
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('❌ Bootstrap: Admin users already exist, cannot bootstrap');
      return c.json({ 
        error: 'Admin users already exist. Use the regular login flow or contact support.' 
      }, 403);
    }

    console.log('✅ Bootstrap: No existing admins found, creating first admin...');

    const supabase = getSupabaseAdmin();
    
    // Create the user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'super_admin',
      },
    });
    
    if (error) {
      console.error('❌ Bootstrap: Failed to create admin user in Supabase Auth:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ Bootstrap: User created in Supabase Auth:', data.user.id);

    // Store admin config in KV
    await kv.set(`admin:config:${data.user.id}`, {
      userId: data.user.id,
      email,
      name,
      role: 'super_admin',
      permissions: {
        canViewOrders: true,
        canManageInventory: true,
        canExportData: true,
        canManageAdmins: true,
      },
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Bootstrap: Admin config stored in KV');
    
    return c.json({ 
      success: true, 
      message: 'First admin user created successfully! You can now log in.',
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'super_admin',
      }
    });
  } catch (error: any) {
    console.error('❌ Bootstrap: Failed to create admin user:', error);
    return c.json({ error: 'Failed to create admin user: ' + error.message }, 500);
  }
});

// Diagnostic endpoint - Check admin account status (no auth required for debugging)
adminApp.get('/make-server-3e3a9cd7/admin/diagnostic', async (c) => {
  try {
    console.log('🔍 Diagnostic: Checking admin account status...');
    
    // Check KV store for admin configs
    const kvAdmins = await kv.getByPrefix('admin:config:');
    console.log('📊 KV Store admins found:', kvAdmins?.length || 0);
    
    // Check Supabase Auth for users
    const supabase = getSupabaseAdmin();
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Failed to list Supabase Auth users:', authError);
      return c.json({ 
        error: 'Failed to check Supabase Auth users',
        kvAdmins: kvAdmins?.length || 0,
        kvAdminsList: kvAdmins?.map((admin: any) => ({
          email: admin.email,
          name: admin.name,
          role: admin.role,
          userId: admin.userId,
        })) || []
      }, 500);
    }
    
    console.log('📊 Supabase Auth users found:', authUsers.users?.length || 0);
    
    return c.json({
      success: true,
      summary: {
        kvAdminsCount: kvAdmins?.length || 0,
        authUsersCount: authUsers.users?.length || 0,
      },
      kvAdmins: kvAdmins?.map((admin: any) => ({
        email: admin.email,
        name: admin.name,
        role: admin.role,
        userId: admin.userId,
        createdAt: admin.createdAt,
      })) || [],
      authUsers: authUsers.users?.map((user: any) => ({
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        emailConfirmed: user.email_confirmed_at ? true : false,
        metadata: user.user_metadata,
      })) || [],
    });
  } catch (error: any) {
    console.error('❌ Diagnostic failed:', error);
    return c.json({ error: 'Diagnostic failed: ' + error.message }, 500);
  }
});

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }
  return supabaseAdmin;
}

// Anon client for JWT verification (must match login client)
let supabaseAnon: ReturnType<typeof createClient> | null = null;

function getSupabaseAnon() {
  if (!supabaseAnon) {
    supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
  }
  return supabaseAnon;
}

// Helper: Verify admin authorization
async function verifyAdmin(authHeader: string | undefined): Promise<{ authorized: boolean; user?: any; error?: string }> {
  console.log('🔐 verifyAdmin called');
  console.log('🔐 authHeader:', authHeader ? `Bearer ${authHeader.split(' ')[1]?.substring(0, 20)}...` : 'MISSING');
  
  if (!authHeader) {
    console.error('❌ No Authorization header provided');
    return { authorized: false, error: 'No auth header' };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.error('❌ Invalid Authorization header format');
    return { authorized: false, error: 'Invalid auth header format' };
  }
  
  const accessToken = parts[1];
  
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
    console.error('❌ Access token is undefined or null');
    return { authorized: false, error: 'Missing or invalid access token' };
  }
  
  console.log('🔐 Token length:', accessToken.length);
  console.log('🔐 Token preview:', accessToken.substring(0, 30) + '...');
  
  // CRITICAL FIX: Use ANON client (same as login) to verify the JWT token
  const supabase = getSupabaseAnon();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    console.error('❌ Auth verification failed:', error.message);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    // Special handling for bad_jwt - this means the token is corrupted or from wrong project
    if (error.message?.includes('bad_jwt') || error.message?.includes('invalid claim')) {
      console.error('🚨 BAD JWT DETECTED - Token is corrupted or from wrong project');
      return { 
        authorized: false, 
        error: 'Invalid JWT',
        forceLogout: true // Signal to client to force logout
      };
    }
    
    return { authorized: false, error: error.message || 'Invalid token' };
  }
  
  if (!user) {
    console.error('❌ No user found for token');
    return { authorized: false, error: 'No user found' };
  }

  console.log('✅ User authenticated:', user.email);

  const isAdmin = user.email === 'joe@bespokemetalprints.com' || 
                  user.user_metadata?.role === 'admin';

  if (!isAdmin) {
    console.error('❌ User is not an admin:', user.email);
    return { authorized: false, error: 'Access denied - admin role required' };
  }

  console.log('✅ Admin verified:', user.email);
  return { authorized: isAdmin, user };
}

// Admin login
adminApp.post('/make-server-3e3a9cd7/admin/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    console.log('🔐 ===== ADMIN LOGIN START =====');
    console.log('📧 Email:', email);

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Use anon key for login
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('🔑 Attempting Supabase signInWithPassword...');
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('❌ Login error:', error);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    console.log('✅ Login successful, session created');
    console.log('🎫 Access token length:', data.session.access_token?.length || 0);
    console.log('🎫 Access token preview:', data.session.access_token?.substring(0, 50) + '...');

    // CRITICAL: Verify user using ANON client (same as login)
    const supabaseAnonForVerify = getSupabaseAnon();
    console.log('🔍 Verifying token with getSupabaseAnon()...');
    const { data: { user }, error: userError } = await supabaseAnonForVerify.auth.getUser(data.session.access_token);

    if (userError) {
      console.error('❌ Token verification failed:', userError);
      console.error('❌ Error code:', userError.code);
      console.error('❌ Error message:', userError.message);
      return c.json({ error: 'Invalid user' }, 401);
    }
    
    if (!user) {
      console.error('❌ No user returned from getUser');
      return c.json({ error: 'Invalid user' }, 401);
    }

    console.log('✅ User verified:', user.email);
    console.log('👤 User ID:', user.id);
    console.log('🏷️ User metadata:', JSON.stringify(user.user_metadata));

    const isAdmin = user.email === 'joe@bespokemetalprints.com' || 
                    user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      console.error('❌ User is not admin:', user.email);
      return c.json({ error: 'Access denied. Admin privileges required.' }, 403);
    }

    console.log(`✅ Admin login successful: ${email}`);
    console.log('🔐 ===== ADMIN LOGIN END =====');

    return c.json({
      success: true,
      access_token: data.session.access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'Admin',
        role: user.user_metadata?.role || 'admin',
      },
      permissions: {
        canViewOrders: true,
        canManageInventory: true,
        canExportData: true,
      },
    });
  } catch (error: any) {
    console.error('💥 Admin login exception:', error);
    console.error('💥 Stack trace:', error.stack);
    return c.json({ error: 'Login failed', details: error.message }, 500);
  }
});

// Helper: Get order index (lightweight metadata only)
async function getOrderIndex(): Promise<any[]> {
  try {
    const index = await kv.get('order-index');
    return index || [];
  } catch (error) {
    console.error('Error fetching order index:', error);
    return [];
  }
}

// Helper: Update order index
async function updateOrderIndex(orderMeta: any) {
  try {
    const index = await getOrderIndex();
    
    // Remove old entry if exists
    const filtered = index.filter((o: any) => o.id !== orderMeta.id);
    
    // Add new entry at beginning
    filtered.unshift(orderMeta);
    
    // Keep only last 200 orders in index (reduced from 500 to prevent memory issues)
    const trimmed = filtered.slice(0, 200);
    
    await kv.set('order-index', trimmed);
    console.log(`📋 Order index updated: ${trimmed.length} orders`);
  } catch (error) {
    console.error('Error updating order index:', error);
  }
}

// Helper: Create order metadata for index
function createOrderMeta(order: any) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName || order.shippingAddress?.name,
    customerEmail: order.customerEmail,
    status: order.status,
    amount: order.amount || order.total || 0,  // Use 'amount' for consistency with client
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shippedAt: order.shippedAt,
    paymentIntentId: order.paymentIntentId,
    trackingNumber: order.trackingNumber,
    trackingStatus: order.trackingStatus,
    trackingCarrier: order.trackingCarrier,
    trackingUrl: order.trackingUrl,
    lastSyncedAt: order.lastSyncedAt,
    deliveredAt: order.deliveredAt,
  };
}

// Get all orders - USES INDEX (no image data)
adminApp.get('/make-server-3e3a9cd7/admin/orders', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    // Check if we should force logout
    if ((auth as any).forceLogout) {
      return c.json({ code: 401, message: 'Invalid JWT', forceLogout: true }, 401);
    }
    return c.json({ code: 401, message: auth.error || 'Unauthorized' }, 401);
  }

  try {
    let index = await getOrderIndex();
    
    // If index is empty, try to initialize it
    if (!index || index.length === 0) {
      console.log('⚠️ Order index is empty, initializing...');
    }
    
    // Limit index size to prevent memory issues (max 200 orders)
    if (index.length > 200) {
      console.log(`⚠️ Index too large (${index.length} orders), trimming to 200`);
      index = index.slice(0, 200);
      // Save trimmed index back
      await kv.set('order-index', index);
    }
    
    // Filter: December 2025+ only, exclude cancelled/incomplete
    const cutoffDate = new Date('2025-12-01T00:00:00Z');
    const filteredOrders = index.filter((order: any) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate && 
             order.status !== 'cancelled' && 
             order.paymentIntentId;
    });

    // Sort by createdAt descending (most recent first)
    filteredOrders.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    });
    
    // Limit to 100 orders in response to reduce payload size
    const limitedOrders = filteredOrders.slice(0, 100);

    console.log(`📊 Returning ${limitedOrders.length} orders from index (filtered: ${filteredOrders.length}, total: ${index.length})`);
    return c.json({ orders: limitedOrders });
  } catch (error: any) {
    console.error('Admin orders error:', error);
    return c.json({ error: 'Failed to fetch orders', details: error.message }, 500);
  }
});

// Get order stats - USES INDEX
adminApp.get('/make-server-3e3a9cd7/admin/stats', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const index = await getOrderIndex();
    const cutoffDate = new Date('2025-12-01T00:00:00Z');
    
    // Filter: December 2025+ only, exclude cancelled/incomplete
    const validOrders = index.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate && 
             order.status !== 'cancelled' && 
             order.paymentIntentId;
    });

    // Count orders by status (from ALL valid orders)
    const processingOrders = validOrders.filter((o: any) => o.status === 'processing').length;
    const paidOrders = validOrders.filter((o: any) => o.status === 'paid').length;
    const shippedOrders = validOrders.filter((o: any) => o.status === 'shipped').length;
    const deliveredOrders = validOrders.filter((o: any) => o.status === 'delivered').length;

    // Calculate revenue from paid, shipped, and delivered orders only (exclude processing, refunded, partially_refunded)
    const revenueOrders = validOrders.filter((o: any) => 
      o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered'
    );
    const totalRevenue = revenueOrders.reduce((sum: number, o: any) => 
      sum + (o.amount || o.total || 0), 0
    );

    const stats = {
      totalOrders: validOrders.length,
      totalRevenue,
      pendingOrders: validOrders.filter((o: any) => o.status === 'pending' || o.status === 'paid').length,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    };

    console.log(`📊 Stats: ${stats.totalOrders} orders, $${(stats.totalRevenue/100).toFixed(2)}`);
    return c.json(stats);
  } catch (error: any) {
    console.error('Stats error:', error);
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500);
  }
});

// Update order status
adminApp.put('/make-server-3e3a9cd7/admin/orders/:orderId/status', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('orderId');
    const { status } = await c.req.json();

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    const wasJustShipped = (status === 'shipped' && !order.shippedAt);
    
    if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = new Date().toISOString();
    }

    await kv.set(`order:${orderId}`, order);
    
    // Update index
    const orderMeta = createOrderMeta(order);
    await updateOrderIndex(orderMeta);
    
    // Send shipping notification SMS if order was just marked as shipped
    if (wasJustShipped) {
      await sendShippingNotificationSMS(order);
    }
    
    return c.json({ success: true, order: orderMeta });
  } catch (error: any) {
    console.error('Update status error:', error);
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

// Sync order tracking status from EasyPost
adminApp.post('/make-server-3e3a9cd7/admin/orders/:orderId/sync-tracking', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Only sync if order has a tracking number
    if (!order.trackingNumber) {
      return c.json({ 
        success: false, 
        error: 'No tracking number available for this order',
        order: createOrderMeta(order)
      });
    }

    const easypostApiKey = Deno.env.get('EASYPOST_API_KEY');
    if (!easypostApiKey) {
      return c.json({ 
        success: false, 
        error: 'EasyPost API key not configured',
        order: createOrderMeta(order)
      });
    }

    console.log(`📦 Syncing tracking status for order ${orderId} (tracking: ${order.trackingNumber})`);

    // Fetch live tracking from EasyPost
    const response = await fetch(
      `https://api.easypost.com/v2/trackers/${order.trackingNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${easypostApiKey}`,
        },
      }
    );

    if (!response.ok) {
      console.warn(`EasyPost API error for ${order.trackingNumber}: ${response.status}`);
      return c.json({ 
        success: false, 
        error: `EasyPost API error: ${response.status}`,
        order: createOrderMeta(order)
      });
    }

    const trackingData = await response.json();
    console.log(`✅ Got live tracking status: ${trackingData.status}`);

    // Update order with latest tracking info
    let updatedStatus = order.status;
    
    // Map EasyPost status to our order status
    if (trackingData.status === 'delivered') {
      updatedStatus = 'delivered';
      order.deliveredAt = trackingData.updated_at || new Date().toISOString();
    } else if (trackingData.status === 'out_for_delivery') {
      updatedStatus = 'shipped';
    } else if (trackingData.status === 'in_transit') {
      updatedStatus = 'shipped';
    }

    // Update order in database
    order.status = updatedStatus;
    order.trackingStatus = trackingData.status;
    order.trackingCarrier = trackingData.carrier || order.trackingCarrier;
    order.trackingUrl = trackingData.public_url || order.trackingUrl;
    order.lastSyncedAt = new Date().toISOString();

    await kv.set(`order:${orderId}`, order);

    // Update order index
    const orderMeta = createOrderMeta(order);
    await updateOrderIndex(orderMeta);

    console.log(`✅ Synced order ${orderId}: ${updatedStatus}`);

    return c.json({ 
      success: true, 
      order: orderMeta,
      trackingStatus: trackingData.status
    });
  } catch (error: any) {
    console.error('Sync tracking error:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to sync tracking' 
    }, 500);
  }
});

// Get single order - FULL DATA
adminApp.get('/make-server-3e3a9cd7/admin/orders/:orderId', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Remove base64 image data to reduce payload size
    if (order.orderDetails?.image) {
      const imageData = order.orderDetails.image;
      order.orderDetails.image = {
        ...imageData,
        data: imageData.data ? '[BASE64_DATA_REMOVED]' : null,
      };
    }

    return c.json({ order });
  } catch (error: any) {
    console.error('Get order error:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Rebuild order index (emergency endpoint)
adminApp.post('/make-server-3e3a9cd7/admin/rebuild-index', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('🔨 Rebuilding order index...');
    
    // This is dangerous - only use if absolutely necessary
    // Load orders in small batches
    const allOrders = await kv.getByPrefix('order:');
    
    console.log(`📊 Found ${allOrders.length} orders in database`);
    
    // Log details of recent orders for debugging
    const recentOrders = allOrders
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    console.log('Recent orders:', recentOrders.map((o: any) => ({
      id: o.id,
      email: o.customerEmail,
      amount: o.amount,
      status: o.status,
      paymentIntentId: o.paymentIntentId,
      createdAt: o.createdAt,
    })));
    
    const index = allOrders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || order.shippingAddress?.name,
      customerEmail: order.customerEmail,
      status: order.status,
      amount: order.amount || order.total || 0,  // Use 'amount' for consistency
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      paymentIntentId: order.paymentIntentId,
      trackingNumber: order.trackingNumber,
      trackingStatus: order.trackingStatus,
      trackingCarrier: order.trackingCarrier,
      trackingUrl: order.trackingUrl,
      lastSyncedAt: order.lastSyncedAt,
      deliveredAt: order.deliveredAt,
    })).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 200);  // Limit to 200 most recent orders to prevent memory issues
    
    await kv.set('order-index', index);
    
    console.log(`✅ Index rebuilt with ${index.length} orders`);
    return c.json({ 
      success: true, 
      orderCount: index.length,
      recentOrders: recentOrders.map((o: any) => ({
        id: o.id,
        email: o.customerEmail,
        amount: o.amount,
        status: o.status,
        createdAt: o.createdAt,
      }))
    });
  } catch (error: any) {
    console.error('Rebuild index error:', error);
    return c.json({ error: 'Failed to rebuild index', details: error.message }, 500);
  }
});

// Debug endpoint - check database directly
adminApp.get('/make-server-3e3a9cd7/admin/debug-orders', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('🔍 DEBUG: Checking database directly...');
    
    // Get all orders
    const allOrders = await kv.getByPrefix('order:');
    console.log(`Total orders in DB: ${allOrders.length}`);
    
    // Get order-index
    const orderIndex = await kv.get('order-index') || [];
    console.log(`Total orders in index: ${orderIndex.length}`);
    
    // Get recent orders (last 24 hours)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentOrders = allOrders.filter((o: any) => {
      if (!o.createdAt) return false;
      return new Date(o.createdAt) >= yesterday;
    }).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`Orders from last 24h: ${recentOrders.length}`);
    
    const recentOrderDetails = recentOrders.map((o: any) => ({
      id: o.id,
      customerEmail: o.customerEmail,
      customerName: o.customerName || o.shippingAddress?.name,
      amount: o.amount,
      status: o.status,
      paymentIntentId: o.paymentIntentId,
      createdAt: o.createdAt,
      inIndex: orderIndex.some((idx: any) => idx.id === o.id),
    }));
    
    console.log('Recent order details:', recentOrderDetails);
    
    // Check cutoff filtering
    const cutoffDate = new Date('2025-12-01T00:00:00Z');
    const afterCutoff = allOrders.filter((o: any) => {
      if (!o.createdAt) return false;
      return new Date(o.createdAt) >= cutoffDate;
    });
    
    const withPaymentIntent = afterCutoff.filter((o: any) => o.paymentIntentId);
    const notCancelled = withPaymentIntent.filter((o: any) => o.status !== 'cancelled');
    
    return c.json({
      success: true,
      stats: {
        totalOrders: allOrders.length,
        indexedOrders: orderIndex.length,
        last24Hours: recentOrders.length,
        afterCutoff: afterCutoff.length,
        withPaymentIntent: withPaymentIntent.length,
        notCancelled: notCancelled.length,
      },
      recentOrders: recentOrderDetails,
      indexSample: orderIndex.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return c.json({ error: 'Debug failed', details: error.message }, 500);
  }
});

// Sync pending orders with Stripe to fix stuck pending orders
adminApp.post('/make-server-3e3a9cd7/admin/sync-pending-orders', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('🔄 Syncing pending orders with Stripe...');
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }
    
    // Import Stripe
    const Stripe = (await import('npm:stripe@17.4.0')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
    
    // Get all pending orders
    const allOrders = await kv.getByPrefix('order:');
    const pendingOrders = allOrders.filter((o: any) => o.status === 'pending');
    
    console.log(`Found ${pendingOrders.length} pending orders`);
    
    let updatedCount = 0;
    let failedCount = 0;
    const results: any[] = [];
    
    for (const order of pendingOrders) {
      if (!order.paymentIntentId) {
        console.log(`⏭️ Skipping ${order.id} - no payment intent ID`);
        results.push({
          orderId: order.id,
          status: 'skipped',
          reason: 'No payment intent ID',
        });
        continue;
      }
      
      // Skip test/mock payment intents
      if (order.paymentIntentId.startsWith('test_') || order.paymentIntentId.includes('mock')) {
        console.log(`⏭️ Skipping ${order.id} - test/mock payment intent: ${order.paymentIntentId}`);
        results.push({
          orderId: order.id,
          status: 'skipped',
          reason: 'Test/mock payment intent',
        });
        continue;
      }
      
      try {
        // Check payment intent status in Stripe
        console.log(`🔍 Checking payment intent: ${order.paymentIntentId}`);
        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
        
        console.log(`   Status: ${paymentIntent.status}`);
        
        if (paymentIntent.status === 'succeeded') {
          // Payment succeeded but webhook didn't update order
          order.status = 'paid';
          order.paymentStatus = 'succeeded';
          order.updatedAt = new Date().toISOString();
          
          await kv.set(`order:${order.id}`, order);
          
          // Update index
          const orderMeta = {
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName || order.shippingAddress?.name,
            customerEmail: order.customerEmail,
            status: order.status,
            amount: order.amount || order.total || 0,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            shippedAt: order.shippedAt,
            paymentIntentId: order.paymentIntentId,
            trackingNumber: order.trackingNumber,
          };
          
          const index = await kv.get('order-index') || [];
          const filtered = index.filter((o: any) => o.id !== orderMeta.id);
          filtered.unshift(orderMeta);
          await kv.set('order-index', filtered.slice(0, 200));
          
          console.log(`✅ Updated ${order.id} to paid`);
          updatedCount++;
          
          results.push({
            orderId: order.id,
            status: 'updated',
            paymentIntentStatus: paymentIntent.status,
          });
        } else {
          console.log(`   Order ${order.id} payment is ${paymentIntent.status}`);
          results.push({
            orderId: order.id,
            status: 'not_updated',
            paymentIntentStatus: paymentIntent.status,
          });
        }
      } catch (error: any) {
        console.error(`❌ Failed to sync ${order.id}:`, error.message);
        failedCount++;
        results.push({
          orderId: order.id,
          status: 'failed',
          error: error.message,
        });
      }
    }
    
    console.log(`✅ Sync complete: ${updatedCount} updated, ${failedCount} failed`);
    
    return c.json({
      success: true,
      totalPending: pendingOrders.length,
      updated: updatedCount,
      failed: failedCount,
      results,
    });
  } catch (error: any) {
    console.error('Sync pending orders error:', error);
    return c.json({ error: 'Failed to sync pending orders', details: error.message }, 500);
  }
});

// Delete order (only pending orders can be deleted)
adminApp.delete('/make-server-3e3a9cd7/admin/orders/:orderId', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      // Order doesn't exist - could be already deleted or never created
      // Clean up any index references to be safe
      console.log(`⚠️ Order ${orderId} not found - cleaning up index references`);
      
      // Remove from OLD index (legacy)
      const index = await kv.get('order-index') || [];
      const filteredIndex = index.filter((o: any) => o.id !== orderId);
      await kv.set('order-index', filteredIndex);
      
      // Try to clean up date-based index (search recent dates)
      // Since we don't know the exact date, check last 30 days
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = checkDate.toISOString().split('T')[0];
        const indexKey = `order_index:${dateKey}:${orderId}`;
        await kv.del(indexKey);
      }
      
      return c.json({ 
        success: true, 
        message: 'Order not found, but cleaned up any index references' 
      });
    }

    // Safety check: Only allow deleting pending orders
    if (order.status !== 'pending') {
      return c.json({ 
        error: 'Only pending orders can be deleted. This order is already paid or processed.' 
      }, 400);
    }

    console.log(`🗑️ Deleting pending order: ${orderId}`);

    // Delete the order
    await kv.del(`order:${orderId}`);
    
    // Delete payment intent mapping if it exists
    if (order.paymentIntentId) {
      await kv.del(`payment-intent:${order.paymentIntentId}`);
    }
    
    // Remove from OLD order index (legacy)
    const index = await kv.get('order-index') || [];
    const filteredIndex = index.filter((o: any) => o.id !== orderId);
    await kv.set('order-index', filteredIndex);
    
    // Remove from NEW date-based index (CRITICAL FIX!)
    if (order.createdAt) {
      const dateKey = order.createdAt.split('T')[0]; // Extract YYYY-MM-DD
      const indexKey = `order_index:${dateKey}:${orderId}`;
      await kv.del(indexKey);
      console.log(`🗑️ Deleted from date index: ${indexKey}`);
    }
    
    console.log(`✅ Deleted pending order: ${orderId}`);
    
    return c.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return c.json({ error: 'Failed to delete order', details: error.message }, 500);
  }
});

// ==================== INVENTORY MANAGEMENT ====================
// 
// ⚠️ CRITICAL: All inventory MUST use the KV key 'inventory' (NOT 'admin:inventory')
// This ensures the admin panel and public frontend read/write to the SAME data.
// 
// KV Key: 'inventory'
// Used by:
//   - Admin endpoints: GET/PUT/DELETE /admin/inventory
//   - Public endpoint: GET /inventory (ConfiguratorSection.tsx, useInventory.tsx)
//   - Cleanup endpoint: POST /inventory-cleanup
// 
// Data structure: Array of inventory items with { id, name, sku, category, quantity, price }
// Categories: 'size', 'finish', 'mount', 'frame'
//
// ==================== END CRITICAL NOTE ====================

// Get all inventory
adminApp.get('/make-server-3e3a9cd7/admin/inventory', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const inventory = await kv.get('inventory') || [];
    return c.json({ inventory });
  } catch (error: any) {
    console.error('Failed to fetch inventory:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

// Update/save inventory
adminApp.put('/make-server-3e3a9cd7/admin/inventory', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { inventory } = await c.req.json();
    await kv.set('inventory', inventory);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save inventory:', error);
    return c.json({ error: 'Failed to save inventory' }, 500);
  }
});

// Delete all inventory
adminApp.delete('/make-server-3e3a9cd7/admin/inventory/all', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    await kv.set('inventory', []);
    return c.json({ success: true, deletedCount: 0 });
  } catch (error: any) {
    console.error('Failed to delete inventory:', error);
    return c.json({ error: 'Failed to delete inventory' }, 500);
  }
});

// ==================== PHOTO COLLECTIONS ====================

// Get all collections
adminApp.get('/make-server-3e3a9cd7/admin/collections', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const collections = await kv.get('stock:collections') || [];
    return c.json({ collections });
  } catch (error: any) {
    console.error('Failed to fetch collections:', error);
    return c.json({ error: 'Failed to fetch collections' }, 500);
  }
});

// Create a new collection
adminApp.post('/make-server-3e3a9cd7/admin/collections', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { name, description } = await c.req.json();
    const collections = await kv.get('stock:collections') || [];
    
    const newCollection = {
      id: Date.now().toString(),
      name,
      description: description || '',
      images: [],
      createdAt: new Date().toISOString(),
    };
    
    collections.push(newCollection);
    await kv.set('stock:collections', collections);
    
    return c.json({ success: true, collection: newCollection });
  } catch (error: any) {
    console.error('Failed to create collection:', error);
    return c.json({ error: 'Failed to create collection' }, 500);
  }
});

// Delete a collection
adminApp.delete('/make-server-3e3a9cd7/admin/collections/:collectionId', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const collectionId = c.req.param('collectionId');
    const collections = await kv.get('stock:collections') || [];
    const filtered = collections.filter((col: any) => col.id !== collectionId);
    await kv.set('stock:collections', filtered);
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete collection:', error);
    return c.json({ error: 'Failed to delete collection' }, 500);
  }
});

// Clear ALL collections (for cleanup/reset)
adminApp.post('/make-server-3e3a9cd7/admin/cleanup-collections', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('🧹 Clearing all collections...');
    await kv.set('stock:collections', []);
    console.log('✅ All collections cleared');
    
    return c.json({ success: true, message: 'All collections cleared' });
  } catch (error: any) {
    console.error('Failed to clear collections:', error);
    return c.json({ error: 'Failed to clear collections', details: error.message }, 500);
  }
});

// Rename a collection
adminApp.put('/make-server-3e3a9cd7/admin/collections/:collectionId/rename', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const collectionId = c.req.param('collectionId');
    const { newName } = await c.req.json();
    
    if (!newName || newName.trim() === '') {
      return c.json({ error: 'New name is required' }, 400);
    }
    
    const collections = await kv.get('stock:collections') || [];
    const collection = collections.find((col: any) => col.id === collectionId);
    
    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }
    
    // Check if a collection with the new name already exists
    const nameExists = collections.some((col: any) => 
      col.id !== collectionId && col.name === newName.trim()
    );
    
    if (nameExists) {
      return c.json({ error: 'A collection with that name already exists' }, 400);
    }
    
    collection.name = newName.trim();
    collection.updatedAt = new Date().toISOString();
    
    await kv.set('stock:collections', collections);
    
    return c.json({ success: true, collection });
  } catch (error: any) {
    console.error('Failed to rename collection:', error);
    return c.json({ error: 'Failed to rename collection' }, 500);
  }
});

// Upload image to collection
adminApp.post('/make-server-3e3a9cd7/admin/collections/:collectionId/images', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const collectionId = c.req.param('collectionId');
    
    // Check for AWS credentials
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const AWS_S3_BUCKET_NAME = Deno.env.get('AWS_S3_BUCKET_NAME');
    const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
    
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
      return c.json({ error: 'AWS S3 not configured. Please set AWS credentials in Supabase Edge Function Secrets.' }, 400);
    }

    console.log('📤 Upload to collection:', collectionId);
    console.log('🔑 AWS Bucket:', AWS_S3_BUCKET_NAME);
    console.log('🌍 AWS Region:', AWS_REGION);

    // Get the collection
    const collections = await kv.get('stock:collections') || [];
    const collection = collections.find((col: any) => col.id === collectionId);
    
    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return c.json({ error: 'No image file provided' }, 400);
    }

    console.log('📷 Image file:', imageFile.name, imageFile.size, 'bytes');

    // Import AWS SDK
    const { S3Client, PutObjectCommand } = await import('npm:@aws-sdk/client-s3@3');
    
    // Create S3 client
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = imageFile.name.split('.').pop() || 'jpg';
    const baseFileName = `${timestamp}-${randomStr}`;
    
    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload original (full resolution for printing) - PRIVATE
    const originalKey = `stock/original/${collection.name}/${baseFileName}.${extension}`;
    await s3Client.send(new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: originalKey,
      Body: buffer,
      ContentType: imageFile.type,
    }));

    const originalUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${originalKey}`;
    console.log('✅ Original uploaded (private):', originalUrl);

    // Upload web version (optimized for display) - PUBLIC
    const webKey = `stock/web/${collection.name}/${baseFileName}.${extension}`;
    await s3Client.send(new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: webKey,
      Body: buffer,
      ContentType: imageFile.type,
    }));

    const webUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${webKey}`;
    console.log('✅ Web version uploaded (public):', webUrl);

    // Add to collection
    const newImage = {
      id: timestamp.toString(),
      name: imageFile.name,
      url: webUrl, // Use web version as default
      uploadedAt: new Date().toISOString(),
    };

    if (!collection.images) {
      collection.images = [];
    }
    collection.images.push(newImage);
    collection.updatedAt = new Date().toISOString();

    // Save updated collections
    await kv.set('stock:collections', collections);

    console.log('✅ Image added to collection database');

    return c.json({ 
      success: true, 
      image: newImage,
      originalUrl,
      webUrl 
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return c.json({ 
      error: 'Failed to upload image', 
      details: error.message 
    }, 500);
  }
});

// Get stock photos count
adminApp.get('/make-server-3e3a9cd7/admin/stock-photos-count', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const collections = await kv.get('stock:collections') || [];
    
    // Only count web versions (same filter as StockPhotoManage.tsx)
    const totalPhotos = collections.reduce((sum: number, col: any) => {
      const webPhotos = (col.images || []).filter((img: any) => 
        img.url.includes('-web.') || !img.url.includes('-original.')
      );
      return sum + webPhotos.length;
    }, 0);
    
    return c.json({ count: totalPhotos });
  } catch (error: any) {
    console.error('Failed to count photos:', error);
    return c.json({ error: 'Failed to count photos' }, 500);
  }
});

// ==================== ADMIN USERS MANAGEMENT ====================

// Get all admin users
adminApp.get('/make-server-3e3a9cd7/admin/users', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Failed to list users:', error);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }
    
    // Filter to only admin users
    const adminUsers = users.filter(user => 
      user.email === 'joe@bespokemetalprints.com' || 
      user.user_metadata?.role === 'admin'
    ).map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || 'Admin',
      role: user.user_metadata?.role || 'admin',
      createdAt: user.created_at,
    }));
    
    return c.json({ users: adminUsers });
  } catch (error: any) {
    console.error('Failed to fetch admin users:', error);
    return c.json({ error: 'Failed to fetch admin users' }, 500);
  }
});

// Create new admin user
adminApp.post('/make-server-3e3a9cd7/admin/users', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { email, password, name, role } = await c.req.json();
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: role || 'admin',
      },
    });
    
    if (error) {
      console.error('Failed to create admin user:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: role || 'admin',
      }
    });
  } catch (error: any) {
    console.error('Failed to create admin user:', error);
    return c.json({ error: 'Failed to create admin user' }, 500);
  }
});

// Delete admin user
adminApp.delete('/make-server-3e3a9cd7/admin/users/:userId', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const userId = c.req.param('userId');
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Failed to delete user:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete admin user:', error);
    return c.json({ error: 'Failed to delete admin user' }, 500);
  }
});

// ==================== S3 RECOVERY ====================

// List S3 folders for reorganization
adminApp.get('/make-server-3e3a9cd7/admin/s3-folders', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('📂 Listing S3 folders...');
    
    // Check for AWS credentials
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const AWS_S3_BUCKET_NAME = Deno.env.get('AWS_S3_BUCKET_NAME');
    const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
    
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
      return c.json({ error: 'AWS S3 not configured' }, 400);
    }
    
    // Log credentials (masked for security)
    console.log(`🔑 Using AWS credentials:`);
    console.log(`   Access Key: ${AWS_ACCESS_KEY_ID.substring(0, 8)}...${AWS_ACCESS_KEY_ID.slice(-4)}`);
    console.log(`   Bucket: ${AWS_S3_BUCKET_NAME}`);
    console.log(`   Region: ${AWS_REGION}`);
    
    // Import AWS SDK
    const { S3Client, ListObjectsV2Command } = await import('npm:@aws-sdk/client-s3@3');
    
    // Create S3 client
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    
    // List objects in bucket - check web folder
    const listCommand = new ListObjectsV2Command({
      Bucket: AWS_S3_BUCKET_NAME,
      Prefix: 'stock/web/',
      Delimiter: '/', // This helps us get folder-level results
    });
    
    const listResponse = await s3Client.send(listCommand);
    
    // Get folder prefixes
    const folderPrefixes = listResponse.CommonPrefixes || [];
    const folders: any[] = [];
    
    // For each folder, get sample images
    for (const prefix of folderPrefixes) {
      if (!prefix.Prefix) continue;
      
      const folderName = prefix.Prefix.replace('stock/web/', '').replace('/', '');
      
      // List files in this folder
      const folderListCommand = new ListObjectsV2Command({
        Bucket: AWS_S3_BUCKET_NAME,
        Prefix: prefix.Prefix,
        MaxKeys: 10, // Get first 10 files as samples
      });
      
      const folderResponse = await s3Client.send(folderListCommand);
      const files = (folderResponse.Contents || [])
        .filter(obj => obj.Key && !obj.Key.endsWith('/') && !obj.Key.endsWith('.webp'))
        .map(obj => ({
          key: obj.Key,
          name: obj.Key?.split('/').pop() || '',
          url: `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${obj.Key}`,
          size: obj.Size,
          lastModified: obj.LastModified?.toISOString(),
        }));
      
      folders.push({
        currentName: folderName,
        prefix: prefix.Prefix,
        fileCount: folderResponse.KeyCount || 0,
        sampleFiles: files.slice(0, 3), // Show first 3 as preview
      });
    }
    
    console.log(`📂 Found ${folders.length} folders`);
    return c.json({ folders });
    
  } catch (error: any) {
    console.error('❌ List folders error:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to list folders';
    let details = error.message;
    
    if (error.message?.includes('Access Key') || error.message?.includes('InvalidAccessKeyId')) {
      errorMessage = 'Invalid AWS credentials';
      details = 'The AWS Access Key ID is invalid or does not exist. Please update your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in the Supabase dashboard under Edge Function Secrets.';
    } else if (error.message?.includes('bucket') || error.message?.includes('NoSuchBucket')) {
      errorMessage = 'Invalid S3 bucket';
      details = `The S3 bucket "${Deno.env.get('AWS_S3_BUCKET_NAME')}" does not exist or you do not have permission to access it. Please verify AWS_S3_BUCKET_NAME.`;
    } else if (error.message?.includes('region')) {
      errorMessage = 'Invalid AWS region';
      details = 'The AWS region is incorrect. Please verify AWS_REGION matches your S3 bucket region.';
    } else if (error.message?.includes('SignatureDoesNotMatch')) {
      errorMessage = 'Invalid AWS Secret Key';
      details = 'The AWS Secret Access Key is incorrect. Please verify AWS_SECRET_ACCESS_KEY.';
    }
    
    return c.json({ error: errorMessage, details: details }, 500);
  }
});

// Rename S3 folder (move all files from old folder to new folder)
adminApp.post('/make-server-3e3a9cd7/admin/s3-rename-folder', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { oldFolderName, newFolderName } = await c.req.json();
    
    if (!oldFolderName || !newFolderName) {
      return c.json({ error: 'Both old and new folder names are required' }, 400);
    }
    
    console.log(`📂 Renaming folder: ${oldFolderName} → ${newFolderName}`);
    
    // Check for AWS credentials
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const AWS_S3_BUCKET_NAME = Deno.env.get('AWS_S3_BUCKET_NAME');
    const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
    
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
      return c.json({ error: 'AWS S3 not configured' }, 400);
    }
    
    // Import AWS SDK
    const { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } = await import('npm:@aws-sdk/client-s3@3');
    
    // Create S3 client
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    
    // List and move files from BOTH web and original folders
    const prefixes = ['stock/web/', 'stock/original/'];
    let totalCopied = 0;
    let totalDeleted = 0;
    const errors: string[] = [];
    
    for (const prefix of prefixes) {
      const listCommand = new ListObjectsV2Command({
        Bucket: AWS_S3_BUCKET_NAME,
        Prefix: `${prefix}${oldFolderName}/`,
      });
      
      const listResponse = await s3Client.send(listCommand);
      const objects = (listResponse.Contents || []).filter(obj => obj.Key && !obj.Key.endsWith('/'));
      
      console.log(`📦 Found ${objects.length} files in ${prefix}${oldFolderName}/`);
      
      // Copy each file to new location and delete old
      for (const obj of objects) {
        if (!obj.Key) continue;
        
        try {
          const fileName = obj.Key.split('/').pop();
          const newKey = `${prefix}${newFolderName}/${fileName}`;
          
          // Copy to new location
          await s3Client.send(new CopyObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            CopySource: `${AWS_S3_BUCKET_NAME}/${obj.Key}`,
            Key: newKey,
          }));
          
          totalCopied++;
          console.log(`✅ Copied: ${obj.Key} → ${newKey}`);
          
          // Delete old file
          await s3Client.send(new DeleteObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key: obj.Key,
          }));
          
          totalDeleted++;
          console.log(`🗑️ Deleted: ${obj.Key}`);
          
        } catch (fileError: any) {
          console.error(`❌ Error moving ${obj.Key}:`, fileError);
          errors.push(`${obj.Key}: ${fileError.message}`);
        }
      }
    }
    
    console.log(`✅ Rename complete: ${totalCopied} copied, ${totalDeleted} deleted`);
    
    // UPDATE COLLECTIONS IN DATABASE TO REFLECT NEW FOLDER NAME
    try {
      console.log(`🔄 Updating collection URLs...`);
      const collections = await kv.get('stock:collections') || [];
      let collectionsUpdated = 0;
      let urlsUpdated = 0;
      
      const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
      
      for (const collection of collections) {
        let collectionModified = false;
        
        // Update image URLs in this collection (check both old and new patterns)
        if (collection.images && Array.isArray(collection.images)) {
          for (const image of collection.images) {
            // Update URLs from old pattern to new pattern
            if (image.url && (image.url.includes(`stock-photos/${oldFolderName}/`) || image.url.includes(`stock/web/${oldFolderName}/`))) {
              // Replace with new folder name
              image.url = image.url
                .replace(`stock-photos/${oldFolderName}/`, `stock/web/${newFolderName}/`)
                .replace(`stock/web/${oldFolderName}/`, `stock/web/${newFolderName}/`);
              urlsUpdated++;
              collectionModified = true;
            }
          }
        }
        
        if (collectionModified) {
          collectionsUpdated++;
          collection.updatedAt = new Date().toISOString();
        }
      }
      
      if (collectionsUpdated > 0) {
        await kv.set('stock:collections', collections);
        console.log(`✅ Updated ${urlsUpdated} URLs across ${collectionsUpdated} collections`);
      } else {
        console.log(`ℹ️ No collections needed URL updates`);
      }
      
    } catch (dbError: any) {
      console.error('⚠️ Failed to update collections, but S3 rename succeeded:', dbError);
      // Don't fail the whole operation - S3 rename already succeeded
    }
    
    return c.json({
      success: true,
      copiedCount,
      deletedCount,
      totalFiles: objects.length,
      errors: errors.length > 0 ? errors : undefined,
    });
    
  } catch (error: any) {
    console.error('❌ Rename folder error:', error);
    return c.json({ error: 'Failed to rename folder', details: error.message }, 500);
  }
});

// Recover photos from S3 bucket
adminApp.post('/make-server-3e3a9cd7/admin/recover-from-s3', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('🔍 Starting S3 recovery scan...');
    
    // Check for AWS credentials
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const AWS_S3_BUCKET_NAME = Deno.env.get('AWS_S3_BUCKET_NAME');
    const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
    
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
      console.error('❌ AWS credentials not configured');
      return c.json({ 
        error: 'AWS S3 not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME environment variables.' 
      }, 400);
    }
    
    console.log(`✅ AWS credentials found. Bucket: ${AWS_S3_BUCKET_NAME}, Region: ${AWS_REGION}`);
    
    // Import AWS SDK
    const { S3Client, ListObjectsV2Command, GetObjectCommand } = await import('npm:@aws-sdk/client-s3@3');
    
    // Create S3 client
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    
    console.log('✅ S3 client created');
    
    // List objects in bucket with pagination to avoid memory issues
    let allObjects: any[] = [];
    let continuationToken: string | undefined = undefined;
    let batchCount = 0;
    const MAX_BATCHES = 10; // Limit to prevent memory issues (10 batches * 1000 = 10,000 objects max)
    
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: AWS_S3_BUCKET_NAME,
        Prefix: 'stock/web/', // Only scan web folder (public photos)
        MaxKeys: 1000, // AWS default/max
        ContinuationToken: continuationToken,
      });
      
      const listResponse = await s3Client.send(listCommand);
      const objects = listResponse.Contents || [];
      
      console.log(`📦 Batch ${batchCount + 1}: Found ${objects.length} objects`);
      allObjects.push(...objects);
      
      continuationToken = listResponse.NextContinuationToken;
      batchCount++;
      
      // Break if we've hit the batch limit
      if (batchCount >= MAX_BATCHES) {
        console.log(`⚠️ Reached maximum batch limit (${MAX_BATCHES}). Stopping to prevent memory issues.`);
        break;
      }
    } while (continuationToken);
    
    const objects = allObjects;
    
    console.log(`📦 Total: Found ${objects.length} objects in S3`);
    
    if (objects.length === 0) {
      return c.json({
        scanned: 0,
        collectionsFound: 0,
        collectionsCreated: 0,
        photosRecovered: 0,
        photosSkipped: 0,
        actions: ['No photos found in S3 bucket under stock/web/ prefix'],
      });
    }
    
    // Get existing collections
    const existingCollections = await kv.get('stock:collections') || [];
    console.log(`📚 Found ${existingCollections.length} existing collections in database`);
    
    // Group photos by collection (folder structure)
    const collectionMap = new Map<string, any[]>();
    
    for (const obj of objects) {
      if (!obj.Key || obj.Key.endsWith('/')) continue; // Skip folders
      
      // Parse key: stock/web/CollectionName/filename.jpg
      const parts = obj.Key.split('/');
      if (parts.length < 3) continue; // Invalid structure
      
      const collectionName = parts[2]; // Changed from parts[1] to parts[2]
      const filename = parts[parts.length - 1];
      
      // Skip .webp files
      if (filename.endsWith('.webp')) {
        console.log(`⏭️ Skipping webp version: ${filename}`);
        continue;
      }
      
      // Build public URL (web version is public)
      const photoUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${obj.Key}`;
      
      if (!collectionMap.has(collectionName)) {
        collectionMap.set(collectionName, []);
      }
      
      collectionMap.get(collectionName)!.push({
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: filename,
        url: photoUrl,
        uploadedAt: obj.LastModified?.toISOString() || new Date().toISOString(),
      });
    }
    
    console.log(`🗂️ Found ${collectionMap.size} collections in S3`);
    
    // Create/update collections
    let collectionsCreated = 0;
    let photosRecovered = 0;
    let photosSkipped = 0;
    const actions: string[] = [];
    
    for (const [collectionName, photos] of collectionMap.entries()) {
      // Check if collection already exists
      const existingCollection = existingCollections.find((c: any) => c.name === collectionName);
      
      if (existingCollection) {
        // Collection exists - add missing photos
        const existingPhotoUrls = new Set(existingCollection.images?.map((img: any) => img.url) || []);
        const newPhotos = photos.filter(photo => !existingPhotoUrls.has(photo.url));
        
        if (newPhotos.length > 0) {
          existingCollection.images = [...(existingCollection.images || []), ...newPhotos];
          existingCollection.updatedAt = new Date().toISOString();
          photosRecovered += newPhotos.length;
          actions.push(`Updated collection "${collectionName}": added ${newPhotos.length} photos`);
        } else {
          photosSkipped += photos.length;
          actions.push(`Skipped collection "${collectionName}": all ${photos.length} photos already exist`);
        }
      } else {
        // Create new collection
        const newCollection = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: collectionName,
          description: getCollectionDescription(collectionName),
          images: photos,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        existingCollections.push(newCollection);
        collectionsCreated++;
        photosRecovered += photos.length;
        actions.push(`Created collection "${collectionName}": ${photos.length} photos`);
      }
    }
    
    // Save updated collections
    await kv.set('stock:collections', existingCollections);
    
    console.log(`✅ Recovery complete: ${collectionsCreated} collections created, ${photosRecovered} photos recovered, ${photosSkipped} photos skipped`);
    
    return c.json({
      scanned: objects.length,
      collectionsFound: collectionMap.size,
      collectionsCreated,
      photosRecovered,
      photosSkipped,
      actions,
    });
    
  } catch (error: any) {
    console.error('❌ S3 recovery error:', error);
    return c.json({ 
      error: 'S3 recovery failed', 
      details: error.message,
      stack: error.stack 
    }, 500);
  }
});

// Helper function to get collection description
function getCollectionDescription(collectionName: string): string {
  const descriptions: Record<string, string> = {
    'Abstract': 'Bold and vibrant abstract art featuring geometric patterns, colors, and modern designs.',
    'Animals': 'Beautiful wildlife and animal photography from around the world.',
    'Beach': 'Stunning coastal scenes, tropical beaches, and serene ocean views.',
    'Cityscape': 'Urban landscapes featuring iconic architecture and city skylines.',
    'Floral': 'Elegant floral photography with roses, flowers, and botanical subjects.',
    'Gallery Art': 'Sophisticated gallery-quality artwork and elegant gold textures.',
    'Gold on Black': 'Dramatic high-contrast images with metallic elements on black backgrounds.',
    'Nature & Landscape': 'Breathtaking natural scenery, mountains, and outdoor landscapes.',
    'Red on Black': 'Striking artistic portraits and dramatic compositions in red and black.',
  };
  
  // Return specific description if found, otherwise create a generic one
  return descriptions[collectionName] || `Curated collection of ${collectionName.toLowerCase()} photography and art.`;
}

// Update descriptions for existing collections
adminApp.post('/make-server-3e3a9cd7/admin/update-collection-descriptions', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('📝 Updating collection descriptions...');
    
    const collections = await kv.get('stock:collections') || [];
    let updatedCount = 0;
    
    for (const collection of collections) {
      // Check if description needs updating (contains "Recovered from S3" or is empty)
      if (!collection.description || collection.description.includes('Recovered from S3')) {
        const newDescription = getCollectionDescription(collection.name);
        collection.description = newDescription;
        collection.updatedAt = new Date().toISOString();
        updatedCount++;
        console.log(`✅ Updated "${collection.name}": ${newDescription}`);
      }
    }
    
    if (updatedCount > 0) {
      await kv.set('stock:collections', collections);
      console.log(`✅ Updated ${updatedCount} collection descriptions`);
    } else {
      console.log(`ℹ️ No collections needed description updates`);
    }
    
    return c.json({
      success: true,
      updatedCount,
      totalCollections: collections.length,
    });
    
  } catch (error: any) {
    console.error('❌ Update descriptions error:', error);
    return c.json({ error: 'Failed to update descriptions', details: error.message }, 500);
  }
});

// Generate shipping label for an order
adminApp.post('/make-server-3e3a9cd7/admin/generate-label/:orderId', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('orderId');
    console.log(`📦 Admin ${auth.user?.email} generating label for order: ${orderId}`);

    // Get the order
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      console.error('❌ Order not found:', orderId);
      return c.json({ error: 'Order not found' }, 404);
    }

    console.log('📋 Order details:', {
      id: order.id,
      status: order.status,
      hasShipmentId: !!order.shipmentId,
      hasTrackingNumber: !!order.trackingNumber,
    });

    // Check if label already exists
    if (order.trackingNumber) {
      console.log('⚠️ Label already exists for this order:', order.trackingNumber);
      return c.json({ 
        error: 'Shipping label already exists for this order',
        trackingNumber: order.trackingNumber 
      }, 400);
    }

    // Verify order has a shipment ID
    if (!order.shipmentId) {
      console.error('❌ Order has no shipment ID');
      return c.json({ 
        error: 'Order has no shipment ID. The order may not have been created with shipping rates.' 
      }, 400);
    }

    // Get EasyPost API key
    const easypostApiKey = Deno.env.get('EASYPOST_API_KEY');
    if (!easypostApiKey) {
      console.error('❌ EasyPost API key not configured');
      return c.json({ error: 'EasyPost not configured' }, 500);
    }

    console.log('🚚 Fetching shipment from EasyPost:', order.shipmentId);

    // Get the shipment to find the selected rate
    const shipmentResponse = await fetch(
      `https://api.easypost.com/v2/shipments/${order.shipmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${easypostApiKey}`,
        },
      }
    );

    if (!shipmentResponse.ok) {
      const errorText = await shipmentResponse.text();
      console.error('❌ Failed to fetch shipment:', errorText);
      return c.json({ 
        error: 'Failed to fetch shipment from EasyPost',
        details: errorText 
      }, 500);
    }

    const shipment = await shipmentResponse.json();
    console.log('✅ Shipment fetched:', {
      id: shipment.id,
      hasRates: !!shipment.rates?.length,
      rateCount: shipment.rates?.length || 0,
    });

    // Find the rate that was selected (Priority or the cheapest available)
    let selectedRate = shipment.rates?.find((r: any) => 
      r.service?.toLowerCase().includes('priority')
    );

    if (!selectedRate && shipment.rates?.length > 0) {
      // If no priority rate, select cheapest
      selectedRate = shipment.rates.reduce((min: any, rate: any) => 
        parseFloat(rate.rate) < parseFloat(min.rate) ? rate : min
      );
    }

    if (!selectedRate) {
      console.error('❌ No shipping rates available for this shipment');
      return c.json({ 
        error: 'No shipping rates available for this shipment' 
      }, 400);
    }

    console.log('📮 Selected rate:', {
      id: selectedRate.id,
      service: selectedRate.service,
      carrier: selectedRate.carrier,
      rate: selectedRate.rate,
    });

    // Purchase the shipping label
    console.log('💳 Purchasing shipping label...');
    const purchaseResponse = await fetch(
      `https://api.easypost.com/v2/shipments/${order.shipmentId}/buy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${easypostApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rate: { id: selectedRate.id },
        }),
      }
    );

    if (!purchaseResponse.ok) {
      const errorText = await purchaseResponse.text();
      console.error('❌ Failed to purchase shipping label:', errorText);
      return c.json({ 
        error: 'Failed to purchase shipping label',
        details: errorText 
      }, 500);
    }

    const purchasedShipment = await purchaseResponse.json();
    console.log('✅ Label purchased:', {
      trackingCode: purchasedShipment.tracking_code,
      labelUrl: purchasedShipment.postage_label?.label_url,
    });

    // Update order with tracking information
    order.trackingNumber = purchasedShipment.tracking_code;
    order.trackingCarrier = purchasedShipment.selected_rate?.carrier || 'USPS';
    order.trackingUrl = purchasedShipment.tracker?.public_url || 
      `https://tools.usps.com/go/TrackConfirmAction?tLabels=${purchasedShipment.tracking_code}`;
    order.labelUrl = purchasedShipment.postage_label?.label_url;
    order.updatedAt = new Date().toISOString();

    // Save updated order
    await kv.set(`order:${orderId}`, order);

    // Create tracking index
    await kv.set(`tracking:${purchasedShipment.tracking_code}`, {
      orderId: orderId,
      createdAt: new Date().toISOString(),
    });

    // Update order index
    const index = await kv.get('order-index') || [];
    const orderMeta = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || `${order.shippingAddress?.name}`,
      customerEmail: order.customerEmail,
      status: order.status,
      amount: order.amount || order.total || 0,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      paymentIntentId: order.paymentIntentId,
      trackingNumber: order.trackingNumber,
    };
    
    const filtered = index.filter((o: any) => o.id !== orderMeta.id);
    filtered.unshift(orderMeta);
    await kv.set('order-index', filtered.slice(0, 200));

    console.log(`✅ Shipping label generated for order ${orderId}`);

    return c.json({
      success: true,
      label: {
        trackingNumber: purchasedShipment.tracking_code,
        carrier: purchasedShipment.selected_rate?.carrier || 'USPS',
        url: purchasedShipment.postage_label?.label_url,
        trackingUrl: order.trackingUrl,
      },
      order: order,
    });

  } catch (error: any) {
    console.error('❌ Generate label error:', error);
    return c.json({ 
      error: 'Failed to generate shipping label', 
      details: error.message 
    }, 500);
  }
});

// Proxy endpoint to download shipping label (avoids CORS issues)
adminApp.post('/make-server-3e3a9cd7/admin/proxy-label', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { labelUrl } = await c.req.json();
    
    if (!labelUrl) {
      return c.json({ error: 'Missing labelUrl parameter' }, 400);
    }

    console.log('📥 Proxying label download:', labelUrl.substring(0, 80) + '...');

    // Fetch the label from EasyPost
    const labelResponse = await fetch(labelUrl);

    if (!labelResponse.ok) {
      console.error('❌ Failed to fetch label from EasyPost:', labelResponse.status);
      return c.json({ 
        error: `Failed to fetch label: ${labelResponse.statusText}` 
      }, labelResponse.status);
    }

    // Get the label data
    const labelBuffer = await labelResponse.arrayBuffer();
    const contentType = labelResponse.headers.get('content-type') || 'application/pdf';

    console.log('✅ Label fetched successfully:', {
      size: labelBuffer.byteLength,
      contentType: contentType,
    });

    // Return the label with appropriate headers
    return new Response(labelBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="shipping-label.pdf"',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Email',
      },
    });

  } catch (error: any) {
    console.error('❌ Proxy label error:', error);
    return c.json({ 
      error: 'Failed to proxy label download', 
      details: error.message 
    }, 500);
  }
});

// Download print-ready image endpoint
adminApp.get('/make-server-3e3a9cd7/admin/download/print-ready/:orderId', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('orderId');
    
    if (!orderId) {
      return c.json({ error: 'Missing orderId parameter' }, 400);
    }

    console.log('🖨️ Downloading print-ready image for order:', orderId);

    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Get the print-ready image URL from orderDetails
    const imageUrl = order.orderDetails?.image;
    if (!imageUrl) {
      return c.json({ error: 'No print-ready image found for this order' }, 404);
    }

    console.log('🖼️ Fetching print-ready image from:', imageUrl.substring(0, 80) + '...');

    // Check if it's an S3 URL that needs signing
    let fetchUrl = imageUrl;
    if (imageUrl.includes('.s3.') && imageUrl.includes('.amazonaws.com')) {
      // Generate signed URL for S3
      const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
      const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
      
      if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
        const urlMatch = imageUrl.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/(.+)/);
        if (urlMatch) {
          const bucket = urlMatch[1];
          const region = urlMatch[2];
          const key = decodeURIComponent(urlMatch[3]);
          
          const { S3Client } = await import('npm:@aws-sdk/client-s3@3');
          const { getSignedUrl } = await import('npm:@aws-sdk/s3-request-presigner@3');
          const { GetObjectCommand } = await import('npm:@aws-sdk/client-s3@3');
          
          const s3Client = new S3Client({
            region: region,
            credentials: {
              accessKeyId: AWS_ACCESS_KEY_ID,
              secretAccessKey: AWS_SECRET_ACCESS_KEY,
            },
          });
          
          const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          });
          
          fetchUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          console.log('🔑 Generated signed S3 URL');
        }
      }
    }

    // Fetch the image
    const imageResponse = await fetch(fetchUrl);

    if (!imageResponse.ok) {
      console.error('❌ Failed to fetch image:', imageResponse.status);
      return c.json({ 
        error: `Failed to fetch image: ${imageResponse.statusText}` 
      }, imageResponse.status);
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // Prepare print metadata
    const printSize = order.orderDetails?.size || 'Custom';
    const printInstructions = `Print at actual size (100% scale) on ${printSize} material. Do not resize or crop. Ensure color profile is preserved.`;
    
    // Determine file format from content type
    let fileFormat = 'PNG';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      fileFormat = 'JPG';
    } else if (contentType.includes('tiff')) {
      fileFormat = 'TIFF';
    }

    console.log('✅ Image fetched successfully:', {
      size: imageBuffer.byteLength,
      contentType: contentType,
      printSize: printSize,
      format: fileFormat,
    });

    // Return the image with print metadata in headers
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="PRINT_READY_${orderId}_${printSize.replace(/[\s×x]/g, '_')}.${fileFormat.toLowerCase()}"`,
        'X-Print-Size': printSize,
        'X-Print-Instructions': printInstructions,
        'X-File-Format': fileFormat,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Email',
        'Access-Control-Expose-Headers': 'X-Print-Size, X-Print-Instructions, X-File-Format',
      },
    });

  } catch (error: any) {
    console.error('❌ Download print-ready error:', error);
    return c.json({ 
      error: 'Failed to download print-ready image', 
      details: error.message 
    }, 500);
  }
});

// Cancel/refund order endpoint
adminApp.post('/make-server-3e3a9cd7/admin/cancel-order', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { orderId, refundAmount, reason } = await c.req.json();
    
    if (!orderId) {
      return c.json({ error: 'Missing orderId parameter' }, 400);
    }

    console.log('💰 Processing refund for order:', orderId);
    console.log('Refund amount:', refundAmount);
    console.log('Reason:', reason);

    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Check if order can be refunded
    if (order.status === 'refunded') {
      return c.json({ error: 'Order has already been fully refunded' }, 400);
    }

    // Get Stripe secret key
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    const stripe = (await import('npm:stripe@14')).default;
    const stripeClient = new stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    let refundData: any = {
      success: false,
      refundedAmount: 0,
      refundId: null,
      voidedLabel: false,
      shippingRefundAmount: 0,
    };

    // Only process Stripe refund if there's a payment intent
    if (order.paymentIntentId) {
      try {
        // Determine refund amount
        const amountToRefund = refundAmount ? 
          Math.round(parseFloat(refundAmount) * 100) : // Partial refund in cents
          undefined; // Full refund

        console.log('💳 Creating Stripe refund...');
        console.log('Payment Intent ID:', order.paymentIntentId);
        console.log('Amount to refund (cents):', amountToRefund || 'Full refund');

        const refund = await stripeClient.refunds.create({
          payment_intent: order.paymentIntentId,
          amount: amountToRefund,
          reason: reason || 'requested_by_customer',
        });

        refundData.success = true;
        refundData.refundId = refund.id;
        refundData.refundedAmount = refund.amount / 100; // Convert cents to dollars

        console.log('✅ Stripe refund successful:', refund.id);
        console.log('Refunded amount: $' + refundData.refundedAmount);

      } catch (stripeError: any) {
        console.error('❌ Stripe refund error:', stripeError);
        throw new Error(`Stripe refund failed: ${stripeError.message}`);
      }
    } else {
      console.log('⚠️ No payment intent found, skipping Stripe refund');
    }

    // Void shipping label if it exists and hasn't been voided yet
    if (order.shipmentId && !order.labelVoided) {
      const EASYPOST_API_KEY = Deno.env.get('EASYPOST_API_KEY');
      
      if (EASYPOST_API_KEY) {
        try {
          console.log('🏷️ Voiding shipping label...');
          
          const voidResponse = await fetch(
            `https://api.easypost.com/v2/shipments/${order.shipmentId}/refund`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${EASYPOST_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (voidResponse.ok) {
            const voidData = await voidResponse.json();
            refundData.voidedLabel = true;
            refundData.shippingRefundAmount = voidData.refund_amount || 0;
            
            console.log('✅ Shipping label voided successfully');
            console.log('Shipping refund amount: $' + refundData.shippingRefundAmount);
          } else {
            console.warn('⚠️ Failed to void shipping label:', await voidResponse.text());
          }
        } catch (labelError) {
          console.warn('⚠️ Error voiding shipping label:', labelError);
          // Continue with order cancellation even if label void fails
        }
      }
    }

    // Update the order
    const isFullRefund = !refundAmount || parseFloat(refundAmount) >= order.amount;
    const previousRefundedAmount = order.refundedAmount || 0;
    const totalRefunded = previousRefundedAmount + refundData.refundedAmount;

    order.status = isFullRefund ? 'refunded' : 'partially_refunded';
    order.paymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';
    order.refundedAmount = totalRefunded;
    order.refundedAt = new Date().toISOString();
    order.refundReason = reason || 'requested_by_customer';
    order.refundId = refundData.refundId;
    order.labelVoided = refundData.voidedLabel || order.labelVoided || false;
    order.shippingRefundAmount = (order.shippingRefundAmount || 0) + refundData.shippingRefundAmount;
    order.updatedAt = new Date().toISOString();

    // Save the updated order
    await kv.set(`order:${orderId}`, order);

    // Update the index
    const indexKey = `order_index:${order.createdAt.split('T')[0]}:${orderId}`;
    const indexEntry = {
      id: order.id,
      customerEmail: order.customerEmail,
      amount: order.amount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      paymentIntentId: order.paymentIntentId,
      refundedAmount: order.refundedAmount,
      refundedAt: order.refundedAt,
    };
    await kv.set(indexKey, indexEntry);

    console.log(`✅ Order ${orderId} ${isFullRefund ? 'fully' : 'partially'} refunded`);

    return c.json({
      success: true,
      message: isFullRefund ? 'Order refunded successfully' : 'Partial refund processed',
      refundedAmount: refundData.refundedAmount,
      totalRefunded: totalRefunded,
      refundId: refundData.refundId,
      voidedLabel: refundData.voidedLabel,
      shippingRefundAmount: refundData.shippingRefundAmount,
      newStatus: order.status,
    });

  } catch (error: any) {
    console.error('❌ Cancel/refund order error:', error);
    return c.json({ 
      error: 'Failed to process refund', 
      details: error.message 
    }, 500);
  }
});

// Sync order status from Stripe (for stuck "pending" orders)
adminApp.post('/make-server-3e3a9cd7/admin/sync-order-from-stripe', async (c) => {
  try {
    const { orderId, paymentIntentId } = await c.req.json();
    
    if (!orderId || !paymentIntentId) {
      return c.json({ error: 'Order ID and Payment Intent ID required' }, 400);
    }
    
    console.log(`🔄 Syncing order ${orderId} from Stripe payment intent ${paymentIntentId}...`);
    
    // Initialize Stripe
    const Stripe = (await import('npm:stripe@17.4.0')).default;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
    
    // Fetch payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`📥 Stripe payment status: ${paymentIntent.status}`);
    
    // Get order from database
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found in database' }, 404);
    }
    
    // Determine new order status based on Stripe payment status
    let newStatus = order.status;
    let newPaymentStatus = order.paymentStatus;
    
    switch (paymentIntent.status) {
      case 'succeeded':
        newStatus = 'paid';
        newPaymentStatus = 'succeeded';
        break;
      case 'canceled':
        newStatus = 'canceled';
        newPaymentStatus = 'canceled';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'processing':
        newStatus = 'pending';
        newPaymentStatus = 'pending';
        break;
      default:
        console.warn(`⚠️ Unknown Stripe status: ${paymentIntent.status}`);
    }
    
    // Check if status changed
    const statusChanged = newStatus !== order.status || newPaymentStatus !== order.paymentStatus;
    
    if (!statusChanged) {
      return c.json({ 
        success: true,
        message: `Order already in sync (status: ${newStatus})`,
        order: {
          id: order.id,
          status: order.status,
          paymentStatus: order.paymentStatus,
        }
      });
    }
    
    // Update order
    const oldStatus = order.status;
    order.status = newStatus;
    order.paymentStatus = newPaymentStatus;
    order.updatedAt = new Date().toISOString();
    
    if (newStatus === 'paid' && !order.paidAt) {
      order.paidAt = new Date().toISOString();
    }
    
    await kv.set(`order:${orderId}`, order);
    
    // Update order index
    const { updateOrderIndex } = await import('./webhooks.ts');
    await updateOrderIndex(order);
    
    console.log(`✅ Order ${orderId} synced: ${oldStatus} → ${newStatus}`);
    
    // Send SMS notification if order was just marked as paid
    if (newStatus === 'paid' && oldStatus === 'pending') {
      try {
        const { sendOrderConfirmationSMS } = await import('./sms-service.ts');
        await sendOrderConfirmationSMS(order);
      } catch (smsError) {
        console.error('Failed to send SMS notification:', smsError);
        // Don't fail the sync if SMS fails
      }
    }
    
    return c.json({
      success: true,
      message: `Order synced successfully: ${oldStatus} → ${newStatus}`,
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        stripeStatus: paymentIntent.status,
      },
      note: newStatus === 'paid' 
        ? 'Note: The print-ready image was not uploaded because payment succeeded outside the normal flow. You may need to contact the customer for the image.'
        : null,
    });
    
  } catch (error: any) {
    console.error('❌ Sync order error:', error);
    return c.json({ 
      error: 'Failed to sync order from Stripe', 
      details: error.message 
    }, 500);
  }
});

// Get all stored customer images from S3
adminApp.get('/make-server-3e3a9cd7/admin/images', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get all orders to build image library
    const orders = await kv.getByPrefix('order:');
    
    // Filter to orders with images AND shipping labels (labelUrl exists)
    const images = orders
      .filter((order: any) => order.orderDetails?.imageUrl && order.labelUrl)
      .map((order: any) => ({
        orderId: order.id,
        orderNumber: order.id, // Using orderId as order number for display
        fileName: `order-images/${order.id}.png`,
        url: order.orderDetails.imageUrl,
        uploadedAt: order.updatedAt || order.createdAt,
        customerEmail: order.customerEmail,
        orderDetails: {
          size: order.orderDetails?.size,
          finish: order.orderDetails?.finish,
          mounting: order.orderDetails?.mountType,
        },
      }))
      .sort((a: any, b: any) => {
        // Sort by upload date descending (most recent first)
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });

    console.log(`📸 Image library: ${images.length} images found (with labels downloaded)`);
    return c.json({ images });
  } catch (error: any) {
    console.error('❌ Failed to fetch image library:', error);
    return c.json({ error: 'Failed to fetch images', details: error.message }, 500);
  }
});

// Download a specific image from S3
adminApp.get('/make-server-3e3a9cd7/admin/images/:orderId/download', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order || !order.orderDetails?.imageUrl) {
      return c.json({ error: 'Image not found for this order' }, 404);
    }

    // Get the image URL from S3
    const imageUrl = order.orderDetails.imageUrl;
    
    // Fetch the image from S3
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from S3: ${imageResponse.status}`);
    }

    // Return the image blob with proper headers
    const imageBlob = await imageResponse.blob();
    
    return new Response(imageBlob, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${orderId}.png"`,
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to download image:', error);
    return c.json({ error: 'Failed to download image', details: error.message }, 500);
  }
});

// Strip base64 images from orders while preserving S3 URLs
adminApp.post('/make-server-3e3a9cd7/admin/strip-base64-images', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('🧹 Starting base64 image cleanup...');
    
    // Get all orders
    const orders = await kv.getByPrefix('order:');
    console.log(`📊 Found ${orders.length} orders to scan`);

    let ordersScanned = 0;
    let ordersWithBase64Images = 0;
    let base64DataRemoved = 0;
    let s3UrlsPreserved = 0;
    let bytesFreed = 0;

    for (const order of orders) {
      ordersScanned++;
      
      // Check if order has base64 image data
      if (order.orderDetails?.image?.data) {
        ordersWithBase64Images++;
        
        // Calculate bytes before removal
        const base64Data = order.orderDetails.image.data;
        const estimatedBytes = base64Data.length * 0.75; // Base64 is ~33% larger than binary
        bytesFreed += estimatedBytes;
        
        // Check if we have an S3 URL (imageUrl)
        const hasS3Url = !!order.orderDetails.imageUrl;
        
        if (hasS3Url) {
          s3UrlsPreserved++;
          console.log(`  ✓ Order ${order.id}: Removing base64 data, preserving S3 URL`);
        } else {
          console.log(`  ⚠️ Order ${order.id}: Removing base64 data (no S3 URL found)`);
        }
        
        // Remove the base64 data
        delete order.orderDetails.image.data;
        
        // If the image object is now empty except for metadata, clean it up
        if (Object.keys(order.orderDetails.image).length === 0) {
          delete order.orderDetails.image;
        }
        
        // Save the updated order
        await kv.set(`order:${order.id}`, order);
        base64DataRemoved++;
      }
    }

    console.log(`✅ Cleanup complete:
      - Orders scanned: ${ordersScanned}
      - Orders with base64 images: ${ordersWithBase64Images}
      - Base64 data removed: ${base64DataRemoved}
      - S3 URLs preserved: ${s3UrlsPreserved}
      - Bytes freed: ${bytesFreed} (~${(bytesFreed / 1024 / 1024).toFixed(2)} MB)`);

    return c.json({
      success: true,
      stats: {
        ordersScanned,
        ordersWithBase64Images,
        base64DataRemoved,
        s3UrlsPreserved,
        bytesFreed,
      },
    });
  } catch (error: any) {
    console.error('❌ Strip base64 images error:', error);
    return c.json({ error: 'Failed to strip base64 images', details: error.message }, 500);
  }
});

// Migrate imageUrl structure for existing orders
adminApp.post('/make-server-3e3a9cd7/admin/migrate-image-urls', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('🔄 Starting imageUrl migration...');
    
    // Get all orders
    const orders = await kv.getByPrefix('order:');
    console.log(`📊 Found ${orders.length} orders to scan`);

    let ordersScanned = 0;
    let ordersMigrated = 0;
    let ordersAlreadyCorrect = 0;
    let ordersNoImage = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        ordersScanned++;
        
        // Validate order has an ID
        if (!order.id) {
          console.warn(`⚠️ Order without ID found, skipping`);
          errors.push(`Order without ID found`);
          continue;
        }
        
        // Check if order has imageUrl at root level but not in orderDetails
        const hasRootImageUrl = !!order.imageUrl;
        const hasOrderDetailsImageUrl = !!order.orderDetails?.imageUrl || !!order.orderDetails?.image;
        
        if (!hasRootImageUrl && !hasOrderDetailsImageUrl) {
          // No image URL found anywhere
          ordersNoImage++;
          continue;
        }
        
        if (hasRootImageUrl && !hasOrderDetailsImageUrl) {
          // Need to migrate: root imageUrl exists but not in orderDetails
          if (!order.orderDetails) {
            order.orderDetails = {};
          }
          
          order.orderDetails.imageUrl = order.imageUrl;
          order.orderDetails.image = order.imageUrl;
          
          await kv.set(`order:${order.id}`, order);
          ordersMigrated++;
          console.log(`  ✓ Migrated order ${order.id}: ${order.imageUrl.substring(0, 60)}...`);
        } else if (!hasRootImageUrl && hasOrderDetailsImageUrl) {
          // Reverse migration: orderDetails has image but root doesn't
          const imageUrl = order.orderDetails.imageUrl || order.orderDetails.image;
          order.imageUrl = imageUrl;
          
          await kv.set(`order:${order.id}`, order);
          ordersMigrated++;
          console.log(`  ✓ Reverse migrated order ${order.id}: ${imageUrl.substring(0, 60)}...`);
        } else {
          // Already has imageUrl in both places
          ordersAlreadyCorrect++;
        }
      } catch (orderError: any) {
        const errorMsg = `Error processing order ${order.id}: ${orderError.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`✅ Migration complete:
      - Orders scanned: ${ordersScanned}
      - Orders migrated: ${ordersMigrated}
      - Orders already correct: ${ordersAlreadyCorrect}
      - Orders with no image: ${ordersNoImage}
      - Errors: ${errors.length}`);

    return c.json({
      success: true,
      stats: {
        ordersScanned,
        ordersMigrated,
        ordersAlreadyCorrect,
        ordersNoImage,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: any) {
    console.error('❌ Migrate imageUrl error:', error);
    return c.json({ error: 'Failed to migrate imageUrls', details: error.message }, 500);
  }
});

// Export orders as CSV
adminApp.get('/make-server-3e3a9cd7/admin/export/orders', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('📊 Exporting orders to CSV...');
    
    // Get all orders
    const orders = await kv.getByPrefix('order:');
    
    // Filter: December 2025+ only, exclude cancelled/incomplete
    const cutoffDate = new Date('2025-12-01T00:00:00Z');
    const validOrders = orders.filter((order: any) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate && 
             order.status !== 'cancelled' && 
             order.paymentIntentId;
    }).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Create CSV header
    const headers = [
      'Order ID',
      'Order Date',
      'Customer Name',
      'Customer Email',
      'Status',
      'Amount',
      'Size',
      'Finish',
      'Mounting',
      'Shipping Address',
      'City',
      'State',
      'Zip',
      'Tracking Number',
      'Carrier',
      'Shipped Date',
      'Delivered Date',
      'Payment Intent ID',
    ];

    // Create CSV rows
    const rows = validOrders.map((order: any) => {
      const address = order.shippingAddress || {};
      return [
        order.id || '',
        order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '',
        order.customerName || address.name || '',
        order.customerEmail || '',
        order.status || '',
        order.amount ? (order.amount / 100).toFixed(2) : '0.00',
        order.orderDetails?.size || '',
        order.orderDetails?.finish || '',
        order.orderDetails?.mountType || '',
        address.line1 || '',
        address.city || '',
        address.state || '',
        address.postal_code || '',
        order.trackingNumber || '',
        order.trackingCarrier || '',
        order.shippedAt ? new Date(order.shippedAt).toISOString().split('T')[0] : '',
        order.deliveredAt ? new Date(order.deliveredAt).toISOString().split('T')[0] : '',
        order.paymentIntentId || '',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    console.log(`✅ Exported ${validOrders.length} orders`);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders_${new Date().toISOString().split('T')[0]}.csv"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('❌ Export orders error:', error);
    return c.json({ error: 'Failed to export orders', details: error.message }, 500);
  }
});

// Export customers as CSV
adminApp.get('/make-server-3e3a9cd7/admin/export/customers', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('📊 Exporting customers to CSV...');
    
    // Get all orders
    const orders = await kv.getByPrefix('order:');
    
    // Filter: December 2025+ only
    const cutoffDate = new Date('2025-12-01T00:00:00Z');
    const validOrders = orders.filter((order: any) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate && 
             order.status !== 'cancelled' && 
             order.paymentIntentId;
    });

    // Aggregate by customer email
    const customerMap = new Map<string, any>();
    
    for (const order of validOrders) {
      const email = order.customerEmail;
      if (!email) continue;
      
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name: order.customerName || order.shippingAddress?.name || '',
          orderCount: 0,
          totalSpent: 0,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
        });
      }
      
      const customer = customerMap.get(email);
      customer.orderCount++;
      customer.totalSpent += order.amount || 0;
      
      if (new Date(order.createdAt) < new Date(customer.firstOrderDate)) {
        customer.firstOrderDate = order.createdAt;
      }
      if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = order.createdAt;
      }
    }

    // Create CSV header
    const headers = [
      'Email',
      'Name',
      'Order Count',
      'Total Spent',
      'First Order Date',
      'Last Order Date',
    ];

    // Create CSV rows
    const customers = Array.from(customerMap.values()).sort((a, b) => 
      b.totalSpent - a.totalSpent
    );

    const rows = customers.map((customer: any) => {
      return [
        customer.email || '',
        customer.name || '',
        customer.orderCount.toString(),
        (customer.totalSpent / 100).toFixed(2),
        customer.firstOrderDate ? new Date(customer.firstOrderDate).toISOString().split('T')[0] : '',
        customer.lastOrderDate ? new Date(customer.lastOrderDate).toISOString().split('T')[0] : '',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    console.log(`✅ Exported ${customers.length} customers`);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="customers_${new Date().toISOString().split('T')[0]}.csv"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('❌ Export customers error:', error);
    return c.json({ error: 'Failed to export customers', details: error.message }, 500);
  }
});

// Export revenue summary as CSV
adminApp.get('/make-server-3e3a9cd7/admin/export/revenue', async (c) => {
  const auth = await verifyAdmin(c.req.header('Authorization'));
  if (!auth.authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('📊 Exporting revenue to CSV...');
    
    // Get all orders
    const orders = await kv.getByPrefix('order:');
    
    // Filter: December 2025+ only
    const cutoffDate = new Date('2025-12-01T00:00:00Z');
    const validOrders = orders.filter((order: any) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate && 
             order.status !== 'cancelled' && 
             order.paymentIntentId;
    });

    // Aggregate by date
    const revenueByDate = new Map<string, any>();
    
    for (const order of validOrders) {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!revenueByDate.has(date)) {
        revenueByDate.set(date, {
          date,
          orderCount: 0,
          totalRevenue: 0,
          paidOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
        });
      }
      
      const dailyStats = revenueByDate.get(date);
      dailyStats.orderCount++;
      
      // Only count revenue for paid, shipped, or delivered orders
      if (['paid', 'shipped', 'delivered'].includes(order.status)) {
        dailyStats.totalRevenue += order.amount || 0;
      }
      
      if (order.status === 'paid') dailyStats.paidOrders++;
      if (order.status === 'shipped') dailyStats.shippedOrders++;
      if (order.status === 'delivered') dailyStats.deliveredOrders++;
    }

    // Create CSV header
    const headers = [
      'Date',
      'Total Orders',
      'Revenue',
      'Paid Orders',
      'Shipped Orders',
      'Delivered Orders',
    ];

    // Create CSV rows
    const dailyRevenue = Array.from(revenueByDate.values()).sort((a, b) => 
      b.date.localeCompare(a.date)
    );

    const rows = dailyRevenue.map((day: any) => {
      return [
        day.date,
        day.orderCount.toString(),
        (day.totalRevenue / 100).toFixed(2),
        day.paidOrders.toString(),
        day.shippedOrders.toString(),
        day.deliveredOrders.toString(),
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    console.log(`✅ Exported revenue for ${dailyRevenue.length} days`);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="revenue_${new Date().toISOString().split('T')[0]}.csv"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('❌ Export revenue error:', error);
    return c.json({ error: 'Failed to export revenue', details: error.message }, 500);
  }
});

// Import discount routes
import discountApp from './discount.ts';

// Mount discount routes
adminApp.route('/', discountApp);

export default adminApp;