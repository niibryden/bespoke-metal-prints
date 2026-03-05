# Webhook & Order Sync System

## Issue: Paid Orders Stuck as "Pending"

### Symptom
- ✅ Payment **succeeds** in Stripe dashboard
- ❌ Order shows as **"pending"** in admin panel
- ❌ No print-ready image (because order is stuck in pending state)
- ❌ Customer doesn't receive confirmation

### Root Cause
The order status update can fail when:

1. **Stripe webhook not configured** (most common)
   - Webhook endpoint never receives `payment_intent.succeeded` event
   - Order stays in pending state forever

2. **Webhook delivery failed**
   - Network timeout during Stripe → Server communication
   - Stripe doesn't retry successfully
   - Order never updates

3. **Frontend callback failed**
   - Payment succeeds but `onSuccess()` callback errors
   - Image upload fails and aborts the process
   - Network interruption during post-payment flow

---

## The Problem Flow

```
Customer completes payment in Stripe ✅
         │
         ├─> Stripe sends webhook → ❌ FAILS (not configured or error)
         │
         └─> Frontend onSuccess() → ❌ FAILS (network error)
         
Result: Order stuck as "pending" 🔴
```

---

## The Solution: Manual Sync Tool

We've added a **"Sync Order Status from Stripe"** button in the admin panel that:

1. ✅ Fetches the **real payment status** directly from Stripe API
2. ✅ Updates the order in the database to match Stripe
3. ✅ Sends SMS confirmation (if payment succeeded)
4. ✅ Safe to run multiple times (idempotent)

### How It Works

```
Admin clicks "Sync from Stripe"
         │
         ├─> Backend calls Stripe API
         │   └─> stripe.paymentIntents.retrieve(paymentIntentId)
         │
         ├─> Check Stripe status:
         │   ├─> "succeeded" → Update order to "paid" ✅
         │   ├─> "canceled" → Update order to "canceled"
         │   └─> "processing" → Keep as "pending"
         │
         ├─> Save to database
         │   └─> kv.set(`order:${orderId}`, updatedOrder)
         │
         ├─> Send SMS notification (if newly paid)
         │   └─> sendOrderConfirmationSMS(order)
         │
         └─> Show success message ✅
```

---

## Files Created/Modified

### 1. Frontend Component
**`/components/admin/SyncOrderFromStripe.tsx`** (NEW)

A React component that:
- Shows blue info box with explanation
- "Sync Order Status from Stripe" button
- Displays success/error messages
- Calls backend sync endpoint

**Props:**
```typescript
{
  orderId: string;           // Order ID to sync
  paymentIntentId: string;   // Stripe payment intent ID
  onSuccess: () => void;     // Callback after successful sync
}
```

### 2. Backend Endpoint
**`/supabase/functions/server/admin.ts`** (MODIFIED)

Added new endpoint:
```typescript
POST /make-server-3e3a9cd7/admin/sync-order-from-stripe
```

**Request:**
```json
{
  "orderId": "ord_1234567890_abc123",
  "paymentIntentId": "pi_3T4tWX90F41gpYap"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Order synced successfully: pending → paid",
  "order": {
    "id": "ord_1234567890_abc123",
    "status": "paid",
    "paymentStatus": "succeeded",
    "stripeStatus": "succeeded"
  },
  "note": "Note: The print-ready image was not uploaded..."
}
```

**Response (Already Synced):**
```json
{
  "success": true,
  "message": "Order already in sync (status: paid)",
  "order": {
    "id": "ord_1234567890_abc123",
    "status": "paid",
    "paymentStatus": "succeeded"
  }
}
```

### 3. Admin Panel Integration
**`/components/admin/OrderManagement.tsx`** (MODIFIED)

Added import:
```typescript
import { SyncOrderFromStripe } from './SyncOrderFromStripe';
```

Added component (line ~1595, before delete button):
```tsx
{selectedOrder.status === 'pending' && selectedOrder.paymentIntentId && (
  <SyncOrderFromStripe
    orderId={selectedOrder.id}
    paymentIntentId={selectedOrder.paymentIntentId}
    onSuccess={() => {
      // Refresh order list and reopen order
      fetchOrders();
    }}
  />
)}
```

### 4. Warning Message Update
**`/components/admin/OrderManagement.tsx`** (MODIFIED)

Updated the "No Print-Ready Image" warning to be context-aware:
- **Pending orders:** Explains that payment wasn't completed (expected)
- **Paid orders:** Warns that image upload may have failed (needs investigation)

---

## Usage Guide

### For the Current Stuck Order

1. **Open Admin Panel** → Orders tab
2. **Click the pending order** (the one showing in Stripe as paid)
3. **Look for blue box** that says "🔄 Order Status Mismatch Detected"
4. **Click "Sync Order Status from Stripe"**
5. **Wait for success** message: "Order synced successfully: pending → paid"
6. **Order status updates** to "Paid" ✅
7. **Customer receives SMS** confirmation ✅

### Important Note About Images

⚠️ **The sync tool does NOT upload the print-ready image.**

Why? Because the image upload happens during the `onSuccess()` callback in the checkout flow. If that callback never ran (which is why the order is stuck), the image was never uploaded to S3.

**What to do:**
1. Sync the order to "paid" status
2. Contact the customer to re-upload their image
3. Or manually upload the image to S3 and update the order

---

## Preventing This in the Future

### 1. Configure Stripe Webhooks Properly

**Stripe Dashboard** → Developers → Webhooks → Add endpoint

