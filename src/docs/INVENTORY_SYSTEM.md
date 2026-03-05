# Inventory System Architecture

## Overview

The Bespoke Metal Prints inventory system uses a **single unified database key** to ensure consistency between the admin panel and customer-facing configurator.

---

## Database Schema

### KV Store Key
```
'inventory'
```

**⚠️ CRITICAL:** This is the ONLY inventory key. Do NOT create or use any other keys like `admin:inventory`.

### Data Structure

```typescript
interface InventoryItem {
  id: string;           // Unique identifier (e.g., "size-1", "finish-1")
  name: string;         // Display name (e.g., "12\" x 8\"", "Gloss")
  sku: string;          // SKU code (e.g., "SIZE_12X8", "FINISH_GLOSS")
  category: string;     // Category: 'size' | 'finish' | 'mount' | 'frame'
  quantity: number;     // Stock quantity (0 = out of stock)
  price: number;        // Price in USD (sizes only, others are $0)
}
```

### Example Data

```json
[
  {
    "id": "size-1",
    "name": "5\" x 7\"",
    "sku": "SIZE_5X7",
    "category": "size",
    "quantity": 100,
    "price": 25.00
  },
  {
    "id": "size-2",
    "name": "12\" x 8\"",
    "sku": "SIZE_12X8",
    "category": "size",
    "quantity": 150,
    "price": 44.99
  },
  {
    "id": "finish-1",
    "name": "Gloss",
    "sku": "FINISH_GLOSS",
    "category": "finish",
    "quantity": 9999,
    "price": 0
  }
]
```

---

## API Endpoints

### Public Endpoints (No Auth Required)

#### `GET /inventory`
- **Used by:** ConfiguratorSection.tsx, useInventory.tsx
- **Purpose:** Fetch all inventory for customer-facing configurator
- **Response:** `{ inventory: InventoryItem[] }`
- **KV Key:** `inventory`

#### `GET /inventory-debug`
- **Used by:** Debugging
- **Purpose:** Inspect inventory with special characters visible
- **Response:** Enhanced inventory with `nameDebug`, `charCodes` fields

#### `POST /inventory-cleanup`
- **Used by:** Data sanitization
- **Purpose:** Remove inventory items with tab characters or whitespace issues
- **Response:** `{ success: true, removed: number, removedItems: [] }`

---

### Admin Endpoints (Auth Required)

#### `GET /admin/inventory`
- **Used by:** Admin panel InventoryManagement.tsx
- **Purpose:** Fetch all inventory for admin management
- **Response:** `{ inventory: InventoryItem[] }`
- **KV Key:** `inventory`
- **Auth:** Admin user with `canManageInventory` permission

#### `PUT /admin/inventory`
- **Used by:** Admin panel save functionality
- **Purpose:** Update all inventory items
- **Body:** `{ inventory: InventoryItem[] }`
- **KV Key:** `inventory`
- **Auth:** Admin user with `canManageInventory` permission

#### `DELETE /admin/inventory/all`
- **Used by:** Admin panel reset functionality
- **Purpose:** Clear all inventory (sets to empty array)
- **KV Key:** `inventory`
- **Auth:** Admin user with `canManageInventory` permission

---

## Data Flow

### Admin Panel → Database

```
Admin User
    ↓
InventoryManagement.tsx (Frontend)
    ↓ PUT /admin/inventory
Server: admin.ts
    ↓ kv.set('inventory', data)
Database: KV Store['inventory']
```

### Database → Configurator

```
Database: KV Store['inventory']
    ↓ kv.get('inventory')
Server: index.tsx
    ↓ GET /inventory
ConfiguratorSection.tsx / useInventory.tsx
    ↓
Customer Configurator UI
```

### Complete Round-Trip

```
Admin Updates Inventory
    ↓
Saved to 'inventory' key
    ↓
Public endpoint reads 'inventory' key
    ↓
Customer sees updated inventory in real-time
```

---

## Frontend Components

### Admin Components

**InventoryManagement.tsx** (`/components/admin/InventoryManagement.tsx`)
- Fetches inventory on mount
- Displays editable table with name, SKU, category, quantity, price
- Auto-saves on change (debounced)
- Manual save button
- Load default inventory button
- Delete all inventory button

### Customer-Facing Components

**ConfiguratorSection.tsx** (`/components/ConfiguratorSection.tsx`)
- Fetches sizes from inventory on mount (line 202-236)
- Filters for `category === 'size'`
- Displays only in-stock items (`quantity > 0`)
- Shows prices from inventory
- Falls back to hardcoded sizes if API fails (for resilience)

**useInventory Hook** (`/hooks/useInventory.tsx`)
- Centralized inventory data fetching
- Provides `isAvailable()`, `getQuantity()`, `isLowStock()` helpers
- Used by checkout, cart, configurator
- Caches inventory data in React state

---

## Categories

