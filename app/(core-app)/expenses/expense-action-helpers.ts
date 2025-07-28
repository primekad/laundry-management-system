import { z } from 'zod';

// Enhanced validation schemas
export const CreateExpenseSchema = z.object({
  description: z.string().min(1, { message: 'Description is required.' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0.' }),
  date: z.coerce.date({ required_error: 'Date is required.' }),
  branchId: z.string().min(1, { message: 'Please select a branch.' }),
  userId: z.string().min(1, { message: 'Please select a user.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  orderId: z.string().optional(),
  receiptUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

export const UpdateExpenseSchema = z.object({
  description: z.string().min(1, { message: 'Description is required.' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0.' }),
  date: z.coerce.date({ required_error: 'Date is required.' }),
  branchId: z.string().min(1, { message: 'Please select a branch.' }),
  userId: z.string().min(1, { message: 'Please select a user.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  orderId: z.string().optional(),
  receiptUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

// Types for action responses
export type ExpenseActionState = {
  errors?: {
    id?: string[];
    description?: string[];
    amount?: string[];
    date?: string[];
    branchId?: string[];
    userId?: string[];
    categoryId?: string[];
    orderId?: string[];
    receiptUrl?: string[];
    form?: string[]; // For general form errors
  };
  message?: string | null;
  success?: boolean;
  data?: any;
  fields?: {
    description?: string;
    amount?: string;
    date?: string;
    branchId?: string;
    userId?: string;
    categoryId?: string;
    orderId?: string;
    receiptUrl?: string;
  };
};

export type ExpenseActionResult = {
  success: boolean;
  message: string;
  data?: any;
};

// Data extraction helpers
export function extractCreateExpenseData(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const receiptUrl = formData.get('receiptUrl') as string;

  return {
    description: formData.get('description') as string,
    amount: parseFloat(formData.get('amount') as string),
    date: new Date(formData.get('date') as string),
    branchId: formData.get('branchId') as string,
    userId: formData.get('userId') as string,
    categoryId: formData.get('categoryId') as string,
    orderId: orderId === 'none' || !orderId ? undefined : orderId,
    receiptUrl: receiptUrl || undefined,
  };
}

export function extractUpdateExpenseData(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const receiptUrl = formData.get('receiptUrl') as string;

  return {
    description: formData.get('description') as string,
    amount: parseFloat(formData.get('amount') as string),
    date: new Date(formData.get('date') as string),
    branchId: formData.get('branchId') as string,
    userId: formData.get('userId') as string,
    categoryId: formData.get('categoryId') as string,
    orderId: orderId === 'none' || !orderId ? undefined : orderId,
    receiptUrl: receiptUrl || undefined,
  };
}

export function extractFormFields(formData: FormData) {
  return {
    description: formData.get('description') as string,
    amount: formData.get('amount') as string,
    date: formData.get('date') as string,
    branchId: formData.get('branchId') as string,
    userId: formData.get('userId') as string,
    categoryId: formData.get('categoryId') as string,
    orderId: formData.get('orderId') as string,
    receiptUrl: formData.get('receiptUrl') as string,
  };
}

// Error response helpers
export function createValidationErrorResponse(
  fieldErrors: Record<string, string[]>,
  formData: FormData
): ExpenseActionState {
  return {
    errors: fieldErrors,
    message: 'Please correct the errors below.',
    success: false,
    fields: extractFormFields(formData),
  };
}

export function createFailureResponse(message: string, formData?: FormData): ExpenseActionState {
  return {
    message,
    success: false,
    fields: formData ? extractFormFields(formData) : undefined,
  };
}

export function createSuccessResponse(message: string, data?: any): ExpenseActionState {
  return {
    message,
    success: true,
    data,
  };
}

export function createActionResult(success: boolean, message: string, data?: any): ExpenseActionResult {
  return {
    success,
    message,
    data,
  };
}

// Validation helpers
export function validateCreateExpenseData(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const receiptUrl = formData.get('receiptUrl') as string;

  const rawData = {
    description: formData.get('description'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    branchId: formData.get('branchId'),
    userId: formData.get('userId'),
    categoryId: formData.get('categoryId'),
    orderId: orderId === 'none' || !orderId ? undefined : orderId,
    receiptUrl: receiptUrl || undefined,
  };

  return CreateExpenseSchema.safeParse(rawData);
}

export function validateUpdateExpenseData(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const receiptUrl = formData.get('receiptUrl') as string;

  const rawData = {
    description: formData.get('description'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    branchId: formData.get('branchId'),
    userId: formData.get('userId'),
    categoryId: formData.get('categoryId'),
    orderId: orderId === 'none' || !orderId ? undefined : orderId,
    receiptUrl: receiptUrl || undefined,
  };

  return UpdateExpenseSchema.safeParse(rawData);
}
