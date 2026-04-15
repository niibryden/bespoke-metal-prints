# User Flow Audit - Bespoke Metal Prints

## Executive Summary

This document provides a comprehensive audit of all user flows across the Bespoke Metal Prints website, identifying friction points, optimization opportunities, and UX improvements.

---

## 🎯 Primary User Journeys

### 1. NEW CUSTOMER PURCHASE FLOW

**Path**: Landing → Browse → Configure → Checkout → Confirmation

#### Step-by-Step Analysis:

**A. Landing (Home Page)**
- ✅ **Entry Point**: Clear hero with "Create Your Print" CTA
- ✅ **First Impression**: Features carousel showcases value props
- ✅ **Social Proof**: Reviews carousel builds trust
- ✅ **Visual Hierarchy**: Orange CTA buttons stand out
- ⚠️ **Potential Issue**: Multiple CTAs might cause decision paralysis
  - "Create Your Print"
  - "Browse Stock Photos"  
  - "Explore Collections"
- 💡 **Recommendation**: A/B test single primary CTA vs multiple options

**B. Image Selection**
- **Option 1: Upload Own Photo**
  - ✅ Drag & drop + file picker
  - ✅ Image quality analyzer provides instant feedback
  - ✅ Real-time preview
  - ⚠️ **Drop-off Risk**: Users with low-quality images may abandon
  - 💡 **Recommendation**: Add "enhance image" upsell or stock photo suggestion

- **Option 2: Browse Stock Photos**
  - ✅ Collections organized by category
  - ✅ High-quality professional images
  - ✅ Search functionality
  - ⚠️ **Potential Confusion**: Marketplace photos mixed with stock
  - 💡 **Recommendation**: Add filter to distinguish marketplace vs stock

**C. Configurator (4-Step Process)**

**Step 1: Upload & Edit**
- ✅ Intuitive image editing tools
- ✅ Crop, zoom, rotate functionality
- ✅ Keyboard shortcuts available
- ✅ Live preview updates
- ⚠️ **Complexity**: Advanced tools may overwhelm casual users
- 💡 **Recommendation**: Add "Quick Edit" preset options

**Step 2: Size Selection**
- ✅ Visual size previews with dimension overlays
- ✅ Price updates in real-time
- ✅ Live price preview component
- ✅ Out-of-stock indicators
- ✅ Multiple size options
- ⚠️ **Cognitive Load**: 15+ size options may overwhelm
- 💡 **Recommendation**: Group by "Popular," "Large," "Small" categories

**Step 3: Mounting Options**
- ✅ Clear visual representations
- ✅ Price differences shown
- ✅ Descriptions of each option
- ✅ Smart upsell components
- ⚠️ **Decision Fatigue**: 4 mounting options × multiple sizes
- 💡 **Recommendation**: Add "Most Popular" badge or recommendation quiz

**Step 4: Quantity & Review**
- ✅ Quantity selector with bulk discount indicators
- ✅ Final preview before adding to cart
- ✅ Smart upsell suggestions
- ⚠️ **Cart Abandonment Risk**: No save-for-later option
- 💡 **Recommendation**: Add "Save Configuration" for logged-in users

**D. Checkout Flow**

**Step 1: Cart Review**
- ✅ Floating cart button for easy access
- ✅ Mini cart preview on hover
- ✅ Full cart modal with editing capabilities
- ✅ Remove/adjust quantities
- ⚠️ **Exit Point**: No cart abandonment recovery
- 💡 **Recommendation**: Implement email capture popup if user tries to exit

**Step 2: Login/Guest Checkout**
- ✅ **GOOD**: Guest checkout available (reduces friction)
- ✅ Optional account creation with benefits
- ✅ Social login options (Google, GitHub, Facebook)
- ⚠️ **Potential Issue**: Login form might slow down eager buyers
- 💡 **Recommendation**: Move login option AFTER shipping info collection

**Step 3: Shipping Information**
- ✅ Standard address form
- ✅ Real-time validation
- ✅ EasyPost integration for accurate shipping
- ✅ Address autocomplete
- ⚠️ **Friction Point**: Loading rates takes time
- 💡 **Recommendation**: Show estimated shipping while calculating exact rates

**Step 4: Payment**
- ✅ Stripe integration (secure & trusted)
- ✅ Multiple payment methods
- ✅ Clear order summary
- ✅ Discount code field
- ⚠️ **Abandoned Cart Risk**: No express checkout (Apple Pay, Google Pay)
- 💡 **Critical**: Add Stripe Payment Request Button for 1-click checkout

