# Bespoke Metal Prints - Quick Reference Card v4.0.3

## ⚡ Latest Updates (v4.0.3)

### Checkout Speed Optimization
- **"Continue to Payment" now loads instantly** (<500ms instead of 3-10s)
- Image uploads deferred to post-payment confirmation
- No more waiting for S3 upload before seeing payment form

### Discount Code System
- **WELCOME10** - 10% off product price
- **FREESHIP** - Free shipping
- Discounts properly validated and applied to Stripe charges
- See `/DISCOUNT_CODE_IMPLEMENTATION.md` for full details

## 🚀 Performance Commands (Browser Console)

```javascript
// View all available commands
window.optimizationTools.help()

// Run complete performance test
window.optimizationTools.testPerformance()

// View current metrics
window.optimizationTools.viewMetrics()

// Check bundle size
window.optimizationTools.checkBundleSize()

// Health check
window.optimizationTools.healthCheck()

// Clear service worker cache
window.optimizationTools.clearCache()

// Test API endpoint
window.optimizationTools.testAPI('https://api.example.com/orders')
```

## 📊 Key Metrics

| Metric | Target | Good | Needs Work |
|--------|--------|------|------------|
| FCP | < 1.5s | 🟢 < 1.8s | 🔴 > 3s |
| LCP | < 2.5s | 🟢 < 2.5s | 🔴 > 4s |
| TTI | < 3.5s | 🟢 < 3.5s | 🔴 > 5s |
| CLS | < 0.1 | 🟢 < 0.1 | 🔴 > 0.25 |
| API | < 500ms | 🟢 < 1s | 🔴 > 2s |

## 🎯 API Endpoints

### Orders (with pagination)
```bash
GET /admin/orders?limit=20&offset=0
GET /admin/orders?limit=20&offset=20
```

**Response:**
```json
{
  "orders": [...],
  "hasMore": true,
  "meta": {
    "total": 20,
    "offset": 0,
    "limit": 20
  }
}
```

### Inventory
```bash
GET /admin/inventory
PUT /admin/inventory
```

### Stats
```bash
GET /admin/stats
```

### Collections
```bash
GET /admin/collections
POST /admin/collections
```

### Live Tracking (NEW in v4.0.2)
```bash
GET /tracking/:trackingNumber/live
```

**Response:**
```json
{
  "status": "delivered",
  "statusTimestamp": "2026-01-25T10:30:00Z",
  "statusDetails": "Package delivered",
  "trackingUrl": "https://...",
  "carrier": "USPS"
}
```

## 🛠️ Component Usage

### Virtual Scrolling
```tsx
import { VirtualOrderList } from './components/admin/VirtualOrderList';

<VirtualOrderList 
  onViewOrder={handleViewOrder}
  adminEmail="admin@example.com"
/>
```

### Optimized Images
```tsx
import { OptimizedImage } from './components/OptimizedImage';

<OptimizedImage
  src={imageUrl}
  alt="Description"
  width={800}
  height={600}
  priority={false}
  thumbnail={thumbnailUrl}
/>
```

### React.memo
```tsx
import { memo } from 'react';

const MyComponent = memo(({ data }) => {
  return <div>{data}</div>;
}, (prev, next) => {
  // Return true if re-render NOT needed
  return prev.data === next.data;
});
```

## 📦 Admin Order Management Features (NEW in v4.0.2)

### Refresh Live Status
**Purpose:** Get real-time carrier tracking status for all orders

**How to use:**
1. Go to Admin Dashboard → Orders tab
2. Click **"Refresh Live Status"** (green button)
3. Wait for statuses to load (1-3 seconds)
4. Look for visual indicators:
   - **(DB)** = Database status
   - **✓ Live** = Current carrier status
   - **Yellow ring** = Status mismatch
   - **✓ In Sync** = Statuses match

**When to use:**
- During Emergency Mode (webhooks blocked)
- To check current delivery status
- Before calling customers about orders
- To identify which orders need status updates

### Sync Tracking
**Purpose:** Update database statuses from EasyPost (writes to DB)

**How to use:**
1. Click **"Sync Tracking"** (blue button)
2. Confirm the action
3. Review update statistics

**Note:** May fail during Emergency Mode (database writes blocked)

## 🧹 Cleanup Commands

### Database Cleanup
1. Go to Admin Dashboard
2. Click "Database Cleanup" tab
3. Choose action:
   - **Strip Images**: Remove base64 data (safe)
   - **Delete Old Orders**: Remove orders >90 days old

### Service Worker Cache
```javascript
// Browser console
window.optimizationTools.clearCache()
```

### Browser Cache
- Chrome: Ctrl/Cmd + Shift + Delete
- Or: DevTools → Network → Disable cache

## 📈 Performance Monitoring

