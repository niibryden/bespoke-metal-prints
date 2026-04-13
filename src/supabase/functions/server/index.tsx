import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import * as kv from "./kv_store.tsx";

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
    
    // Generate signed URL valid for 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    return s3Url; // Return original URL as fallback
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

// Public endpoint to get stock photo collections (for Stock Photos page)
app.get("/make-server-3e3a9cd7/collections", async (c) => {
  try {
    const collections = await kv.get('stock:collections') || [];
    
    // Transform collections to public format with only web-optimized images
    const publicCollections = await Promise.all(collections.map(async (col: any, index: number) => {
      // Filter to only include web-optimized images (faster loading)
      const webImages = (col.images || []).filter((img: any) => 
        img.url.includes('-web.') || !img.url.includes('-original.')
      );
      
      // Generate signed URLs for marketplace photos or images in private paths
      const photosWithUrls = await Promise.all(webImages.map(async (img: any) => {
        let imageUrl = img.url;
        
        // If it's a marketplace photo or in a private path (contains '/original/'), use signed URL
        if (img.isMarketplacePhoto || img.url.includes('/original/') || img.url.includes('marketplace')) {
          try {
            imageUrl = await generateSignedUrl(img.url);
          } catch (err) {
            console.warn('Failed to generate signed URL for:', img.url.substring(0, 50), err);
            // Keep original URL as fallback
          }
        }
        
        return {
          id: img.id,
          url: imageUrl,
          name: img.name || img.title
        };
      }));
      
      return {
        id: col.id || `col_${index}`, // Generate ID if missing
        title: col.name,
        description: col.description || '',
        photos: photosWithUrls,
        hidden: col.hidden || false
      };
    }));
    
    return c.json(publicCollections);
  } catch (error: any) {
    console.error('Failed to fetch collections for public:', error);
    return c.json({ error: 'Failed to fetch collections' }, 500);
  }
});

// Public endpoint to get photos from a specific collection
app.get("/make-server-3e3a9cd7/stock-photos/:collectionName", async (c) => {
  try {
    const collectionName = c.req.param('collectionName');
    const collections = await kv.get('stock:collections') || [];
    
    // Find the requested collection
    const collection = collections.find((col: any) => col.name === collectionName);
    
    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }
    
    // Filter to only include web-optimized images (faster loading)
    const webImages = (collection.images || []).filter((img: any) => 
      img.url.includes('-web.') || !img.url.includes('-original.')
    );
    
    // Transform photos to the format expected by CollectionDetailView with direct S3 URLs
    const photos = webImages.map((img: any) => {
      return {
        id: img.id,
        title: img.name,
        url: img.url, // Direct S3 URL
        optimizedUrl: img.url // Use the same URL since it's already optimized
      };
    });
    
    return c.json({ photos });
  } catch (error: any) {
    console.error('Failed to fetch photos for collection:', error);
    return c.json({ error: 'Failed to fetch photos' }, 500);
  }
});

