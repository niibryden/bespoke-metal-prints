import * as kv from './kv_store.tsx';

/**
 * SMS Service for Bespoke Metal Prints
 * A2P-compliant transactional SMS notifications using Twilio
 */

// Lazy-load Twilio client
let twilioClient: any = null;

async function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    if (!accountSid || !authToken) {
      console.warn('⚠️ Twilio credentials not configured - SMS notifications disabled');
      return null;
    }
    
    const twilio = await import('npm:twilio@5.3.4');
    twilioClient = twilio.default(accountSid, authToken);
  }
  
  return twilioClient;
}

/**
 * Check if customer has opted out of SMS
 */
async function isOptedOut(phoneNumber: string): Promise<boolean> {
  try {
    const normalized = normalizePhoneNumber(phoneNumber);
    const optOutStatus = await kv.get(`sms:opt-out:${normalized}`);
    return optOutStatus?.optedOut === true;
  } catch (error) {
    console.error('Error checking opt-out status:', error);
    return false; // Fail safe - don't send if we can't verify
  }
}

/**
 * Normalize phone number to E.164 format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 for US numbers if not present
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Add + if missing
  if (!digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`;
  }
  
  if (digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`;
  }
  
  // Return as-is if already formatted
  return phone.startsWith('+') ? phone : `+${digits}`;
}

/**
 * Send SMS notification
 */
async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    const client = await getTwilioClient();
    if (!client) {
      console.log('📵 Twilio not configured - SMS not sent');
      return false;
    }
    
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    if (!fromNumber) {
      console.error('❌ TWILIO_PHONE_NUMBER not configured');
      return false;
    }
    
    // Check opt-out status
    if (await isOptedOut(to)) {
      console.log(`📵 Customer ${to} has opted out - SMS not sent`);
      return false;
    }
    
    const normalizedTo = normalizePhoneNumber(to);
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: normalizedTo,
    });
    
    console.log(`✅ SMS sent to ${normalizedTo}: ${result.sid}`);
    
    // Log SMS for tracking
    await kv.set(`sms:log:${result.sid}`, {
      to: normalizedTo,
      message,
      sid: result.sid,
      sentAt: new Date().toISOString(),
      status: 'sent',
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send SMS:', error.message);
    return false;
  }
}

/**
 * Send order confirmation SMS
 */
export async function sendOrderConfirmationSMS(order: any): Promise<void> {
  try {
    // Only send if customer has SMS consent
    if (!order.smsConsent || !order.smsPhone) {
      console.log('📵 No SMS consent or phone number - skipping order confirmation SMS');
      return;
    }
    
    const message = `Bespoke Metal Prints: Order confirmed! Your ${order.orderDetails?.size || ''} metal print is being prepared. Order #${order.orderNumber || order.id.slice(-8)}. Track at bespokemetalprints.com`;
    
    const sent = await sendSMS(order.smsPhone, message);
    
    if (sent) {
      console.log(`📱 Order confirmation SMS sent for order ${order.id}`);
    }
  } catch (error) {
    console.error('Error sending order confirmation SMS:', error);
  }
}

/**
 * Send shipping notification SMS
 */
export async function sendShippingNotificationSMS(order: any): Promise<void> {
  try {
    // Only send if customer has SMS consent
    if (!order.smsConsent || !order.smsPhone) {
      console.log('📵 No SMS consent or phone number - skipping shipping SMS');
      return;
    }
    
    const trackingInfo = order.trackingNumber 
      ? ` Tracking: ${order.trackingNumber}` 
      : '';
    
    const message = `Bespoke Metal Prints: Your order has shipped!${trackingInfo} Estimated delivery: ${order.estimatedDelivery || '3-5 business days'}. Reply STOP to opt out.`;
    
    const sent = await sendSMS(order.smsPhone, message);
    
    if (sent) {
      console.log(`📱 Shipping notification SMS sent for order ${order.id}`);
    }
  } catch (error) {
    console.error('Error sending shipping notification SMS:', error);
  }
}

