import { PricingType } from "@prisma/client";

export const PRICING_TYPES: { label: string; value: PricingType }[] = [
  {
    label: "Flat Rate - Single price for all items",
    value: "FLAT_RATE",
  },
  {
    label: "Size Based - Different prices for different sizes",
    value: "SIZE_BASED",
  },
  {
    label: "Range - Price range with exact amount entered per order",
    value: "RANGE_BASED",
  },
];