**Endpoint URL:**
```
https://{projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/webhooks/stripe
```

**Events to send:**
- `payment_intent.succeeded`
- `checkout.session.completed`
- `charge.refunded`

**Webhook Secret:**
- Copy the signing secret
- Add to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

### 2. Test Webhooks

Use Stripe CLI to test:
```bash
stripe listen --forward-to https://{projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/webhooks/stripe

stripe trigger payment_intent.succeeded
```

Check Supabase logs:
```
✅ Webhook verified: payment_intent.succeeded
💳 Payment succeeded: pi_xxxxx
✅ Order ord_xxxxx marked as paid
```

### 3. Add Error Handling to Frontend

The `onSuccess()` callback in CheckoutPage.tsx should:
- ✅ Retry failed image uploads
- ✅ Log errors to monitoring service
- ✅ Show user-friendly error messages
- ✅ Allow customer to retry manually

---

## Monitoring & Debugging

### Check Webhook Delivery

**Stripe Dashboard** → Developers → Webhooks → Select endpoint

View:
- Request/response logs
- Failed attempts
- Retry history

### Check Edge Function Logs

**Supabase Dashboard** → Edge Functions → make-server-3e3a9cd7 → Logs

Look for:
```
✅ Webhook verified: payment_intent.succeeded
💳 Payment succeeded: pi_xxxxx
✅ Order ord_xxxxx marked as paid
```

Or errors:
```
❌ Webhook signature verification failed
❌ No order found for payment intent: pi_xxxxx
```

### Check Order Status

**Admin Panel** → Orders → Click order

Look at:
- **Status:** Should be "paid" if payment succeeded
- **Payment Intent ID:** Should match Stripe
- **Print-Ready Image:** May be missing if synced manually

---

## Common Scenarios

### Scenario 1: Webhook Not Configured
**Symptom:** All orders stuck as pending, even after successful payment

**Fix:**
1. Configure webhook in Stripe dashboard (see above)
2. Use sync tool for existing stuck orders
3. Future orders will auto-update via webhook

### Scenario 2: Webhook Configured But Orders Still Stuck
**Symptom:** Some orders stuck, not all

**Possible causes:**
- Network timeout during webhook delivery
- Stripe retry limit exceeded
- Edge function error during webhook processing

**Fix:**
1. Check Stripe webhook logs for delivery failures
2. Check Supabase Edge Function logs for errors
3. Use sync tool to manually fix stuck orders
4. Fix underlying issue (network, code bug, etc.)

### Scenario 3: Order Synced But No Image
**Symptom:** Order status is "paid" but no print-ready image

**Explanation:** Image upload happens in frontend `onSuccess()` callback. If that callback failed (network error, browser closed, etc.), the image was never uploaded even though payment succeeded.

**Fix:**
1. Contact customer to get their image
2. Upload image manually to S3
3. Update order with image URL:
   ```typescript
   order.orderDetails.imageUrl = "https://s3.amazonaws.com/...";
   order.orderDetails.image = "https://s3.amazonaws.com/...";
   ```

---

## Technical Details

### Stripe Payment Intent Statuses

| Stripe Status | Order Status | Payment Status | Action |
|---------------|--------------|----------------|--------|
| `succeeded` | `paid` | `succeeded` | Process & ship |
| `processing` | `pending` | `pending` | Wait for completion |
| `requires_payment_method` | `pending` | `pending` | Customer needs to retry |
| `requires_confirmation` | `pending` | `pending` | Awaiting 3D Secure |
| `requires_action` | `pending` | `pending` | Customer action needed |
| `canceled` | `canceled` | `canceled` | Payment cancelled |

### Database Updates

When syncing, the following fields are updated:

```typescript
order.status = newStatus;           // "paid", "canceled", etc.
order.paymentStatus = newPaymentStatus;  // "succeeded", etc.
order.updatedAt = new Date().toISOString();
order.paidAt = new Date().toISOString();  // Only if newly paid
```

Index is also updated:
```typescript
await updateOrderIndex(order);
```

### SMS Notification

If order status changes from `pending` → `paid`, an SMS is sent:

```typescript
if (newStatus === 'paid' && oldStatus === 'pending') {
  await sendOrderConfirmationSMS(order);
}
```

Message format:
```
🎉 Order confirmed! Your Bespoke Metal Print is in production.
Order #12345
Track: https://example.com/track/12345
```

---

## Future Improvements

### Short-term (Next Sprint)
- [ ] Add "Retry Image Upload" button for paid orders without images
- [ ] Auto-sync all pending orders older than 1 hour (cron job)
- [ ] Email admin when order is manually synced (audit trail)

### Medium-term
- [ ] Implement image upload retry logic in frontend
- [ ] Add webhook event replay feature
- [ ] Create admin dashboard widget showing "sync needed" count

### Long-term
- [ ] Move to Stripe Checkout Sessions (more reliable than Payment Intents)
- [ ] Implement two-phase commit pattern for order creation
- [ ] Add order state machine with automatic recovery

---

## Related Documentation

- `/docs/ORDER_IMAGE_SYSTEM.md` - How images are uploaded after payment
- `/docs/INVENTORY_SYSTEM.md` - Inventory management
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

---

**Created:** February 25, 2026  
**Issue:** Order stuck as "pending" despite successful Stripe payment  
**Solution:** Manual sync tool + webhook configuration guide  
**Status:** ✅ Resolved - Tool ready to use
