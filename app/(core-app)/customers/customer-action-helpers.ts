import { z } from 'zod';

// Enhanced validation schemas
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Types for action responses
export type CustomerActionState = {
  errors?: {
    id?: string[];
    name?: string[];
    email?: string[];
    phone?: string[];
    address?: string[];
    form?: string[]; // For general form errors
  };
  message?: string | null;
  success?: boolean;
  data?: any;
  fields?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
};

export type CustomerActionResult = {
  success: boolean;
  message: string;
  data?: any;
};

// Data extraction helpers
export function extractCreateCustomerData(formData: FormData) {
  return {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
    address: formData.get('address') as string || undefined,
  };
}

export function extractUpdateCustomerData(formData: FormData) {
  return {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
    address: formData.get('address') as string || undefined,
  };
}

export function extractFormFields(formData: FormData) {
  return {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
  };
}

// Error response helpers
export function createValidationErrorResponse(
  fieldErrors: Record<string, string[]>,
  formData: FormData
): CustomerActionState {
  return {
    errors: fieldErrors,
    message: 'Please correct the errors below.',
    success: false,
    fields: extractFormFields(formData),
  };
}

export function createFailureResponse(message: string, formData?: FormData): CustomerActionState {
  return {
    message,
    success: false,
    fields: formData ? extractFormFields(formData) : undefined,
  };
}

export function createSuccessResponse(message: string, data?: any): CustomerActionState {
  return {
    message,
    success: true,
    data,
  };
}

export function createActionResult(success: boolean, message: string, data?: any): CustomerActionResult {
  return {
    success,
    message,
    data,
  };
}

// Validation helpers
export function validateCreateCustomerData(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
  };

  return CreateCustomerSchema.safeParse(rawData);
}

export function validateUpdateCustomerData(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    address: formData.get('address') || undefined,
  };

  return UpdateCustomerSchema.safeParse(rawData);
}
