# Promotions and Discounts - Complete Reference

**Last Updated:** April 15, 2026

## 📋 Overview

This document lists ALL promotional offers, discount codes, and special pricing on the Bespoke Metal Prints website.

---

## 🎟️ Active Discount Codes

### 1. WELCOME10
- **Type:** Percentage discount
- **Value:** 10% off product price
- **Applies to:** Product subtotal only (not shipping)
- **Status:** ✅ Active
- **Implementation:** Server-side validation in `/supabase/functions/server/checkout.ts`
- **Storage:** Stored in Supabase KV store as `discount:WELCOME10`
- **Locations shown:**
  - Exit intent popup
  - Newsletter signup popup
  - FAQ page
  - Product pages
  - Size guide page
  - HD Metal Print Guide page
  - Admin discount management

### Admin-Created Discount Codes
Administrators can create unlimited custom discount codes through the Admin Dashboard:

**Admin Capabilities:**
- ✅ Create new discount codes (percentage or fixed amount)
- ✅ Set expiration dates (optional)
- ✅ Toggle codes active/inactive
- ✅ Delete discount codes
- ✅ View all discount codes

**Discount Code Types:**
1. **Percentage** - e.g., 25% off (value: 25)
2. **Fixed Amount** - e.g., $10 off (value: 10)

**Where to Manage:**
- Admin Dashboard → Discounts tab
- `/admin` route (requires admin login)

**API Endpoints:**
- `GET /admin/discount-codes` - List all codes
- `POST /admin/discount-codes` - Create new code
- `PATCH /admin/discount-codes/:code` - Toggle active status
- `DELETE /admin/discount-codes/:code` - Delete code

**Validation Rules:**
- Code must be alphanumeric (A-Z, 0-9)
- Automatically converted to UPPERCASE
- Percentage cannot exceed 100%
- Fixed amount must be positive number
- Duplicate codes are rejected

**Example Admin Codes:**
- `SUMMER25` - 25% off (percentage)
- `HOLIDAY50` - $50 off (fixed amount)
- `FLASH20` - 20% off with expiration date
- `VIP15` - 15% off (can stack with multi-item discount)

**How Admin Codes Work with Multi-Item Discount:**
Admin codes stack with the automatic 15% multi-item discount (4+ items):
- Example: Create code `BIGORDER30` for 30% off
- Customer adds 5 items totaling $500
- Multi-item discount: -$75 (15% off)
- BIGORDER30 code: -$150 (30% off $500)
- Total savings: $225 (45% combined!)
- Final price: $275 + shipping

---

## 🚚 Automatic Promotions (No Code Required)

### 2. Free Shipping on Orders Over $100
- **Type:** Automatic free shipping
- **Threshold:** $100+ cart subtotal (after any discount codes)
- **Applies to:** USPS Priority shipping ONLY
- **Does NOT apply to:** Express or overnight shipping
- **Status:** ✅ Active
- **Implementation:** 
  - Automatic detection in checkout (`CheckoutPage.tsx` and `CartCheckoutPage.tsx`)
  - FREE_SHIPPING_THRESHOLD constant set to 100
- **Visual indicators:**
  - FreeShippingProgress component in cart modal
  - Progress bar showing distance to free shipping threshold
  - Green "You've qualified for FREE SHIPPING!" banner when eligible
  - Shows in order summary at checkout
- **Locations shown:**
  - Cart modal
  - Checkout page
  - Shipping policy page

**Important Note:** If a customer wants Express or overnight shipping, they will pay for it even if their cart total exceeds $100. Free shipping only covers USPS Priority service.

### 3. Save 15% When You Add 4+ Prints to Cart
- **Type:** Automatic multi-item discount
- **Value:** 15% off when 4 or more prints in cart
- **Status:** ✅ FULLY IMPLEMENTED
- **Implementation:** Automatic calculation in `CartContext.tsx`
- **Applies to:** Product subtotal only (before discount codes)
- **Visual indicators:**
  - Promotional messaging in LivePricePreview
  - CheckoutUpsell shows "Add X More - Save 15%!" if less than 4 items
  - Order summary shows "Multi-Item Discount (15% off)" when applied
  - Green checkmark icon next to discount line
  - Combined savings message at checkout
- **Locations shown:**
  - LivePricePreview component
  - CheckoutUpsell component  
  - CartCheckoutPage order summary
