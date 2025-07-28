import {it, describe, expect,} from 'vitest';
import {createValidationErrorResponse, validateFormData} from "@/app/(auth)/login/auth-action-helpers";

describe('validateFormData', () => {
    it('should return success for valid form data', () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        const result = validateFormData(formData);
        expect(result.success).toBe(true);
    });

    it('should return error for invalid email', () => {
        const formData = new FormData();
        formData.append('email', 'not-an-email');
        formData.append('password', 'password123');
        const result = validateFormData(formData);
        expect(result.success).toBe(false);
    });

    it('should return error for missing password', () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        const result = validateFormData(formData);
        expect(result.success).toBe(false);
    });
});

describe('createValidationErrorResponse', () => {
    it('should create a validation error response', () => {
        const formData = new FormData();
        formData.append('email', 'not-an-email');
        const validationResult = validateFormData(formData);

        const result = createValidationErrorResponse(validationResult,formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid fields. Could not log in.');
        expect(result.errors).toHaveProperty('email');
        expect(result.errors).toHaveProperty('password');
        expect(result.email).toBe('not-an-email');
    });
});