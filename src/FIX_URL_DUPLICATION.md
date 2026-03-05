# URL Path Duplication Fix

**Issue:** Frontend URLs have `/make-server-3e3a9cd7` duplicated in the path

**Error Example:**
```
/make-server-3e3a9cd7/make-server-3e3a9cd7/customer/123
                     ↑ Duplicate prefix ↑
```

## Root Cause

The `serverUrl` variable already includes the prefix:
```typescript
const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
```

But then code adds it again:
```typescript
fetch(`${serverUrl}/make-server-3e3a9cd7/customer/${userId}`)
                   ↑ Don't add this again! ↑
```

## Fix Pattern

**BEFORE:**
```typescript
const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
fetch(`${serverUrl}/make-server-3e3a9cd7/customer/${userId}`)
```

**AFTER:**
```typescript
const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
fetch(`${serverUrl}/customer/${userId}`)  // Remove duplicate prefix
```

## Files Requiring Fix

### ✅ Fixed
- `/components/CheckoutPage.tsx` - All fetch calls updated

### ⚠️ Need to Fix
- `/components/CartCheckoutPage.tsx` - 3 occurrences
- `/components/admin/AdminSettings.tsx` - 4 occurrences  
- `/components/AdminDiagnostics.tsx` - 9 occurrences
- `/components/StripePaymentForm.tsx` - 1 occurrence
- `/components/SignupPopup.tsx` - 1 occurrence

## Automated Fix Commands

Replace all occurrences of the duplicate prefix:

```bash
# Pattern to find
${serverUrl}/make-server-3e3a9cd7/

# Replace with
${serverUrl}/
```

## Manual Verification

After applying the fix, verify these endpoints work:
1. `/customer/:userId` - Customer data fetch
2. `/calculate-shipping` - Shipping rates
3. `/create-payment-intent` - Payment creation
4. `/create-order` - Order creation
5. `/admin/users` - Admin user management

## Testing Checklist

- [ ] Customer data loads correctly
- [ ] Shipping calculation works
- [ ] Payment intent creation works
- [ ] Order creation works
- [ ] Admin functions work
- [ ] No 404 errors in console
