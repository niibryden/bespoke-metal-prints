# Inventory Data Migration Guide

## ⚠️ CRITICAL SYSTEM CHANGE

**Date:** February 23, 2026  
**Change:** Unified inventory database key across entire system

---

## What Changed?

Previously, the system had **TWO separate inventory databases**:
- ❌ `admin:inventory` - Used by admin panel (WRONG)
- ❌ `inventory` - Used by public configurator (WRONG)

This caused the admin panel and frontend to show different data!

**Now unified to ONE database:**
- ✅ `inventory` - Used by EVERYTHING (admin + public)

---

## Technical Details

### Database Key (KV Store)
**Key:** `inventory`

**Data Structure:**
```json
[
  {
    "id": "unique-id",
    "name": "12\" x 8\"",
    "sku": "SIZE_12X8",
    "category": "size",
    "quantity": 150,
    "price": 44.99
  },
  ...
]
```

**Categories:**
- `size` - Print sizes (e.g., "12\" x 8\"")
- `finish` - Surface finish (e.g., "Gloss", "Matte")
- `mount` - Mount types (e.g., "Stick Tape", "French Cleat")
- `frame` - Frame options (e.g., "None", "Black Frame")

---

## Files Updated

### Backend (`/supabase/functions/server/`)
1. **admin.ts** - Lines 995-1044
   - `GET /admin/inventory` - Reads from `inventory`
   - `PUT /admin/inventory` - Writes to `inventory`
   - `DELETE /admin/inventory/all` - Clears `inventory`

2. **index.tsx** - Lines 166-235
   - `GET /inventory` - Public endpoint, reads from `inventory`
   - `GET /inventory-debug` - Debug endpoint
   - `POST /inventory-cleanup` - Cleanup endpoint

### Frontend
1. **components/ConfiguratorSection.tsx** - Line 205
   - Fetches from `GET /inventory`

2. **hooks/useInventory.tsx** - Line 37
   - Fetches from `GET /inventory`

3. **components/admin/InventoryManagement.tsx** - Multiple lines
   - Fetches from `GET /admin/inventory`
   - Saves to `PUT /admin/inventory`
   - Deletes with `DELETE /admin/inventory/all`

---

## Migration Steps (Already Completed)

✅ **Step 1:** Updated all admin endpoints to use `inventory` key  
✅ **Step 2:** Added critical documentation comments  
✅ **Step 3:** Verified public endpoints use `inventory` key  
✅ **Step 4:** Removed all references to `admin:inventory`  

---

## What You Need To Do NOW

### Re-save Your Inventory Data

1. **Open Admin Panel** → Navigate to "Inventory Management"
2. **Click "Save Changes"** - This will save your current inventory to the unified `inventory` key
3. **Hard Refresh Configurator** (Ctrl+Shift+R or Cmd+Shift+R)
4. **Verify** - Sizes should now match between admin and frontend!

---

## Manual Migration Script (If Needed)

If you had data in the old `admin:inventory` key, run this in your browser console:

```javascript
// Migration: Copy old admin:inventory to new inventory key
fetch('https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server-3e3a9cd7/migrate-inventory', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc3BmYnBxZGN0YXJnY2pobmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjgzMTMsImV4cCI6MjA3ODE0NDMxM30.4sZudo6wR6SAFeUzTm_Q3hGogbmFPzy6oKqD4vGAUCU'
  }
})
  .then(r => r.json())
  .then(data => console.log('Migration result:', data));
```

**Note:** This endpoint doesn't exist yet, but can be created if needed.

---

## Verification Checklist

After migration, verify:

- [ ] Admin panel shows your inventory (5" x 7", 12" x 8", etc.)
- [ ] Configurator shows the SAME sizes as admin panel
- [ ] Prices match between admin and configurator
- [ ] Out of stock items (quantity: 0) are disabled in configurator
- [ ] No old fallback sizes (8"×10", 12"×16", etc.) appear

---

## Troubleshooting

### Problem: Configurator still shows old fallback sizes
**Solution:** The inventory API returned empty data. Go to Admin → Inventory and click "Save Changes"

### Problem: Admin panel is empty
**Solution:** Use the "Load Default Inventory" button in the admin panel

### Problem: Prices don't match
**Solution:** Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## Future Development

**DO NOT:**
- ❌ Create new inventory keys (stick with `inventory`)
- ❌ Use `admin:inventory` prefix
- ❌ Store inventory in different KV keys by category

**DO:**
- ✅ Always use the `inventory` key
- ✅ Filter by `category` field in the data
- ✅ Update the migration guide if you add new categories

---

## Contact

If you encounter issues, check:
1. Backend logs in Supabase Edge Functions
2. Browser console for frontend errors
3. Network tab to verify API responses