/**
 * Send delivery notification SMS
 */
export async function sendDeliveryNotificationSMS(order: any): Promise<void> {
  try {
    // Only send if customer has SMS consent
    if (!order.smsConsent || !order.smsPhone) {
      console.log('📵 No SMS consent or phone number - skipping delivery SMS');
      return;
    }
    
    const message = `Bespoke Metal Prints: Your order has been delivered! We hope you love your new metal print. Need help? Email support@bespokemetalprints.com`;
    
    const sent = await sendSMS(order.smsPhone, message);
    
    if (sent) {
      console.log(`📱 Delivery notification SMS sent for order ${order.id}`);
    }
  } catch (error) {
    console.error('Error sending delivery notification SMS:', error);
  }
}

/**
 * Handle STOP command (opt-out)
 */
export async function handleOptOut(phoneNumber: string): Promise<void> {
  try {
    const normalized = normalizePhoneNumber(phoneNumber);
    
    await kv.set(`sms:opt-out:${normalized}`, {
      phoneNumber: normalized,
      optedOut: true,
      optedOutAt: new Date().toISOString(),
    });
    
    console.log(`📵 Customer ${normalized} opted out of SMS`);
    
    // Send confirmation (allowed even after opt-out)
    const client = await getTwilioClient();
    if (client) {
      const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
      await client.messages.create({
        body: 'Bespoke Metal Prints: You have been unsubscribed from SMS notifications. You will not receive further messages. Reply START to resubscribe.',
        from: fromNumber,
        to: normalized,
      });
    }
  } catch (error) {
    console.error('Error handling opt-out:', error);
  }
}

/**
 * Handle START command (opt-in)
 */
export async function handleOptIn(phoneNumber: string): Promise<void> {
  try {
    const normalized = normalizePhoneNumber(phoneNumber);
    
    // Remove opt-out record
    await kv.del(`sms:opt-out:${normalized}`);
    
    console.log(`📱 Customer ${normalized} opted back in to SMS`);
    
    // Send confirmation
    const client = await getTwilioClient();
    if (client) {
      const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
      await client.messages.create({
        body: 'Bespoke Metal Prints: You have been resubscribed to SMS notifications. You will receive order updates. Reply STOP to opt out. Msg&data rates may apply.',
        from: fromNumber,
        to: normalized,
      });
    }
  } catch (error) {
    console.error('Error handling opt-in:', error);
  }
}

/**
 * Handle HELP command
 */
export async function handleHelp(phoneNumber: string): Promise<void> {
  try {
    const normalized = normalizePhoneNumber(phoneNumber);
    
    // Send help message
    const client = await getTwilioClient();
    if (client) {
      const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
      await client.messages.create({
        body: 'Bespoke Metal Prints: For help, email support@bespokemetalprints.com or visit bespokemetalprints.com. Reply STOP to opt out. Msg&data rates may apply.',
        from: fromNumber,
        to: normalized,
      });
    }
    
    console.log(`📱 Help message sent to ${normalized}`);
  } catch (error) {
    console.error('Error sending help message:', error);
  }
}

/**
 * Process incoming SMS (for STOP/START/HELP)
 */
export async function processIncomingSMS(from: string, body: string): Promise<void> {
  const normalizedBody = body.trim().toLowerCase();
  
  if (normalizedBody === 'stop' || normalizedBody === 'unsubscribe' || normalizedBody === 'cancel' || normalizedBody === 'end' || normalizedBody === 'quit') {
    await handleOptOut(from);
  } else if (normalizedBody === 'start' || normalizedBody === 'unstop' || normalizedBody === 'subscribe' || normalizedBody === 'yes') {
    await handleOptIn(from);
  } else if (normalizedBody === 'help' || normalizedBody === 'info') {
    await handleHelp(from);
  } else {
    // Unknown command - send help
    console.log(`❓ Unknown SMS command from ${from}: ${body}`);
    await handleHelp(from);
  }
}
