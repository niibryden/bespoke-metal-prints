# Disk IO Optimization Guide

## Overview
This document details the optimizations implemented to reduce Supabase Disk IO consumption and improve database performance.

## Problem
Supabase's Disk IO Budget was being depleted, causing:
- Slow response times on database queries
- High CPU usage due to IO wait
- Potential instance unresponsiveness
- Statement timeout errors in the admin dashboard

## Root Causes
1. **Large base64 image data** stored in order records (up to 2-3 MB per order)
2. **Frequent database queries** without proper caching
3. **Large query limits** pulling too much data at once
4. **Long timeouts** keeping connections open during slow queries

## Optimizations Implemented (v3.1.5)

### 1. Reduced Query Limits
**Files Modified:**
- `/supabase/functions/server/checkout.tsx`
- `/supabase/functions/server/index.tsx`

**Changes:**
- Order fetching limit: 100 → 50 orders
- Diagnostic queries limit: 200 → 50 records
- Migration queries limit: 100 → 50 records
- Batch size increased: 2 → 5 (better throughput while maintaining stability)

**Impact:** Reduces the amount of data scanned per query, minimizing Disk IO operations.

### 2. Aggressive Query Timeouts
**Files Modified:**
- `/supabase/functions/server/checkout.tsx`
- `/supabase/functions/server/index.tsx`

**Changes:**
- Order keys query timeout: 8s → 5s
- Batch fetch timeout: 10s → 6s
- Individual order timeout: 15s → 8s
- Migration timeout: 60s → 10s

**Impact:** Prevents long-running queries from consuming excessive Disk IO resources.

### 3. Extended Cache TTL
**Files Modified:**
- `/supabase/functions/server/checkout.tsx`

**Changes:**
- Stats cache: 5 minutes → 10 minutes
- Orders cache: 30 minutes → 60 minutes

**Impact:** Reduces the frequency of database queries, significantly lowering Disk IO usage.

### 4. Database Cleanup Tools
**New Files:**
- `/components/admin/DataCleanup.tsx` - Admin UI for cleanup operations
- New endpoint in `/supabase/functions/server/admin.tsx`

**Features:**
- **Strip Images:** Remove base64 image data from order records while preserving S3 URLs
- **Delete Old Orders:** Remove delivered orders older than a specified number of days (default: 90 days)

**Impact:** Directly reduces database size and ongoing Disk IO consumption.

### 5. Batch Processing Delays
**Files Modified:**
- `/supabase/functions/server/index.tsx`

**Changes:**
- Inter-batch delay: 250ms → 500ms

**Impact:** Gives the database time to recover between batch operations, preventing IO spikes.

## How to Use Database Cleanup

### Access the Cleanup Tool
1. Log in to Admin Dashboard
2. Navigate to "Database Cleanup" tab
3. Choose an operation:

### Strip Images from Orders
- **Safe Operation:** Does not delete any orders
- **Removes:** Base64 image data from `orderDetails.image` and `items.image`
- **Preserves:** All S3 URLs and other order data
- **Benefit:** Can free up hundreds of MB instantly
- **Recommended:** Run this first if experiencing Disk IO issues

### Delete Old Orders
- **Destructive Operation:** Permanently deletes records
- **Target:** Only orders with status "delivered"
- **Age Filter:** Customizable (default 90 days)
- **Safety:** Requires confirmation
- **Benefit:** Keeps database lean long-term
- **Recommended:** Run periodically (monthly/quarterly)

## Monitoring & Maintenance

### Check Disk IO Usage
Visit: https://supabase.com/dashboard/project/shspfbpqdctargcjhnke

Navigate to: Database → Performance

### Recommended Schedule
- **Daily:** Monitor Disk IO consumption
- **Weekly:** Review cache hit rates
- **Monthly:** Run "Strip Images" cleanup
- **Quarterly:** Run "Delete Old Orders" for orders older than 90 days

### Performance Indicators
✅ **Healthy:**
- Admin dashboard loads in < 3 seconds
- No timeout errors
- Disk IO stays below 50% budget

⚠️ **Warning:**
- Dashboard takes 5-10 seconds to load
- Occasional timeout errors
- Disk IO at 50-80% budget
- **Action:** Run "Strip Images" cleanup

🚨 **Critical:**
- Dashboard fails to load
- Frequent timeout errors
- Disk IO at 80-100% budget
- **Action:** 
  1. Run "Strip Images" immediately
  2. Consider deleting old orders
  3. Consider upgrading Supabase plan

## Technical Details

### Query Optimization
All queries now use:
- `LIKE` operator for prefix matching (better index usage)
- `LIMIT` clauses to restrict row scans
- Aggressive timeouts to prevent runaway queries
- Small batch sizes for bulk operations

### Caching Strategy
- **Level 1:** In-memory cache (60 minutes for orders, 10 minutes for stats)
- **Level 2:** Client-side cache (browser)
- **Invalidation:** Automatic on data mutations

### Image Handling
- **New Orders:** Images stored only in S3, not in database
- **Existing Orders:** Can be cleaned with "Strip Images" tool
- **Display:** Uses S3 URLs exclusively

## Version History

### v4.0.0 (Current)
- **Ultra Performance Update**
- Reduced default order limit to 20 (from 50)
- Added pagination support (offset/limit) to all admin endpoints
- Implemented virtual scrolling for admin order lists
- React.memo optimization for expensive components
- Service worker caching for static assets
- Progressive image loading with OptimizedImage component
- Performance monitoring utilities
- Bundle size optimization

### v3.1.5
- Reduced all query limits by 50%
- Implemented aggressive timeouts
- Extended cache TTL
- Added Database Cleanup tools

### v3.1.4
- Removed duplicate endpoint code
- Implemented 2-second timeout for KV queries

### v3.0.0
- Stripped image data from order writes
- Implemented basic caching

## Support

If you continue to experience Disk IO issues after these optimizations:

1. **Check Database Size:**
   - Admin Dashboard → Database Cleanup
   - Review total orders count

2. **Run Cleanup:**
   - Start with "Strip Images" (safe)
   - Then consider "Delete Old Orders" (destructive)

3. **Consider Upgrading:**
   - If database consistently exceeds limits
   - Supabase Pro plan offers higher Disk IO budget

4. **Contact Support:**
   - Document specific error messages
   - Include timestamp of issues
   - Share Disk IO usage graph from Supabase dashboard
