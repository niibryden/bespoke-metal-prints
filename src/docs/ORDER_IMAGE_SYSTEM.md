# Order & Image Upload System

## Overview

The Bespoke Metal Prints checkout system uses a **two-phase approach** for order creation and image upload to optimize performance and storage costs.

---

## How It Works

### Phase 1: Payment Initialization (Fast)

When the customer clicks "Continue to Payment":

1. ✅ **Create Payment Intent** with Stripe
2. ✅ **Create Order Record** with metadata only:
   - Order ID
   - Customer email
   - Shipping address
   - Product details (size, finish, mount, frame)
   - Pricing information
   - **NO IMAGE DATA** ❌
3. ✅ **Set Status:** `pending`
4. ✅ **Show Payment Form** (Stripe)

**Why skip the image?**
- Faster checkout (no S3 upload delay)
- Saves S3 storage costs (don't store abandoned cart images)
- Better UX (instant "Continue to Payment" button)

---

### Phase 2: Post-Payment Upload (After Success)

When the customer completes payment:

1. ✅ **Payment Succeeds** (Stripe confirms)
2. ✅ **Upload Image to S3**
   - Compress image to 70% quality
   - Upload to `order-images/` folder
   - Get signed URL from S3
3. ✅ **Update Order** with image URL:
   ```typescript
   orderDetails: {
     imageUrl: "https://s3.amazonaws.com/...",
     image: "https://s3.amazonaws.com/...", // backward compat
     size: "12\" x 8\"",
     finish: "Gloss",
     mountType: "French Cleat",
     frame: "None"
   }
   ```
4. ✅ **Update Status:** `paid`
5. ✅ **Show Success Page**

---

## Order Status & Images

### Pending Orders
- **Status:** `pending`
- **Payment:** NOT completed
- **Image:** ❌ **NO IMAGE** (not uploaded yet)
- **Action:** Safe to delete (abandoned cart or test order)
- **Storage:** No S3 cost

### Paid Orders
- **Status:** `paid`
- **Payment:** ✅ Completed
- **Image:** ✅ **HAS IMAGE** (uploaded to S3)
- **Action:** Process and ship
- **Storage:** S3 storage used

---

## File Locations

### Frontend (CheckoutPage.tsx)

**Line 487-489:** Skip image upload during payment init
```typescript
// ⚡ OPTIMIZATION: Skip image upload during payment initialization
// Image will be uploaded AFTER payment confirmation for better UX
console.log('⚡ Skipping image upload - will upload after payment confirmation');
```

**Line 553:** Create order without image
```typescript
console.log('📝 Creating order placeholder (image will be uploaded after payment)...');
```

**Line 582:** Order creation payload
```typescript
orderDetails: {
  finish: orderDetails.finish,
  size: orderDetails.size,
  mountType: orderDetails.mountType,
  frame: orderDetails.frame,
  hasImage: !!orderDetails.image,
  // Don't send image data here - upload after payment confirmation
}
```

**Line 1043-1099:** Post-payment image upload
```typescript
onSuccess={async () => {
  // ⚡ OPTIMIZATION: Upload image to S3 AFTER payment confirmation
  let imageUrl = null;
  if (orderDetails.image) {
    // Compress image
    const compressedImage = await compressImage(orderDetails.image, 0.7);
    
    // Upload to S3 via server endpoint
    const uploadResponse = await fetch(`${serverUrl}/upload-image`, {
      method: 'POST',
      body: JSON.stringify({
        imageData: compressedImage,
        fileName: `order-images/${Date.now()}-${Math.random()}.png`,
      }),
    });
    
    const uploadData = await uploadResponse.json();
    imageUrl = uploadData.url;
    
    // Update order with image URL
    await fetch(`${serverUrl}/update-order`, {
      method: 'POST',
      body: JSON.stringify({
        orderId: orderId,
        imageUrl: imageUrl,
      }),
    });
  }
  
  // Update order status to paid
  await fetch(`${serverUrl}/update-order-status`, {
    method: 'POST',
    body: JSON.stringify({
      orderId: orderId,
      status: 'paid',
      paymentStatus: 'succeeded',
    }),
  });
}
```

---

### Backend (checkout.ts)

**Line 286-357:** Create order endpoint
```typescript
checkoutApp.post('/make-server-3e3a9cd7/create-order', async (c) => {
  const order = {
    id: orderId,
    paymentIntentId: paymentIntentId,
    customerEmail: customerEmail,
    orderDetails: orderDetails, // No image field yet
    status: 'pending',
    paymentStatus: 'pending',
  };
  
  await kv.set(`order:${orderId}`, order);
});
```

**Line 526-562:** Update order with image
```typescript
checkoutApp.post('/make-server-3e3a9cd7/update-order', async (c) => {
  const { orderId, imageUrl } = await c.req.json();
  
  const order = await kv.get(`order:${orderId}`);
  
  if (imageUrl) {
    order.orderDetails.imageUrl = imageUrl;
    order.orderDetails.image = imageUrl; // Backward compatibility
  }
  
  await kv.set(`order:${orderId}`, order);
});
```

**Line 565-600:** Update order status
```typescript
checkoutApp.post('/make-server-3e3a9cd7/update-order-status', async (c) => {
  const { orderId, status, paymentStatus } = await c.req.json();
  
  order.status = status;
  order.paymentStatus = paymentStatus;
  
  await kv.set(`order:${orderId}`, order);
});
```

---

## Admin Panel Display

### OrderManagement.tsx (Line 1296-1324)

Shows context-aware warning for missing images:

**For Pending Orders:**
```
⚠️ No Print-Ready Image Found

This is a pending order where the customer did not complete payment.
Print-ready images are only uploaded after successful payment.

What this means:
• Payment was never completed (abandoned cart or test order)
• No image was uploaded (saves S3 storage)
• You can safely delete this order using the button below
```

**For Paid Orders:**
```
⚠️ No Print-Ready Image Found

This paid order does not have a print-ready image stored. This might happen if:
• The order was created before image storage was implemented
• The image upload failed after payment (network error)
• The image data was too large and was truncated

[🐛 Log Debug Info to Console]
```

---

## Data Flow Diagram

```
Customer Checkout Flow:
┌─────────────────────────────────────────────────────────────┐
│  1. Upload Image in Configurator                            │
│     └─> Stored in browser memory (NOT uploaded yet)         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Click "Continue to Payment"                             │
│     ├─> Create Payment Intent (Stripe)                      │
│     ├─> Create Order Record (metadata only, NO image)       │
│     ├─> Status: pending                                     │
│     └─> Show Payment Form                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Customer Completes Payment                              │
│     └─> Stripe processes card                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Payment Success Callback                                │
│     ├─> Compress image (70% quality)                        │
│     ├─> Upload image to S3                                  │
│     ├─> Update order with imageUrl                          │
│     ├─> Update status to 'paid'                             │
│     └─> Show success page                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Order Ready for Production                              │
│     ├─> Admin sees order with print-ready image             │
│     ├─> Download button available                           │
│     └─> Ship to customer                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Edge Cases

### 1. Payment Abandoned
- **Scenario:** Customer leaves during payment
- **Result:** Order stays `pending` with no image
- **Action:** Admin can safely delete

### 2. Image Upload Fails After Payment
- **Scenario:** S3 upload fails but payment succeeded
- **Result:** Order is `paid` but no image
- **Action:** Contact customer for re-upload (rare)

### 3. Network Error During Payment
- **Scenario:** Payment succeeds but frontend loses connection
- **Result:** Webhook will update order status
- **Action:** Image may be missing, handle via admin panel

---

## Storage Optimization

### Before This System (Old Approach)
```
100 visitors → 100 orders created
└─> 70 abandoned carts
    └─> 70 images uploaded to S3 ❌
        └─> Wasted storage cost
```

### After This System (Current)
```
100 visitors → 100 orders created
└─> 70 abandoned carts (pending)
    └─> 0 images uploaded ✅
        └─> No wasted storage

└─> 30 completed orders (paid)
    └─> 30 images uploaded ✅
        └─> Only paying customers
```

**Cost Savings:** ~70% reduction in S3 storage for abandoned carts

---

## Testing

### Test a Complete Order Flow

1. **Create Test Order:**
   - Upload image in configurator
   - Click "Continue to Payment"
   - Complete payment with test card (4242 4242 4242 4242)

2. **Verify:**
   - ✅ Order created with `pending` status
   - ✅ Payment succeeds
   - ✅ Image uploads to S3
   - ✅ Order updated with `imageUrl`
   - ✅ Status changes to `paid`

3. **Check Admin Panel:**
   - ✅ Order shows print-ready image
   - ✅ Download button works
   - ✅ Image dimensions match order size

### Test an Abandoned Cart

1. **Create Pending Order:**
   - Upload image in configurator
   - Click "Continue to Payment"
   - **Close tab** (don't complete payment)

2. **Verify:**
   - ✅ Order created with `pending` status
   - ✅ No image uploaded to S3
   - ✅ Admin panel shows yellow warning
   - ✅ Delete button available

---

## Troubleshooting

### Problem: Paid order has no image
**Possible Causes:**
- S3 upload failed after payment
- Network interruption during callback
- Order created before image system implemented

**Solution:**
- Check browser console for upload errors
- Contact customer for image re-upload
- Use debug button in admin panel

### Problem: Pending orders accumulating
**Cause:** Abandoned carts / test orders

**Solution:**
- Use "Delete Pending Order" button
- Consider auto-cleanup after 7 days (future feature)

---

## Future Improvements

- [ ] Auto-delete pending orders after 7 days
- [ ] Retry image upload if payment succeeds but upload fails
- [ ] Email customer if image missing on paid order
- [ ] Compress images more aggressively (JPEG instead of PNG)
- [ ] Store image in multiple sizes (thumbnail, print-ready, original)

---

Last Updated: February 25, 2026  
System Version: 2.0 (Two-Phase Upload)
