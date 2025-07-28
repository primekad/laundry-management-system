import {beforeEach, describe, expect, it} from 'vitest';
import {getUserByEmail, getUserById, getUsersByRole,} from '@/lib/better-auth-helpers/user-queries-helpers';
import {getBetterAuthOptions} from '@/lib/auth';
import {getTestInstance} from '@better-auth-kit/tests';
import {betterAuth, User} from 'better-auth';
import {join} from 'path';
import Database from 'better-sqlite3';
import {createTestUser, testUsers,} from '@/tests/better-auth-helper-tests/__helpers/seed/seed-helper';

const testDbPath = join(__dirname, './__helpers/test-queries.db');
const baseAuthOptions = getBetterAuthOptions();

const testAuth = betterAuth({
  ...baseAuthOptions,
  database: new Database(testDbPath),
});


describe('User Queries Helper Tests', async () => {
  const { signInWithUser, resetDatabase,client,sessionSetter,testUser,signInWithTestUser } = await getTestInstance(testAuth, {
    shouldRunMigrations: true,
  });
  let signedInHeaders: Headers = new Headers();
  let signedInUser:User = {} as User;

  beforeEach(async () => {
    await resetDatabase();
    // Create a variety of users for testing different roles
    await createTestUser(testAuth, testUsers.admin);
    await createTestUser(testAuth, testUsers.manager);
    await createTestUser(testAuth, testUsers.staff);
    const { headers  } = await signInWithUser(
        testUsers.admin.email,
        testUsers.admin.password,
    );
    signedInHeaders = headers;
  });

  it('should retrieve user by email', async () => {
    const testEmail = testUsers.admin.email;
    // Testing the default auth instance by not passing it
    const user = await getUserByEmail(testEmail, signedInHeaders,testAuth);
    expect(user).toBeDefined();
    expect(user?.email).toBe(testEmail);
  });

  it('should return null for non-existent user by email', async () => {
    const nonExistentEmail = 'nonexistent@example.com';
    const user = await getUserByEmail(nonExistentEmail, signedInHeaders,testAuth);
    expect(user).toBeNull();
  });

  it('should retrieve user by ID', async () => {
    // First, get the user to know their ID
    const foundUser = await getUserByEmail(testUsers.manager.email, signedInHeaders,testAuth);
    expect(foundUser).toBeDefined();

    const userId = foundUser!.id;

    const user = await getUserById(userId, signedInHeaders,testAuth);
    expect(user).toBeDefined();
    expect(user?.id).toBe(userId);
    expect(user?.email).toBe(testUsers.manager.email);
  });

  it('should return null for non-existent user by ID', async () => {
    const nonExistentId = 'non-existent-id';
    const user = await getUserById(nonExistentId, signedInHeaders,testAuth);
    expect(user).toBeNull();
  });

  it('should retrieve users by role', async () => {
    const staffUsers = await getUsersByRole('staff', {}, signedInHeaders,testAuth);
    expect(staffUsers.users.length).toBe(1);
    expect(staffUsers.users[0].email).toBe(testUsers.staff.email);

    const adminUsers = await getUsersByRole('admin', {}, signedInHeaders,testAuth);
    expect(adminUsers.users.length).toBe(1);
    expect(adminUsers.users[0].email).toBe(testUsers.admin.email);
  });
});
