# Inventory System Flow Diagram

## 🗂️ Single Source of Truth

```
┌─────────────────────────────────────────────────────────────┐
│                    KV STORE DATABASE                        │
│                                                             │
│         Key: 'inventory'                                    │
│         Value: Array<InventoryItem>                         │
│                                                             │
│  [                                                          │
│    { id, name, sku, category, quantity, price },           │
│    { id, name, sku, category, quantity, price },           │
│    ...                                                      │
│  ]                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ▲         │
                         │         │
                    WRITE│         │READ
                         │         │
        ┌────────────────┴─────────┴────────────────┐
        │                                            │
        │                                            │
        ▼                                            ▼
┌──────────────────┐                     ┌──────────────────┐
│  ADMIN ROUTES    │                     │  PUBLIC ROUTES   │
│  (Authenticated) │                     │  (No Auth)       │
├──────────────────┤                     ├──────────────────┤
│                  │                     │                  │
│ GET /admin/      │                     │ GET /inventory   │
│     inventory    │                     │                  │
│                  │                     │ GET /inventory-  │
│ PUT /admin/      │                     │     debug        │
│     inventory    │                     │                  │
│                  │                     │ POST /inventory- │
│ DELETE /admin/   │                     │      cleanup     │
│     inventory/   │                     │                  │
│     all          │                     │                  │
│                  │                     │                  │
└────────┬─────────┘                     └─────────┬────────┘
         │                                         │
         │                                         │
         ▼                                         ▼
┌──────────────────┐                     ┌──────────────────┐
│  ADMIN PANEL     │                     │  CUSTOMER UI     │
├──────────────────┤                     ├──────────────────┤
│                  │                     │                  │
│ Inventory        │                     │ Configurator     │
│ Management       │                     │ Section          │
│                  │                     │                  │
│ - View items     │                     │ useInventory     │
│ - Edit items     │                     │ Hook             │
│ - Add/Delete     │                     │                  │
│ - Set stock      │                     │ - View sizes     │
│ - Set prices     │                     │ - Check stock    │
│ - Auto-save      │                     │ - Show prices    │
│                  │                     │ - Filter items   │
└──────────────────┘                     └──────────────────┘
```

---

## 📊 Data Flow: Admin Updates Inventory

```
1. Admin User
   │
   ├─ Opens Admin Panel
   │
   ├─ Navigates to "Inventory Management"
   │
   ├─ Edits item (e.g., change "12\" x 8\"" price to $44.99)
   │
   └─ Auto-save triggers
      │
      ▼
2. Frontend: InventoryManagement.tsx
   │
   ├─ Debounces changes (500ms)
   │
   ├─ Sends PUT request to /admin/inventory
   │  Body: { inventory: [...all items...] }
   │
   └─ Shows "Saving..." indicator
      │
      ▼
3. Backend: admin.ts
   │
   ├─ Verifies admin authentication
   │
   ├─ Validates inventory data
   │
   ├─ Calls kv.set('inventory', data)
   │
   └─ Returns { success: true }
      │
      ▼
4. Database: KV Store
   │
   ├─ Overwrites 'inventory' key
   │
   └─ Data now available to all endpoints
      │
      ▼
5. Frontend: Shows "Saved ✓"
```

---

## 🛒 Data Flow: Customer Views Configurator

```
1. Customer
   │
   ├─ Visits website
   │
   ├─ Navigates to configurator
   │
   └─ Uploads image
      │
      ▼
2. Frontend: ConfiguratorSection.tsx
   │
   ├─ On mount, calls fetchSizes()
   │
   ├─ Sends GET request to /inventory
   │  Headers: { Authorization: Bearer <anon_key> }
   │
   └─ Shows loading spinner
      │
      ▼
3. Backend: index.tsx
   │
   ├─ No auth required (public endpoint)
   │
   ├─ Calls kv.get('inventory')
   │
   └─ Returns { inventory: [...] }
      │
      ▼
4. Database: KV Store
   │
   ├─ Reads 'inventory' key
   │
   └─ Returns all inventory items
      │
      ▼
5. Frontend: ConfiguratorSection.tsx
   │
   ├─ Filters items where category === 'size'
   │
   ├─ Filters items where quantity > 0
   │
   ├─ Sorts by area (smallest to largest)
   │
   ├─ Displays sizes with prices
   │
   └─ Disables out-of-stock items
      │
      ▼
6. Customer sees available sizes
```

---

## 🔄 Real-Time Sync Flow

