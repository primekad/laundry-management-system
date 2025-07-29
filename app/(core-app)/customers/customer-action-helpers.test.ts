import { describe, expect, it } from 'vitest';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  validateCreateCustomerData,
  validateUpdateCustomerData,
  extractCreateCustomerData,
  extractUpdateCustomerData,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  createActionResult,
  extractFormFields,
} from './customer-action-helpers';

describe('Customer Action Helpers', () => {
  describe('Validation Schemas', () => {
    describe('CreateCustomerSchema', () => {
      it('should validate valid create customer data', () => {
        const validData = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St, City, State',
        };

        const result = CreateCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should reject invalid email', () => {
        const invalidData = {
          name: 'John Doe',
          email: 'invalid-email',
          phone: '+1234567890',
          address: '123 Main St',
        };

        const result = CreateCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid email address.');
        }
      });

      it('should reject missing name', () => {
        const invalidData = {
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St',
        };

        const result = CreateCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Required');
        }
      });

      it('should reject empty name', () => {
        const invalidData = {
          name: '',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St',
        };

        const result = CreateCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Name is required.');
        }
      });

      it('should allow optional fields', () => {
        const validData = {
          name: 'John Doe',
          email: 'john.doe@example.com',
        };

        const result = CreateCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('UpdateCustomerSchema', () => {
      it('should validate valid update customer data', () => {
        const validData = {
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+0987654321',
          address: '456 Oak Ave, City, State',
        };

        const result = UpdateCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });
    });
  });

  describe('Data Extraction Functions', () => {
    describe('extractCreateCustomerData', () => {
      it('should extract create customer data from FormData', () => {
        const formData = new FormData();
        formData.append('name', 'John Doe');
        formData.append('email', 'john.doe@example.com');
        formData.append('phone', '+1234567890');
        formData.append('address', '123 Main St, City, State');

        const result = extractCreateCustomerData(formData);
        expect(result).toEqual({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St, City, State',
        });
      });

      it('should handle missing optional fields', () => {
        const formData = new FormData();
        formData.append('name', 'John Doe');
        formData.append('email', 'john.doe@example.com');

        const result = extractCreateCustomerData(formData);
        expect(result).toEqual({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: undefined,
          address: undefined,
        });
      });
    });

    describe('extractUpdateCustomerData', () => {
      it('should extract update customer data from FormData', () => {
        const formData = new FormData();
        formData.append('name', 'Jane Doe');
        formData.append('email', 'jane.doe@example.com');
        formData.append('phone', '+0987654321');
        formData.append('address', '456 Oak Ave, City, State');

        const result = extractUpdateCustomerData(formData);
        expect(result).toEqual({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+0987654321',
          address: '456 Oak Ave, City, State',
        });
      });
    });

    describe('extractFormFields', () => {
      it('should extract form fields as strings', () => {
        const formData = new FormData();
        formData.append('name', 'John Doe');
        formData.append('email', 'john.doe@example.com');
        formData.append('phone', '+1234567890');

        const result = extractFormFields(formData);
        expect(result).toEqual({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: null,
        });
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateCreateCustomerData', () => {
      it('should validate valid FormData', () => {
        const formData = new FormData();
        formData.append('name', 'John Doe');
        formData.append('email', 'john.doe@example.com');
        formData.append('phone', '+1234567890');
        formData.append('address', '123 Main St');

        const result = validateCreateCustomerData(formData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid FormData', () => {
        const formData = new FormData();
        formData.append('name', '');
        formData.append('email', 'invalid-email');

        const result = validateCreateCustomerData(formData);
        expect(result.success).toBe(false);
      });
    });

    describe('validateUpdateCustomerData', () => {
      it('should validate valid FormData', () => {
        const formData = new FormData();
        formData.append('name', 'Jane Doe');
        formData.append('email', 'jane.doe@example.com');
        formData.append('phone', '+0987654321');
        formData.append('address', '456 Oak Ave');

        const result = validateUpdateCustomerData(formData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Response Helper Functions', () => {
    describe('createValidationErrorResponse', () => {
      it('should create validation error response', () => {
        const fieldErrors = { name: ['Name is required'] };
        const formData = new FormData();
        formData.append('email', 'john.doe@example.com');

        const result = createValidationErrorResponse(fieldErrors, formData);
        expect(result).toEqual({
          errors: fieldErrors,
          message: 'Please correct the errors below.',
          success: false,
          fields: expect.any(Object),
        });
      });
    });

    describe('createFailureResponse', () => {
      it('should create failure response', () => {
        const message = 'Something went wrong';
        const result = createFailureResponse(message);
        expect(result).toEqual({
          message,
          success: false,
          fields: undefined,
        });
      });
    });

    describe('createSuccessResponse', () => {
      it('should create success response', () => {
        const message = 'Customer created successfully';
        const data = { id: 'customer-123' };
        const result = createSuccessResponse(message, data);
        expect(result).toEqual({
          message,
          success: true,
          data,
        });
      });
    });

    describe('createActionResult', () => {
      it('should create action result', () => {
        const result = createActionResult(true, 'Success', { id: '123' });
        expect(result).toEqual({
          success: true,
          message: 'Success',
          data: { id: '123' },
        });
      });
    });
  });
});
