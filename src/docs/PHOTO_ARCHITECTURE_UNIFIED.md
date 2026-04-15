# Unified Photo Architecture

## Overview
This document describes the unified photo management system for Bespoke Metal Prints, which handles both admin-uploaded stock photos and marketplace photographer photos in a single, coherent architecture.

---

## Architecture Principles

### 1. Single Source of Truth
**All photos are stored in `stock:collections`** as the definitive source.

### 2. Consistent Metadata Structure
All photos share a common metadata schema with optional fields for marketplace-specific data.

### 3. Clear Source Tracking
Every photo is tagged with its source (admin/marketplace) for proper attribution and royalty calculations.

### 4. Unified URL Handling
All photos have both display URLs (optimized) and original URLs (high-res for printing).

---

## Data Model

### Collection Structure
```typescript
{
  id: string;              // Unique collection ID (timestamp-based)
  name: string;            // Collection display name
  description: string;     // Collection description
  images: Image[];         // Array of photos
  createdAt: string;       // ISO timestamp
  updatedAt?: string;      // ISO timestamp
}
```

### Image Structure (Unified)
```typescript
{
  // Core Fields (all photos)
  id: string;              // Unique photo ID
  name: string;            // Photo name/title
  url: string;             // Display URL (web-optimized)
  originalUrl?: string;    // Original high-res URL (for printing)
  uploadedAt: string;      // ISO timestamp
  
  // Source Tracking
  source: 'admin' | 'marketplace';  // Photo source
  
  // Admin Photo Fields (when source === 'admin')
  // (Uses only core fields above)
  
  // Marketplace Photo Fields (when source === 'marketplace')
  photographerId?: string;       // Photographer user ID
  photographerName?: string;     // Photographer display name
  royaltyRate?: number;          // Photographer royalty percentage (0-100)
  isMarketplacePhoto?: boolean;  // Legacy flag (deprecated, use source)
  
  // Optional Metadata
  title?: string;            // Alternative to 'name'
  description?: string;      // Photo description
  tags?: string[];          // Search/categorization tags
  featured?: boolean;       // Featured status
}
```

---

## Storage Architecture

### KV Store Keys

#### Collections (Single Source of Truth)
```
stock:collections → Array<Collection>
```

#### Marketplace Tracking (Index Only)
```
marketplace:photos:pending → Array<photoId>
marketplace:photos:approved → Array<photoId>
marketplace:photo:{photoId} → MarketplacePhotoRecord
photographer:photos:{userId} → Array<photoId>
photographer:profile:{userId} → PhotographerProfile
```

**Important**: Marketplace KV records are for tracking workflow state (pending/approved) and photographer metadata. The canonical photo data lives in `stock:collections`.

### S3 Structure

#### Admin Photos
```
stock/{collectionName}/web/{filename}        // Display version
stock/{collectionName}/original/{filename}   // High-res version
```

#### Marketplace Photos
```
marketplace/{photographer-slug}/web/{filename}      // Display version
marketplace/{photographer-slug}/original/{filename} // High-res version
```

---

## Workflow: Admin Upload

### 1. Admin uploads photo to collection
   - POST `/admin/collections/:collectionId/images`

### 2. Upload to S3
   - Upload to: `stock/{collectionName}/web/{filename}`
   - Optional: Upload original to `stock/{collectionName}/original/{filename}`

### 3. Add to Collection
   ```javascript
   const image = {
     id: generateUniqueId(),
     name: filename,
     url: s3WebUrl,
     originalUrl: s3OriginalUrl || s3WebUrl,
     source: 'admin',
     uploadedAt: new Date().toISOString()
   };
   collection.images.push(image);
   await kv.set('stock:collections', collections);
   ```

---

## Workflow: Marketplace Photo

### 1. Photographer uploads photo
   - POST `/marketplace/photographer/upload`
   - Photo status: `pending`

### 2. Upload to S3
   - Upload to: `marketplace/{slug}/web/{filename}`
   - Upload to: `marketplace/{slug}/original/{filename}`

### 3. Store in Marketplace Tracking
   ```javascript
   const marketplacePhoto = {
     id: generateUniqueId(),
     title,
     description,
     tags,
     category,
     s3Url: originalUrl,      // High-res URL
     webUrl: webUrl,          // Display URL
     photographerId,
     photographerName,
     photographerRoyalty,
     status: 'pending',
     submittedAt: new Date().toISOString()
   };
   await kv.set(`marketplace:photo:${photoId}`, marketplacePhoto);
   
   // Add to pending list
   const pending = await kv.get('marketplace:photos:pending') || [];
   pending.push(photoId);
   await kv.set('marketplace:photos:pending', pending);
   ```

