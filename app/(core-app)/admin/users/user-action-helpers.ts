import { z } from 'zod';
import type { CreateUserData } from '@/lib/better-auth-helpers/types';
import { Role, ROLE_VALUES } from '@/lib/types/role';
import crypto from 'crypto';

// Enhanced validation schemas
export const CreateUserSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  surname: z.string().min(2, { message: 'Surname must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phoneNumber: z.string().nullable().optional(),
  role: z.nativeEnum(Role, {
    required_error: 'Please select a role.',
    invalid_type_error: 'Invalid role selected.'
  }),
  defaultBranchId: z.string({ required_error: 'Please select a default branch.' }),
  secondaryBranchIds: z.string().nullable().optional(),
  // Password removed - will be generated automatically
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  surname: z.string().min(2, { message: 'Surname must be at least 2 characters.' }),
  phoneNumber: z.string().nullable().optional(),
  role: z.nativeEnum(Role, {
    required_error: 'Please select a role.',
    invalid_type_error: 'Invalid role selected.'
  }),
  defaultBranchId: z.string({ required_error: 'Please select a default branch.' }),
  secondaryBranchIds: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

// Types for action responses - compatible with useServerActionForm
export type UserActionState = {
  errors?: {
    id?: string[];
    firstName?: string[];
    surname?: string[];
    phoneNumber?: string[];
    role?: string[];
    isActive?: string[];
    defaultBranchId?: string[];
    secondaryBranchIds?: string[];
    email?: string[];
    password?: string[];
    form?: string[]; // For general form errors
  };
  message?: string | null;
  success?: boolean;
  // Keep fields for backward compatibility but make them optional
  fields?: {
    firstName?: string;
    surname?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    defaultBranchId?: string;
    secondaryBranchIds?: string;
    password?: string;
  };
};

export type UserActionResult = {
  success: boolean;
  message: string;
  data?: any;
};

// Helper functions for processing form data
export function extractCreateUserData(formData: FormData): CreateUserData {
  const firstName = formData.get('firstName') as string;
  const surname = formData.get('surname') as string;
  const secondaryBranchIds = formData.get('secondaryBranchIds') as string;
  
  return {
    name: `${firstName} ${surname}`.trim(),
    email: formData.get('email') as string,
    password: generateRandomPassword(), // Generate random password instead of using form data
    role: formData.get('role') as 'admin' | 'manager' | 'staff',
    defaultBranchId: formData.get('defaultBranchId') as string,
    assignedBranches: secondaryBranchIds ? secondaryBranchIds.split(',').filter(id => id.trim()) : [],
    data: {
      phoneNumber: formData.get('phoneNumber') as string || undefined,
    },
  };
}

export function extractUpdateUserData(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const surname = formData.get('surname') as string;
  const secondaryBranchIds = formData.get('secondaryBranchIds') as string;
  
  return {
    name: `${firstName} ${surname}`.trim(),
    role: formData.get('role') as 'admin' | 'manager' | 'staff',
    defaultBranchId: formData.get('defaultBranchId') as string,
    assignedBranches: secondaryBranchIds ? secondaryBranchIds.split(',').filter(id => id.trim()) : [],
    data: {
      phoneNumber: formData.get('phoneNumber') as string || undefined,
    },
  };
}

// Response creators - compatible with useServerActionForm
export function createValidationErrorResponse(
  validationResult: any,
  formData?: FormData
): UserActionState {
  const fieldErrors: Record<string, string[]> = {};
  
  if (validationResult.error) {
    validationResult.error.issues.forEach((issue: any) => {
      const field = issue.path[0];
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    });
  }

  return {
    errors: fieldErrors,
    message: null,
    success: false,
  };
}

export function createFailureResponse(message: string, fields?: Record<string, any>): UserActionState {
  return {
    errors: { form: [message] },
    message,
    success: false,
    ...(fields && { fields }),
  };
}

export function createSuccessResponse(message: string): UserActionState {
  return {
    message,
    success: true,
  };
}

export function createActionResult(success: boolean, message: string, data?: any): UserActionResult {
  return {
    success,
    message,
    data,
  };
}

// Validation helpers
export function validateCreateUserData(formData: FormData) {
  const rawData = {
    firstName: formData.get('firstName'),
    surname: formData.get('surname'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    role: formData.get('role'),
    defaultBranchId: formData.get('defaultBranchId'),
    secondaryBranchIds: formData.get('secondaryBranchIds'),
  };

  return CreateUserSchema.safeParse(rawData);
}

export function validateUpdateUserData(formData: FormData) {
  const rawData = {
    firstName: formData.get('firstName'),
    surname: formData.get('surname'),
    phoneNumber: formData.get('phoneNumber'),
    role: formData.get('role'),
    defaultBranchId: formData.get('defaultBranchId'),
    secondaryBranchIds: formData.get('secondaryBranchIds'),
    isActive: formData.get('isActive') === 'true',
  };

  return UpdateUserSchema.safeParse(rawData);
}

// Field extraction helpers
export function extractFormFields(formData: FormData) {
  return {
    firstName: formData.get('firstName') as string || '',
    surname: formData.get('surname') as string || '',
    email: formData.get('email') as string || '',
    phoneNumber: formData.get('phoneNumber') as string || '',
    role: formData.get('role') as string || '',
    defaultBranchId: formData.get('defaultBranchId') as string || '',
    secondaryBranchIds: formData.get('secondaryBranchIds') as string || '',
    // password field removed since we generate it automatically
  };
}

/**
 * Generate a secure random password
 */
export function generateRandomPassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}
