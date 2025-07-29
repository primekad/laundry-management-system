import { describe, expect, it } from 'vitest';
import {
  CreateOrderSchema,
  UpdateOrderSchema,
  validateCreateOrderData,
  validateUpdateOrderData,
  extractCreateOrderData,
  extractUpdateOrderData,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  createActionResult,
  extractFormFields,
  formatDateForInput,
  parseDateFromInput,
  OrderStatus,
  PaymentMethod,
} from './order-action-helpers';

describe('Order Action Helpers', () => {
  describe('Validation Schemas', () => {
    describe('CreateOrderSchema', () => {
      it('should validate valid create order data', () => {
        const validData = {
          customerId: 'customer-123',
          branchId: 'branch-456',
          notes: 'Test order notes',
          discount: 10,
          amountPaid: 100,
          paymentMethod: PaymentMethod.CASH,
          customInvoiceNumber: 'INV-001',
          orderDate: '2024-01-15',
          expectedDeliveryDate: '2024-01-20',
          items: [
            {
              serviceTypeId: 'service-123',
              categoryId: 'category-456',
              quantity: 2,
              size: 'Large',
              notes: 'Handle with care',
              unitPrice: 50,
              total: 100,
            },
          ],
        };

        const result = CreateOrderSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should require customerId', () => {
        const invalidData = {
          branchId: 'branch-456',
          items: [
            {
              serviceTypeId: 'service-123',
              quantity: 1,
              unitPrice: 50,
              total: 50,
            },
          ],
        };

        const result = CreateOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e => e.path.includes('customerId'))).toBe(true);
        }
      });

      it('should require branchId', () => {
        const invalidData = {
          customerId: 'customer-123',
          items: [
            {
              serviceTypeId: 'service-123',
              quantity: 1,
              unitPrice: 50,
              total: 50,
            },
          ],
        };

        const result = CreateOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e => e.path.includes('branchId'))).toBe(true);
        }
      });

      it('should require at least one item', () => {
        const invalidData = {
          customerId: 'customer-123',
          branchId: 'branch-456',
          items: [],
        };

        const result = CreateOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e => e.path.includes('items'))).toBe(true);
        }
      });

      it('should require payment method when amount paid is greater than 0', () => {
        const invalidData = {
          customerId: 'customer-123',
          branchId: 'branch-456',
          amountPaid: 100,
          // paymentMethod is missing
          items: [
            {
              serviceTypeId: 'service-123',
              quantity: 1,
              unitPrice: 50,
              total: 50,
            },
          ],
        };

        const result = CreateOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e => e.path.includes('paymentMethod'))).toBe(true);
        }
      });

      it('should allow payment method to be optional when amount paid is 0', () => {
        const validData = {
          customerId: 'customer-123',
          branchId: 'branch-456',
          amountPaid: 0,
          // paymentMethod is optional
          items: [
            {
              serviceTypeId: 'service-123',
              quantity: 1,
              unitPrice: 50,
              total: 50,
            },
          ],
        };

        const result = CreateOrderSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate item fields', () => {
        const invalidData = {
          customerId: 'customer-123',
          branchId: 'branch-456',
          items: [
            {
              // serviceTypeId is missing
              quantity: 0, // invalid quantity
              unitPrice: -10, // invalid price
              total: -50, // invalid total
            },
          ],
        };

        const result = CreateOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          const errors = result.error.errors;
          expect(errors.some(e => e.path.includes('serviceTypeId'))).toBe(true);
          expect(errors.some(e => e.path.includes('quantity'))).toBe(true);
          expect(errors.some(e => e.path.includes('unitPrice'))).toBe(true);
          expect(errors.some(e => e.path.includes('total'))).toBe(true);
        }
      });

      it('should default discount and amountPaid to 0', () => {
        const data = {
          customerId: 'customer-123',
          branchId: 'branch-456',
          items: [
            {
              serviceTypeId: 'service-123',
              quantity: 1,
              unitPrice: 50,
              total: 50,
            },
          ],
        };

        const result = CreateOrderSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.discount).toBe(0);
          expect(result.data.amountPaid).toBe(0);
        }
      });
    });

    describe('UpdateOrderSchema', () => {
      it('should validate valid update order data', () => {
        const validData = {
          customerId: 'customer-123',
          branchId: 'branch-456',
          notes: 'Updated notes',
          status: OrderStatus.PROCESSING,
          discount: 15,
          orderDate: '2024-01-16',
          expectedDeliveryDate: '2024-01-21',
          items: [
            {
              serviceTypeId: 'service-123',
              quantity: 3,
              unitPrice: 60,
              total: 180,
            },
          ],
        };

        const result = UpdateOrderSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should allow all fields to be optional', () => {
        const validData = {};

        const result = UpdateOrderSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate status enum', () => {
        const invalidData = {
          status: 'INVALID_STATUS',
        };

        const result = UpdateOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e => e.path.includes('status'))).toBe(true);
        }
      });

      it('should validate discount is positive', () => {
        const invalidData = {
          discount: -10,
        };

        const result = UpdateOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e => e.path.includes('discount'))).toBe(true);
        }
      });
    });
  });

  describe('Data Extraction Functions', () => {
    describe('extractCreateOrderData', () => {
      it('should extract valid create order data from FormData', () => {
        const formData = new FormData();
        formData.append('customerId', 'customer-123');
        formData.append('branchId', 'branch-456');
        formData.append('notes', 'Test notes');
        formData.append('discount', '10');
        formData.append('amountPaid', '100');
        formData.append('paymentMethod', 'CASH');
        formData.append('customInvoiceNumber', 'INV-001');
        formData.append('orderDate', '2024-01-15');
        formData.append('expectedDeliveryDate', '2024-01-20');
        formData.append('items', JSON.stringify([
          {
            serviceTypeId: 'service-123',
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ]));

        const result = extractCreateOrderData(formData);
        expect(result).toEqual({
          customerId: 'customer-123',
          branchId: 'branch-456',
          notes: 'Test notes',
          discount: 10,
          amountPaid: 100,
          paymentMethod: PaymentMethod.CASH,
          customInvoiceNumber: 'INV-001',
          orderDate: '2024-01-15',
          expectedDeliveryDate: '2024-01-20',
          items: [
            {
              serviceTypeId: 'service-123',
              quantity: 1,
              unitPrice: 50,
              total: 50,
            },
          ],
        });
      });

      it('should handle missing optional fields', () => {
        const formData = new FormData();
        formData.append('customerId', 'customer-123');
        formData.append('branchId', 'branch-456');
        formData.append('items', JSON.stringify([
          {
            serviceTypeId: 'service-123',
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ]));

        const result = extractCreateOrderData(formData);
        expect(result.notes).toBeUndefined();
        expect(result.customInvoiceNumber).toBeUndefined();
        expect(result.orderDate).toBeUndefined();
        expect(result.expectedDeliveryDate).toBeUndefined();
        expect(result.paymentMethod).toBeUndefined();
        expect(result.discount).toBe(0);
        expect(result.amountPaid).toBe(0);
      });

      it('should handle invalid JSON in items', () => {
        const formData = new FormData();
        formData.append('customerId', 'customer-123');
        formData.append('branchId', 'branch-456');
        formData.append('items', 'invalid-json');

        const result = extractCreateOrderData(formData);
        expect(result.items).toEqual([]);
      });

      it('should not set payment method when amount paid is 0', () => {
        const formData = new FormData();
        formData.append('customerId', 'customer-123');
        formData.append('branchId', 'branch-456');
        formData.append('amountPaid', '0');
        formData.append('paymentMethod', 'CASH');
        formData.append('items', JSON.stringify([
          {
            serviceTypeId: 'service-123',
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ]));

        const result = extractCreateOrderData(formData);
        expect(result.paymentMethod).toBeUndefined();
      });

      it('should handle "none" payment method', () => {
        const formData = new FormData();
        formData.append('customerId', 'customer-123');
        formData.append('branchId', 'branch-456');
        formData.append('amountPaid', '100');
        formData.append('paymentMethod', 'none');
        formData.append('items', JSON.stringify([
          {
            serviceTypeId: 'service-123',
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ]));

        const result = extractCreateOrderData(formData);
        expect(result.paymentMethod).toBeUndefined();
      });
    });

    describe('extractUpdateOrderData', () => {
      it('should extract valid update order data from FormData', () => {
        const formData = new FormData();
        formData.append('customerId', 'customer-123');
        formData.append('branchId', 'branch-456');
        formData.append('notes', 'Updated notes');
        formData.append('status', 'PROCESSING');
        formData.append('discount', '15');
        formData.append('orderDate', '2024-01-16');
        formData.append('expectedDeliveryDate', '2024-01-21');
        formData.append('items', JSON.stringify([
          {
            serviceTypeId: 'service-123',
            quantity: 2,
            unitPrice: 60,
            total: 120,
          },
        ]));

        const result = extractUpdateOrderData(formData);
        expect(result).toEqual({
          customerId: 'customer-123',
          branchId: 'branch-456',
          notes: 'Updated notes',
          status: OrderStatus.PROCESSING,
          discount: 15,
          orderDate: '2024-01-16',
          expectedDeliveryDate: '2024-01-21',
          items: [
            {
              serviceTypeId: 'service-123',
              quantity: 2,
              unitPrice: 60,
              total: 120,
            },
          ],
        });
      });

      it('should handle "none" values', () => {
        const formData = new FormData();
        formData.append('customerId', 'none');
        formData.append('branchId', 'none');
        formData.append('status', 'none');

        const result = extractUpdateOrderData(formData);
        expect(result.customerId).toBeUndefined();
        expect(result.branchId).toBeUndefined();
        expect(result.status).toBeUndefined();
      });

      it('should handle invalid JSON in items', () => {
        const formData = new FormData();
        formData.append('items', 'invalid-json');

        const result = extractUpdateOrderData(formData);
        expect(result.items).toBeUndefined();
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateCreateOrderData', () => {
      it('should validate valid FormData', () => {
        const formData = new FormData();
        formData.append('customerId', 'customer-123');
        formData.append('branchId', 'branch-456');
        formData.append('items', JSON.stringify([
          {
            serviceTypeId: 'service-123',
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ]));

        const result = validateCreateOrderData(formData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid FormData', () => {
        const formData = new FormData();
        formData.append('customerId', '');
        formData.append('items', JSON.stringify([]));

        const result = validateCreateOrderData(formData);
        expect(result.success).toBe(false);
      });
    });

    describe('validateUpdateOrderData', () => {
      it('should validate valid FormData', () => {
        const formData = new FormData();
        formData.append('status', 'PROCESSING');

        const result = validateUpdateOrderData(formData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid FormData', () => {
        const formData = new FormData();
        formData.append('status', 'INVALID_STATUS');

        const result = validateUpdateOrderData(formData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Response Helper Functions', () => {
    describe('createValidationErrorResponse', () => {
      it('should create validation error response', () => {
        const fieldErrors = { customerId: ['Customer is required'] };
        const formData = new FormData();
        formData.append('branchId', 'branch-456');

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

      it('should create failure response with form data', () => {
        const message = 'Something went wrong';
        const formData = new FormData();
        formData.append('customerId', 'customer-123');

        const result = createFailureResponse(message, formData);
        expect(result).toEqual({
          message,
          success: false,
          fields: expect.any(Object),
        });
      });
    });

    describe('createSuccessResponse', () => {
      it('should create success response', () => {
        const message = 'Order created successfully';
        const data = { id: 'order-123' };
        const result = createSuccessResponse(message, data);
        expect(result).toEqual({
          message,
          success: true,
          data,
          fields: undefined,
        });
      });
    });

    describe('createActionResult', () => {
      it('should create action result', () => {
        const result = createActionResult(true, 'Success', { id: 'order-123' });
        expect(result).toEqual({
          success: true,
          message: 'Success',
          data: { id: 'order-123' },
        });
      });
    });
  });

  describe('Date Helper Functions', () => {
    describe('formatDateForInput', () => {
      it('should format Date object for input', () => {
        const date = new Date('2024-01-15T10:30:00Z');
        const result = formatDateForInput(date);
        expect(result).toBe('2024-01-15');
      });

      it('should format date string for input', () => {
        const dateString = '2024-01-15T10:30:00Z';
        const result = formatDateForInput(dateString);
        expect(result).toBe('2024-01-15');
      });

      it('should handle null date', () => {
        const result = formatDateForInput(null);
        expect(result).toBe('');
      });

      it('should handle invalid date', () => {
        const result = formatDateForInput('invalid-date');
        expect(result).toBe('');
      });
    });

    describe('parseDateFromInput', () => {
      it('should parse valid date string', () => {
        const result = parseDateFromInput('2024-01-15');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2024);
        expect(result?.getMonth()).toBe(0); // January is 0
        expect(result?.getDate()).toBe(15);
      });

      it('should handle empty string', () => {
        const result = parseDateFromInput('');
        expect(result).toBeNull();
      });

      it('should handle invalid date string', () => {
        const result = parseDateFromInput('invalid-date');
        expect(result).toBeNull();
      });
    });
  });

  describe('extractFormFields', () => {
    it('should extract all form fields', () => {
      const formData = new FormData();
      formData.append('customerId', 'customer-123');
      formData.append('branchId', 'branch-456');
      formData.append('notes', 'Test notes');
      formData.append('status', 'PENDING');
      formData.append('discount', '10');
      formData.append('amountPaid', '100');
      formData.append('paymentMethod', 'CASH');
      formData.append('customInvoiceNumber', 'INV-001');
      formData.append('orderDate', '2024-01-15');
      formData.append('expectedDeliveryDate', '2024-01-20');
      formData.append('items', '[]');

      const result = extractFormFields(formData);
      expect(result).toEqual({
        customerId: 'customer-123',
        branchId: 'branch-456',
        notes: 'Test notes',
        status: 'PENDING',
        discount: '10',
        amountPaid: '100',
        paymentMethod: 'CASH',
        customInvoiceNumber: 'INV-001',
        orderDate: '2024-01-15',
        expectedDeliveryDate: '2024-01-20',
        items: '[]',
      });
    });
  });
});