### 4. Admin Approves Photo
   - POST `/marketplace/admin/approve-photo/:photoId`
   
   a. Update marketplace record status:
   ```javascript
   photo.status = 'approved';
   photo.approvedAt = new Date().toISOString();
   await kv.set(`marketplace:photo:${photoId}`, photo);
   ```
   
   b. Update tracking lists:
   ```javascript
   // Remove from pending
   const pending = await kv.get('marketplace:photos:pending') || [];
   await kv.set('marketplace:photos:pending', 
     pending.filter(id => id !== photoId));
   
   // Add to approved
   const approved = await kv.get('marketplace:photos:approved') || [];
   approved.push(photoId);
   await kv.set('marketplace:photos:approved', approved);
   ```
   
   c. Add to stock collections (MERGE SYSTEMS):
   ```javascript
   // Map marketplace category to collection name
   const categoryMap = {
     'nature': 'Nature & Landscapes',
     'urban': 'Urban & Architecture',
     // etc...
   };
   const collectionName = categoryMap[photo.category] || 'Marketplace';
   
   // Find or create collection
   let collection = collections.find(c => c.name === collectionName);
   if (!collection) {
     collection = {
       id: Date.now().toString(),
       name: collectionName,
       description: `${collectionName} photos from our photographer marketplace`,
       images: [],
       createdAt: new Date().toISOString()
     };
     collections.push(collection);
   }
   
   // Add photo to collection
   const stockImage = {
     id: photo.id,
     name: photo.title,
     title: photo.title,
     url: photo.webUrl,           // Display URL
     originalUrl: photo.s3Url,    // High-res URL
     source: 'marketplace',
     photographerId: photo.photographerId,
     photographerName: photo.photographerName,
     royaltyRate: photo.photographerRoyalty,
     description: photo.description,
     tags: photo.tags,
     uploadedAt: photo.submittedAt,
     
     // Legacy fields for backward compatibility
     isMarketplacePhoto: true
   };
   
   if (!collection.images.find(img => img.id === photo.id)) {
     collection.images.push(stockImage);
     await kv.set('stock:collections', collections);
   }
   ```

### 5. Customer Browses Stock Photos
   - GET `/collections`
   - Returns all collections with photos (merged admin + marketplace)
   - Filters to web-optimized URLs only
   - Marketplace photos included seamlessly

### 6. Customer Orders Print
   - Checkout process uses `originalUrl` for high-res printing
   - If `source === 'marketplace'`, calculate photographer royalty
   - Record sale with royalty metadata

### 7. Photographer Views Sales
   - Dashboard shows sales where `photographerId` matches
   - Royalty calculations based on `royaltyRate` field

---

## Royalty Calculation

When an order is placed with a marketplace photo:

```javascript
// In order processing
if (photo.source === 'marketplace' && photo.photographerId) {
  const royaltyAmount = orderItemPrice * (photo.royaltyRate / 100);
  
  // Record royalty
  const sale = {
    photoId: photo.id,
    photographerId: photo.photographerId,
    orderId,
    itemPrice: orderItemPrice,
    royaltyRate: photo.royaltyRate,
    royaltyAmount,
    saleDate: new Date().toISOString()
  };
  
  // Store in photographer's sales
  const sales = await kv.get(`photographer:sales:${photo.photographerId}`) || [];
  sales.push(sale);
  await kv.set(`photographer:sales:${photo.photographerId}`, sales);
}
```

---

## Migration Strategy

### Phase 1: Add Source Field (Non-Breaking)
1. Update marketplace approval flow to add `source: 'marketplace'`
2. Update admin upload flow to add `source: 'admin'`
3. Existing photos without `source` default to `'admin'` for backward compatibility

### Phase 2: Standardize URL Fields
1. Ensure all photos have both `url` (display) and `originalUrl` (high-res)
2. Admin photos: if only `url` exists, set `originalUrl = url`
3. Marketplace photos: `url = webUrl`, `originalUrl = s3Url`

### Phase 3: Clean Up Legacy Fields
1. Audit all photos for consistent structure
2. Add migration endpoint: `/admin/migrate-photo-structure`
3. Run migration to normalize all photos

### Phase 4: Update Consumers
1. Update all photo consumers to use standardized fields
2. Update checkout to use `originalUrl` consistently
3. Update royalty calculation to check `source` field

---

## Benefits of Unified Architecture

### 1. Simplicity
- Single source of truth for all photos
- No dual-tracking or synchronization issues
- Easier debugging and maintenance

### 2. Consistency
- All photos follow same metadata schema
- Uniform handling in frontend/backend
- Predictable behavior

### 3. Flexibility
- Easy to add new photo sources (e.g., stock photo APIs)
- Simple to extend metadata
- Clear separation of concerns

### 4. Performance
- Single query to get all collections
- No need to merge multiple data sources
- Efficient filtering and searching

### 5. Correctness
- Royalty tracking guaranteed for marketplace photos
- Clear attribution for all photos
- Audit trail via source field

---

## API Summary

### Public Endpoints
```
GET  /collections                          → All collections (merged admin + marketplace)
GET  /stock-photos/:collectionName         → Photos in specific collection
```

### Admin Endpoints
```
GET    /admin/collections                  → All collections (admin view)
POST   /admin/collections                  → Create new collection
DELETE /admin/collections/:id              → Delete collection
POST   /admin/collections/:id/images       → Upload photo to collection
DELETE /admin/collections/:id/images/:id   → Delete photo from collection
```

### Marketplace Endpoints
```
POST /marketplace/photographer/upload      → Upload photo (creates pending)
GET  /marketplace/admin/pending-photos     → Get pending photos for approval
POST /marketplace/admin/approve-photo/:id  → Approve photo (adds to collections)
POST /marketplace/admin/reject-photo/:id   → Reject photo
GET  /marketplace/photographer/dashboard   → Get photographer's sales/stats
```

---

## Summary

This unified architecture treats `stock:collections` as the canonical source for all photos, with marketplace KV records serving as workflow tracking only. This eliminates dual storage issues, provides consistent metadata, and simplifies the codebase while maintaining full royalty tracking and photographer attribution.
