# Bespoke Metal Prints - Production Test Checklist

## ✅ Public Customer-Facing Features

### Home Page
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] Navigation menu works (all links)
- [ ] Footer displays with correct links
- [ ] "Create Custom Print" CTA button works
- [ ] Newsletter signup form works

### Gallery / Stock Photos Page  
- [ ] Page loads without CORS errors
- [ ] Collections display correctly
- [ ] Collection count shows accurate number
- [ ] Photos count shows accurate number
- [ ] Clicking a collection opens detail view
- [ ] "Quick Print" button starts configurator with selected image
- [ ] Images load properly from S3

### About Page
- [ ] Page loads without errors
- [ ] Content displays correctly
- [ ] Images load if any

### Contact Page
- [ ] Page loads without errors
- [ ] Contact form fields work
- [ ] Form submission works
- [ ] Email is sent successfully (check admin email)

---

## ✅ Product Configurator (4-Step Workflow)

### Step 1: Upload/Select Image
- [ ] File upload works (drag & drop and click)
- [ ] Stock photo selection works
- [ ] Image preview displays correctly
- [ ] File size validation works
- [ ] File type validation works (only images)
- [ ] Can proceed to Step 2

### Step 2: Edit Image
- [ ] Image editor loads properly
- [ ] Crop tool works
- [ ] Rotate tool works
- [ ] Zoom controls work
- [ ] Filters apply correctly
- [ ] Reset button works
- [ ] Can proceed to Step 3
- [ ] Can go back to Step 1

### Step 3: Select Size & Material
- [ ] Size options display (8x10, 11x14, 16x20, 24x36, custom)
- [ ] Material options display (Aluminum, Steel, etc.)
- [ ] Finish options display based on material
- [ ] Price updates correctly when changing options
- [ ] Quantity selector works
- [ ] "Add to Cart" button works
- [ ] Preview updates with selections
- [ ] Can go back to Step 2

### Step 4: Review & Checkout
- [ ] Cart items display correctly
- [ ] Quantities can be adjusted
- [ ] Items can be removed
- [ ] Subtotal calculates correctly
- [ ] "Proceed to Checkout" button works

---

## ✅ Checkout & Payment

### Checkout Page
- [ ] Page loads without errors
- [ ] Cart summary displays correctly
- [ ] Shipping address form works
- [ ] Email field validates properly
- [ ] Discount code "WELCOME10" applies 10% off
- [ ] Discount code validation works (invalid codes rejected)
- [ ] Shipping cost calculation works (EasyPost)
- [ ] Tax calculation works if applicable
- [ ] Total updates correctly

### Payment Processing
- [ ] Stripe payment form loads
- [ ] Test card (4242 4242 4242 4242) processes successfully
- [ ] Payment success page displays
- [ ] Order confirmation email sent to customer
- [ ] Order notification email sent to admin
- [ ] Order saved to database correctly
- [ ] Tracking number generated (if shipping integrated)

---

## ✅ Customer Account Features

### Sign Up / Login
- [ ] Sign up form works
- [ ] Email validation works
- [ ] Password validation works
- [ ] Login form works
- [ ] "Forgot password" works
- [ ] Social login works (if enabled)
- [ ] Session persists across page refreshes

### Account Dashboard
- [ ] Dashboard loads without errors
- [ ] User profile displays correctly
- [ ] Order history displays
- [ ] Order details can be viewed
- [ ] Saved addresses display
- [ ] Addresses can be added/edited/deleted
- [ ] Saved payment methods display (if implemented)
- [ ] Payment methods can be managed
- [ ] "Reorder" functionality works

---

## ✅ Admin Dashboard (Protected)

### Admin Login
- [ ] Admin login page accessible
- [ ] Admin credentials work
- [ ] Non-admin users are blocked
- [ ] Session persists

### Admin Overview Tab
- [ ] Dashboard loads without database timeout
- [ ] Stats display correctly (revenue, orders, customers)
- [ ] Date period filter works (24h, 7d, 30d, All)
- [ ] Charts display correctly
- [ ] Recent orders list displays
- [ ] No massive base64 images in console

