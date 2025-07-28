import { it, describe, expect } from 'vitest';
import {
  createFailureResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  validateFormData
} from "@/app/(auth)/reset-password/reset-password-action-helpers";

describe('validateFormData', () => {
  it('should return success for valid form data', () => {
    const formData = new FormData();
    formData.append('password', 'password123');
    formData.append('passwordConfirmation', 'password123');
    formData.append('token', 'valid-token');
    const result = validateFormData(formData);
    expect(result.success).toBe(true);
  });

  it('should return error for password too short', () => {
    const formData = new FormData();
    formData.append('password', '123');
    formData.append('passwordConfirmation', '123');
    formData.append('token', 'valid-token');
    const result = validateFormData(formData);
    expect(result.success).toBe(false);
  });

  it('should return error for mismatched passwords', () => {
    const formData = new FormData();
    formData.append('password', 'password123');
    formData.append('passwordConfirmation', 'different123');
    formData.append('token', 'valid-token');
    const result = validateFormData(formData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.passwordConfirmation).toContain('Passwords do not match.');
    }
  });

  it('should return error for missing token', () => {
    const formData = new FormData();
    formData.append('password', 'password123');
    formData.append('passwordConfirmation', 'password123');
    const result = validateFormData(formData);
    expect(result.success).toBe(false);
  });

  it('should return error for empty token', () => {
    const formData = new FormData();
    formData.append('password', 'password123');
    formData.append('passwordConfirmation', 'password123');
    formData.append('token', '');
    const result = validateFormData(formData);
    expect(result.success).toBe(false);
  });

  it('should return error for missing password', () => {
    const formData = new FormData();
    formData.append('passwordConfirmation', 'password123');
    formData.append('token', 'valid-token');
    const result = validateFormData(formData);
    expect(result.success).toBe(false);
  });
});

describe('createValidationErrorResponse', () => {
  it('should create a validation error response', () => {
    const formData = new FormData();
    formData.append('password', '123');
    formData.append('passwordConfirmation', 'different');
    formData.append('token', '');
    const validationResult = validateFormData(formData);

    const result = createValidationErrorResponse(validationResult, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Validation failed. Please check your input.');
    expect(result.errors).toHaveProperty('password');
    expect(result.errors).toHaveProperty('passwordConfirmation');
    expect(result.errors).toHaveProperty('token');
  });
});

describe('createFailureResponse', () => {
  it('should create a failure response', () => {
    const message = 'Reset link is invalid or expired.';
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
    expect(result.message).toBe('Your password has been reset successfully. You can now sign in.');
    expect(result.errors).toEqual({});
  });
});
