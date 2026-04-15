# Photo System Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BESPOKE METAL PRINTS                          │
│                   Unified Photo Architecture                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       PHOTO SOURCES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Admin Upload    │              │  Photographer    │        │
│  │  (Stock Photos)  │              │  (Marketplace)   │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                  │                   │
│           │ Upload                           │ Upload            │
│           ▼                                  ▼                   │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  S3: stock/      │              │  S3: marketplace/│        │
│  │  - web/          │              │  - web/          │        │
│  │  - original/     │              │  - original/     │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                  │                   │
│           │                                  │ Pending           │
│           │                                  ▼                   │
│           │                        ┌──────────────────┐         │
│           │                        │  Admin Approves  │         │
│           │                        └────────┬─────────┘         │
│           │                                  │                   │
│           └──────────────┬───────────────────┘                   │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              SINGLE SOURCE OF TRUTH (KV Store)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  stock:collections = [                                           │
│    {                                                             │
│      id: "123",                                                  │
│      name: "Nature & Landscapes",                                │
│      images: [                                                   │
│        {                                                         │
│          id: "img-1",                                            │
│          name: "sunset.jpg",                                     │
│          url: "https://.../web/sunset.jpg",      ◄─ Display     │
│          originalUrl: "https://.../original/...", ◄─ Print      │
│          source: "admin",                         ◄─ Tracking    │
│          uploadedAt: "2025-01-15T10:00:00Z"                      │
│        },                                                        │
│        {                                                         │
│          id: "img-2",                                            │
│          name: "mountain.jpg",                                   │
│          url: "https://.../web/mountain.jpg",    ◄─ Display     │
│          originalUrl: "https://.../original/...", ◄─ Print      │
│          source: "marketplace",                  ◄─ Tracking    │
│          photographerId: "user-123",             ◄─ Royalty     │
│          photographerName: "Jane Doe",                           │
│          royaltyRate: 30,                        ◄─ 30%         │
│          uploadedAt: "2025-01-15T12:00:00Z"                      │
│        }                                                         │
│      ]                                                           │
│    }                                                             │
│  ]                                                               │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CONSUMERS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐   ┌──────────────────┐   ┌─────────────┐ │
│  │  Stock Photos    │   │  Customer        │   │ Photographer│ │
│  │  Browsing        │   │  Checkout        │   │ Dashboard   │ │
│  └────────┬─────────┘   └────────┬─────────┘   └──────┬──────┘ │
│           │                      │                     │        │
│           │ GET /collections     │                     │        │
│           ▼                      │                     │        │
│  Shows all photos                │                     │        │
│  (admin + marketplace)           │                     │        │
│                                  │                     │        │
│                                  │ Uses originalUrl    │        │
│                                  │ for printing        │        │
│                                  ▼                     │        │
│                         If source='marketplace'        │        │
│                         Calculate royalty:             │        │
│                         price * (royaltyRate/100)      │        │
│                                  │                     │        │
│                                  │ Record sale         │        │
│                                  └─────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Admin Upload

```
┌──────────┐
│  Admin   │
│  Selects │
│   File   │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────┐
│  POST /admin/collections/:id/   │
│  images                          │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Upload to S3                    │
│  - stock/{collection}/web/       │
│  - stock/{collection}/original/  │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Create Image Object             │
│  {                               │
│    source: 'admin',              │
│    url: webUrl,                  │
│    originalUrl: originalUrl,     │
│    ...                           │
│  }                               │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Add to stock:collections        │
│  collections[i].images.push()    │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  ✅ Photo appears in browsing   │
└─────────────────────────────────┘
```

---

## Data Flow: Marketplace Photo

```
┌──────────────┐
│ Photographer │
│   Uploads    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│ POST /marketplace/photographer/ │
│ upload                           │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Upload to S3                    │
│  - marketplace/{slug}/web/       │
│  - marketplace/{slug}/original/  │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Store in KV                     │
│  marketplace:photo:{id}          │
│  status: 'pending'               │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Add to pending list             │
│  marketplace:photos:pending      │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Admin reviews                   │
│  (Marketplace Approvals panel)   │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  POST /marketplace/admin/        │
│  approve-photo/:id               │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Update marketplace:photo:{id}   │
│  status: 'approved'              │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Create Image Object             │
│  {                               │
│    source: 'marketplace',        │
│    url: webUrl,                  │
│    originalUrl: s3Url,           │
│    photographerId: ...,          │
│    royaltyRate: ...,             │
│    ...                           │
│  }                               │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Map category → collection       │
│  'nature' → 'Nature & Landscapes'│
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Add to stock:collections        │
│  collections[i].images.push()    │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  ✅ Photo appears in browsing   │
└─────────────────────────────────┘
```

---

## Data Flow: Customer Order

```
┌──────────────┐
│  Customer    │
│  Browses     │
│  Stock       │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  GET /collections                │
│  Returns all photos from         │
│  stock:collections               │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Photos display                  │
│  Uses: image.url (web-optimized) │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Customer selects photo          │
│  Configures print                │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Checkout                        │
│  Uses: image.originalUrl         │
│  (high-res for printing)         │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Check: image.source             │
└────┬────────────────────────────┘
     │
     ├─── source='admin' ────────► No royalty
     │
     └─── source='marketplace' ──► Calculate royalty
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │ royalty = price *    │
                          │   (royaltyRate/100)  │
                          └──────┬───────────────┘
                                 │
                                 ▼
                          ┌──────────────────────┐
                          │ Record sale in       │
                          │ photographer:sales   │
                          └──────┬───────────────┘
                                 │
                                 ▼
                          ┌──────────────────────┐
                          │ Photographer sees in │
                          │ their dashboard      │
                          └──────────────────────┘
```

