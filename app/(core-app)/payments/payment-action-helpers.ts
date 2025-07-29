import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

// Re-export enums for use in other files
export { PaymentMethod, PaymentStatus };

// Enhanced validation schemas
export const CreatePaymentSchema = z.object({
  orderId: z.string().min(1, { message: 'Please select an order.' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0.' }),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    required_error: 'Please select a payment method.',
    invalid_type_error: 'Invalid payment method selected.'
  }),
  transactionId: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.PAID),
});

export const UpdatePaymentSchema = z.object({
  orderId: z.string().min(1, { message: 'Please select an order.' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0.' }),
  paymentMethod: z.nativeEnum(PaymentMethod, { 
    required_error: 'Please select a payment method.',
    invalid_type_error: 'Invalid payment method selected.'
  }),
  transactionId: z.string().optional(),
  status: z.nativeEnum(PaymentStatus),
});

// Types for action responses
export type PaymentActionState = {
  errors?: {
    id?: string[];
    orderId?: string[];
    amount?: string[];
    paymentMethod?: string[];
    transactionId?: string[];
    status?: string[];
    form?: string[]; // For general form errors
  };
  message?: string | null;
  success?: boolean;
  data?: any;
  fields?: {
    orderId?: string;
    amount?: string;
    paymentMethod?: string;
    transactionId?: string;
    status?: string;
  };
};

export type PaymentActionResult = {
  success: boolean;
  message: string;
  data?: any;
};

// Data extraction helpers
export function extractCreatePaymentData(formData: FormData) {
  return {
    orderId: formData.get('orderId') as string,
    amount: parseFloat(formData.get('amount') as string),
    paymentMethod: formData.get('paymentMethod') as PaymentMethod,
    transactionId: formData.get('transactionId') as string || undefined,
    status: (formData.get('status') as PaymentStatus) || PaymentStatus.PAID,
  };
}

export function extractUpdatePaymentData(formData: FormData) {
  return {
    orderId: formData.get('orderId') as string,
    amount: parseFloat(formData.get('amount') as string),
    paymentMethod: formData.get('paymentMethod') as PaymentMethod,
    transactionId: formData.get('transactionId') as string || undefined,
    status: formData.get('status') as PaymentStatus,
  };
}

export function extractFormFields(formData: FormData) {
  return {
    orderId: formData.get('orderId') as string,
    amount: formData.get('amount') as string,
    paymentMethod: formData.get('paymentMethod') as string,
    transactionId: formData.get('transactionId') as string,
    status: formData.get('status') as string,
  };
}

// Error response helpers
export function createValidationErrorResponse(
  fieldErrors: Record<string, string[]>,
  formData: FormData
): PaymentActionState {
  return {
    errors: fieldErrors,
    message: 'Please correct the errors below.',
    success: false,
    fields: extractFormFields(formData),
  };
}

export function createFailureResponse(message: string, formData?: FormData): PaymentActionState {
  return {
    message,
    success: false,
    fields: formData ? extractFormFields(formData) : undefined,
  };
}

export function createSuccessResponse(message: string, data?: any): PaymentActionState {
  return {
    message,
    success: true,
    data,
  };
}

export function createActionResult(success: boolean, message: string, data?: any): PaymentActionResult {
  return {
    success,
    message,
    data,
  };
}

// Validation helpers
export function validateCreatePaymentData(formData: FormData) {
  const rawData = {
    orderId: formData.get('orderId'),
    amount: formData.get('amount'),
    paymentMethod: formData.get('paymentMethod'),
    transactionId: formData.get('transactionId') || undefined,
    status: formData.get('status') || undefined,
  };

  return CreatePaymentSchema.safeParse(rawData);
}

export function validateUpdatePaymentData(formData: FormData) {
  const rawData = {
    orderId: formData.get('orderId'),
    amount: formData.get('amount'),
    paymentMethod: formData.get('paymentMethod'),
    transactionId: formData.get('transactionId') || undefined,
    status: formData.get('status'),
  };

  return UpdatePaymentSchema.safeParse(rawData);
}