### Admin Orders Tab
- [ ] Orders list loads without timeout
- [ ] Orders display with correct details (NO base64 images)
- [ ] Order status can be updated
- [ ] Tracking number can be added
- [ ] Order details modal works
- [ ] Filter/search works
- [ ] Pagination works

### Admin Inventory Tab
- [ ] Inventory list loads
- [ ] Stock levels display correctly
- [ ] Items can be added/edited/deleted
- [ ] SKU management works
- [ ] Low stock alerts work

### Admin Settings Tab
- [ ] Settings page loads
- [ ] Discount codes can be managed
- [ ] Current code is "WELCOME10" (10% off)
- [ ] Site settings can be updated
- [ ] Admin users can be managed
- [ ] Email notifications settings work

### Admin Stock Photos Tab
- [ ] Stock photos manager loads
- [ ] Collections can be created/edited/deleted
- [ ] Photos can be uploaded to collections
- [ ] Photos can be organized
- [ ] Visibility toggle works (hide/show collections)
- [ ] S3 upload works correctly

---

## ✅ Email Notifications

### Customer Emails
- [ ] Order confirmation email sent
- [ ] Order confirmation includes correct details
- [ ] Shipping notification sent when order ships
- [ ] Newsletter signup confirmation works

### Admin Emails
- [ ] New order notification sent to admin
- [ ] Email includes order details
- [ ] Contact form submissions notify admin

---

## ✅ Critical Backend Functions

### Stripe Integration
- [ ] Payments process correctly
- [ ] Webhook handles `checkout.session.completed`
- [ ] Webhook handles `payment_intent.succeeded`
- [ ] Refunds work if needed
- [ ] Test mode vs Live mode configured correctly

### EasyPost Integration
- [ ] Shipping rates calculated correctly
- [ ] Shipping labels generated
- [ ] Tracking numbers saved to orders
- [ ] Webhook handles tracking updates

### Supabase Database
- [ ] Orders save without massive base64 images
- [ ] Customer data saves correctly
- [ ] KV store queries work without timeout
- [ ] Auth works properly
- [ ] No statement timeout errors in admin dashboard

### AWS S3 Storage
- [ ] Images upload successfully
- [ ] Signed URLs work for private images
- [ ] Public stock photos accessible
- [ ] Bucket permissions configured correctly

---

## 🚨 Known Issues (Fixed in Emergency Mode)

### ✅ RESOLVED: Database Timeout Issue
- **Problem**: Orders were stored with massive base64 image data (50MB+), causing PostgreSQL statement timeouts in admin dashboard
- **Solution**: Emergency Mode enabled - admin features blocked until manual SQL cleanup removes base64 from order records
- **Status**: Customer-facing site works perfectly; admin temporarily disabled

### ⚠️ ACTIVE: Stock Photos CORS Error
- **Problem**: CORS preflight OPTIONS requests not returning proper headers
- **Current Fix**: Added global OPTIONS handler for all routes
- **Testing**: Awaiting confirmation after latest fix

---

## 📝 Testing Notes

- **Environment**: PRODUCTION (live at bespokemetalprints.com)
- **Test Card**: 4242 4242 4242 4242 (Stripe test mode)
- **Test Discount**: WELCOME10 (10% off)
- **Admin Email**: [Admin email from environment]

---

## 🔒 Security Checklist

- [ ] API keys not exposed in console logs
- [ ] Authorization headers redacted in logs
- [ ] Stripe webhook secret configured
- [ ] EasyPost webhook secret configured
- [ ] CORS configured correctly
- [ ] Admin routes protected
- [ ] Database credentials secure
- [ ] S3 bucket permissions correct

---

## ✅ Performance Checklist

- [ ] Images optimized and compressed
- [ ] Page load times reasonable (<3s)
- [ ] Database queries optimized
- [ ] Caching enabled where appropriate
- [ ] CDN configured for static assets (if applicable)
- [ ] No memory leaks
- [ ] No statement timeouts

---

## 📞 Support Information

If any issues are found during testing:
1. Check browser console for errors
2. Check server logs in Supabase
3. Verify environment variables are set
4. Check Stripe dashboard for payment issues
5. Check EasyPost dashboard for shipping issues

---

**Last Updated**: January 24, 2026
**Status**: Active testing in progress
