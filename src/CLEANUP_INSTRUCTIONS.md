# ReturnToHomeButton Removal - Remaining Files

The ReturnToHomeButton component has been deleted. The following files still have imports/usages that need to be removed:

## Completed ✅
- AboutPage.tsx
- BestPhotoPrintMaterialGiftsPage.tsx
- BestPrintTypeWallArtPage.tsx

## Remaining Files to Update

### SEO/Blog Pages
- BestWallArtBathroomsPage.tsx
- BestWallArtOfficesPage.tsx
- MetalPrintsExplainedPage.tsx
- MetalPrintsVsAcrylicPage.tsx
- MetalPrintsVsCanvasPage.tsx
- MetalPrintsVsPaperPage.tsx

### Guide/Info Pages  
- CareInstructionsPage.tsx
- CompleteGuidePage.tsx
- FAQPage.tsx
- HDMetalPrintGuidePage.tsx
- SizeGuidePage.tsx
- ReviewsPage.tsx

### Policy Pages
- PrivacyPolicyPage.tsx
- RefundPolicyPage.tsx
- ShippingPolicyPage.tsx
- TermsConditionsPage.tsx

### Account/User Pages
- AccountPage.tsx
- DiagnosticPage.tsx

### Marketplace/Photographer Pages
- MarketplaceBrowsePage.tsx
- PhotographerLoginPage.tsx
- PhotographerSignupPage.tsx
- PhotographerMarketplaceHub.tsx

### Admin Pages
- AdminBootstrap.tsx
- AdminLogin.tsx

### Collection/Stock Pages
- CollectionDetailView.tsx
- CollectionPage.tsx
- StockPhotosPage.tsx

### Other
- CartCheckoutPage.tsx
- SupportSyncIntegrationPage.tsx

## Pattern to Remove

### Step 1: Remove import
```typescript
// REMOVE THIS LINE:
import { ReturnToHomeButton } from './ReturnToHomeButton';
```

### Step 2: Remove usage
```typescript
// REMOVE THIS:
<ReturnToHomeButton onClick={onClose} />

// OR THIS (with wrapper):
<div className="mb-6">
  <ReturnToHomeButton onClick={onClose} />
</div>

// OR THIS (inline in header):
<ReturnToHomeButton />
```

### Step 3: Remove wrapper divs if empty
If the div only contained the button, remove the entire wrapper.

## Note
All pages already have Navigation and Footer components at the app level in App.tsx, so no additional navigation is needed.
