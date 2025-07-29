import { it, describe, expect } from 'vitest';
import {
  createFailureResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  validateFormData
} from "@/app/(auth)/forgot-password/forgot-password-action-helpers";

describe('validateFormData', () => {
  it('should return success for valid email', () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    const result = validateFormData(formData);
    expect(result.success).toBe(true);
  });

  it('should return error for invalid email', () => {
    const formData = new FormData();
    formData.append('email', 'not-an-email');
    const result = validateFormData(formData);
    expect(result.success).toBe(false);
  });

  it('should return error for missing email', () => {
    const formData = new FormData();
    const result = validateFormData(formData);
    expect(result.success).toBe(false);
  });

  it('should return error for empty email', () => {
    const formData = new FormData();
    formData.append('email', '');
    const result = validateFormData(formData);
    expect(result.success).toBe(false);
  });
});

describe('createValidationErrorResponse', () => {
  it('should create a validation error response', () => {
    const formData = new FormData();
    formData.append('email', 'not-an-email');
    const validationResult = validateFormData(formData);

    const result = createValidationErrorResponse(validationResult, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed. Please check your input.');
    expect(result.errors).toHaveProperty('email');
  });
});

describe('createFailureResponse', () => {
  it('should create a failure response', () => {
    const message = 'An unexpected error occurred.';
    const result = createFailureResponse(message);

    expect(result.success).toBe(false);
    expect(result.message).toBe(message);
    expect(result.errors).toEqual({});
  });
});

describe('createSuccessResponse', () => {
  it('should create a success response', () => {
    const result = createSuccessResponse();

    expect(result.success).toBe(true);
    expect(result.message).toBe('If an account with that email exists, a password reset link has been sent.');
    expect(result.errors).toEqual({});
  });
});