**E. Confirmation & Post-Purchase**
- ✅ Order confirmation page with confetti animation
- ✅ Order number prominently displayed
- ✅ Email confirmation sent
- ✅ Tracking link provided
- ✅ SMS notifications with Twilio
- ⚠️ **Missing**: No upsell opportunity post-purchase
- 💡 **Recommendation**: Show "Complete the Collection" recommendations

---

### 2. RETURNING CUSTOMER FLOW

**Path**: Login → Account Dashboard → Reorder/Track

#### Analysis:

**A. Login Process**
- ✅ Email/password login
- ✅ Social login options (Google, GitHub, Facebook)
- ✅ Password reset functionality
- ✅ Session management (30min inactivity timeout)
- ⚠️ **UX Issue**: Inactivity timeout might frustrate users browsing
- 💡 **Recommendation**: Increase to 60 minutes or add "Stay logged in" option

**B. Account Dashboard**
- ✅ Order history with details
- ✅ Saved addresses
- ✅ Payment methods (planned)
- ✅ One-click reorder functionality
- ✅ Order tracking
- ⚠️ **Missing Features**:
  - No saved configurations
  - No wishlist
  - No favorites
- 💡 **Recommendation**: Add "Saved Designs" feature

**C. Reorder Journey**
- ✅ **Excellent**: One-click reorder from account page
- ✅ Preserves original configuration
- ✅ Updates pricing if changed
- ✅ Checks inventory availability
- ⚠️ **Potential Issue**: What if original image is no longer available?
- 💡 **Recommendation**: Save original image reference or notify user

---

### 3. PHOTOGRAPHER MARKETPLACE FLOW

**Path**: Signup → Upload → Approval → Sales Tracking

#### Analysis:

**A. Photographer Signup**
- ✅ Dedicated signup page
- ✅ Separate login flow from customers
- ✅ Profile creation
- ✅ Royalty structure clearly explained
- ⚠️ **Missing**: Portfolio review or quality requirements
- 💡 **Recommendation**: Add sample upload during signup for quality check

**B. Photo Upload Process**
- ✅ Bulk upload capability
- ✅ Metadata collection (title, description, category)
- ✅ Royalty rate setting
- ✅ Progress indicators
- ⚠️ **UX Issue**: No draft saving - must complete full upload
- 💡 **Recommendation**: Allow saving drafts for later completion

**C. Admin Approval Flow**
- ✅ Admin review interface
- ✅ Approve/reject with reason
- ✅ Email notifications to photographer
- ⚠️ **Bottleneck**: Manual approval creates delay
- 💡 **Recommendation**: Implement auto-approval for trusted photographers after 10 approved uploads

**D. Photographer Dashboard**
- ✅ Sales tracking in real-time
- ✅ Earnings breakdown
- ✅ Photo performance metrics
- ✅ Upload history
- ✅ Transparency (can verify no cheating)
- ⚠️ **Missing**: Analytics on view counts, conversion rates
- 💡 **Recommendation**: Add detailed analytics dashboard

**E. Payment Flow**
- ⚠️ **CRITICAL MISSING**: No payout mechanism visible
- 💡 **Urgent**: Implement photographer payout system (Stripe Connect?)

---

### 4. ADMIN MANAGEMENT FLOW

**Path**: Admin Login → Dashboard → Order Management

#### Analysis:

**A. Admin Authentication**
- ✅ Separate admin login endpoint
- ✅ JWT token management
- ✅ Auto-refresh to prevent expiration
- ✅ Session validation
- ✅ Role-based permissions
- ⚠️ **Security**: Admin accessible via predictable URL
- 💡 **Recommendation**: Add IP whitelist or 2FA

**B. Admin Dashboard**
- ✅ Order management interface
- ✅ Inventory management
- ✅ User management (suspend/restore)
- ✅ Stock photo upload
- ✅ Marketplace photo approval
- ✅ Discount code management
- ✅ Export data functionality
- ⚠️ **Overwhelming**: Too many options on one screen
- 💡 **Recommendation**: Organize into tabbed interface or separate sections

**C. Order Fulfillment Process**
- ✅ View order details
- ✅ Update order status
- ✅ Download customer images
- ✅ Generate shipping labels (EasyPost)
- ✅ Track fulfillment
- ⚠️ **Manual Process**: No automatic status updates
- 💡 **Recommendation**: Integrate with print fulfillment API for auto-status

---

## 📊 Conversion Funnel Analysis

### Identified Drop-Off Points:

1. **Image Upload → Configurator (Est. 30% drop)**
   - **Cause**: Image quality rejection or complexity
   - **Fix**: Better guidance, quality tips, stock photo suggestions