---

## Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         KV STORE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  stock:collections                    ◄─── SINGLE SOURCE        │
│  └─ Array of collections                   OF TRUTH            │
│     └─ Each has images array                                    │
│        └─ Each image has:                                       │
│           • source ('admin' or 'marketplace')                   │
│           • url (display)                                       │
│           • originalUrl (printing)                              │
│           • photographerId (if marketplace)                     │
│           • royaltyRate (if marketplace)                        │
│                                                                  │
│  marketplace:photo:{id}               ◄─── WORKFLOW TRACKING    │
│  └─ Individual photo records              (pending/approved)   │
│                                                                  │
│  marketplace:photos:pending           ◄─── INDEX               │
│  └─ Array of photo IDs                                          │
│                                                                  │
│  marketplace:photos:approved          ◄─── INDEX               │
│  └─ Array of photo IDs                                          │
│                                                                  │
│  photographer:sales:{userId}          ◄─── ROYALTY TRACKING    │
│  └─ Array of sale records                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         S3 BUCKET                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  stock/                               ◄─── ADMIN PHOTOS         │
│  ├─ Nature & Landscapes/                                        │
│  │  ├─ web/                           ◄─── Display (fast)      │
│  │  │  └─ sunset.jpg                                            │
│  │  └─ original/                      ◄─── Print (high-res)    │
│  │     └─ sunset.jpg                                            │
│  └─ Urban & Architecture/                                       │
│     └─ ...                                                       │
│                                                                  │
│  marketplace/                         ◄─── MARKETPLACE PHOTOS   │
│  ├─ jane-photographer/                                          │
│  │  ├─ web/                           ◄─── Display (fast)      │
│  │  │  └─ mountain.jpg                                          │
│  │  └─ original/                      ◄─── Print (high-res)    │
│  │     └─ mountain.jpg                                          │
│  └─ john-photographer/                                          │
│     └─ ...                                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin Panel Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 Overview                                                     │
│  📦 Orders                                                       │
│  🖼️  Stock Photos                    ◄─── Upload & manage      │
│     ├─ Browse & Manage                     admin photos         │
│     └─ Upload Photos                                            │
│                                                                  │
│  🗄️  Photo Architecture              ◄─── NEW! Monitor &       │
│     ├─ Load Statistics                     migrate system      │
│     └─ Run Migration                                            │
│                                                                  │
│  📦 Inventory                                                    │
│  🏷️  Discounts                                                   │
│  ⚙️  Settings                                                    │
│  📸 Marketplace Approvals            ◄─── Approve marketplace   │
│                                           photos                │
│  💬 Testimonials                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Migration Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    BEFORE MIGRATION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Photo 1 (Admin):                                                │
│  {                                                               │
│    id: "img-1",                                                  │
│    name: "sunset.jpg",                                           │
│    url: "https://.../web/sunset.jpg",                            │
│    // ❌ Missing: source, originalUrl                           │
│  }                                                               │
│                                                                  │
│  Photo 2 (Marketplace):                                          │
│  {                                                               │
│    id: "img-2",                                                  │
│    webUrl: "https://.../web/mountain.jpg",                       │
│    s3Url: "https://.../original/mountain.jpg",                   │
│    isMarketplacePhoto: true,                                     │
│    // ❌ Missing: source, url, originalUrl, name                │
│  }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /admin/migrate-photo-structure
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AFTER MIGRATION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Photo 1 (Admin):                                                │
│  {                                                               │
│    id: "img-1",                                                  │
│    name: "sunset.jpg",                                           │
│    url: "https://.../web/sunset.jpg",                            │
│    originalUrl: "https://.../web/sunset.jpg",  ◄─ Added        │
│    source: "admin",                            ◄─ Added        │
│    uploadedAt: "2025-01-15T10:00:00Z"                            │
│  }                                                               │
│                                                                  │
│  Photo 2 (Marketplace):                                          │
│  {                                                               │
│    id: "img-2",                                                  │
│    name: "mountain.jpg",                       ◄─ Added        │
│    url: "https://.../web/mountain.jpg",        ◄─ From webUrl  │
│    originalUrl: "https://.../original/...",    ◄─ From s3Url   │
│    source: "marketplace",                      ◄─ Added        │
│    webUrl: "https://.../web/mountain.jpg",     ◄─ Kept         │
│    s3Url: "https://.../original/mountain.jpg", ◄─ Kept         │
│    isMarketplacePhoto: true,                   ◄─ Kept         │
│    photographerId: "user-123",                                   │
│    royaltyRate: 30,                                              │
│    uploadedAt: "2025-01-15T12:00:00Z"                            │
│  }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Principles

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1️⃣  SINGLE SOURCE OF TRUTH                                     │
│     All photos in stock:collections                              │
│     No dual storage or synchronization                           │
│                                                                  │
│  2️⃣  CONSISTENT METADATA                                        │
│     Same fields for all photos                                   │
│     Optional fields for source-specific data                     │
│                                                                  │
│  3️⃣  CLEAR SOURCE TRACKING                                      │
│     Every photo has 'source' field                               │
│     Enables attribution and royalties                            │
│                                                                  │
│  4️⃣  DUAL URL SYSTEM                                            │
│     url = display (optimized)                                    │
│     originalUrl = printing (high-res)                            │
│                                                                  │
│  5️⃣  AUTOMATIC ROYALTIES                                        │
│     source='marketplace' triggers calculation                    │
│     Transparent to customers                                     │
│     Trackable by photographers                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

This diagram represents the complete unified photo architecture for Bespoke Metal Prints, showing how all pieces work together seamlessly.
