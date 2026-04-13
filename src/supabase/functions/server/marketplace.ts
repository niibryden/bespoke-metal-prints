import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable CORS for all marketplace routes
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Admin-Email'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Helper: Generate signed URLs for S3 images
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

// Helper: Get authenticated user
async function getAuthenticatedUser(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || ''
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Helper: Upload to S3
async function uploadToS3(file: File, folder: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import('npm:@aws-sdk/client-s3@3');
  
  const s3Client = new S3Client({
    region: Deno.env.get('AWS_REGION') || 'us-east-1',
    credentials: {
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
      secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
    },
  });
  
  const bucketName = Deno.env.get('AWS_S3_BUCKET_NAME');
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME not configured');
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const ext = file.name.split('.').pop();
  const key = `${folder}/${timestamp}-${randomStr}.${ext}`;
  
  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });
  
  await s3Client.send(command);
  
  // Return S3 URL
  return `https://${bucketName}.s3.${Deno.env.get('AWS_REGION') || 'us-east-1'}.amazonaws.com/${key}`;
}

// Helper: Delete from S3
async function deleteFromS3(s3Url: string): Promise<void> {
  const { S3Client, DeleteObjectCommand } = await import('npm:@aws-sdk/client-s3@3');
  
  const s3Client = new S3Client({
    region: Deno.env.get('AWS_REGION') || 'us-east-1',
    credentials: {
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
      secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
    },
  });
  
  const bucketName = Deno.env.get('AWS_S3_BUCKET_NAME');
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME not configured');
  }
  
  // Extract S3 key from URL
  // Format: https://bucket.s3.region.amazonaws.com/key
  const urlMatch = s3Url.match(/https:\/\/[^\/]+\/(.+)/);
  if (!urlMatch) {
    throw new Error('Invalid S3 URL format');
  }
  
  const key = decodeURIComponent(urlMatch[1]);
  
  await s3Client.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));
  
  console.log('🗑️ Deleted from S3:', key);
}

