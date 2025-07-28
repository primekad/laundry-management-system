import { describe, expect, it } from 'vitest';
import {
  CreatePaymentSchema,
  UpdatePaymentSchema,
  validateCreatePaymentData,
  validateUpdatePaymentData,
  extractCreatePaymentData,
  extractUpdatePaymentData,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  createActionResult,
  extractFormFields,
  PaymentMethod,
  PaymentStatus,
} from './payment-action-helpers';

describe('Payment Action Helpers', () => {
  describe('Validation Schemas', () => {
    describe('CreatePaymentSchema', () => {
      it('should validate valid create payment data', () => {
        const validData = {
          orderId: 'order-123',
          amount: 100.50,
          paymentMethod: PaymentMethod.CASH,
          transactionId: 'txn-123',
          status: PaymentStatus.PAID,
        };

        const result = CreatePaymentSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should reject invalid amount', () => {
        const invalidData = {
          orderId: 'order-123',
          amount: 0,
          paymentMethod: PaymentMethod.CASH,
        };

        const result = CreatePaymentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Amount must be greater than 0.');
        }
      });

      it('should reject missing orderId', () => {
        const invalidData = {
          amount: 100,
          paymentMethod: PaymentMethod.CASH,
        };

        const result = CreatePaymentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Required');
        }
      });

      it('should reject invalid payment method', () => {
        const invalidData = {
          orderId: 'order-123',
          amount: 100,
          paymentMethod: 'INVALID_METHOD',
        };

        const result = CreatePaymentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid enum value');
        }
      });

      it('should allow optional transactionId', () => {
        const validData = {
          orderId: 'order-123',
          amount: 100,
          paymentMethod: PaymentMethod.CASH,
        };

        const result = CreatePaymentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('UpdatePaymentSchema', () => {
      it('should validate valid update payment data', () => {
        const validData = {
          orderId: 'order-123',
          amount: 100.50,
          paymentMethod: PaymentMethod.CARD,
          transactionId: 'txn-456',
          status: PaymentStatus.PAID,
        };

        const result = UpdatePaymentSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should require status for updates', () => {
        const invalidData = {
          orderId: 'order-123',
          amount: 100,
          paymentMethod: PaymentMethod.CASH,
        };

        const result = UpdatePaymentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Data Extraction Functions', () => {
    describe('extractCreatePaymentData', () => {
      it('should extract create payment data from FormData', () => {
        const formData = new FormData();
        formData.append('orderId', 'order-123');
        formData.append('amount', '100.50');
        formData.append('paymentMethod', PaymentMethod.CASH);
        formData.append('transactionId', 'txn-123');

        const result = extractCreatePaymentData(formData);
        expect(result).toEqual({
          orderId: 'order-123',
          amount: 100.50,
          paymentMethod: PaymentMethod.CASH,
          transactionId: 'txn-123',
          status: PaymentStatus.PAID,
        });
      });

      it('should handle missing optional fields', () => {
        const formData = new FormData();
        formData.append('orderId', 'order-123');
        formData.append('amount', '100');
        formData.append('paymentMethod', PaymentMethod.CASH);

        const result = extractCreatePaymentData(formData);
        expect(result).toEqual({
          orderId: 'order-123',
          amount: 100,
          paymentMethod: PaymentMethod.CASH,
          transactionId: undefined,
          status: PaymentStatus.PAID,
        });
      });
    });

    describe('extractUpdatePaymentData', () => {
      it('should extract update payment data from FormData', () => {
        const formData = new FormData();
        formData.append('orderId', 'order-456');
        formData.append('amount', '200.75');
        formData.append('paymentMethod', PaymentMethod.CARD);
        formData.append('transactionId', 'txn-456');
        formData.append('status', PaymentStatus.PENDING);

        const result = extractUpdatePaymentData(formData);
        expect(result).toEqual({
          orderId: 'order-456',
          amount: 200.75,
          paymentMethod: PaymentMethod.CARD,
          transactionId: 'txn-456',
          status: PaymentStatus.PENDING,
        });
      });
    });

    describe('extractFormFields', () => {
      it('should extract form fields as strings', () => {
        const formData = new FormData();
        formData.append('orderId', 'order-123');
        formData.append('amount', '100.50');
        formData.append('paymentMethod', PaymentMethod.CASH);

        const result = extractFormFields(formData);
        expect(result).toEqual({
          orderId: 'order-123',
          amount: '100.50',
          paymentMethod: PaymentMethod.CASH,
          transactionId: null,
          status: null,
        });
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateCreatePaymentData', () => {
      it('should validate valid FormData', () => {
        const formData = new FormData();
        formData.append('orderId', 'order-123');
        formData.append('amount', '100');
        formData.append('paymentMethod', PaymentMethod.CASH);
        // status should use default value

        const result = validateCreatePaymentData(formData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid FormData', () => {
        const formData = new FormData();
        formData.append('amount', '0');
        formData.append('paymentMethod', PaymentMethod.CASH);

        const result = validateCreatePaymentData(formData);
        expect(result.success).toBe(false);
      });
    });

    describe('validateUpdatePaymentData', () => {
      it('should validate valid FormData', () => {
        const formData = new FormData();
        formData.append('orderId', 'order-123');
        formData.append('amount', '100');
        formData.append('paymentMethod', PaymentMethod.CASH);
        formData.append('status', PaymentStatus.PAID);
        formData.append('transactionId', 'txn-123');

        const result = validateUpdatePaymentData(formData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Response Helper Functions', () => {
    describe('createValidationErrorResponse', () => {
      it('should create validation error response', () => {
        const fieldErrors = { amount: ['Amount is required'] };
        const formData = new FormData();
        formData.append('orderId', 'order-123');

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
        const message = 'Payment created successfully';
        const data = { id: 'payment-123' };
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
