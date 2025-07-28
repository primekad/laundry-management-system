import { format } from "date-fns"

export type InvoiceSettingsType = {
  prefix: string
  separator: string
  yearFormat: string
  includeMonth: boolean
  monthFormat: string
  includeDay: boolean
  dayFormat: string
  counterDigits: number
  counterStart: number
  currentCounter: number
  resetCounterYearly: boolean
  isDefault: boolean
}

/**
 * Generates an invoice number based on the provided settings
 */
export function generateInvoiceNumber(settings: InvoiceSettingsType, date = new Date()): string {
  const { 
    prefix, 
    separator, 
    yearFormat,
    includeMonth,
    monthFormat,
    includeDay,
    dayFormat,
    counterDigits,
    currentCounter
  } = settings

  let invoiceNumber = prefix

  // Add year
  const year = yearFormat === "YYYY" 
    ? format(date, "yyyy") 
    : format(date, "yy")
  
  invoiceNumber += separator + year

  // Add month if enabled
  if (includeMonth) {
    const month = monthFormat === "MM" 
      ? format(date, "MM") 
      : format(date, "M")
    invoiceNumber += separator + month
  }

  // Add day if enabled
  if (includeDay) {
    const day = dayFormat === "DD" 
      ? format(date, "dd") 
      : format(date, "d")
    invoiceNumber += separator + day
  }

  // Add counter with leading zeros
  const counterStr = currentCounter.toString().padStart(counterDigits, '0')
  invoiceNumber += separator + counterStr

  return invoiceNumber
}

/**
 * Creates a default invoice settings object
 */
export function createDefaultInvoiceSettings(): InvoiceSettingsType {
  return {
    prefix: "INV",
    separator: "-",
    yearFormat: "YYYY",
    includeMonth: false,
    monthFormat: "MM",
    includeDay: false,
    dayFormat: "DD",
    counterDigits: 4,
    counterStart: 1,
    currentCounter: 1,
    resetCounterYearly: true,
    isDefault: true
  }
}
