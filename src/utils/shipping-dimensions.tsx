/**
 * Helper function to get shipping dimensions based on product size
 * Matches the weights from /supabase/functions/server/shipping-config.tsx
 * 
 * CRITICAL: Shipping costs are a core business component - accuracy is essential!
 * These dimensions MUST match the server-side shipping-config.tsx exactly.
 */
export function getShippingDimensions(size: string): { 
  length: string; 
  width: string; 
  height: string; 
  weight: string;
} {
  console.log(`🚚 [SHIPPING] Getting dimensions for size: "${size}"`);
  
  // Normalize the size string to extract dimensions regardless of format
  // Handles: "5\" x 7\"", "5\" × 7\"", "12\" x 8\"", "8\" x 12\"", etc.
  const normalized = size.replace(/[""]/g, '"').trim();
  const match = normalized.match(/(\d+)"\s*[x×]\s*(\d+)"/i);
  
  if (!match) {
    console.error(`❌ [SHIPPING ERROR] Unable to parse size "${size}" - using 8x12 fallback`);
    return {
      length: '14',
      width: '12',
      height: '3',
      weight: '20',
    };
  }
  
  const dim1 = parseInt(match[1]);
  const dim2 = parseInt(match[2]);
  
  // Calculate area to determine which size tier
  const area = dim1 * dim2;
  console.log(`📐 [SHIPPING] Parsed dimensions: ${dim1}" x ${dim2}" = ${area} sq in`);
  
  let result;
  
  // Match to standard size tiers by area
  // CRITICAL: These tiers match /supabase/functions/server/shipping-config.tsx
  if (area <= 35) {
    // 5x7 tier (35 sq in)
    result = {
      length: '9.25',
      width: '6.25',
      height: '2',
      weight: '12',  // 0.75 lbs = 12 oz
    };
    console.log(`✅ [SHIPPING] Matched to 5x7 tier: ${JSON.stringify(result)}`);
  } else if (area <= 96) {
    // 8x12 tier (96 sq in)
    result = {
      length: '14',
      width: '12',
      height: '3',
      weight: '20',  // 1.25 lbs = 20 oz
    };
    console.log(`✅ [SHIPPING] Matched to 8x12 tier: ${JSON.stringify(result)}`);
  } else if (area <= 192) {
    // 12x16 tier (192 sq in)
    result = {
      length: '18',
      width: '14',
      height: '3',
      weight: '36',  // 2.25 lbs = 36 oz
    };
    console.log(`✅ [SHIPPING] Matched to 12x16 tier: ${JSON.stringify(result)}`);
  } else if (area <= 320) {
    // 16x20 tier (320 sq in)
    result = {
      length: '22',
      width: '18',
      height: '4',
      weight: '56',  // 3.50 lbs = 56 oz
    };
    console.log(`✅ [SHIPPING] Matched to 16x20 tier: ${JSON.stringify(result)}`);
  } else {
    // 24x36 tier (864 sq in) and larger
    result = {
      length: '38',
      width: '26',
      height: '4',
      weight: '128',  // 8.0 lbs = 128 oz
    };
    console.log(`✅ [SHIPPING] Matched to 24x36 tier: ${JSON.stringify(result)}`);
  }
  
  return result;
}