- **Implementation Details:**
  - Threshold: 4+ items (changed from 2+)
  - Stacks with discount codes (both can be applied)
  - Automatically calculated in cart context
  - No code required - applied automatically

---

## 📍 Where Promotions Are Displayed

### Homepage
- Exit intent popup with WELCOME10 code

### Cart Modal (`/components/CartModal.tsx`)
- Free shipping progress bar
- Shows remaining amount to qualify for free shipping
- Green banner when free shipping is unlocked

### Checkout Pages
- `CheckoutPage.tsx` - Single item checkout
- `CartCheckoutPage.tsx` - Multi-item cart checkout
- Both show:
  - Discount code input field
  - Applied discount in order summary
  - Free shipping indicator
  - "You saved $X" message

### Product Pages
- "10% OFF with WELCOME10" badge on pricing

### Educational Pages
- FAQ page mentions WELCOME10
- Size guide mentions WELCOME10
- HD Metal Print Guide mentions WELCOME10

### Admin Dashboard
- Discount management section
- Lists all active/inactive codes
- Can toggle codes on/off

---

## 🔧 Technical Implementation

### Discount Code Validation
**File:** `/supabase/functions/server/checkout.ts`
**Endpoint:** `POST /make-server-3e3a9cd7/checkout/validate-discount`

```typescript
// Validates discount codes against KV store
const upperCode = code.toUpperCase();
const discountCode = await kv.get(`discount:${upperCode}`);

// Checks:
// 1. Code exists in database
// 2. Code is active
// 3. Returns discount details (type, value)
```

### Discount Storage
**Location:** Supabase KV Store
**Key Pattern:** `discount:{CODE}`

Example:
```json
{
  "code": "WELCOME10",
  "type": "percentage",
  "value": 10,
  "active": true
}
```

### Free Shipping Logic
**Files:** `CheckoutPage.tsx`, `CartCheckoutPage.tsx`

```typescript
const FREE_SHIPPING_THRESHOLD = 100;
const qualifiesForFreeShipping = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD;

// Only applies to USPS Priority shipping
// Customer can still choose Express/Overnight but will pay for it
```

### Shipping Rate Filtering
**File:** `/supabase/functions/server/shipping-config.ts`

```typescript
// Filters shipping rates to USPS Priority services only
// Excludes: International, First Class, Parcel Select, Media Mail
// Includes: Priority, Priority Express
```

---

## 🎯 Discount Code Workflow

1. **Customer enters code at checkout**
2. Frontend sends code to `/checkout/validate-discount` endpoint
3. Server checks KV store for `discount:{CODE}`
4. Server validates code is active
5. Server returns discount details (type, value)
6. Frontend calculates discount amount
7. Frontend displays discount in order summary
8. Discount is applied to Stripe payment intent
9. Discount metadata saved in Stripe and order records

---

## 💡 Multi-Item Discount Implementation

### ✅ IMPLEMENTED (Changed from 2+ to 4+ items)
**File:** `/contexts/CartContext.tsx`

```typescript
const getMultiItemDiscount = () => {
  const itemCount = getItemCount();
  const MULTI_ITEM_THRESHOLD = 4; // 4+ items get discount
  const MULTI_ITEM_PERCENTAGE = 15; // 15% off
  
  if (itemCount >= MULTI_ITEM_THRESHOLD) {
    const subtotal = getTotalPrice();
    const discountAmount = (subtotal * MULTI_ITEM_PERCENTAGE) / 100;
    
    return { 
      applied: true, 
      amount: discountAmount, 
      percentage: MULTI_ITEM_PERCENTAGE 
    };
  }
  
  return { applied: false, amount: 0, percentage: 0 };
};
```

**How it works:**
- Automatically detects when cart has 4+ items
- Calculates 15% discount on subtotal
- Returns discount details (applied, amount, percentage)
- Stacks with discount codes (WELCOME10 can be used with multi-item discount)
- Displayed in checkout order summary with green checkmark

### ❌ No "FREESHIP" Discount Code
**Mentioned in:** Some documentation files
**Current State:** NOT IMPLEMENTED
**Status:** The automatic free shipping promo (orders over $100) replaced this

---

## 📊 Promotional Impact Estimates

Based on implementation documentation:

