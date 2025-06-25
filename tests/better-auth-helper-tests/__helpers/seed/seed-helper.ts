import type { CreateUserData } from '@/lib/better-auth-helpers/types';

// A consistent set of test users to be used across all helper tests
export const testUsers: Record<string, CreateUserData> = {
  admin: {
    email: 'admin@test.com',
    password: 'password123',
    name: 'Test Admin',
    role: 'admin',
  },
  manager: {
    email: 'manager@test.com',
    password: 'password123',
    name: 'Test Manager',
    role: 'manager',
  },
  staff: {
    email: 'staff@test.com',
    password: 'password123',
    name: 'Test Staff',
    role: 'staff',
  },
};

/**
 * A type-safe helper to create a user for testing purposes.
 * @param auth - The test auth instance.
 * @param userData - The user data to create.
 */
export async function createTestUser(
  auth: any,
  userData: CreateUserData
) {
  await auth.api.createUser({
    body: userData,
  });
}