// Public endpoint to get inventory (for configurator)
// ⚠️ CRITICAL: Uses KV key 'inventory' - same as admin endpoints
// Do NOT change this key or it will break sync with admin panel
app.get("/make-server-3e3a9cd7/inventory", async (c) => {
  try {
    const inventory = await kv.get('inventory') || [];
    
    // Return inventory data in the same format as admin endpoint
    return c.json({ inventory });
  } catch (error: any) {
    console.error('Failed to fetch inventory for public:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

// Debug endpoint to inspect inventory with special characters visible
app.get("/make-server-3e3a9cd7/inventory-debug", async (c) => {
  try {
    const inventory = await kv.get('inventory') || [];
    
    // Convert each item's name to show hidden characters
    const debugInventory = inventory.map((item: any) => ({
      ...item,
      nameDebug: JSON.stringify(item.name), // Shows tabs, special chars
      nameLength: item.name.length,
      charCodes: Array.from(item.name).map((char: string) => char.charCodeAt(0)),
    }));
    
    return c.json({ 
      inventory: debugInventory,
      count: debugInventory.length,
      sizes: debugInventory.filter((i: any) => i.category === 'size'),
    });
  } catch (error: any) {
    console.error('Failed to fetch debug inventory:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

// Cleanup endpoint to remove inventory items with tab characters or other issues
app.post("/make-server-3e3a9cd7/inventory-cleanup", async (c) => {
  try {
    const inventory = await kv.get('inventory') || [];
    
    // Find items with tab characters, leading/trailing whitespace, or other issues
    const problematicItems = inventory.filter((item: any) => {
      const hasTab = item.name.includes('\t');
      const hasLeadingSpace = item.name !== item.name.trimStart();
      const hasTrailingSpace = item.name !== item.name.trimEnd();
      return hasTab || hasLeadingSpace || hasTrailingSpace;
    });
    
    // Remove problematic items
    const cleanedInventory = inventory.filter((item: any) => {
      const hasTab = item.name.includes('\t');
      const hasLeadingSpace = item.name !== item.name.trimStart();
      const hasTrailingSpace = item.name !== item.name.trimEnd();
      return !(hasTab || hasLeadingSpace || hasTrailingSpace);
    });
    
    // Save cleaned inventory
    await kv.set('inventory', cleanedInventory);
    
    return c.json({ 
      success: true,
      removed: problematicItems.length,
      removedItems: problematicItems.map((item: any) => ({
        name: item.name,
        nameDebug: JSON.stringify(item.name),
        category: item.category,
        price: item.price,
      })),
      remainingCount: cleanedInventory.length,
    });
  } catch (error: any) {
    console.error('Failed to cleanup inventory:', error);
    return c.json({ error: 'Failed to cleanup inventory' }, 500);
  }
});

// Proxy endpoint for S3 images - fetches and returns with CORS headers
app.options("/make-server-3e3a9cd7/proxy-image", async (c) => {
  // Handle CORS preflight
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.get("/make-server-3e3a9cd7/proxy-image", async (c) => {
  const isHead = c.req.method === 'HEAD';
  
  // Handle HEAD requests for the image
  if (isHead) {
    const s3Url = c.req.query('url');
    
    if (!s3Url) {
      return new Response(null, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    try {
      const signedUrl = await generateSignedUrl(s3Url);
      const imageResponse = await fetch(signedUrl, { method: 'HEAD' });
      
      return new Response(null, {
        status: imageResponse.status,
        headers: {
          'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
          'Content-Length': imageResponse.headers.get('content-length') || '0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    } catch (error) {
      return new Response(null, {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
  
  // Handle GET requests
  try {
    const s3Url = c.req.query('url');
    
    if (!s3Url) {
      console.error('❌ Proxy image: Missing url parameter');
      return c.json({ error: 'Missing url parameter' }, 400);
    }
    
    console.log('🖼️ Fetching S3 image via proxy:', s3Url.substring(0, 80) + '...');
    
    // Generate signed URL if it's a direct S3 URL
    const signedUrl = await generateSignedUrl(s3Url);
    console.log('🔑 Generated signed URL (first 100 chars):', signedUrl.substring(0, 100) + '...');
    
    // Fetch the image from S3
    console.log('📥 Fetching image from S3...');
    const imageResponse = await fetch(signedUrl);
    
    console.log('📥 S3 Response status:', imageResponse.status);
    console.log('📥 S3 Response headers:', Object.fromEntries(imageResponse.headers.entries()));
    
    if (!imageResponse.ok) {
      console.error('❌ Failed to fetch image from S3:', imageResponse.status, imageResponse.statusText);
      const errorText = await imageResponse.text();
      console.error('❌ S3 Error response:', errorText);
      return c.json({ error: `Failed to fetch image: ${imageResponse.statusText}`, details: errorText }, imageResponse.status);
    }
    
    // Get the image data as an ArrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    console.log('✅ Image fetched successfully, size:', imageBuffer.byteLength, 'bytes, type:', contentType);
    
    // Return the image with CORS headers
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to proxy image:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return c.json({ error: 'Failed to proxy image: ' + error.message, stack: error.stack }, 500);
  }
});

// Lightweight endpoint to get signed URL without fetching image (saves memory)
app.get("/make-server-3e3a9cd7/get-signed-url", async (c) => {
  try {
    const s3Url = c.req.query('url');
    
    if (!s3Url) {
      console.error('❌ Get signed URL: Missing url parameter');
      return c.json({ error: 'Missing url parameter' }, 400);
    }
    
    console.log('🔑 Generating signed URL for:', s3Url.substring(0, 80) + '...');
    
    // Generate signed URL if it's a direct S3 URL
    const signedUrl = await generateSignedUrl(s3Url);
    console.log('✅ Signed URL generated (first 80 chars):', signedUrl.substring(0, 80) + '...');
    
    // Return just the URL - browser will fetch it directly
    return c.json({ signedUrl });
  } catch (error: any) {
    console.error('❌ Failed to generate signed URL:', error);
    return c.json({ error: 'Failed to generate signed URL: ' + error.message }, 500);
  }
});

// Lazy-load admin routes
app.all("/make-server-3e3a9cd7/admin/*", async (c) => {
  const { default: adminRoutes } = await import("./admin.ts");
  return await adminRoutes.fetch(c.req.raw, {});
});

// Lazy-load auth routes  
app.post("/make-server-3e3a9cd7/signup", async (c) => {
  const { default: authRoutes } = await import("./auth.ts");
  return await authRoutes.fetch(c.req.raw, {});
});

app.get("/make-server-3e3a9cd7/me", async (c) => {
  const { default: authRoutes } = await import("./auth.ts");
  return await authRoutes.fetch(c.req.raw, {});
});

// Lazy-load checkout routes
app.all("/make-server-3e3a9cd7/checkout/*", async (c) => {
  const { default: checkoutRoutes } = await import("./checkout.ts");
  return await checkoutRoutes.fetch(c.req.raw, {});
});

// Payment intent and order creation routes (used by checkout)
app.post("/make-server-3e3a9cd7/create-payment-intent", async (c) => {
  const { default: checkoutRoutes } = await import("./checkout.ts");
  return await checkoutRoutes.fetch(c.req.raw, {});
});

app.post("/make-server-3e3a9cd7/create-order", async (c) => {
  const { default: checkoutRoutes } = await import("./checkout.ts");
  return await checkoutRoutes.fetch(c.req.raw, {});
});

// Update order routes (for image upload after payment)
app.post("/make-server-3e3a9cd7/update-order", async (c) => {
  const { default: checkoutRoutes } = await import("./checkout.ts");
  return await checkoutRoutes.fetch(c.req.raw, {});
});

app.post("/make-server-3e3a9cd7/update-order-status", async (c) => {
  const { default: checkoutRoutes } = await import("./checkout.ts");
  return await checkoutRoutes.fetch(c.req.raw, {});
});

// Lazy-load customer routes
app.get("/make-server-3e3a9cd7/order/:orderId/tracking", async (c) => {
  const { default: customerRoutes } = await import("./customer.ts");
  return await customerRoutes.fetch(c.req.raw, {});
});

app.get("/make-server-3e3a9cd7/tracking/:trackingNumber", async (c) => {
  const { default: customerRoutes } = await import("./customer.ts");
  return await customerRoutes.fetch(c.req.raw, {});
});

app.get("/make-server-3e3a9cd7/tracking/:trackingNumber/live", async (c) => {
  const { default: customerRoutes } = await import("./customer.ts");
  return await customerRoutes.fetch(c.req.raw, {});
});

// Track orders by email (public endpoint - for guest checkout)
app.post("/make-server-3e3a9cd7/tracking/by-email", async (c) => {
  const { default: customerRoutes } = await import("./customer.ts");
  return await customerRoutes.fetch(c.req.raw, {});
});

// Customer address management routes
app.all("/make-server-3e3a9cd7/customer/*", async (c) => {
  const { default: customerRoutes } = await import("./customer.ts");
  return await customerRoutes.fetch(c.req.raw, {});
});

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

Deno.serve(app.fetch);