// Helper: Upload to S3 with both original and web versions (like admin stock photos)
async function uploadMarketplacePhoto(file: File, photographerId: string, photographerName: string): Promise<{ originalUrl: string; webUrl: string }> {
  const { S3Client, PutObjectCommand } = await import('npm:@aws-sdk/client-s3@3');
  
  const s3Client = new S3Client({
    region: Deno.env.get('AWS_REGION') || 'us-east-1',
    credentials: {
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
      secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
    },
  });
  
  const bucketName = Deno.env.get('AWS_S3_BUCKET_NAME');
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME not configured');
  }
  
  const region = Deno.env.get('AWS_REGION') || 'us-east-1';
  
  // Create photographer folder slug from name or ID
  const photographerSlug = photographerName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || photographerId;
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const ext = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomStr}.${ext}`;
  
  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  // Upload original (full resolution for printing)
  const originalKey = `marketplace/${photographerSlug}/original/${fileName}`;
  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: originalKey,
    Body: buffer,
    ContentType: file.type,
  }));
  
  const originalUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${originalKey}`;
  console.log('✅ Original uploaded:', originalUrl);
  
  // Upload web version (optimized for display)
  const webKey = `marketplace/${photographerSlug}/web/${fileName}`;
  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: webKey,
    Body: buffer,
    ContentType: file.type,
  }));
  
  const webUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${webKey}`;
  console.log('✅ Web version uploaded:', webUrl);
  
  return { originalUrl, webUrl };
}

// Helper: Add marketplace photo to stock photo collections
async function addMarketplacePhotoToStockCollections(photo: any) {
  try {
    const collections = await kv.get('stock:collections') || [];
    
    // Map marketplace category to stock photo collection name
    const categoryMap: Record<string, string> = {
      'nature': 'Nature & Landscapes',
      'urban': 'Urban & Architecture',
      'portrait': 'Portrait & People',
      'abstract': 'Abstract & Artistic',
      'wildlife': 'Wildlife & Animals',
      'travel': 'Travel & Adventure',
      'food': 'Food & Culinary',
      'sports': 'Sports & Action',
      'other': 'Marketplace',
      'uncategorized': 'Marketplace',
    };
    
    const collectionName = categoryMap[photo.category] || 'Marketplace';
    
    // Find or create collection
    let collection = collections.find((col: any) => col.name === collectionName);
    
    if (!collection) {
      // Create new collection for this category
      collection = {
        name: collectionName,
        images: [],
        description: `${collectionName} photos from our photographer marketplace`,
      };
      collections.push(collection);
    }
    
    // Create stock photo format from marketplace photo
    const stockImage = {
      id: photo.id,
      url: photo.webUrl || photo.s3Url, // Use web URL for display
      title: photo.title,
      description: photo.description || '',
      tags: photo.tags || [],
      photographerId: photo.photographerId,
      photographerName: photo.photographerName,
      isMarketplacePhoto: true, // Flag to identify marketplace photos
      royaltyRate: photo.photographerRoyalty,
      name: photo.title, // Add 'name' field for compatibility with stock photos
    };
    
    // Add image to collection if not already present
    if (!collection.images.find((img: any) => img.id === photo.id)) {
      collection.images.push(stockImage);
      
      // Save updated collections
      await kv.set('stock:collections', collections);
      
      console.log(`✅ Added marketplace photo to "${collectionName}" collection:`, photo.id);
    }
  } catch (error: any) {
    console.error('❌ Error adding photo to stock collections:', error);
    // Don't throw error - we don't want to fail approval if stock sync fails
  }
}

// ==================== PHOTOGRAPHER ROUTES ====================

// Check if user is a photographer
app.get("/make-server-3e3a9cd7/marketplace/photographer/check", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`photographer:profile:${user.id}`);
    
    if (!profile) {
      return c.json({ isPhotographer: false }, 404);
    }
    
    return c.json({ isPhotographer: true, profile });
  } catch (error: any) {
    console.error('❌ Error checking photographer status:', error);
    return c.json({ error: error.message || 'Failed to check photographer status' }, 500);
  }
});

// Register as photographer
app.post("/make-server-3e3a9cd7/marketplace/photographer/register", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { displayName, bio, portfolioUrl, instagramHandle } = await c.req.json();
    
    // Check if already registered
    const existing = await kv.get(`photographer:profile:${user.id}`);
    if (existing) {
      return c.json({ error: 'Already registered as photographer' }, 400);
    }
    
    // Create photographer profile
    const profile = {
      id: user.id,
      userId: user.id,
      email: user.email,
      displayName: displayName || user.email?.split('@')[0] || 'Unknown',
      bio: bio || '',
      portfolioUrl: portfolioUrl || '',
      instagramHandle: instagramHandle || '',
      commissionRate: 30, // 30% royalty by default
      totalSales: 0,
      totalEarnings: 0,
      status: 'pending', // pending, approved, suspended
      joinedDate: new Date().toISOString(),
      photoCount: 0,
      approvedPhotoCount: 0,
    };
    
    await kv.set(`photographer:profile:${user.id}`, profile);
    
    // Add to pending list for admin review
    const pending = await kv.get('photographer:pending') || [];
    pending.push(user.id);
    await kv.set('photographer:pending', pending);
    
    console.log('✅ Photographer registered:', user.id, displayName);
    
    return c.json({ 
      success: true, 
      profile,
      message: 'Application submitted! We\'ll review it within 24 hours.'
    });
  } catch (error: any) {
    console.error('❌ Error registering photographer:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get photographer profile (own profile)
app.get("/photographer/profile-old", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`photographer:profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Not registered as photographer' }, 404);
    }
    
    return c.json({ profile });
  } catch (error: any) {
    console.error('❌ Error fetching photographer profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update photographer profile
app.put("/photographer/profile-old", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`photographer:profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Not registered as photographer' }, 404);
    }
    
    const updates = await c.req.json();
    const updatedProfile = {
      ...profile,
      ...updates,
      id: profile.id, // Don't allow changing ID
      userId: profile.userId,
      status: profile.status, // Don't allow self-approval
      commissionRate: profile.commissionRate, // Don't allow changing commission
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`photographer:profile:${user.id}`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('❌ Error updating photographer profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Upload photo
app.post("/make-server-3e3a9cd7/marketplace/photographer/upload", async (c) => {
  try {
    console.log('📤 Upload request received');
    
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      console.log('❌ No authenticated user');
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('👤 Authenticated user:', user.id);
    
    const profile = await kv.get(`photographer:profile:${user.id}`);
    if (!profile) {
      console.log('❌ No photographer profile found for user:', user.id);
      return c.json({ error: 'Not registered as photographer' }, 404);
    }
    
    console.log('📸 Photographer profile:', profile.displayName, 'Status:', profile.status);
    
    if (profile.status !== 'approved') {
      console.log('❌ Photographer not approved. Current status:', profile.status);
      return c.json({ 
        error: 'Photographer account not approved yet', 
        status: profile.status,
        message: profile.status === 'pending' 
          ? 'Your photographer application is pending review. Please wait for admin approval before uploading photos.'
          : 'Your photographer account is not active. Please contact support.'
      }, 403);
    }
    
    console.log('📝 Parsing form data...');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;
    const basePrice = parseFloat(formData.get('basePrice') as string || '0');
    
    console.log('📄 Form data:', { title, category, fileSize: file?.size, fileType: file?.type });
    
    if (!file) {
      console.log('❌ No file in form data');
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Upload to S3 - use stock/original/marketplace path (matches IAM policy structure)
    console.log('☁️ Uploading to S3...');
    const { originalUrl, webUrl } = await uploadMarketplacePhoto(file, user.id, profile.displayName);
    console.log('✅ S3 upload complete:', originalUrl, webUrl);
    
    // Create photo record
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const photo = {
      id: photoId,
      photographerId: user.id,
      photographerName: profile.displayName,
      s3Url: originalUrl,
      webUrl: webUrl,
      title: title || 'Untitled',
      description: description || '',
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      category: category || 'uncategorized',
      basePrice: basePrice || 0,
      photographerRoyalty: profile.commissionRate,
      status: 'pending', // pending, approved, rejected
      uploadDate: new Date().toISOString(),
      sales: 0,
      views: 0,
      featured: false,
    };
    
    await kv.set(`marketplace:photo:${photoId}`, photo);
    
    // Add to photographer's photo list
    const photographerPhotos = await kv.get(`photographer:photos:${user.id}`) || [];
    photographerPhotos.push(photoId);
    await kv.set(`photographer:photos:${user.id}`, photographerPhotos);
    
    // Add to pending photos for admin review
    const pendingPhotos = await kv.get('marketplace:photos:pending') || [];
    pendingPhotos.push(photoId);
    await kv.set('marketplace:photos:pending', pendingPhotos);
    
    // Update photographer's photo count
    profile.photoCount = (profile.photoCount || 0) + 1;
    await kv.set(`photographer:profile:${user.id}`, profile);
    
    console.log('✅ Photo uploaded:', photoId, title);
    
    return c.json({ 
      success: true, 
      photo,
      message: 'Photo uploaded! It will be reviewed within 24 hours.'
    });
  } catch (error: any) {
    console.error('❌ Error uploading photo:', error);
    console.error('❌ Error stack:', error.stack);
    return c.json({ 
      error: error.message || 'Failed to upload photo',
      details: error.stack?.split('\n').slice(0, 3).join('\n')
    }, 500);
  }
});

// Get photographer's photos
app.get("/make-server-3e3a9cd7/marketplace/photographer/photos", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const photoIds = await kv.get(`photographer:photos:${user.id}`) || [];
    const photos = await Promise.all(
      photoIds.map((id: string) => kv.get(`marketplace:photo:${id}`))
    );
    
    return c.json({ photos: photos.filter(Boolean) });
  } catch (error: any) {
    console.error('❌ Error fetching photographer photos:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete photo (photographer only - can delete pending/rejected photos, not approved ones with sales)
app.delete("/make-server-3e3a9cd7/marketplace/photographer/photo/:photoId", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const photoId = c.req.param('photoId');
    const photo = await kv.get(`marketplace:photo:${photoId}`);
    
    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }
    
    // Check ownership
    if (photo.photographerId !== user.id) {
      return c.json({ error: 'You can only delete your own photos' }, 403);
    }
    
    // Don't allow deleting approved photos with sales
    if (photo.status === 'approved' && (photo.sales || 0) > 0) {
      return c.json({ 
        error: 'Cannot delete approved photos with sales history',
        message: 'This photo has sales records and cannot be deleted. Contact support if you need assistance.'
      }, 403);
    }
    
    // Delete from S3 (both original and web versions)
    try {
      if (photo.s3Url) {
        await deleteFromS3(photo.s3Url);
      }
      if (photo.webUrl && photo.webUrl !== photo.s3Url) {
        await deleteFromS3(photo.webUrl);
      }
    } catch (s3Error: any) {
      console.error('⚠️ Error deleting from S3:', s3Error);
      // Continue with database deletion even if S3 fails
    }
    
    // Remove from photographer's photo list
    const photographerPhotos = await kv.get(`photographer:photos:${user.id}`) || [];
    const updatedPhotos = photographerPhotos.filter((id: string) => id !== photoId);
    await kv.set(`photographer:photos:${user.id}`, updatedPhotos);
    
    // Remove from pending list if present
    if (photo.status === 'pending') {
      const pending = await kv.get('marketplace:photos:pending') || [];
      const updatedPending = pending.filter((id: string) => id !== photoId);
      await kv.set('marketplace:photos:pending', updatedPending);
    }
    
    // Remove from approved list if present
    if (photo.status === 'approved') {
      const approved = await kv.get('marketplace:photos:approved') || [];
      const updatedApproved = approved.filter((id: string) => id !== photoId);
      await kv.set('marketplace:photos:approved', updatedApproved);
      
      // Remove from stock collections
      const collections = await kv.get('stock:collections') || [];
      collections.forEach((col: any) => {
        col.images = (col.images || []).filter((img: any) => img.id !== photoId);
      });
      await kv.set('stock:collections', collections);
    }
    
    // Delete photo record
    await kv.del(`marketplace:photo:${photoId}`);
    
    // Update photographer's photo count
    const profile = await kv.get(`photographer:profile:${user.id}`);
    if (profile) {
      profile.photoCount = Math.max(0, (profile.photoCount || 0) - 1);
      if (photo.status === 'approved') {
        profile.approvedPhotoCount = Math.max(0, (profile.approvedPhotoCount || 0) - 1);
      }
      await kv.set(`photographer:profile:${user.id}`, profile);
    }
    
    console.log('✅ Photo deleted by photographer:', photoId);
    
    return c.json({ 
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting photo:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get photographer dashboard stats
app.get("/make-server-3e3a9cd7/marketplace/photographer/dashboard", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`photographer:profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Not registered as photographer' }, 404);
    }
    
    const photoIds = await kv.get(`photographer:photos:${user.id}`) || [];
    const photos = await Promise.all(
      photoIds.map((id: string) => kv.get(`marketplace:photo:${id}`))
    );
    
    const approvedPhotos = photos.filter((p: any) => p?.status === 'approved');
    const pendingPhotos = photos.filter((p: any) => p?.status === 'pending');
    const rejectedPhotos = photos.filter((p: any) => p?.status === 'rejected');
    
    return c.json({ 
      profile,
      approvedPhotos,
      pendingPhotos,
      rejectedPhotos,
    });
  } catch (error: any) {
    console.error('❌ Error fetching photographer dashboard stats:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== MARKETPLACE BROWSE ROUTES ====================

// Get all approved marketplace photos (public)
app.get("/make-server-3e3a9cd7/marketplace/photos", async (c) => {
  try {
    console.log('📸 Fetching marketplace photos...');
    
    const approvedPhotoIds = await kv.get('marketplace:photos:approved') || [];
    console.log(`📋 Found ${approvedPhotoIds.length} approved photo IDs`);
    
    if (approvedPhotoIds.length === 0) {
      console.log('ℹ️ No approved marketplace photos yet');
      return c.json({ photos: [] });
    }
    
    const photos = await Promise.all(
      approvedPhotoIds.map(async (id: string) => {
        try {
          const photo = await kv.get(`marketplace:photo:${id}`);
          if (!photo) {
            console.warn(`⚠️ Photo ${id} not found in KV store`);
            return null;
          }
          
          // Generate signed URLs for S3 images
          const photoWithSignedUrls = { ...photo };
          
          // Use web URL if available, otherwise original URL
          const displayUrl = photo.webUrl || photo.s3Url;
          
          if (displayUrl) {
            try {
              photoWithSignedUrls.s3Url = await generateSignedUrl(displayUrl);
              console.log(`🔑 Generated signed URL for photo ${id}`);
            } catch (err) {
              console.error(`❌ Failed to generate signed URL for photo ${id}:`, err);
              // Keep original URL as fallback
            }
          }
          
          return photoWithSignedUrls;
        } catch (err) {
          console.error(`❌ Error fetching photo ${id}:`, err);
          return null;
        }
      })
    );
    
    const validPhotos = photos.filter(Boolean);
    console.log(`✅ Returning ${validPhotos.length} valid marketplace photos with signed URLs`);
    
    // Sort by upload date (newest first)
    validPhotos.sort((a: any, b: any) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
    
    return c.json({ photos: validPhotos });
  } catch (error: any) {
    console.error('❌ Error fetching marketplace photos:', error);
    console.error('❌ Error stack:', error.stack);
    return c.json({ 
      error: error.message || 'Failed to fetch marketplace photos',
      details: error.stack?.split('\n').slice(0, 3).join('\n')
    }, 500);
  }
});

// Get single photo details
app.get("/make-server-3e3a9cd7/marketplace/photo/:photoId", async (c) => {
  try {
    const photoId = c.req.param('photoId');
    const photo = await kv.get(`marketplace:photo:${photoId}`);
    
    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }
    
    // Increment view count
    photo.views = (photo.views || 0) + 1;
    await kv.set(`marketplace:photo:${photoId}`, photo);
    
    return c.json({ photo });
  } catch (error: any) {
    console.error('❌ Error fetching photo:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Search marketplace photos
app.get("/make-server-3e3a9cd7/marketplace/search", async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    const category = c.req.query('category');
    
    const approvedPhotoIds = await kv.get('marketplace:photos:approved') || [];
    const photos = await Promise.all(
      approvedPhotoIds.map((id: string) => kv.get(`marketplace:photo:${id}`))
    );
    
    let results = photos.filter(Boolean);
    
    // Filter by search query
    if (query) {
      results = results.filter((photo: any) => 
        photo.title?.toLowerCase().includes(query) ||
        photo.description?.toLowerCase().includes(query) ||
        photo.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (category && category !== 'all') {
      results = results.filter((photo: any) => photo.category === category);
    }
    
    return c.json({ photos: results });
  } catch (error: any) {
    console.error('❌ Error searching photos:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get featured photos
app.get("/make-server-3e3a9cd7/marketplace/featured", async (c) => {
  try {
    const approvedPhotoIds = await kv.get('marketplace:photos:approved') || [];
    const photos = await Promise.all(
      approvedPhotoIds.map((id: string) => kv.get(`marketplace:photo:${id}`))
    );
    
    const featured = photos.filter((photo: any) => photo?.featured === true);
    
    return c.json({ photos: featured });
  } catch (error: any) {
    console.error('❌ Error fetching featured photos:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get public photographer profile
app.get("/make-server-3e3a9cd7/marketplace/photographers/:id", async (c) => {
  try {
    const photographerId = c.req.param('id');
    const profile = await kv.get(`photographer:profile:${photographerId}`);
    
    if (!profile || profile.status !== 'approved') {
      return c.json({ error: 'Photographer not found' }, 404);
    }
    
    // Get photographer's approved photos
    const photoIds = await kv.get(`photographer:photos:${photographerId}`) || [];
    const allPhotos = await Promise.all(
      photoIds.map((id: string) => kv.get(`marketplace:photo:${id}`))
    );
    const approvedPhotos = allPhotos.filter((p: any) => p?.status === 'approved');
    
    // Return public profile (hide sensitive info)
    const publicProfile = {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio,
      portfolioUrl: profile.portfolioUrl,
      instagramHandle: profile.instagramHandle,
      joinedDate: profile.joinedDate,
      photoCount: approvedPhotos.length,
      totalSales: profile.totalSales || 0,
    };
    
    return c.json({ 
      profile: publicProfile,
      photos: approvedPhotos
    });
  } catch (error: any) {
    console.error('❌ Error fetching photographer profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Get pending photographers (admin only)
app.get("/make-server-3e3a9cd7/marketplace/admin/pending-photographers", async (c) => {
  try {
    // TODO: Add proper admin auth check
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const pendingIds = await kv.get('photographer:pending') || [];
    console.log('📋 Pending photographer IDs:', pendingIds);
    
    const profiles = await Promise.all(
      pendingIds.map(async (id: string) => {
        const profile = await kv.get(`photographer:profile:${id}`);
        console.log(`👤 Profile for ${id}:`, profile ? 'Found' : 'Not found');
        return profile;
      })
    );
    
    const validProfiles = profiles.filter(Boolean);
    console.log('✅ Valid pending profiles:', validProfiles.length);
    
    // Map the profile data to match what the UI expects
    const formattedProfiles = validProfiles.map((profile: any) => ({
      id: profile.userId,
      displayName: profile.displayName,
      email: profile.email,
      bio: profile.bio || '',
      portfolioUrl: profile.portfolioUrl || '',
      instagramHandle: profile.instagramHandle || '',
      joinedDate: profile.joinedDate,
      status: profile.status,
    }));
    
    return c.json({ photographers: formattedProfiles });
  } catch (error: any) {
    console.error('❌ Error fetching pending photographers:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Approve/reject photographer (admin only)
app.put("/make-server-3e3a9cd7/marketplace/admin/photographer/:id/status", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const photographerId = c.req.param('id');
    const { status, reason } = await c.req.json(); // approved, rejected, suspended
    
    const profile = await kv.get(`photographer:profile:${photographerId}`);
    if (!profile) {
      return c.json({ error: 'Photographer not found' }, 404);
    }
    
    profile.status = status;
    profile.statusReason = reason || '';
    profile.reviewedAt = new Date().toISOString();
    profile.reviewedBy = adminEmail;
    
    await kv.set(`photographer:profile:${photographerId}`, profile);
    
    // Remove from pending list
    if (status === 'approved' || status === 'rejected') {
      const pending = await kv.get('photographer:pending') || [];
      const updated = pending.filter((id: string) => id !== photographerId);
      await kv.set('photographer:pending', updated);
    }
    
    console.log(`✅ Photographer ${status}:`, photographerId);
    
    return c.json({ success: true, profile });
  } catch (error: any) {
    console.error('❌ Error updating photographer status:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get pending photos (admin only)
app.get("/make-server-3e3a9cd7/marketplace/admin/pending-photos", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const pendingIds = await kv.get('marketplace:photos:pending') || [];
    const photos = await Promise.all(
      pendingIds.map((id: string) => kv.get(`marketplace:photo:${id}`))
    );
    
    return c.json({ photos: photos.filter(Boolean) });
  } catch (error: any) {
    console.error('❌ Error fetching pending photos:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Approve/reject photo (admin only)
app.put("/make-server-3e3a9cd7/marketplace/admin/photo/:id/status", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const photoId = c.req.param('id');
    const { status, reason, featured } = await c.req.json(); // approved, rejected
    
    const photo = await kv.get(`marketplace:photo:${photoId}`);
    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }
    
    photo.status = status;
    photo.statusReason = reason || '';
    photo.reviewedAt = new Date().toISOString();
    photo.reviewedBy = adminEmail;
    if (featured !== undefined) {
      photo.featured = featured;
    }
    
    await kv.set(`marketplace:photo:${photoId}`, photo);
    
    // Update pending list
    const pending = await kv.get('marketplace:photos:pending') || [];
    const updatedPending = pending.filter((id: string) => id !== photoId);
    await kv.set('marketplace:photos:pending', updatedPending);
    
    // Update approved list
    if (status === 'approved') {
      const approved = await kv.get('marketplace:photos:approved') || [];
      if (!approved.includes(photoId)) {
        approved.push(photoId);
        await kv.set('marketplace:photos:approved', approved);
      }
      
      // 🆕 MERGE SYSTEMS: Add to stock photos collections
      await addMarketplacePhotoToStockCollections(photo);
      
      // Update photographer's approved count
      const profile = await kv.get(`photographer:profile:${photo.photographerId}`);
      if (profile) {
        profile.approvedPhotoCount = (profile.approvedPhotoCount || 0) + 1;
        await kv.set(`photographer:profile:${photo.photographerId}`, profile);
      }
    }
    
    console.log(`✅ Photo ${status}:`, photoId);
    
    return c.json({ success: true, photo });
  } catch (error: any) {
    console.error('❌ Error updating photo status:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all photographers
app.get("/make-server-3e3a9cd7/marketplace/admin/photographers", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const photographerIds = await kv.get('photographer:ids') || [];
    const profiles = await Promise.all(
      photographerIds.map((id: string) => kv.get(`photographer:profile:${id}`))
    );
    
    return c.json({ photographers: profiles.filter(Boolean) });
  } catch (error: any) {
    console.error('❌ Error fetching all photographers:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Approve photo
app.post("/make-server-3e3a9cd7/marketplace/admin/approve-photo/:photoId", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const photoId = c.req.param('photoId');
    const { featured } = await c.req.json(); // optional
    
    const photo = await kv.get(`marketplace:photo:${photoId}`);
    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }
    
    photo.status = 'approved';
    photo.statusReason = '';
    photo.reviewedAt = new Date().toISOString();
    photo.reviewedBy = adminEmail;
    if (featured !== undefined) {
      photo.featured = featured;
    }
    
    await kv.set(`marketplace:photo:${photoId}`, photo);
    
    // Update pending list
    const pending = await kv.get('marketplace:photos:pending') || [];
    const updatedPending = pending.filter((id: string) => id !== photoId);
    await kv.set('marketplace:photos:pending', updatedPending);
    
    // Update approved list
    const approved = await kv.get('marketplace:photos:approved') || [];
    if (!approved.includes(photoId)) {
      approved.push(photoId);
      await kv.set('marketplace:photos:approved', approved);
    }
    
    // 🆕 MERGE SYSTEMS: Add to stock photos collections
    await addMarketplacePhotoToStockCollections(photo);
    
    // Update photographer's approved count
    const profile = await kv.get(`photographer:profile:${photo.photographerId}`);
    if (profile) {
      profile.approvedPhotoCount = (profile.approvedPhotoCount || 0) + 1;
      await kv.set(`photographer:profile:${photo.photographerId}`, profile);
    }
    
    console.log(`✅ Photo approved:`, photoId);
    
    return c.json({ success: true, photo });
  } catch (error: any) {
    console.error('❌ Error approving photo:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Reject photo
app.post("/make-server-3e3a9cd7/marketplace/admin/reject-photo/:photoId", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const photoId = c.req.param('photoId');
    const { reason } = await c.req.json(); // optional
    
    const photo = await kv.get(`marketplace:photo:${photoId}`);
    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }
    
    photo.status = 'rejected';
    photo.statusReason = reason || '';
    photo.reviewedAt = new Date().toISOString();
    photo.reviewedBy = adminEmail;
    
    await kv.set(`marketplace:photo:${photoId}`, photo);
    
    // Update pending list
    const pending = await kv.get('marketplace:photos:pending') || [];
    const updatedPending = pending.filter((id: string) => id !== photoId);
    await kv.set('marketplace:photos:pending', updatedPending);
    
    console.log(`✅ Photo rejected:`, photoId);
    
    return c.json({ success: true, photo });
  } catch (error: any) {
    console.error('❌ Error rejecting photo:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Delete photo (force delete any photo)
app.delete("/make-server-3e3a9cd7/marketplace/admin/photo/:photoId", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const photoId = c.req.param('photoId');
    const photo = await kv.get(`marketplace:photo:${photoId}`);
    
    if (!photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }
    
    // Delete from S3 (both original and web versions)
    try {
      if (photo.s3Url) {
        await deleteFromS3(photo.s3Url);
      }
      if (photo.webUrl && photo.webUrl !== photo.s3Url) {
        await deleteFromS3(photo.webUrl);
      }
    } catch (s3Error: any) {
      console.error('⚠️ Error deleting from S3:', s3Error);
      // Continue with database deletion even if S3 fails
    }
    
    // Remove from photographer's photo list
    const photographerPhotos = await kv.get(`photographer:photos:${photo.photographerId}`) || [];
    const updatedPhotos = photographerPhotos.filter((id: string) => id !== photoId);
    await kv.set(`photographer:photos:${photo.photographerId}`, updatedPhotos);
    
    // Remove from pending list if present
    const pending = await kv.get('marketplace:photos:pending') || [];
    const updatedPending = pending.filter((id: string) => id !== photoId);
    await kv.set('marketplace:photos:pending', updatedPending);
    
    // Remove from approved list if present
    const approved = await kv.get('marketplace:photos:approved') || [];
    const updatedApproved = approved.filter((id: string) => id !== photoId);
    await kv.set('marketplace:photos:approved', updatedApproved);
    
    // Remove from stock collections
    const collections = await kv.get('stock:collections') || [];
    collections.forEach((col: any) => {
      col.images = (col.images || []).filter((img: any) => img.id !== photoId);
    });
    await kv.set('stock:collections', collections);
    
    // Delete photo record
    await kv.del(`marketplace:photo:${photoId}`);
    
    // Update photographer's photo count
    const profile = await kv.get(`photographer:profile:${photo.photographerId}`);
    if (profile) {
      profile.photoCount = Math.max(0, (profile.photoCount || 0) - 1);
      if (photo.status === 'approved') {
        profile.approvedPhotoCount = Math.max(0, (profile.approvedPhotoCount || 0) - 1);
      }
      await kv.set(`photographer:profile:${photo.photographerId}`, profile);
    }
    
    console.log('✅ Photo deleted by admin:', photoId, 'Deleted by:', adminEmail);
    
    return c.json({ 
      success: true,
      message: 'Photo permanently deleted'
    });
  } catch (error: any) {
    console.error('❌ Error deleting photo (admin):', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Approve photographer
app.post("/make-server-3e3a9cd7/marketplace/admin/approve-photographer/:userId", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const photographerId = c.req.param('userId');
    
    const profile = await kv.get(`photographer:profile:${photographerId}`);
    if (!profile) {
      return c.json({ error: 'Photographer not found' }, 404);
    }
    
    profile.status = 'approved';
    profile.statusReason = '';
    profile.reviewedAt = new Date().toISOString();
    profile.reviewedBy = adminEmail;
    
    await kv.set(`photographer:profile:${photographerId}`, profile);
    
    // Remove from pending list
    const pending = await kv.get('photographer:pending') || [];
    const updated = pending.filter((id: string) => id !== photographerId);
    await kv.set('photographer:pending', updated);
    
    console.log(`✅ Photographer approved:`, photographerId);
    
    return c.json({ success: true, profile });
  } catch (error: any) {
    console.error('❌ Error approving photographer:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Reject photographer
app.post("/make-server-3e3a9cd7/marketplace/admin/reject-photographer/:userId", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const photographerId = c.req.param('userId');
    const { reason } = await c.req.json(); // optional
    
    const profile = await kv.get(`photographer:profile:${photographerId}`);
    if (!profile) {
      return c.json({ error: 'Photographer not found' }, 404);
    }
    
    profile.status = 'rejected';
    profile.statusReason = reason || '';
    profile.reviewedAt = new Date().toISOString();
    profile.reviewedBy = adminEmail;
    
    await kv.set(`photographer:profile:${photographerId}`, profile);
    
    // Remove from pending list
    const pending = await kv.get('photographer:pending') || [];
    const updated = pending.filter((id: string) => id !== photographerId);
    await kv.set('photographer:pending', updated);
    
    console.log(`✅ Photographer rejected:`, photographerId);
    
    return c.json({ success: true, profile });
  } catch (error: any) {
    console.error('❌ Error rejecting photographer:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Photographer signup
app.post("/make-server-3e3a9cd7/marketplace/photographer/signup", async (c) => {
  try {
    const { email, password, displayName, bio, portfolioUrl, instagramHandle } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );
    
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayName,
          bio,
          portfolioUrl,
          instagramHandle,
        }
      }
    });
    
    if (error || !user) {
      return c.json({ error: error.message || 'Failed to sign up' }, 500);
    }
    
    // Create photographer profile
    const profile = {
      id: user.id,
      userId: user.id,
      email: user.email,
      displayName: displayName || user.email?.split('@')[0] || 'Unknown',
      bio: bio || '',
      portfolioUrl: portfolioUrl || '',
      instagramHandle: instagramHandle || '',
      commissionRate: 30, // 30% royalty by default
      totalSales: 0,
      totalEarnings: 0,
      status: 'pending', // pending, approved, suspended
      joinedDate: new Date().toISOString(),
      photoCount: 0,
      approvedPhotoCount: 0,
    };
    
    await kv.set(`photographer:profile:${user.id}`, profile);
    
    // Add to pending list for admin review
    const pending = await kv.get('photographer:pending') || [];
    pending.push(user.id);
    await kv.set('photographer:pending', pending);
    
    console.log('✅ Photographer registered:', user.id, displayName);
    
    return c.json({ 
      success: true, 
      profile,
      message: 'Application submitted! We\'ll review it within 24 hours.'
    });
  } catch (error: any) {
    console.error('❌ Error registering photographer:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Photographer login
app.post("/make-server-3e3a9cd7/marketplace/photographer/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );
    
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error || !user) {
      return c.json({ error: error.message || 'Failed to log in' }, 500);
    }
    
    return c.json({ 
      success: true, 
      user,
      message: 'Logged in successfully.'
    });
  } catch (error: any) {
    console.error('❌ Error logging in:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get photographer profile
app.get("/make-server-3e3a9cd7/marketplace/photographer/profile", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`photographer:profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Not registered as photographer' }, 404);
    }
    
    return c.json({ profile });
  } catch (error: any) {
    console.error('❌ Error fetching photographer profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update photographer profile
app.put("/make-server-3e3a9cd7/marketplace/photographer/profile", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`photographer:profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Not registered as photographer' }, 404);
    }
    
    const updates = await c.req.json();
    const updatedProfile = {
      ...profile,
      ...updates,
      id: profile.id, // Don't allow changing ID
      userId: profile.userId,
      status: profile.status, // Don't allow self-approval
      commissionRate: profile.commissionRate, // Don't allow changing commission
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`photographer:profile:${user.id}`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('❌ Error updating photographer profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

// DEBUG: Check photographer database state (admin only)
app.get("/make-server-3e3a9cd7/marketplace/admin/debug/photographers", async (c) => {
  try {
    const adminEmail = c.req.header('X-Admin-Email');
    if (!adminEmail) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    // Get the pending list
    const pendingList = await kv.get('photographer:pending') || [];
    
    // Get all photographer profiles by their IDs from the pending list
    // and collect all profiles from pending list
    const allProfiles = await kv.getByPrefix('photographer:profile:');
    
    console.log('🔍 DEBUG: Pending list:', pendingList);
    console.log('🔍 DEBUG: All photographer profiles found:', allProfiles.length);
    
    const debugInfo = {
      pendingList,
      pendingListCount: pendingList.length,
      allProfilesCount: allProfiles.length,
      profileDetails: allProfiles.map((profile: any) => ({
        key: `photographer:profile:${profile.userId}`,
        userId: profile.userId,
        status: profile?.status,
        displayName: profile?.displayName,
        email: profile?.email,
        joinedDate: profile?.joinedDate,
      })),
    };
    
    return c.json({ debug: debugInfo });
  } catch (error: any) {
    console.error('❌ Error in debug endpoint:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ADMIN: Sync pending list (finds all pending photographers and rebuilds the pending list)
app.post("/make-server-3e3a9cd7/marketplace/admin/sync-pending", async (c) => {
  try {
    console.log('🔄 Sync pending list request received');
    
    const adminEmail = c.req.header('X-Admin-Email');
    console.log('👤 Admin email:', adminEmail);
    
    if (!adminEmail) {
      console.log('❌ No admin email provided');
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    console.log('📋 Fetching all photographer profiles...');
    // Get all photographer profiles
    const allProfiles = await kv.getByPrefix('photographer:profile:');
    console.log(`✅ Found ${allProfiles.length} total profiles`);
    
    // Find all with status='pending'
    const pendingProfiles = allProfiles.filter((profile: any) => profile?.status === 'pending');
    console.log(`🔍 Found ${pendingProfiles.length} pending profiles`);
    
    // Rebuild the pending list
    const pendingIds = pendingProfiles.map((profile: any) => profile.userId);
    await kv.set('photographer:pending', pendingIds);
    
    console.log('✅ Synced pending list:', pendingIds.length, 'photographers');
    
    return c.json({ 
      success: true, 
      syncedCount: pendingIds.length,
      pendingPhotographers: pendingProfiles 
    });
  } catch (error: any) {
    console.error('❌ Error syncing pending list:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;