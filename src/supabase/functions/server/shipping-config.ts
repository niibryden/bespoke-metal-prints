/**
 * Shipping Configuration for Bespoke Metal Prints
 */

// Shipping origin address
export const ORIGIN_ADDRESS = {
  name: "Bespoke Metal Prints",
  street1: "4920 Bells Ferry Road",
  street2: "Ste 134-2081",
  city: "Kennesaw",
  state: "GA",
  zip: "30144",
  country: "US",
  phone: "",
};

// Standard size shipping specifications
export interface ShippingSpec {
  printSize: string;
  panelWeight: number; // in pounds
  boxType: string;
  length: number; // in inches
  width: number; // in inches
  height: number; // in inches (depth)
  shippingWeight: number; // in pounds (includes packaging)
}

export const STANDARD_SIZES: Record<string, ShippingSpec> = {
  "5\" x 7\"": {
    printSize: "5\" x 7\"",
    panelWeight: 0.15,
    boxType: "USPS 1096L Mailing Box",
    length: 9.25,
    width: 6.25,
    height: 2,
    shippingWeight: 0.75,
  },
  "8\" x 12\"": {
    printSize: "8\" x 12\"",
    panelWeight: 0.42,
    boxType: "USPS 1092 Side-Loading Box",
    length: 14,
    width: 12,
    height: 3,
    shippingWeight: 1.25,
  },
  "12\" x 16\"": {
    printSize: "12\" x 16\"",
    panelWeight: 0.83,
    boxType: "Custom Flat Art Box",
    length: 18,
    width: 14,
    height: 3,
    shippingWeight: 2.25,
  },
  "16\" x 20\"": {
    printSize: "16\" x 20\"",
    panelWeight: 1.39,
    boxType: "Custom Flat Art Box",
    length: 22,
    width: 18,
    height: 4,
    shippingWeight: 3.50,
  },
  "24\" x 36\"": {
    printSize: "24\" x 36\"",
    panelWeight: 3.75,
    boxType: "Large Custom Art Box",
    length: 38,
    width: 26,
    height: 4,
    shippingWeight: 8.0,
  },
};

export function getShippingSpec(size: string): ShippingSpec | null {
  return STANDARD_SIZES[size] || null;
}

export function toEasyPostParcel(spec: ShippingSpec) {
  return {
    length: spec.length.toString(),
    width: spec.width.toString(),
    height: spec.height.toString(),
    weight: (spec.shippingWeight * 16).toString(), // Convert pounds to ounces
  };
}

export function calculateCustomShipping(widthInches: number, heightInches: number): ShippingSpec {
  const panelWeight = widthInches * heightInches * 0.00434;
  const area = widthInches * heightInches;
  
  let packagingWeight: number;
  if (area <= 35) packagingWeight = 0.60;
  else if (area <= 96) packagingWeight = 0.83;
  else if (area <= 192) packagingWeight = 1.42;
  else if (area <= 320) packagingWeight = 2.11;
  else packagingWeight = 4.25;
  
  return {
    printSize: `${widthInches}" x ${heightInches}"`,
    panelWeight,
    boxType: "Custom Box",
    length: widthInches + 4,
    width: heightInches + 4,
    height: 3,
    shippingWeight: panelWeight + packagingWeight,
  };
}

export function filterRates(rates: any[]): any[] {
  if (!rates || rates.length === 0) return [];
  
  return rates.filter((rate: any) => {
    const serviceLower = (rate.service || "").toLowerCase();
    const carrier = (rate.carrier || "").toUpperCase();
    
    // Only USPS Priority services
    if (carrier !== "USPS") return false;
    if (serviceLower.includes("international")) return false;
    if (serviceLower.includes("first") || serviceLower.includes("parcel") || serviceLower.includes("media")) return false;
    
    return serviceLower.includes("priority") || serviceLower.includes("express");
  });
}

export function sortRates(rates: any[]): any[] {
  return rates.sort((a: any, b: any) => {
    const aService = a.service.toLowerCase();
    const bService = b.service.toLowerCase();
    
    const aIsPriority = aService.includes("priority") && !aService.includes("express");
    const bIsPriority = bService.includes("priority") && !bService.includes("express");
    
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    
    return parseFloat(a.rate) - parseFloat(b.rate);
  });
}
