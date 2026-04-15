import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import * as kv from "./kv_store.tsx";
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Helper function to generate signed URLs for S3 images
async function generateSignedUrl(s3Url: string): Promise<string> {
  try {
    // Extract the S3 key from the URL
    // Format: https://bucket.s3.region.amazonaws.com/key
    const urlMatch = s3Url.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/(.+)/);
    if (!urlMatch) {
      console.warn('Not an S3 URL, returning as-is:', s3Url.substring(0, 50));
      return s3Url;
    }
    
    const bucket = urlMatch[1];
    const region = urlMatch[2];
    const key = decodeURIComponent(urlMatch[3]);
    
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.warn('AWS credentials not configured, returning direct URL');
      return s3Url;
    }
    
    // Import AWS SDK for signed URLs
    const { S3Client } = await import('npm:@aws-sdk/client-s3@3');
    const { getSignedUrl } = await import('npm:@aws-sdk/s3-request-presigner@3');
    const { GetObjectCommand, HeadObjectCommand } = await import('npm:@aws-sdk/client-s3@3');
    
    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    
    // CRITICAL: Verify file exists before generating signed URL
    // This prevents 404 errors when trying to use the signed URL
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(headCommand);
    } catch (headError: any) {
      if (headError.name === 'NotFound' || headError.$metadata?.httpStatusCode === 404) {
        console.warn(`⚠️ S3 file does not exist: ${key.substring(0, 80)}`);
        throw new Error('File not found in S3');
      }
      // For other errors (permissions, etc.), log but continue to try generating URL
      console.warn('Warning checking S3 file existence:', headError.message);
    }
    
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    // Generate signed URL valid for 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error: any) {
    // Only log detailed error for non-404 cases
    if (!error.message?.includes('File not found')) {
      console.error('Failed to generate signed URL:', error);
    }
    throw error; // Re-throw so caller can handle
  }
}

// Enable CORS
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-Admin-Email"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Health check
app.get("/make-server-3e3a9cd7/ping", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Supabase config
app.get("/make-server-3e3a9cd7/supabase-config", (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return c.json({ error: 'Supabase not configured' }, 500);
  }
  
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || '';
  return c.json({ projectId, publicAnonKey: supabaseAnonKey });
});

// Stripe config - returns publishable key
app.get("/make-server-3e3a9cd7/stripe-config", (c) => {
  const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
  
  if (!publishableKey) {
    console.error('❌ STRIPE_PUBLISHABLE_KEY not found in environment variables');
    return c.json({ error: 'Stripe not configured' }, 500);
  }
  
  console.log('✅ Returning Stripe publishable key (prefix):', publishableKey.substring(0, 10) + '...');
  return c.json({ publishableKey });
});