### Size
- **Purpose:** Print dimensions
- **Format:** `"{width}\" x {height}\"` (e.g., "12\" x 8\"")
- **Price:** Varies by size (base price for the print)
- **Examples:** 5" x 7", 12" x 8", 17" x 11", 24" x 16"

### Finish
- **Purpose:** Surface coating
- **Format:** Simple name (e.g., "Gloss", "Matte")
- **Price:** $0 (included in base price)
- **Examples:** Gloss, Matte, Metallic

### Mount
- **Purpose:** Wall mounting hardware
- **Format:** Descriptive name
- **Price:** $0 (included in base price)
- **Examples:** Stick Tape, French Cleat, Stand-Offs

### Frame
- **Purpose:** Optional frame around print
- **Format:** Frame description or "None"
- **Price:** $0 for "None", additional cost for frames (future feature)
- **Examples:** None, Black Frame, White Frame

---

## Stock Management

### In Stock
- `quantity > 0` - Item is available
- Shown in configurator with price
- Can be added to cart

### Out of Stock
- `quantity === 0` - Item is unavailable
- Shown as disabled/grayed out in configurator
- Cannot be added to cart

### Low Stock Warning
- `quantity > 0 && quantity <= 10` - Low stock threshold
- Admin panel shows warning badge
- Consider alerting admin for restock

---

## Default Inventory

Located in: `InventoryManagement.tsx` → `loadDefaultInventory()` function

**Sizes:**
- 5" x 7" - $25.00 (100 in stock)
- 12" x 8" - $44.99 (150 in stock)
- 17" x 11" - $69.99 (120 in stock)
- 24" x 16" - $109.99 (100 in stock)
- 30" x 20" - $149.99 (80 in stock)
- 36" x 24" - $199.99 (60 in stock)
- 40" x 30" - $269.99 (40 in stock)

**Finishes:**
- Gloss (9999 in stock)
- Matte (9999 in stock)

**Mounts:**
- Stick Tape (9999 in stock)
- French Cleat (9999 in stock)
- Stand-Offs (9999 in stock)

**Frames:**
- None (9999 in stock)

---

## Error Handling

### Backend Errors
- If KV fetch fails → Return empty array `[]`
- Log error to console
- Return 500 status with error message

### Frontend Errors
- If API fetch fails → Use fallback hardcoded inventory
- Don't show error to customer (graceful degradation)
- Log warning to console for debugging

### Data Validation
- Tab character cleanup: `POST /inventory-cleanup`
- Whitespace trimming on save
- SKU format validation (future)
- Price validation (must be >= 0)

---

## Best Practices

### DO ✅
- Always use the `inventory` KV key
- Filter by `category` field for different item types
- Validate data before saving
- Show loading states during fetch
- Handle empty inventory gracefully
- Use quantity for stock management

### DON'T ❌
- Don't create new KV keys for inventory
- Don't use `admin:inventory` prefix
- Don't store prices separately
- Don't hardcode inventory in components (use API)
- Don't bypass the inventory API
- Don't forget to handle out-of-stock items

---

## Future Enhancements

### Planned Features
- [ ] Inventory history/audit log
- [ ] Low stock email alerts
- [ ] Automatic restock orders
- [ ] Variant pricing (e.g., frame add-ons)
- [ ] Bulk import/export (CSV)
- [ ] Inventory analytics dashboard

### Potential Improvements
- [ ] Real-time inventory sync (WebSocket)
- [ ] Reserved inventory during checkout
- [ ] Backorder management
- [ ] Seasonal pricing adjustments
- [ ] Multi-warehouse support

---

## Troubleshooting

### Issue: Sizes don't appear in configurator
**Cause:** Inventory API returned empty or missing data  
**Fix:** Admin panel → Load Default Inventory → Save

### Issue: Prices don't match
**Cause:** Cache or stale data  
**Fix:** Hard refresh (Ctrl+Shift+R), check admin panel matches

### Issue: Out of stock items still show
**Cause:** Frontend not filtering `quantity > 0`  
**Fix:** Check ConfiguratorSection.tsx filtering logic

### Issue: Admin changes don't appear on frontend
**Cause:** Using wrong KV key or caching issue  
**Fix:** Verify both use `inventory` key, clear cache

---

## Monitoring

### Key Metrics to Track
- Total inventory items
- Out of stock items count
- Low stock items count
- Most popular sizes (by order volume)
- Inventory value (quantity × price sum)

### Logs to Monitor
- Inventory fetch failures
- Save operation failures
- Data validation errors
- Cleanup operations (tab characters, etc.)

---

## Security

### Admin Endpoints
- Require valid admin authentication
- Verify `canManageInventory` permission
- Validate input data before saving

### Public Endpoints
- Read-only access (GET only)
- No sensitive data exposed
- Rate limiting (future consideration)

---

Last Updated: February 23, 2026  
System Version: 2.0 (Unified Inventory)