2. **Size Selection → Mounting Options (Est. 20% drop)**
   - **Cause**: Decision fatigue, price sticker shock
   - **Fix**: Popular recommendations, price anchoring

3. **Cart → Checkout (Est. 40% drop)** ⚠️ CRITICAL
   - **Cause**: Unexpected shipping costs, forced login, complexity
   - **Fix**: Free shipping threshold, guest checkout first, show total earlier

4. **Shipping Info → Payment (Est. 25% drop)**
   - **Cause**: Slow shipping calculation, security concerns
   - **Fix**: Faster API, trust badges, express checkout options

5. **Payment → Confirmation (Est. 5% drop)**
   - **Cause**: Payment failures, last-minute doubts
   - **Fix**: Multiple payment options, clear return policy

---

## 🚨 Critical UX Issues

### High Priority (Fix Immediately):

1. **No Express Checkout Options**
   - Impact: Losing impulse buyers
   - Solution: Add Apple Pay, Google Pay, Shop Pay via Stripe
   - Effort: Medium
   - ROI: High (estimated 15-20% conversion increase)

2. **Cart Abandonment Recovery**
   - Impact: Losing warm leads
   - Solution: Email capture popup, abandoned cart emails
   - Effort: Medium
   - ROI: High (estimated 10-15% recovery)

3. **Slow Shipping Calculation**
   - Impact: User frustration, drop-offs
   - Solution: Cache common routes, show estimates first
   - Effort: Low
   - ROI: Medium (5-10% fewer drop-offs)

4. **Missing Photographer Payout System**
   - Impact: Legal/trust issues, photographer churn
   - Solution: Implement Stripe Connect or manual payout dashboard
   - Effort: High
   - ROI: Critical for marketplace viability

### Medium Priority:

5. **No Saved Configurations**
   - Impact: User frustration on repeat visits
   - Solution: Save designs to account
   - Effort: Medium
   - ROI: Medium (improves retention)

6. **Decision Fatigue in Configurator**
   - Impact: Abandoned configurations
   - Solution: Smart defaults, "Most Popular" badges
   - Effort: Low
   - ROI: Medium (5-10% completion increase)

7. **Login Friction in Checkout**
   - Impact: Cart abandonment
   - Solution: Move login after shipping info
   - Effort: Low
   - ROI: Medium (3-5% conversion increase)

### Low Priority:

8. **Limited Post-Purchase Engagement**
   - Impact: Missed upsell opportunities
   - Solution: Recommendation engine on confirmation page
   - Effort: Medium
   - ROI: Low-Medium (incremental revenue)

9. **No Wishlist/Favorites**
   - Impact: Lost interest over time
   - Solution: Add wishlist functionality
   - Effort: Medium
   - ROI: Low (nice-to-have)

---

## 📱 Mobile Experience Audit

### Strengths:
- ✅ Responsive design throughout
- ✅ Touch-friendly buttons
- ✅ Mobile-optimized navigation
- ✅ Swipe gestures in galleries

### Issues:
- ⚠️ **Configurator on Mobile**: Image editing tools cramped on small screens
- ⚠️ **Multiple Form Steps**: Lots of scrolling on checkout
- ⚠️ **Keyboard Issues**: Input fields don't always scroll into view

### Recommendations:
- 📱 Simplify mobile configurator (fewer tools, bigger buttons)
- 📱 Add progress indicator in checkout
- 📱 Test on actual devices (currently only responsive testing)

---

## ♿ Accessibility Audit

### Strengths:
- ✅ Comprehensive accessibility settings panel
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Dark/light mode
- ✅ Font size adjustments
- ✅ High contrast mode
- ✅ Reduced motion support

### Issues:
- ⚠️ **Missing**: Skip to main content link (intentionally hidden)
- ⚠️ **Missing**: ARIA labels on some interactive elements
- ⚠️ **Image Alt Text**: Stock photos may have generic alts

### Recommendations:
- ♿ Audit all interactive elements for ARIA labels
- ♿ Ensure all images have descriptive alt text
- ♿ Test with screen readers (NVDA, JAWS)

---

## 🔄 User Journey Maps

### Journey A: First-Time Buyer (Success Path)
```
1. Lands on homepage → Sees compelling hero
2. Clicks "Create Your Print" → Uploads photo
3. Photo quality: GOOD → Proceeds with confidence
4. Edits image → Crops to perfect composition
5. Selects size → Sees reasonable price
6. Chooses mounting → Adds to cart
7. Views cart → Feels good about purchase
8. Guest checkout → Quick form fill
9. Stripe payment → Smooth, trusted
10. Confirmation → Happy, receives tracking info
```
**Outcome**: ✅ Successful purchase, likely to return

