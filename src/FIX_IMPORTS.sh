#!/bin/bash
# This script removes all ReturnToHomeButton imports from the remaining files

FILES=(
  "/components/MarketplaceBrowsePage.tsx"
  "/components/CartCheckoutPage.tsx"
  "/components/CollectionDetailView.tsx"
  "/components/CollectionPage.tsx"
  "/components/CompleteGuidePage.tsx"
  "/components/DiagnosticPage.tsx"
  "/components/FAQPage.tsx"
  "/components/HDMetalPrintGuidePage.tsx"
  "/components/PhotographerMarketplaceHub.tsx"
  "/components/PhotographerSignupPage.tsx"
  "/components/PrivacyPolicyPage.tsx"
  "/components/RefundPolicyPage.tsx"
  "/components/ReviewsPage.tsx"
  "/components/ShippingPolicyPage.tsx"
  "/components/SizeGuidePage.tsx"
  "/components/StockPhotosPage.tsx"
  "/components/SupportSyncIntegrationPage.tsx"
  "/components/TermsConditionsPage.tsx"
)

echo "Files to fix: ${#FILES[@]}"
for file in "${FILES[@]}"; do
  echo "- $file"
done
