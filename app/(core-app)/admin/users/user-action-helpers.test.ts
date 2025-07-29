import { describe, expect, it } from 'vitest';
import {
  CreateUserSchema,
  UpdateUserSchema,
  validateCreateUserData,
  validateUpdateUserData,
  extractCreateUserData,
  extractUpdateUserData,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  createActionResult,
  extractFormFields,
} from './user-action-helpers';
import { Role } from '@/lib/types/role';

describe('User Action Helpers', () => {
  describe('CreateUserSchema', () => {
    it('should validate valid create user data', () => {
      const validData = {
        firstName: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1234567890',
        role: Role.staff,
        defaultBranchId: 'branch-1',
        secondaryBranchIds: 'branch-2,branch-3',
        password: 'password123',
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        firstName: 'John',
        surname: 'Doe',
        email: 'invalid-email',
        role: Role.staff,
        defaultBranchId: 'branch-1',
        password: 'password123',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email']);
        expect(result.error.issues[0].message).toBe('Please enter a valid email address.');
      }
    });

    it('should reject short first name', () => {
      const invalidData = {
        firstName: 'J',
        surname: 'Doe',
        email: 'john.doe@example.com',
        role: 'Staff' as const,
        defaultBranchId: 'branch-1',
        password: 'password123',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['firstName']);
        expect(result.error.issues[0].message).toBe('First name must be at least 2 characters.');
      }
    });



    it('should reject invalid role', () => {
      const invalidData = {
        firstName: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        role: 'INVALID_ROLE',
        defaultBranchId: 'branch-1',
        password: 'password123',
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['role']);
      }
    });
  });

  describe('UpdateUserSchema', () => {
    it('should validate valid update user data', () => {
      const validData = {
        id: 'user-1',
        firstName: 'John',
        surname: 'Doe',
        phoneNumber: '+1234567890',
        role: 'manager' as const,
        defaultBranchId: 'branch-1',
        secondaryBranchIds: 'branch-2',
        isActive: true,
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should default isActive to true', () => {
      const dataWithoutIsActive = {
        id: 'user-1',
        firstName: 'John',
        surname: 'Doe',
        role: Role.staff,
        defaultBranchId: 'branch-1',
      };

      const result = UpdateUserSchema.safeParse(dataWithoutIsActive);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });
  });

  describe('validateCreateUserData', () => {
    it('should validate form data correctly', () => {
      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('surname', 'Doe');
      formData.append('email', 'john.doe@example.com');
      formData.append('role', 'staff');
      formData.append('defaultBranchId', 'branch-1');

      const result = validateCreateUserData(formData);
      expect(result.success).toBe(true);
    });

    it('should return validation errors for invalid data', () => {
      const formData = new FormData();
      formData.append('firstName', 'J'); // Too short
      formData.append('surname', 'Doe');
      formData.append('email', 'invalid-email');
      formData.append('role', 'staff');
      formData.append('defaultBranchId', 'branch-1');

      const result = validateCreateUserData(formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2); // firstName and email errors only
      }
    });
  });

  describe('extractCreateUserData', () => {
    it('should extract and format user data correctly', () => {
      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('surname', 'Doe');
      formData.append('email', 'john.doe@example.com');
      formData.append('role', 'staff');
      formData.append('phoneNumber', '+1234567890');
      formData.append('defaultBranchId', 'branch-1');
      formData.append('secondaryBranchIds', 'branch-2,branch-3');

      const result = extractCreateUserData(formData);

      expect(result).toMatchObject({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'staff',
        defaultBranchId: 'branch-1',
        assignedBranches: ['branch-2', 'branch-3'],
        data: {
          phoneNumber: '+1234567890',
        },
      });
      // Password should be generated, so just check it exists and is a string
      expect(typeof result.password).toBe('string');
      expect(result.password.length).toBeGreaterThan(0);
    });

    it('should handle missing optional fields', () => {
      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('surname', 'Doe');
      formData.append('email', 'john.doe@example.com');
      formData.append('role', 'staff');
      formData.append('defaultBranchId', 'branch-1');

      const result = extractCreateUserData(formData);

      expect(result).toMatchObject({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'staff',
        defaultBranchId: 'branch-1',
        assignedBranches: [],
        data: {
          phoneNumber: undefined,
        },
      });
      // Password should be generated, so just check it exists and is a string
      expect(typeof result.password).toBe('string');
      expect(result.password.length).toBeGreaterThan(0);
    });
  });

  describe('extractUpdateUserData', () => {
    it('should extract and format update data correctly', () => {
      const formData = new FormData();
      formData.append('firstName', 'Jane');
      formData.append('surname', 'Smith');
      formData.append('role', 'manager');
      formData.append('phoneNumber', '+1234567890');
      formData.append('defaultBranchId', 'branch-2');
      formData.append('secondaryBranchIds', 'branch-1');

      const result = extractUpdateUserData(formData);

      expect(result).toEqual({
        name: 'Jane Smith',
        role: 'manager',
        defaultBranchId: 'branch-2',
        assignedBranches: ['branch-1'],
        data: {
          phoneNumber: '+1234567890',
        },
      });
    });

    it('should handle multiple secondary branches', () => {
      const formData = new FormData();
      formData.append('firstName', 'Jane');
      formData.append('surname', 'Smith');
      formData.append('role', 'manager');
      formData.append('defaultBranchId', 'branch-2');
      formData.append('secondaryBranchIds', 'branch-1,branch-3');

      const result = extractUpdateUserData(formData);

      expect(result.assignedBranches).toEqual(['branch-1', 'branch-3']);
    });
  });

  describe('Response creators', () => {
    describe('createValidationErrorResponse', () => {
      it('should create validation error response', () => {
        const validationResult = {
          error: {
            issues: [
              { path: ['firstName'], message: 'First name is required' }
            ]
          }
        };

        const result = createValidationErrorResponse(validationResult);

        expect(result).toEqual({
          errors: {
            firstName: ['First name is required']
          },
          message: null,
          success: false,
        });
      });
    });

    describe('createFailureResponse', () => {
      it('should create failure response', () => {
        const message = 'User creation failed';
        const fields = {
          firstName: 'John',
          surname: 'Doe',
          role: Role.staff,
          defaultBranchId: 'branch-1'
        };

        const result = createFailureResponse(message, fields);

        expect(result).toEqual({
          message,
          fields,
          errors: { form: [message] },
          success: false,
        });
      });
    });

    describe('createSuccessResponse', () => {
      it('should create success response', () => {
        const message = 'User created successfully';

        const result = createSuccessResponse(message);

        expect(result).toEqual({
          message,
          success: true,
        });
      });
    });

    describe('createActionResult', () => {
      it('should create action result with data', () => {
        const result = createActionResult(true, 'Success', { id: 'user-1' });

        expect(result).toEqual({
          success: true,
          message: 'Success',
          data: { id: 'user-1' },
        });
      });

      it('should create action result without data', () => {
        const result = createActionResult(false, 'Failed');

        expect(result).toEqual({
          success: false,
          message: 'Failed',
          data: undefined,
        });
      });
    });
  });

  describe('extractFormFields', () => {
    it('should extract all form fields with defaults', () => {
      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('email', 'john@example.com');

      const result = extractFormFields(formData);

      expect(result).toEqual({
        firstName: 'John',
        surname: '',
        email: 'john@example.com',
        phoneNumber: '',
        role: '',
        defaultBranchId: '',
        secondaryBranchIds: '',
      });
    });
  });
});
