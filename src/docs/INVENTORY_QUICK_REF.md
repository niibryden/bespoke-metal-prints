# Inventory System Quick Reference Card

## 🔑 The ONE Key Rule

```
KV Key: 'inventory'
```

**NEVER use:** `admin:inventory`, `public:inventory`, or any other variation!

---

## 📍 All Inventory Locations

| Location | File | Line | Purpose |
|----------|------|------|---------|
| **Database** | KV Store | - | Single source of truth |
| **Admin GET** | `/supabase/functions/server/admin.ts` | 1005 | `kv.get('inventory')` |
| **Admin PUT** | `/supabase/functions/server/admin.ts` | 1022 | `kv.set('inventory', data)` |
| **Admin DELETE** | `/supabase/functions/server/admin.ts` | 1038 | `kv.set('inventory', [])` |
| **Public GET** | `/supabase/functions/server/index.tsx` | 168 | `kv.get('inventory')` |
| **Debug GET** | `/supabase/functions/server/index.tsx` | 181 | `kv.get('inventory')` |
| **Cleanup POST** | `/supabase/functions/server/index.tsx` | 205 | `kv.get('inventory')` |
| **Frontend Admin** | `/components/admin/InventoryManagement.tsx` | 95 | Fetch from API |
| **Frontend Config** | `/components/ConfiguratorSection.tsx` | 205 | Fetch from API |
| **Frontend Hook** | `/hooks/useInventory.tsx` | 37 | Fetch from API |

---

## 🌐 API Endpoints

### Admin (Auth Required)
```bash
GET    /admin/inventory       # Read inventory
PUT    /admin/inventory       # Save inventory
DELETE /admin/inventory/all   # Clear inventory
```

### Public (No Auth)
```bash
GET    /inventory              # Read inventory
GET    /inventory-debug        # Debug view
POST   /inventory-cleanup      # Clean bad data
```

---

## 📦 Data Structure

```typescript
{
  id: string,        // "size-1"
  name: string,      // "12\" x 8\""
  sku: string,       // "SIZE_12X8"
  category: string,  // "size" | "finish" | "mount" | "frame"
  quantity: number,  // 150
  price: number      // 44.99
}
```

---

## ✅ Quick Checks

### Is inventory synced?
```javascript
// In browser console:
fetch('https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server-3e3a9cd7/inventory', {
  headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc3BmYnBxZGN0YXJnY2pobmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjgzMTMsImV4cCI6MjA3ODE0NDMxM30.4sZudo6wR6SAFeUzTm_Q3hGogbmFPzy6oKqD4vGAUCU' }
})
  .then(r => r.json())
  .then(data => console.table(data.inventory.filter(i => i.category === 'size')));
```

### Debug inventory characters
```javascript
fetch('https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server-3e3a9cd7/inventory-debug', {
  headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc3BmYnBxZGN0YXJnY2pobmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjgzMTMsImV4cCI6MjA3ODE0NDMxM30.4sZudo6wR6SAFeUzTm_Q3hGogbmFPzy6oKqD4vGAUCU' }
})
  .then(r => r.json())
  .then(data => console.table(data.sizes));
```

### Clean corrupt data
```javascript
fetch('https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server-3e3a9cd7/inventory-cleanup', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc3BmYnBxZGN0YXJnY2pobmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjgzMTMsImV4cCI6MjA3ODE0NDMxM30.4sZudo6wR6SAFeUzTm_Q3hGogbmFPzy6oKqD4vGAUCU' }
})
  .then(r => r.json())
  .then(data => console.log('Removed:', data.removedItems));
```

---

## 🔧 Common Tasks

### Add new size
1. Admin → Inventory Management
2. Click "+ Add Item"
3. Set: name="48\" x 32\"", sku="SIZE_48X32", category="size", quantity=20, price=349.99
4. Click "Save Changes"

### Update price
1. Admin → Inventory Management
2. Find item in table
3. Click price field, edit value
4. Auto-saves in 500ms

### Mark out of stock
1. Admin → Inventory Management
2. Find item, set quantity = 0
3. Auto-saves
4. Item now disabled in configurator

### Restore stock
1. Admin → Inventory Management
2. Find item, set quantity > 0
3. Auto-saves
4. Item now available in configurator

### Reset to defaults
1. Admin → Inventory Management
2. Click "Load Default Inventory"
3. Confirms, then loads preset items
4. Click "Save Changes"

---

## ⚠️ Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Sizes don't match | Using wrong KV key | Check all use `'inventory'` |
| Empty configurator | No data in database | Admin → Load Defaults → Save |
| Wrong prices | Stale cache | Hard refresh (Ctrl+Shift+R) |
| Duplicate items | Data corruption | Use cleanup endpoint |
| Save fails | Permission error | Check admin auth token |

---

## 🚨 Emergency Commands

### Backup current inventory
```javascript
fetch('https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server-3e3a9cd7/inventory')
  .then(r => r.json())
  .then(data => {
    const backup = JSON.stringify(data.inventory, null, 2);
    console.log('BACKUP:', backup);
    // Copy from console and save to file
  });
```

### Restore from backup
```javascript
const backupData = [...]; // Paste your backup array here

fetch('https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server-3e3a9cd7/admin/inventory', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({ inventory: backupData })
})
  .then(r => r.json())
  .then(data => console.log('Restored:', data));
```

---

## 📋 Checklist for Changes

Before modifying inventory code:
- [ ] Does it use `'inventory'` key? (not `admin:inventory`)
- [ ] Does it maintain the data structure?
- [ ] Does it validate `category` field?
- [ ] Does it handle errors gracefully?
- [ ] Does it work for both admin and public?
- [ ] Have you tested on both frontend and admin?

---

## 📞 Support

**Edge Function Logs:**
- Supabase Dashboard → Edge Functions → `make-server-3e3a9cd7` → Logs

**Browser Console:**
- Press F12 → Console tab
- Look for "📦 Inventory loaded:" messages

**Network Tab:**
- Press F12 → Network tab
- Filter: `/inventory`
- Check request/response

---

Last Updated: February 23, 2026  
Quick Ref Version: 1.0
