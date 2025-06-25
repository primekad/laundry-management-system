import {beforeEach, describe, expect, it} from 'vitest';
import {getBetterAuthOptions} from '@/lib/auth';
import {getTestInstance} from '@better-auth-kit/tests';
import {betterAuth} from 'better-auth';
import {join} from 'path';
import Database from 'better-sqlite3';
import {createTestUser, testUsers,} from '@/tests/better-auth-helper-tests/__helpers/seed/seed-helper';
import {checkUserPermission, userHasRole} from '@/lib/better-auth-helpers/permission-helpers';
import {getUserByEmail} from '@/lib/better-auth-helpers/user-queries-helpers';

const testDbPath = join(__dirname, './__helpers/test.db');
const baseAuthOptions = getBetterAuthOptions(true);

const testAuth = betterAuth({
  ...baseAuthOptions,
  database: new Database(testDbPath),
});

describe('Permission Helper Tests', async () => {
  const { signInWithUser, resetDatabase } = await getTestInstance(testAuth, {
    shouldRunMigrations: true,
  });
  let signedInHeaders: Headers = new Headers();

  beforeEach(async () => {
    await resetDatabase();
    await createTestUser(testAuth, testUsers.admin);
    await createTestUser(testAuth, testUsers.staff);
    await createTestUser(testAuth, testUsers.manager);
    const { headers } = await signInWithUser(
      testUsers.admin.email,
      testUsers.admin.password
    );
    signedInHeaders = headers;
  });

  it('should return true if user has permission', async () => {
    const adminUser = await getUserByEmail(
      testUsers.admin.email,
      signedInHeaders,
      testAuth
    );
    expect(adminUser).toBeDefined();

    const hasPermission = await checkUserPermission(
      adminUser!.id,
      { settings: ['update_pricing'] },
      signedInHeaders,
      testAuth
    );

    expect(hasPermission).toBe(true);
  });

  it('should return false if user does not have permission', async () => {
    const staffUser = await getUserByEmail(
      testUsers.staff.email,
      signedInHeaders,
      testAuth
    );
    expect(staffUser).toBeDefined();

    const hasPermission = await checkUserPermission(
      staffUser!.id,
      { project: ['delete'] }, // Assuming 'staff' role does not have 'delete' permission
      signedInHeaders,
      testAuth
    );

    expect(hasPermission).toBe(false);
  });

  it('should return true if user has the specified role', async () => {
    const adminUser = await getUserByEmail(
      testUsers.admin.email,
      signedInHeaders,
      testAuth
    );
    const hasRole = await userHasRole(
      adminUser!.id,
      'admin',
      signedInHeaders,
      testAuth
    );
    expect(hasRole).toBe(true);
  });

  it('should return false if user does not have the specified role', async () => {
    const staffUser = await getUserByEmail(
      testUsers.staff.email,
      signedInHeaders,
      testAuth
    );
    const hasRole = await userHasRole(
      staffUser!.id,
      'admin',
      signedInHeaders,
      testAuth
    );
    expect(hasRole).toBe(false);
  });

  it('should handle an array of roles', async () => {
    const managerUser = await getUserByEmail(
      testUsers.manager.email,
      signedInHeaders,
      testAuth
    );
    const hasRole = await userHasRole(
      managerUser!.id,
      ['manager', 'staff'],
      signedInHeaders,
      testAuth
    );
    expect(hasRole).toBe(true);
  });
});
