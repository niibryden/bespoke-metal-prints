# Remaining ReturnToHomeButton Removal - 22 Files

## Summary
The ReturnToHomeButton component has been DELETED. The following 22 files still have imports that need to be removed.

## Quick Fix Pattern

For each file below:

1. **Remove the import line:**
```typescript
import { ReturnToHomeButton } from './ReturnToHomeButton';
```

2. **Remove the component usage** (one of these patterns):
- `<ReturnToHomeButton onClick={onClose} />`
- `<ReturnToHomeButton onClick={onBack} />`
- `<ReturnToHomeButton />`
- `<div className="mb-6"><ReturnToHomeButton onClick={...} /></div>`
- `<div className="mb-8"><ReturnToHomeButton onClick={...} /></div>`
- `<div className="fixed top-6 left-6 z-20"><ReturnToHomeButton onClick={...} /></div>`

## Files Remaining (22):

1. ✅ AccountPage.tsx
2. ✅ AdminBootstrap.tsx  
3. ✅ AdminLogin.tsx
4. ✅ CartCheckoutPage.tsx
5. ✅ CollectionDetailView.tsx
6. ✅ CollectionPage.tsx
7. ✅ CompleteGuidePage.tsx
8. ✅ DiagnosticPage.tsx
9. ✅ FAQPage.tsx
10. ✅ HDMetalPrintGuidePage.tsx
11. ✅ MarketplaceBrowsePage.tsx
12. ✅ PhotographerLoginPage.tsx
13. ✅ PhotographerMarketplaceHub.tsx
14. ✅ PhotographerSignupPage.tsx
15. ✅ PrivacyPolicyPage.tsx
16. ✅ RefundPolicyPage.tsx
17. ✅ ReviewsPage.tsx
18. ✅ ShippingPolicyPage.tsx
19. ✅ SizeGuidePage.tsx
20. ✅ StockPhotosPage.tsx
21. ✅ SupportSyncIntegrationPage.tsx
22. ✅ TermsConditionsPage.tsx

## What Was Fixed (10/32 files):
- ✅ AboutPage.tsx
- ✅ BestPhotoPrintMaterialGiftsPage.tsx
- ✅ BestPrintTypeWallArtPage.tsx
- ✅ BestWallArtBathroomsPage.tsx
- ✅ BestWallArtOfficesPage.tsx
- ✅ CareInstructionsPage.tsx
- ✅ MetalPrintsExplainedPage.tsx
- ✅ MetalPrintsVsAcrylicPage.tsx
- ✅ MetalPrintsVsCanvasPage.tsx
- ✅ MetalPrintsVsPaperPage.tsx
- ✅ ReturnToHomeButton.tsx (DELETED)

##Note
All pages already have Navigation and Footer components via App.tsx, so removing the button doesn't impact overall navigation.