// Image proxy endpoint to bypass CORS issues with S3 signed URLs
app.get("/make-server-3e3a9cd7/proxy-image", async (c) => {
  try {
    const imageUrl = c.req.query('url');
    
    if (!imageUrl) {
      return c.json({ error: 'Missing url parameter' }, 400);
    }
    
    console.log('🖼️ Proxying image:', imageUrl.substring(0, 80) + '...');
    
    // Fetch the image from S3
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch image from S3:', response.status, response.statusText);
      return c.json({ error: `Failed to fetch image: ${response.statusText}` }, response.status);
    }
    
    // Get the image data as array buffer
    const imageData = await response.arrayBuffer();
    
    // Get content type from original response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log('✅ Image proxied successfully:', contentType, imageData.byteLength, 'bytes');
    
    // Return the image with proper headers
    return new Response(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('❌ Error proxying image:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Customer address management routes
app.all("/make-server-3e3a9cd7/customer/*", async (c) => {
  const { default: customerRoutes } = await import("./customer.ts");
  return await customerRoutes.fetch(c.req.raw, {});
});

// Customer collections endpoint (for Stock Photos page)
app.get("/make-server-3e3a9cd7/collections", async (c) => {
  const { default: customerRoutes } = await import("./customer.ts");
  return await customerRoutes.fetch(c.req.raw, {});
});

// Collection details endpoint (for CollectionPage)
app.get("/make-server-3e3a9cd7/stock-photos/:collectionName", async (c) => {
  const { default: customerRoutes } = await import("./customer.ts");
  return await customerRoutes.fetch(c.req.raw, {});
});

// Public testimonials endpoint (no auth required)
app.get("/make-server-3e3a9cd7/testimonials", async (c) => {
  try {
    console.log('📝 GET /testimonials (public) called');
    // Use the same data source as admin - fetch from prefixed keys
    const testimonials = await kv.getByPrefix('testimonial:') || [];
    console.log(`✅ Returning ${testimonials.length} testimonials`);
    
    // Sort by createdAt (newest first)
    const sortedTestimonials = testimonials.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return c.json({ testimonials: sortedTestimonials });
  } catch (error: any) {
    console.error('❌ Failed to fetch testimonials:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mount admin routes (includes inventory, testimonials, orders, etc.)
// Note: admin.ts routes are already prefixed with /make-server-3e3a9cd7
const { default: adminRoutes } = await import("./admin.ts");
app.route('/', adminRoutes);

// Lazy-load webhook routes
app.all("/make-server-3e3a9cd7/webhooks/*", async (c) => {
  const { default: webhookRoutes } = await import("./webhooks.ts");
  return await webhookRoutes.fetch(c.req.raw, {});
});

// Lazy-load marketplace routes
app.all("/make-server-3e3a9cd7/marketplace/*", async (c) => {
  const { default: marketplaceRoutes } = await import("./marketplace.ts");
  // Forward the request to the marketplace router
  // Strip the /make-server-3e3a9cd7/marketplace prefix so the nested router works correctly
  return await marketplaceRoutes.fetch(c.req.raw, {});
});

// Legacy Photographer Dashboard endpoint - DEPRECATED, use /marketplace/photographer/dashboard instead
app.post("/make-server-3e3a9cd7/photographer-dashboard", async (c) => {
  console.log('⚠️ WARNING: Legacy photographer-dashboard endpoint called. Please update client to use /marketplace/photographer/dashboard');
  return c.json({ 
    error: 'This endpoint is deprecated. Please use /marketplace/photographer/dashboard with GET and Authorization header.' 
  }, 410); // 410 Gone status
});

// Track a marketplace photo sale (called when order is completed)
app.post("/make-server-3e3a9cd7/track-marketplace-sale", async (c) => {
  try {
    const body = await c.req.json();
    const { photoId, orderId, printSize, quantity, basePrice, customerName } = body;

    if (!photoId || !orderId) {
      return c.json({ error: 'photoId and orderId required' }, 400);
    }

    // Get the photo details
    const photo = await kv.get(`marketplace:photo:${photoId}`);
    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    // Calculate royalty (25%)
    const royaltyPercentage = 25;
    const royaltyAmount = (basePrice * royaltyPercentage) / 100;

    // Create sale record
    const saleId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sale = {
      id: saleId,
      photoId,
      photographerEmail: photo.photographerEmail,
      photographerName: photo.photographerName,
      orderId,
      saleDate: new Date().toISOString(),
      printSize,
      quantity,
      basePrice,
      royaltyPercentage,
      royaltyAmount,
      customerName: customerName || 'Anonymous',
    };

    await kv.set(`marketplace:sale:${saleId}`, sale);

    console.log(`✅ Marketplace sale tracked: ${royaltyAmount.toFixed(2)} royalty for photographer ${photo.photographerEmail}`);

    return c.json({ 
      success: true, 
      saleId,
      royaltyAmount,
    });
  } catch (error: any) {
    console.error('Error tracking marketplace sale:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== PHOTOGRAPHER PAYOUT SYSTEM ENDPOINTS =====

// Get photographer earnings summary
app.get('/make-server-3e3a9cd7/photographer/earnings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user from Supabase auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get photographer earnings from KV store
    const earningsKey = `photographer:${user.id}:earnings`;
    const payoutsKey = `photographer:${user.id}:payouts`;
    
    const earnings = await kv.get(earningsKey) || {
      total_earnings: 0,
      pending_earnings: 0,
      paid_out: 0,
      available_balance: 0,
      sales_count: 0,
      this_month: 0,
      last_month: 0,
    };

    const payouts = await kv.getByPrefix(payoutsKey) || [];

    return c.json({
      summary: earnings,
      payout_requests: payouts,
    });
  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Request payout
app.post('/make-server-3e3a9cd7/photographer/request-payout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { amount, payment_method, payment_details } = await c.req.json();

    // Validate amount
    if (amount < 50) {
      return c.json({ error: 'Minimum payout amount is $50' }, 400);
    }

    // Check available balance
    const earningsKey = `photographer:${user.id}:earnings`;
    const earnings = await kv.get(earningsKey) || { available_balance: 0 };
    
    if (amount > earnings.available_balance) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    // Create payout request
    const payoutId = crypto.randomUUID();
    const payoutRequest = {
      id: payoutId,
      photographer_id: user.id,
      amount,
      status: 'pending',
      requested_at: new Date().toISOString(),
      payment_method,
      payment_details,
    };

    await kv.set(`photographer:${user.id}:payouts:${payoutId}`, payoutRequest);

    // Update available balance
    earnings.available_balance -= amount;
    earnings.pending_earnings = (earnings.pending_earnings || 0) + amount;
    await kv.set(earningsKey, earnings);

    return c.json({ success: true, payout_id: payoutId });
  } catch (error: any) {
    console.error('Error requesting payout:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== ANALYTICS & AUTO-APPROVAL ENDPOINTS =====

app.get('/make-server-3e3a9cd7/:role/analytics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Mock analytics data
    const analytics = {
      revenue: {
        today: 1247.89,
        this_week: 5234.67,
        this_month: 18392.45,
        all_time: 125483.92,
      },
      orders: {
        today: 12,
        this_week: 48,
        this_month: 187,
        total: 1245,
        pending: 8,
        completed: 1205,
      },
      customers: {
        total: 842,
        new_this_month: 67,
        returning_rate: 42,
      },
      photographers: {
        total: 34,
        active: 28,
        pending_approval: 3,
        total_photos: 1247,
        approved_photos: 1189,
      },
      top_products: [
        { size: '12" × 8"', sales: 234, revenue: 11696.66 },
        { size: '16" × 24"', sales: 189, revenue: 20789.11 },
      ],
      recent_sales: [
        { id: '1', date: new Date().toISOString(), customer: 'John D.', amount: 89.99, status: 'completed' },
        { id: '2', date: new Date().toISOString(), customer: 'Sarah M.', amount: 149.99, status: 'pending' },
      ],
    };

    const chartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      revenue: [842, 1247, 934, 1456, 1123, 1892, 1678],
      orders: [8, 12, 9, 14, 11, 18, 16],
    };

    return c.json({ analytics, chart_data: chartData });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3e3a9cd7/admin/auto-approval-settings', async (c) => {
  try {
    const settings = await kv.get('auto_approval_settings') || {
      enabled: true,
      min_resolution_width: 3000,
      min_resolution_height: 2000,
      max_file_size_mb: 50,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      auto_approve_trusted_photographers: true,
      trust_threshold_sales: 10,
      require_metadata: false,
      check_duplicates: true,
      ai_quality_check: true,
      min_quality_score: 75,
    };

    return c.json({ settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-3e3a9cd7/admin/auto-approval-settings', async (c) => {
  try {
    const { settings } = await c.req.json();
    await kv.set('auto_approval_settings', settings);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3e3a9cd7/admin/auto-approval-stats', async (c) => {
  try {
    const stats = {
      total_pending: 12,
      auto_approved_today: 34,
      auto_rejected_today: 5,
      manual_review_needed: 3,
      average_processing_time_seconds: 2.4,
    };
    return c.json({ stats });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Customer management endpoints
app.get('/make-server-3e3a9cd7/admin/customers', async (c) => {
  try {
    // Get all customers from auth.users who are not photographers or admins
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return c.json({ error: authError.message }, 500);
    }

    // Get photographer emails to exclude
    const photographerKeys = await kv.getByPrefix('photographer:');
    const photographerEmails = new Set(
      photographerKeys.map(key => key.replace('photographer:', '').split(':')[0])
    );

    // Filter to only customers (non-photographers, non-admins)
    const customers = authUsers.users
      .filter(user => {
        const email = user.email || '';
        const isPhotographer = photographerEmails.has(email);
        const isAdmin = email.includes('admin') || user.user_metadata?.role === 'admin';
        return !isPhotographer && !isAdmin;
      })
      .map(user => ({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || 'N/A',
        createdAt: user.created_at,
        status: user.banned_until ? 'suspended' : 'active',
        orderCount: 0, // TODO: Get actual order count
        totalSpent: 0, // TODO: Get actual total spent
      }));

    return c.json({ customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-3e3a9cd7/admin/customers/:customerId/status', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    const { status } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (status === 'suspended') {
      // Ban user for 100 years (effectively permanent)
      const banUntil = new Date();
      banUntil.setFullYear(banUntil.getFullYear() + 100);
      
      const { error } = await supabase.auth.admin.updateUserById(customerId, {
        ban_duration: '876000h', // 100 years in hours
      });

      if (error) {
        console.error('Error suspending customer:', error);
        return c.json({ error: error.message }, 500);
      }
    } else {
      // Unban user
      const { error } = await supabase.auth.admin.updateUserById(customerId, {
        ban_duration: 'none',
      });

      if (error) {
        console.error('Error reactivating customer:', error);
        return c.json({ error: error.message }, 500);
      }
    }

    return c.json({ success: true, status });
  } catch (error: any) {
    console.error('Error updating customer status:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);