import { UnitOfMeasurement } from "@prisma/client";

export const UNITS_OF_MEASUREMENT: { label: string; value: UnitOfMeasurement }[] = [
  {
    label: "per Yard",
    value: "YARDS",
  },
  {
    label: "per Metre",
    value: "METRES",
  },
  {
    label: "per Piece",
    value: "PIECES",
  },
  {
    label: "per Kilogram",
    value: "KILOGRAMS",
  },
];
