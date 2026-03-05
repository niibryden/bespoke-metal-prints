// Email service using Resend API
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const IS_TEST_MODE = false; // Production mode - emails sent to actual customers

const COMPANY_INFO = {
  name: "Bespoke Metal Prints",
  email: "orders@bespokemetalprints.com",
  address: "4920 Bells Ferry Road, Ste 134-2081, Kennesaw GA 30144, United States",
  website: "www.bespokemetalprints.com",
};

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured");
    return { success: false, message: "Email service not configured" };
  }

  try {
    console.log(`📧 Sending email to ${to}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${COMPANY_INFO.name} <${COMPANY_INFO.email}>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();
    console.log(`✅ Email sent successfully: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center; border-bottom: 4px solid #ff6b35; }
    .email-logo { font-size: 28px; font-weight: bold; color: #ffffff; margin: 0; }
    .email-logo span { color: #ff6b35; }
    .email-body { padding: 40px 30px; }
    .email-greeting { font-size: 18px; font-weight: 600; color: #0a0a0a; margin-bottom: 20px; }
    .email-text { font-size: 15px; color: #555555; margin-bottom: 15px; }
    .order-summary { background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; margin: 30px 0; }
    .order-summary-header { font-size: 18px; font-weight: 600; color: #0a0a0a; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #ff6b35; }
    .order-detail { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .order-label { font-weight: 600; color: #333333; }
    .order-value { color: #555555; text-align: right; }
    .order-item { background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin: 15px 0; }
    .order-total { background-color: #0a0a0a; color: #ffffff; padding: 15px; border-radius: 6px; margin-top: 20px; display: flex; justify-content: space-between; }
    .order-total-value { font-size: 24px; font-weight: bold; color: #ff6b35; }
    .button { display: inline-block; padding: 14px 32px; background-color: #ff6b35; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .email-footer { background-color: #0a0a0a; color: #999999; padding: 30px; text-align: center; font-size: 13px; }
    .status-badge { display: inline-block; padding: 6px 12px; background-color: #ff6b35; color: #ffffff; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
  </style>
`;

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function sendOrderConfirmationEmail(order: any) {
  try {
    const orderDetails = order.orderDetails || {};
    const shippingCost = parseFloat(order.shippingRate?.rate || "0");
    const total = order.amount || 0;
    const discountAmount = order.discount?.discountAmount || 0;
    const subtotal = order.basePrice || (total + discountAmount - shippingCost);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${emailStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1 class="email-logo">BESPOKE <span>METAL PRINTS</span></h1>
          </div>
          
          <div class="email-body">
            <div class="email-greeting">Thank you for your order!</div>
            <p class="email-text">Hi ${order.shippingAddress?.name || "Valued Customer"},</p>
            <p class="email-text">We've received your order and payment has been confirmed. Your custom metal print will be carefully crafted and shipped to you soon!</p>
            
            <div class="order-summary">
              <div class="order-summary-header">Order Summary</div>
              <div class="order-detail">
                <span class="order-label">Order Number:</span>
                <span class="order-value">${order.id}</span>
              </div>
              <div class="order-detail">
                <span class="order-label">Order Date:</span>
                <span class="order-value">${formatDate(order.createdAt)}</span>
              </div>
              <div class="order-detail">
                <span class="order-label">Status:</span>
                <span class="order-value"><span class="status-badge">CONFIRMED</span></span>
              </div>
              
              <div class="order-item">
                <div style="font-weight: 600; margin-bottom: 8px;">${orderDetails.size || "Custom Size"} Metal Print</div>
                <div style="color: #777; font-size: 14px;">Finish: ${orderDetails.finish || "Matte"}</div>
                <div style="color: #777; font-size: 14px;">Mounting: ${orderDetails.mountType || "Stick Tape"}</div>
                <div style="color: #777; font-size: 14px;">Frame: ${orderDetails.frame || "None"}</div>
              </div>
              
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <div class="order-detail">
                  <span class="order-label">Subtotal:</span>
                  <span class="order-value">${formatPrice(subtotal)}</span>
                </div>
                ${order.discount ? `
                <div class="order-detail" style="color: #22c55e;">
                  <span class="order-label">Discount (${order.discount.code}):</span>
                  <span class="order-value">-${formatPrice(discountAmount)}</span>
                </div>` : ''}
                <div class="order-detail">
                  <span class="order-label">Shipping:</span>
                  <span class="order-value">${formatPrice(shippingCost)}</span>
                </div>
              </div>
              
              <div class="order-total">
                <span style="font-size: 18px; font-weight: 600;">Total Paid:</span>
                <span class="order-total-value">${formatPrice(total)}</span>
              </div>
            </div>
            
            <p class="email-text">You'll receive another email with tracking information once your order ships.</p>
            <center>
              <a href="https://${COMPANY_INFO.website}?order=${order.id}" class="button">Track Your Order</a>
            </center>
          </div>
          
          <div class="email-footer">
            <strong style="color: #ffffff;">${COMPANY_INFO.name}</strong>
            <div style="margin: 15px 0;">${COMPANY_INFO.address}</div>
            <div><a href="mailto:${COMPANY_INFO.email}" style="color: #ff6b35; text-decoration: none;">${COMPANY_INFO.email}</a></div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.id}`,
      html: html,
    });

    console.log(`Order confirmation email sent to ${order.customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
}

export async function sendShippingConfirmationEmail(order: any) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>${emailStyles}</head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1 class="email-logo">BESPOKE <span>METAL PRINTS</span></h1>
          </div>
          <div class="email-body">
            <div class="email-greeting">Your order is on its way!</div>
            <p class="email-text">Hi ${order.shippingAddress?.name || "Valued Customer"},</p>
            <p class="email-text">Great news! Your custom metal print has been shipped and is heading your way.</p>
            
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%); color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <div style="font-size: 16px; margin-bottom: 10px;">Tracking Number</div>
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 15px 0;">${order.trackingNumber}</div>
              <div style="margin-top: 20px;">
                <a href="${order.trackingUrl || "#"}" style="background-color: #ffffff; color: #ff6b35; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Track Package</a>
              </div>
            </div>
            
            <p class="email-text">Your package should arrive within ${order.shippingRate?.delivery_days || 5} business days.</p>
          </div>
          <div class="email-footer">
            <strong style="color: #ffffff;">${COMPANY_INFO.name}</strong>
            <div style="margin: 15px 0;">${COMPANY_INFO.address}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: order.customerEmail,
      subject: `Your Order Has Shipped! - ${order.id}`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending shipping confirmation email:", error);
    throw error;
  }
}

export async function sendDeliveryConfirmationEmail(order: any) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>${emailStyles}</head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1 class="email-logo">BESPOKE <span>METAL PRINTS</span></h1>
          </div>
          <div class="email-body">
            <div class="email-greeting">Your order has been delivered!</div>
            <p class="email-text">Hi ${order.shippingAddress?.name || "Valued Customer"},</p>
            <p class="email-text">Your custom metal print has been successfully delivered! We hope you love your new artwork.</p>
            
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
              <div style="font-size: 20px; font-weight: 600;">DELIVERED</div>
              <div style="font-size: 14px; margin-top: 10px;">Order #${order.id}</div>
            </div>
            
            <p class="email-text">
              <strong>Care Instructions:</strong><br>
              • Clean with a soft, dry cloth<br>
              • Avoid abrasive cleaners<br>
              • Keep away from direct moisture<br>
              • Display away from direct sunlight to prevent fading
            </p>
            
            <center>
              <a href="${COMPANY_INFO.website}" style="display: inline-block; padding: 14px 32px; background-color: #ff6b35; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Shop Again</a>
            </center>
          </div>
          <div class="email-footer">
            <strong style="color: #ffffff;">${COMPANY_INFO.name}</strong>
            <div style="margin: 15px 0;">${COMPANY_INFO.address}</div>
            <div style="margin-top: 20px; color: #ffffff; font-size: 14px;">Thank you for choosing Bespoke Metal Prints!</div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: order.customerEmail,
      subject: `Your Order Has Been Delivered! - ${order.id}`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending delivery confirmation email:", error);
    throw error;
  }
}