### Enable Debug Mode
Add to URL: `?debug=true`

### View Metrics
1. Open browser console (F12)
2. Look for colored indicators:
   - 🟢 Good
   - 🟡 Needs improvement
   - 🔴 Poor

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Click "Generate report"

## 🔧 Configuration

### Adjust Page Size
```tsx
// /components/admin/VirtualOrderList.tsx
const PAGE_SIZE = 20; // Change this
```

### Adjust Cache TTL
```tsx
// /supabase/functions/server/admin.tsx
const CACHE_TTL = 30000; // 30 seconds
```

### Disable Performance Monitoring
```tsx
// /App.tsx
// Comment out:
// initPerformanceMonitoring();
```

## 🐛 Troubleshooting

### Admin Dashboard Slow
1. Check limit parameter (should be ≤20)
2. Run cleanup tool to remove old data
3. Check Disk IO usage in Supabase dashboard

### Orders Showing Old Status (NEW)
**Symptom:** Admin dashboard shows "Processing" but carrier shows "Delivered"

**Solution:**
1. Click **"Refresh Live Status"** (green button in Orders tab)
2. Wait for live status to load from EasyPost
3. Look for yellow ring on status badges (indicates mismatch)
4. Once Emergency Mode is off, click **"Sync Tracking"** to update database

**Why this happens:**
- Emergency Mode blocks webhook updates
- Database statuses become stale
- Live status shows current carrier data

### Dashboard Shows "0 Deliveries" (NEW)
**Symptom:** Overview shows "0 delivered" but packages have been delivered

**Solution:**
1. Look for yellow warning banner in Dashboard Overview
2. Click **"Go to Orders (Live Status)"** button in banner
3. Click **"Refresh Live Status"** to see actual delivery counts

**Why this happens:**
- Statistics are based on database statuses
- Database not updating during Emergency Mode
- Warning banner explains and provides solution

### Shipping Calculation Fails (NEW)
**Symptom:** "Not found" or "Unable to fetch shipping data" error during checkout

**Solution:**
1. Check that server is deployed and running
2. Verify EasyPost API key is set in environment variables
3. Check browser console for detailed error messages
4. Verify shipping address is complete and valid

**Why this happens:**
- Missing or incorrect EasyPost API key
- Server endpoint not deployed
- Invalid address data
- EasyPost API temporarily down

### Images Not Loading
1. Check browser console for errors
2. Verify image URLs are accessible
3. Check network tab for failed requests

### Service Worker Issues
1. DevTools → Application → Service Workers
2. Click "Unregister"
3. Refresh page

### API Timeouts
1. Reduce limit parameter
2. Check database performance
3. Run cleanup tools

## ⚡ Quick Wins

### Immediate Performance Boost
1. ✅ Reduce order fetch limit to 20
2. ✅ Enable service worker (auto-enabled)
3. ✅ Use OptimizedImage for images
4. ✅ Run database cleanup monthly
5. ✅ Add loading="lazy" to images

### Regular Maintenance
- **Daily**: Monitor admin dashboard load time
- **Weekly**: Check Disk IO usage
- **Monthly**: Run cleanup tools
- **Quarterly**: Review performance metrics

## 📱 Mobile Optimization

### Best Practices
1. Use smaller images on mobile
2. Implement touch-friendly UI
3. Test on real devices
4. Use responsive images
5. Optimize for 3G networks

### Testing
```javascript
// Simulate slow network
// DevTools → Network → Slow 3G
```

## 🎓 Learning Resources

- [OPTIMIZATION_V4.md](./OPTIMIZATION_V4.md) - Technical guide
- [PERFORMANCE_FEATURES.md](./PERFORMANCE_FEATURES.md) - Feature docs
- [DISK_IO_OPTIMIZATION.md](./DISK_IO_OPTIMIZATION.md) - Database guide
- [OPTIMIZATION_SUMMARY_v4.md](./OPTIMIZATION_SUMMARY_v4.md) - Summary

## 📞 Support

### Performance Issues
1. Run health check: `window.optimizationTools.healthCheck()`
2. Check metrics: `window.optimizationTools.viewMetrics()`
3. Test performance: `window.optimizationTools.testPerformance()`

### Database Issues
1. Check Supabase dashboard
2. Run cleanup tools
3. Review Disk IO usage

### Cache Issues
1. Clear service worker cache
2. Clear browser cache
3. Hard refresh (Ctrl/Cmd + Shift + R)

## 🎉 Success Indicators

✅ Admin dashboard loads in < 2s  
✅ No timeout errors  
✅ Disk IO < 30%  
✅ All metrics green  
✅ Users report fast experience  

---

**Version**: 4.0.3  
**Last Updated**: January 25, 2026  
**Status**: Production Ready ✅