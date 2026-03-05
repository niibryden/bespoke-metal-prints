import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import crypto from "node:crypto";
import { sendOrderConfirmationSMS, sendDeliveryNotificationSMS, processIncomingSMS } from "./sms-service.ts";

const app = new Hono();

// Lazy-load Stripe
let stripeInstance: any = null;
async function getStripe() {
  if (!stripeInstance) {
    const Stripe = (await import('npm:stripe@17.4.0')).default;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe not configured');
    }
    stripeInstance = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  }
  return stripeInstance;
}

// Helper: Update order index (lightweight metadata only)
async function updateOrderIndex(order: any) {
  try {
    const index = await kv.get('order-index') || [];
    
    const orderMeta = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || `${order.shippingAddress?.name}`,
      customerEmail: order.customerEmail,
      status: order.status,
      amount: order.amount || order.total || 0,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      paymentIntentId: order.paymentIntentId,
      trackingNumber: order.trackingNumber,
    };
    
    // Remove old entry if exists
    const filtered = index.filter((o: any) => o.id !== orderMeta.id);
    
    // Add new entry at beginning
    filtered.unshift(orderMeta);
    
    // Keep only last 500 orders in index
    const trimmed = filtered.slice(0, 500);
    
    await kv.set('order-index', trimmed);
    console.log(`✅ Order index updated for: ${order.id}`);
  } catch (error) {
    console.error('Error updating order index:', error);
    // Don't fail the request if index update fails
  }
}

