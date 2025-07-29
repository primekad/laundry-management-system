import { describe, expect, it } from 'vitest';
import {
  CreateExpenseSchema,
  UpdateExpenseSchema,
  validateCreateExpenseData,
  validateUpdateExpenseData,
  extractCreateExpenseData,
  extractUpdateExpenseData,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  createActionResult,
  extractFormFields,
} from './expense-action-helpers';

describe('Expense Action Helpers', () => {
  describe('Validation Schemas', () => {
    describe('CreateExpenseSchema', () => {
      it('should validate valid create expense data', () => {
        const validData = {
          description: 'Office supplies',
          amount: 150.75,
          date: new Date('2024-01-15'),
          branchId: 'branch-123',
          userId: 'user-456',
          categoryId: 'category-789',
          orderId: 'order-101',
          receiptUrl: 'https://example.com/receipt.pdf',
        };

        const result = CreateExpenseSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should reject invalid amount', () => {
        const invalidData = {
          description: 'Office supplies',
          amount: 0,
          date: new Date(),
          branchId: 'branch-123',
          userId: 'user-456',
          categoryId: 'category-789',
        };

        const result = CreateExpenseSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Amount must be greater than 0.');
        }
      });

      it('should reject missing description', () => {
        const invalidData = {
          amount: 100,
          date: new Date(),
          branchId: 'branch-123',
          userId: 'user-456',
          categoryId: 'category-789',
        };

        const result = CreateExpenseSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Required');
        }
      });

      it('should reject missing required fields', () => {
        const invalidData = {
          description: 'Test',
          amount: 100,
          date: new Date(),
        };

        const result = CreateExpenseSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });

      it('should allow optional fields', () => {
        const validData = {
          description: 'Office supplies',
          amount: 100,
          date: new Date(),
          branchId: 'branch-123',
          userId: 'user-456',
          categoryId: 'category-789',
        };

        const result = CreateExpenseSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate receipt URL format', () => {
        const invalidData = {
          description: 'Office supplies',
          amount: 100,
          date: new Date(),
          branchId: 'branch-123',
          userId: 'user-456',
          categoryId: 'category-789',
          receiptUrl: 'invalid-url',
        };

        const result = CreateExpenseSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Please enter a valid URL.');
        }
      });

      it('should allow empty string for receipt URL', () => {
        const validData = {
          description: 'Office supplies',
          amount: 100,
          date: new Date(),
          branchId: 'branch-123',
          userId: 'user-456',
          categoryId: 'category-789',
          receiptUrl: '',
        };

        const result = CreateExpenseSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('UpdateExpenseSchema', () => {
      it('should validate valid update expense data', () => {
        const validData = {
          description: 'Updated office supplies',
          amount: 200.50,
          date: new Date('2024-01-20'),
          branchId: 'branch-456',
          userId: 'user-789',
          categoryId: 'category-101',
          orderId: 'order-202',
          receiptUrl: 'https://example.com/updated-receipt.pdf',
        };

        const result = UpdateExpenseSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });
    });
  });

  describe('Data Extraction Functions', () => {
    describe('extractCreateExpenseData', () => {
      it('should extract create expense data from FormData', () => {
        const formData = new FormData();
        formData.append('description', 'Office supplies');
        formData.append('amount', '150.75');
        formData.append('date', '2024-01-15');
        formData.append('branchId', 'branch-123');
        formData.append('userId', 'user-456');
        formData.append('categoryId', 'category-789');
        formData.append('orderId', 'order-101');
        formData.append('receiptUrl', 'https://example.com/receipt.pdf');

        const result = extractCreateExpenseData(formData);
        expect(result).toEqual({
          description: 'Office supplies',
          amount: 150.75,
          date: new Date('2024-01-15'),
          branchId: 'branch-123',
          userId: 'user-456',
          categoryId: 'category-789',
          orderId: 'order-101',
          receiptUrl: 'https://example.com/receipt.pdf',
        });
      });

      it('should handle missing optional fields', () => {
        const formData = new FormData();
        formData.append('description', 'Office supplies');
        formData.append('amount', '100');
        formData.append('date', '2024-01-15');
        formData.append('branchId', 'branch-123');
        formData.append('userId', 'user-456');
        formData.append('categoryId', 'category-789');

        const result = extractCreateExpenseData(formData);
        expect(result).toEqual({
          description: 'Office supplies',
          amount: 100,
          date: new Date('2024-01-15'),
          branchId: 'branch-123',
          userId: 'user-456',
          categoryId: 'category-789',
          orderId: undefined,
          receiptUrl: undefined,
        });
      });
    });

    describe('extractUpdateExpenseData', () => {
      it('should extract update expense data from FormData', () => {
        const formData = new FormData();
        formData.append('description', 'Updated supplies');
        formData.append('amount', '200.50');
        formData.append('date', '2024-01-20');
        formData.append('branchId', 'branch-456');
        formData.append('userId', 'user-789');
        formData.append('categoryId', 'category-101');
        formData.append('orderId', 'order-202');
        formData.append('receiptUrl', 'https://example.com/updated.pdf');

        const result = extractUpdateExpenseData(formData);
        expect(result).toEqual({
          description: 'Updated supplies',
          amount: 200.50,
          date: new Date('2024-01-20'),
          branchId: 'branch-456',
          userId: 'user-789',
          categoryId: 'category-101',
          orderId: 'order-202',
          receiptUrl: 'https://example.com/updated.pdf',
        });
      });
    });

    describe('extractFormFields', () => {
      it('should extract form fields as strings', () => {
        const formData = new FormData();
        formData.append('description', 'Office supplies');
        formData.append('amount', '150.75');
        formData.append('date', '2024-01-15');
        formData.append('branchId', 'branch-123');

        const result = extractFormFields(formData);
        expect(result).toEqual({
          description: 'Office supplies',
          amount: '150.75',
          date: '2024-01-15',
          branchId: 'branch-123',
          userId: null,
          categoryId: null,
          orderId: null,
          receiptUrl: null,
        });
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateCreateExpenseData', () => {
      it('should validate valid FormData', () => {
        const formData = new FormData();
        formData.append('description', 'Office supplies');
        formData.append('amount', '100');
        formData.append('date', '2024-01-15');
        formData.append('branchId', 'branch-123');
        formData.append('userId', 'user-456');
        formData.append('categoryId', 'category-789');

        const result = validateCreateExpenseData(formData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid FormData', () => {
        const formData = new FormData();
        formData.append('amount', '0');
        formData.append('date', '2024-01-15');

        const result = validateCreateExpenseData(formData);
        expect(result.success).toBe(false);
      });
    });

    describe('validateUpdateExpenseData', () => {
      it('should validate valid FormData', () => {
        const formData = new FormData();
        formData.append('description', 'Updated supplies');
        formData.append('amount', '100');
        formData.append('date', '2024-01-15');
        formData.append('branchId', 'branch-123');
        formData.append('userId', 'user-456');
        formData.append('categoryId', 'category-789');

        const result = validateUpdateExpenseData(formData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Response Helper Functions', () => {
    describe('createValidationErrorResponse', () => {
      it('should create validation error response', () => {
        const fieldErrors = { description: ['Description is required'] };
        const formData = new FormData();
        formData.append('amount', '100');

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
        const message = 'Expense created successfully';
        const data = { id: 'expense-123' };
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