### Journey B: First-Time Buyer (Drop-Off Path)
```
1. Lands on homepage → Sees hero
2. Clicks "Create Your Print" → Uploads photo
3. Photo quality: POOR → Gets rejection message
4. Frustrated → Tries another photo
5. Still poor quality → Doesn't know how to fix
6. Sees stock photos → Prices seem high
7. Adds to cart to "think about it"
8. Sees shipping costs → Sticker shock
9. Closes tab → Never returns
```
**Outcome**: ❌ Lost customer
**Fix**: Better quality guidance, stock photo samples, free shipping threshold

### Journey C: Photographer Onboarding (Current)
```
1. Hears about marketplace → Intrigued
2. Clicks signup → Fills out form
3. Uploads sample photos → Waits for approval
4. Days pass → Checks dashboard (no updates)
5. Approval email arrives → Logs back in
6. Uploads more photos → Waiting again
7. Photos go live → No traffic metrics
8. First sale! → Can't find payout info
9. Frustrated → Contacts support
```
**Outcome**: ⚠️ Frustrated but still engaged
**Fix**: Faster approval, auto-approve trusted users, clear payout info

---

## 💡 Quick Wins (High Impact, Low Effort)

1. **Add "Most Popular" badges** on sizes and mounting options
   - Effort: 1 hour
   - Impact: Reduces decision fatigue, 5-10% increase in completion

2. **Show total price earlier** in configurator
   - Effort: 2 hours
   - Impact: Reduces checkout shock, 3-5% more conversions

3. **Add progress indicator** to configurator
   - Effort: 1 hour
   - Impact: Psychological completion boost

4. **Implement exit-intent popup** for email capture
   - Effort: 3 hours
   - Impact: 10-15% cart abandonment recovery

5. **Add free shipping threshold** notification
   - Effort: 2 hours
   - Impact: Increases average order value

6. **Trust badges** on checkout page
   - Effort: 1 hour
   - Impact: 2-5% more payment completions

---

## 📈 Optimization Roadmap

### Phase 1: Conversion Optimization (Week 1-2)
- [ ] Add Apple Pay / Google Pay express checkout
- [ ] Implement exit-intent email capture
- [ ] Add progress indicators throughout
- [ ] Show free shipping threshold
- [ ] Add trust badges to checkout

### Phase 2: User Experience (Week 3-4)
- [ ] Simplify configurator decision points
- [ ] Add "Most Popular" recommendations
- [ ] Implement saved configurations
- [ ] Improve mobile configurator
- [ ] Speed up shipping calculations

### Phase 3: Marketplace Maturation (Week 5-6)
- [ ] Build photographer payout system
- [ ] Add photographer analytics dashboard
- [ ] Implement auto-approval for trusted users
- [ ] Create photographer resources/guides
- [ ] Add marketplace photo filtering

### Phase 4: Retention & Growth (Week 7-8)
- [ ] Build email marketing automation
- [ ] Create loyalty program
- [ ] Add referral system
- [ ] Implement wishlist/favorites
- [ ] Post-purchase recommendation engine

---

## 🎯 Key Metrics to Track

### Conversion Funnel:
- [ ] Homepage → Configurator start (current: unknown)
- [ ] Configurator start → Add to cart (target: 70%)
- [ ] Add to cart → Checkout start (target: 60%)
- [ ] Checkout start → Payment (target: 80%)
- [ ] Payment → Confirmation (target: 95%)

### User Engagement:
- [ ] Average session duration (target: 5+ minutes)
- [ ] Pages per session (target: 4+)
- [ ] Bounce rate (target: <40%)
- [ ] Return visitor rate (target: 30%+)

### Revenue Metrics:
- [ ] Average order value (track changes after optimizations)
- [ ] Revenue per visitor (target: increase 20%)
- [ ] Cart abandonment recovery rate (target: 15%+)

---

## 🏁 Conclusion

**Overall Assessment**: 7.5/10

**Strengths**:
- Comprehensive configurator with powerful features
- Strong technical implementation
- Good accessibility features
- Solid admin tools

**Critical Gaps**:
- No express checkout (losing impulse buyers)
- Cart abandonment not addressed
- Photographer payout system missing
- Mobile experience could be smoother

**Recommended Priority**:
1. Add express checkout (Apple Pay, Google Pay)
2. Implement cart abandonment recovery
3. Build photographer payout system
4. Optimize mobile configurator
5. Add saved configurations

Implementing these changes should increase conversion rate by 25-35% and significantly improve user satisfaction.

---

**Last Updated**: January 2026
**Next Review**: After Phase 1 implementation