// Stripe webhook handler
app.post("/make-server-3e3a9cd7/webhooks/stripe", async (c) => {
  try {
    console.log("=== Stripe Webhook Received ===");
    
    const body = await c.req.text();
    const signature = c.req.header("stripe-signature");
    
    if (!signature) {
      return c.json({ error: "Missing signature" }, 400);
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      return c.json({ error: "Webhook not configured" }, 500);
    }

    const stripe = await getStripe();
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`✅ Webhook verified: ${event.type}`);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed:`, err.message);
      return c.json({ error: `Webhook Error: ${err.message}` }, 400);
    }

    // Handle payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`💳 Payment succeeded: ${paymentIntent.id}`);
      
      // Find order by payment intent ID using index (much faster than scanning all orders)
      const orderIndex = await kv.get(`payment-intent:${paymentIntent.id}`);
      
      if (orderIndex?.orderId) {
        const order = await kv.get(`order:${orderIndex.orderId}`);
        
        if (order) {
          order.status = "paid";
          order.paymentStatus = "succeeded";
          order.updatedAt = new Date().toISOString();
          await kv.set(`order:${order.id}`, order);
          
          console.log(`✅ Order ${order.id} marked as paid`);
          await updateOrderIndex(order);
          
          // Send order confirmation SMS
          await sendOrderConfirmationSMS(order);
        }
      } else {
        console.warn(`⚠️ No order found for payment intent: ${paymentIntent.id}`);
      }
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`🛒 Checkout session completed: ${session.id}`);
      
      // Use payment intent index if available
      if (session.payment_intent) {
        const orderIndex = await kv.get(`payment-intent:${session.payment_intent}`);
        
        if (orderIndex?.orderId) {
          const order = await kv.get(`order:${orderIndex.orderId}`);
          
          if (order) {
            order.status = "paid";
            order.paymentStatus = "succeeded";
            order.stripeCheckoutSessionId = session.id;
            order.stripePaymentIntentId = session.payment_intent;
            order.updatedAt = new Date().toISOString();
            await kv.set(`order:${order.id}`, order);
            console.log(`✅ Order ${order.id} marked as paid`);
            await updateOrderIndex(order);
            
            // Send order confirmation SMS
            await sendOrderConfirmationSMS(order);
          }
        }
      }
    }

    // Handle charge.refunded
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      console.log(`💰 Charge refunded: ${charge.id}`);
      
      // Use payment intent index for faster lookup
      if (charge.payment_intent) {
        const orderIndex = await kv.get(`payment-intent:${charge.payment_intent}`);
        
        if (orderIndex?.orderId) {
          const order = await kv.get(`order:${orderIndex.orderId}`);
          
          if (order) {
            const totalRefunded = charge.amount_refunded / 100;
            order.status = charge.refunded ? "refunded" : "partially_refunded";
            order.refundedAmount = totalRefunded;
            order.refundedAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();
            await kv.set(`order:${order.id}`, order);
            console.log(`✅ Order ${order.id} refund updated: $${totalRefunded}`);
            await updateOrderIndex(order);
          }
        }
      }
    }

    return c.json({ 
      received: true,
      eventType: event.type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Stripe webhook error:", error);
    return c.json({ error: error.message || "Webhook processing failed" }, 500);
  }
});

// EasyPost webhook handler
app.post("/make-server-3e3a9cd7/easypost-webhook", async (c) => {
  try {
    console.log("=== EasyPost Webhook Received ===");
    
    const body = await c.req.text();
    const signature = c.req.header("x-hmac-signature");
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get("EASYPOST_WEBHOOK_SECRET");
    
    if (webhookSecret && signature) {
      const hmac = crypto.createHmac("sha256", webhookSecret);
      hmac.update(body);
      const expectedSignature = hmac.digest("hex");
      
      if (signature !== expectedSignature) {
        console.error("Webhook signature verification failed");
        return c.json({ error: "Invalid signature" }, 401);
      }
      console.log("✅ Webhook signature verified");
    }
    
    const payload = JSON.parse(body);
    const eventType = payload.description || payload.event_type || "";
    console.log("Webhook Event:", eventType);
    
    // Handle tracker updates
    if (eventType.toLowerCase().includes("tracker") && eventType.toLowerCase().includes("updated")) {
      await handleTrackerUpdate(payload);
    }
    
    return c.json({ 
      received: true,
      eventType: eventType 
    });
    
  } catch (error) {
    console.error("EasyPost webhook error:", error);
    return c.json({ error: error.message || "Webhook processing failed" }, 400);
  }
});

// Handle tracker updates
async function handleTrackerUpdate(payload: any) {
  try {
    console.log("📦 Processing tracker update...");
    
    const tracker = payload.result;
    const trackingCode = tracker?.tracking_code;
    const status = tracker?.status;
    
    if (!trackingCode) {
      console.warn("No tracking code in tracker update");
      return;
    }
    
    console.log(`Tracking ${trackingCode}: ${status}`);
    
    // Find order by tracking number
    let order = null;
    const trackingIndex = await kv.get(`tracking:${trackingCode}`);
    
    if (trackingIndex?.orderId) {
      order = await kv.get(`order:${trackingIndex.orderId}`);
    } else {
      // Fallback search
      const orderKeys = await kv.getByPrefix('order:');
      order = orderKeys.find((o: any) => o.trackingNumber === trackingCode);
    }
    
    if (!order) {
      console.warn(`No order found for tracking number: ${trackingCode}`);
      return;
    }
    
    console.log(`Found order ${order.id} for tracking ${trackingCode}`);
    
    // Update order status based on tracking status
    let orderStatus = order.status;
    if (status === 'delivered') {
      orderStatus = 'delivered';
    } else if (status === 'in_transit' || status === 'out_for_delivery') {
      if (orderStatus !== 'delivered') {
        orderStatus = 'shipped';
      }
    }
    
    // Update order
    const updatedOrder = {
      ...order,
      status: orderStatus,
      trackingStatus: status,
      trackingUpdatedAt: new Date().toISOString(),
      deliveredAt: status === 'delivered' ? new Date().toISOString() : order.deliveredAt,
      shippedAt: (status === 'in_transit' || status === 'out_for_delivery' || status === 'delivered') && !order.shippedAt 
        ? new Date().toISOString() 
        : order.shippedAt,
    };
    
    await kv.set(`order:${order.id}`, updatedOrder);
    console.log(`✅ Updated order ${order.id} with status: ${orderStatus}`);
    await updateOrderIndex(updatedOrder);
    
    // Send delivery notification SMS if order is delivered
    if (status === 'delivered') {
      await sendDeliveryNotificationSMS(order);
    }
    
  } catch (error) {
    console.error("Error handling tracker update:", error);
  }
}

// Test endpoints
app.get("/make-server-3e3a9cd7/webhooks/test", (c) => {
  return c.json({ 
    message: "Webhook endpoint is accessible!",
    timestamp: new Date().toISOString() 
  });
});

// Twilio SMS webhook handler (for STOP/START/HELP commands)
app.post("/make-server-3e3a9cd7/webhooks/twilio-sms", async (c) => {
  try {
    console.log("=== Twilio SMS Webhook Received ===");
    
    const formData = await c.req.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;
    
    console.log(`📱 Incoming SMS from ${from}: ${body}`);
    
    // Process the incoming SMS (STOP/START/HELP)
    await processIncomingSMS(from, body);
    
    // Respond with empty TwiML (no need to send auto-reply, service handles it)
    return c.text('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', 200, {
      'Content-Type': 'text/xml',
    });
    
  } catch (error) {
    console.error("Twilio SMS webhook error:", error);
    // Still return 200 to Twilio to avoid retries
    return c.text('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', 200, {
      'Content-Type': 'text/xml',
    });
  }
});

export { updateOrderIndex };
export default app;