```
Admin Panel                    Database                    Customer UI
    │                             │                            │
    │  PUT /admin/inventory       │                            │
    ├──────────────────────────>  │                            │
    │                             │                            │
    │  ✓ Saved                    │                            │
    │ <────────────────────────── │                            │
    │                             │                            │
    │                             │  GET /inventory            │
    │                             │ <────────────────────────  │
    │                             │                            │
    │                             │  Returns updated data      │
    │                             │ ─────────────────────────> │
    │                             │                            │
    │                             │                   ✓ Updated UI
    │                             │                            │
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FIGMA MAKE                             │
│                   (Cloud Environment)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              FRONTEND (React/TSX)                   │   │
│  │                                                     │   │
│  │  ┌─────────────────┐      ┌─────────────────┐     │   │
│  │  │ Admin Panel     │      │ Customer UI     │     │   │
│  │  │                 │      │                 │     │   │
│  │  │ Inventory       │      │ Configurator    │     │   │
│  │  │ Management      │      │ Section         │     │   │
│  │  └────────┬────────┘      └────────┬────────┘     │   │
│  │           │                        │              │   │
│  │           └────────────┬───────────┘              │   │
│  │                        │                          │   │
│  └────────────────────────┼──────────────────────────┘   │
│                           │                              │
│                           │ HTTPS API Calls              │
│                           │                              │
│  ┌────────────────────────┼──────────────────────────┐   │
│  │              BACKEND (Deno/Hono)                  │   │
│  │                        │                          │   │
│  │        ┌───────────────┴───────────────┐         │   │
│  │        │                               │         │   │
│  │   ┌────▼─────┐                 ┌───────▼──────┐ │   │
│  │   │  Admin   │                 │   Public     │ │   │
│  │   │  Routes  │                 │   Routes     │ │   │
│  │   │          │                 │              │ │   │
│  │   │ admin.ts │                 │  index.tsx   │ │   │
│  │   └────┬─────┘                 └───────┬──────┘ │   │
│  │        │                               │        │   │
│  │        └───────────────┬───────────────┘        │   │
│  │                        │                        │   │
│  └────────────────────────┼────────────────────────┘   │
│                           │                            │
│                           │ kv.get/set                 │
│                           │                            │
│  ┌────────────────────────┼────────────────────────┐   │
│  │          KV STORE (Database)                    │   │
│  │                        │                        │   │
│  │              ┌─────────▼──────────┐             │   │
│  │              │                    │             │   │
│  │              │  'inventory' key   │             │   │
│  │              │                    │             │   │
│  │              │  Array of items    │             │   │
│  │              │                    │             │   │
│  │              └────────────────────┘             │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Principles

### ✅ Single Source of Truth
- **ONE database key:** `'inventory'`
- **ONE data structure:** `Array<InventoryItem>`
- **ONE API contract:** Same response format for admin and public

### ✅ Separation of Concerns
- **Admin routes:** Write operations (PUT, DELETE) with authentication
- **Public routes:** Read operations (GET) without authentication
- **Frontend:** Display logic, no direct database access

### ✅ Data Consistency
- Admin saves → Immediately available to customers
- No sync delays or cache invalidation needed
- Same data visible in both admin panel and configurator

### ✅ Graceful Degradation
- If API fails → Frontend uses fallback data
- If inventory empty → Admin can load defaults
- Errors logged but don't crash the app

---

## 🔐 Security Model

```
┌──────────────────────────────────────────────────┐
│  ADMIN ENDPOINTS (Protected)                     │
│                                                  │
│  Authorization: Bearer <access_token>            │
│  ├─ Verify JWT token                            │
│  ├─ Check user role = admin                     │
│  ├─ Check permission: canManageInventory         │
│  └─ Allow request                               │
│                                                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  PUBLIC ENDPOINTS (Open)                         │
│                                                  │
│  Authorization: Bearer <anon_key>                │
│  ├─ Validate anon key (prevents spam)           │
│  └─ Allow read-only access                      │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Current Implementation
- **Storage:** KV Store (simple key-value)
- **Reads:** Fast, in-memory cache
- **Writes:** Immediate, no queue
- **Limits:** ~1MB per key (sufficient for 1000s of items)

### Future Optimization (If Needed)
- **Caching:** Add Redis for read-heavy workloads
- **Pagination:** Split inventory into categories
- **Indexes:** Add search/filter indexes
- **CDN:** Cache public endpoint responses

---

Last Updated: February 23, 2026  
Diagram Version: 1.0