| Promotion | Estimated Impact | Status |
|-----------|-----------------|--------|
| Free Shipping ($100+) | +15-25% AOV | ✅ Active |
| WELCOME10 (10% off) | +12-20% conversion | ✅ Active |
| Exit Intent Popup | +10-15% email capture | ✅ Active |
| 15% Multi-Item Discount (4+ items) | +20-30% cart size | ✅ Active |

---

## 🔍 How to Find Discount Codes in Code

### Search Patterns:
```bash
# Find discount code references
grep -r "WELCOME10" components/
grep -r "discount" supabase/functions/server/

# Find free shipping logic
grep -r "FREE_SHIPPING_THRESHOLD" components/
grep -r "qualifiesForFreeShipping" components/

# Find promotional messaging
grep -r "Save 15%" components/
grep -r "2 or more" components/
```

### Key Files:
- `/components/CheckoutPage.tsx` - Single item checkout with discounts
- `/components/CartCheckoutPage.tsx` - Cart checkout with discounts
- `/components/FreeShippingProgress.tsx` - Free shipping progress bar
- `/components/ExitIntentPopup.tsx` - Exit intent with WELCOME10
- `/components/SignupPopup.tsx` - Newsletter signup with WELCOME10
- `/supabase/functions/server/checkout.ts` - Discount validation
- `/contexts/CartContext.tsx` - Cart totals (no multi-item discount)

---

## 🚨 Important Notes

1. **Free shipping is USPS Priority ONLY** - If customers choose Express or overnight, they pay full shipping cost regardless of cart total

2. **Multi-item discount IS now automatic** - 15% discount automatically applies when cart has 4+ items

3. **Discount codes and multi-item discount can stack** - Customer can use WELCOME10 code AND get 15% multi-item discount
   - Example: $400 cart with 4 items
   - Multi-item discount: -$60 (15% off)
   - WELCOME10 code: -$40 (10% off $400)
   - Total savings: $100
   - Final price: $300 + shipping

4. **Admin-created codes also stack** - Any admin-created discount code will stack with the multi-item discount

5. **Discount codes are case-insensitive** - WELCOME10, welcome10, Welcome10 all work

6. **Discounts apply to product price only** - Shipping is calculated after discount, free shipping promo is separate

7. **Only one discount CODE at a time** - Cannot use WELCOME10 + another code, but can use any code + multi-item discount

---

## ✅ Verification Checklist

- [x] WELCOME10 code validated server-side
- [x] Free shipping automatically applied at $100+ threshold
- [x] Free shipping only applies to USPS Priority shipping
- [x] Discount codes stored in Supabase KV store
- [x] Discount metadata saved in Stripe payment intents
- [x] Multi-item 15% discount automatically applied for 4+ items
- [x] Exit intent popup offers WELCOME10
- [x] Newsletter signup offers WELCOME10
- [x] Promotional banner removed from homepage

---

## 📝 Summary

**3 Promotions Currently Active on Website:**

1. ✅ **WELCOME10** - 10% off (Code required, fully implemented)
2. ✅ **Free Shipping on $100+** - Automatic (USPS Priority only, fully implemented)
3. ✅ **Save 15% with 4+ Items** - Automatic (Fully implemented, stacks with codes)

**Key Changes Made:**
- ✅ Multi-item discount threshold changed from 2+ to 4+ items
- ✅ Multi-item discount fully implemented in CartContext
- ✅ Multi-item discount displays in checkout order summary
- ✅ Promotional messaging updated to reflect "4 or more"
- ✅ Homepage promotional banner removed
- ✅ Free shipping banner made more compact
- ✅ Cart checkout flow improved with dedicated page

**Additional Discount Codes:**
- None currently active beyond WELCOME10
- FREESHIP was mentioned in old docs but is NOT implemented (replaced by automatic free shipping promo)
- Admins can create unlimited custom codes through the Admin Dashboard
  - Supports percentage (e.g., 25% off) and fixed amount (e.g., $10 off)
  - All admin codes stack with multi-item discount
  - Can set optional expiration dates
  - Can toggle active/inactive without deleting

**Admin Discount Management:**
- Location: Admin Dashboard → Discounts tab
- Full CRUD operations (Create, Read, Update, Delete)
- Real-time validation prevents duplicate codes
- All codes stored in Supabase KV store
- Codes work immediately after creation (no deployment needed)