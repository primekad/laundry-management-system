import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '@prisma/client';

// Enums matching Prisma schema
export { OrderStatus, PaymentMethod };

// Order item validation schema
const OrderItemSchema = z.object({
  serviceTypeId: z.string().min(1, { message: 'Please select a service type.' }),
  categoryId: z.string().optional(),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1.' }),
  size: z.string().optional(),
  notes: z.string().optional(),
  unitPrice: z.coerce.number().min(0, { message: 'Unit price must be positive.' }),
  total: z.coerce.number().min(0, { message: 'Total must be positive.' }),
});

// Enhanced validation schemas
export const CreateOrderSchema = z.object({
  customerId: z.string().min(1, { message: 'Please select a customer.' }),
  branchId: z.string().min(1, { message: 'Please select a branch.' }),
  notes: z.string().optional(),
  discount: z.coerce.number().min(0, { message: 'Discount must be positive.' }).optional().default(0),
  amountPaid: z.coerce.number().min(0, { message: 'Amount paid must be positive.' }).optional().default(0),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    required_error: 'Please select a payment method.',
    invalid_type_error: 'Invalid payment method selected.'
  }).optional(),
  customInvoiceNumber: z.string().optional(),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  items: z.array(OrderItemSchema).min(1, { message: 'Please add at least one item.' }),
}).refine((data) => {
  // If amount paid is greater than 0, payment method is required
  if (data.amountPaid && data.amountPaid > 0 && !data.paymentMethod) {
    return false;
  }
  return true;
}, {
  message: 'Payment method is required when amount paid is greater than 0.',
  path: ['paymentMethod'],
});

export const UpdateOrderSchema = z.object({
  customerId: z.string().min(1, { message: 'Please select a customer.' }).optional(),
  branchId: z.string().min(1, { message: 'Please select a branch.' }).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(OrderStatus, {
    required_error: 'Please select a status.',
    invalid_type_error: 'Invalid status selected.'
  }).optional(),
  discount: z.coerce.number().min(0, { message: 'Discount must be positive.' }).optional(),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  items: z.array(OrderItemSchema).optional(),
});

// Types for action responses
export type OrderActionState = {
  errors?: {
    id?: string[];
    customerId?: string[];
    branchId?: string[];
    notes?: string[];
    status?: string[];
    discount?: string[];
    amountPaid?: string[];
    paymentMethod?: string[];
    customInvoiceNumber?: string[];
    orderDate?: string[];
    expectedDeliveryDate?: string[];
    items?: string[];
    form?: string[]; // For general form errors
  };
  message?: string | null;
  success?: boolean;
  data?: any;
  fields?: {
    customerId?: string;
    branchId?: string;
    notes?: string;
    status?: string;
    discount?: string;
    amountPaid?: string;
    paymentMethod?: string;
    customInvoiceNumber?: string;
    orderDate?: string;
    expectedDeliveryDate?: string;
    items?: string;
  };
};

export type OrderActionResult = {
  success: boolean;
  message: string;
  data?: any;
};

// Data extraction helpers
export function extractCreateOrderData(formData: FormData) {
  const amountPaid = parseFloat(formData.get('amountPaid') as string) || 0;
  const paymentMethod = formData.get('paymentMethod') as string;
  const orderDate = formData.get('orderDate') as string;
  const expectedDeliveryDate = formData.get('expectedDeliveryDate') as string;
  const itemsJson = formData.get('items') as string;

  let items = [];
  try {
    items = itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error('Error parsing items JSON:', error);
    items = [];
  }

  return {
    customerId: formData.get('customerId') as string,
    branchId: formData.get('branchId') as string,
    notes: formData.get('notes') as string || undefined,
    discount: parseFloat(formData.get('discount') as string) || 0,
    amountPaid,
    paymentMethod: (amountPaid > 0 && paymentMethod && paymentMethod !== 'none') ? 
      paymentMethod as PaymentMethod : undefined,
    customInvoiceNumber: formData.get('customInvoiceNumber') as string || undefined,
    orderDate: orderDate || undefined,
    expectedDeliveryDate: expectedDeliveryDate || undefined,
    items,
  };
}

export function extractUpdateOrderData(formData: FormData) {
  const customerId = formData.get('customerId') as string;
  const branchId = formData.get('branchId') as string;
  const status = formData.get('status') as string;
  const orderDate = formData.get('orderDate') as string;
  const expectedDeliveryDate = formData.get('expectedDeliveryDate') as string;
  const itemsJson = formData.get('items') as string;

  let items;
  try {
    items = itemsJson ? JSON.parse(itemsJson) : undefined;
  } catch (error) {
    console.error('Error parsing items JSON:', error);
    items = undefined;
  }

  return {
    customerId: customerId === 'none' || !customerId ? undefined : customerId,
    branchId: branchId === 'none' || !branchId ? undefined : branchId,
    notes: formData.get('notes') as string || undefined,
    status: status === 'none' || !status ? undefined : status as OrderStatus,
    discount: parseFloat(formData.get('discount') as string) || undefined,
    orderDate: orderDate || undefined,
    expectedDeliveryDate: expectedDeliveryDate || undefined,
    items,
  };
}

export function extractFormFields(formData: FormData) {
  return {
    customerId: formData.get('customerId') as string,
    branchId: formData.get('branchId') as string,
    notes: formData.get('notes') as string,
    status: formData.get('status') as string,
    discount: formData.get('discount') as string,
    amountPaid: formData.get('amountPaid') as string,
    paymentMethod: formData.get('paymentMethod') as string,
    customInvoiceNumber: formData.get('customInvoiceNumber') as string,
    orderDate: formData.get('orderDate') as string,
    expectedDeliveryDate: formData.get('expectedDeliveryDate') as string,
    items: formData.get('items') as string,
  };
}

// Error response helpers
export function createValidationErrorResponse(
  fieldErrors: Record<string, string[]>,
  formData: FormData
): OrderActionState {
  return {
    errors: fieldErrors,
    message: 'Please correct the errors below.',
    success: false,
    fields: extractFormFields(formData),
  };
}

export function createFailureResponse(message: string, formData?: FormData): OrderActionState {
  return {
    message,
    success: false,
    fields: formData ? extractFormFields(formData) : undefined,
  };
}

export function createSuccessResponse(message: string, data?: any): OrderActionState {
  return {
    message,
    success: true,
    data,
    fields: undefined,
  };
}

export function createActionResult(success: boolean, message: string, data?: any): OrderActionResult {
  return {
    success,
    message,
    data,
  };
}

// Validation helpers
export function validateCreateOrderData(formData: FormData) {
  const rawData = extractCreateOrderData(formData);
  return CreateOrderSchema.safeParse(rawData);
}

export function validateUpdateOrderData(formData: FormData) {
  const rawData = extractUpdateOrderData(formData);
  return UpdateOrderSchema.safeParse(rawData);
}

// Date formatting helpers
export function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function parseDateFromInput(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}
