import {beforeEach,afterEach, describe, expect, it} from 'vitest';
import {getBetterAuthOptions} from '@/lib/auth';
import {getTestInstance} from '@better-auth-kit/tests';
import {betterAuth} from 'better-auth';
import {join} from 'path';
import Database from 'better-sqlite3';
import {PrismaClient} from './__helpers/prisma/client';
import {
  createTestUser,
  seedBranches,
  testUsers,
} from '@/tests/better-auth-helper-tests/__helpers/seed/seed-helper';
import {getUserByEmail} from '@/lib/better-auth-helpers/user-queries-helpers';
import {
  banUser,
  createUser,
  deleteUser, loginUser,
  setUserRole,
  unbanUser,
} from '@/lib/better-auth-helpers/user-commands-helpers';
import {AppUser} from "@/lib/better-auth-helpers/types";



const testDbPath = join(__dirname, './__helpers/test-commands.db');
const baseAuthOptions = getBetterAuthOptions();

const testAuth = betterAuth({
  ...baseAuthOptions,
    database: new Database(testDbPath),
  plugins: [baseAuthOptions.plugins[0]]
});

describe('User Commands Helper Tests', async () => {
  const { signInWithUser, resetDatabase } = await getTestInstance(testAuth, {
    shouldRunMigrations: true,
  });


  let signedInHeaders: Headers = new Headers();

  beforeEach(async () => {

    await resetDatabase();
    await createTestUser(testAuth, testUsers.admin);
    const { headers } = await signInWithUser(
      testUsers.admin.email,
      testUsers.admin.password,
    );
    signedInHeaders = headers;
  });

  it('should create a new user', async () => {
    const newUser = testUsers.staff;
    await createUser(newUser, signedInHeaders,testAuth);

    const fetchedUser = await getUserByEmail(newUser.email, signedInHeaders,testAuth);
    expect(fetchedUser).toBeDefined();
    expect(fetchedUser?.email).toBe(newUser.email);
    expect(fetchedUser?.name).toBe(newUser.name);
  });

  it('should delete a user', async () => {
    const userToDelete = testUsers.manager;
    await createUser(userToDelete, signedInHeaders,testAuth);

    let fetchedUser = await getUserByEmail(userToDelete.email, signedInHeaders,testAuth);
    expect(fetchedUser).toBeDefined();

    await deleteUser(fetchedUser!.id, signedInHeaders,testAuth);

    fetchedUser = await getUserByEmail(userToDelete.email, signedInHeaders,testAuth);
    expect(fetchedUser).toBeNull();
  });

  it('should set a user role', async () => {
    const userToModify = testUsers.staff;
    await createUser(userToModify, signedInHeaders,testAuth);

    let fetchedUser = await getUserByEmail(userToModify.email, signedInHeaders,testAuth);
    expect(fetchedUser).toBeDefined();
    // Role can be a string or an array of strings, so we check for inclusion.
    const roles = Array.isArray(fetchedUser?.role) ? fetchedUser?.role : [fetchedUser?.role];
    expect(roles).toContain('staff');

    await setUserRole(fetchedUser!.id, 'manager', signedInHeaders,testAuth);

    fetchedUser = await getUserByEmail(userToModify.email, signedInHeaders,testAuth);
    const newRoles = Array.isArray(fetchedUser?.role) ? fetchedUser?.role : [fetchedUser?.role];
    expect(newRoles).toContain('manager');
    expect(newRoles).not.toContain('staff');
  });

  it('should ban and unban a user', async () => {
    const userToBan = testUsers.manager;
    await createUser(userToBan, signedInHeaders,testAuth);

    let fetchedUser = await getUserByEmail(userToBan.email, signedInHeaders,testAuth);
    expect(fetchedUser).toBeDefined();
    expect(fetchedUser?.banned).not.toBe(true);

    // Ban the user
    await banUser(fetchedUser!.id, 'Test ban', undefined, signedInHeaders,testAuth);
    fetchedUser = await getUserByEmail(userToBan.email, signedInHeaders,testAuth);
    expect(fetchedUser?.banned).toBe(true);

    // Unban the user
    await unbanUser(fetchedUser!.id, signedInHeaders,testAuth);
    fetchedUser = await getUserByEmail(userToBan.email, signedInHeaders,testAuth);
    expect(fetchedUser?.banned).toBe(false);
  });

  it("should login a user", async () => {
    const userToLogin = testUsers.manager;
    await createUser(userToLogin, signedInHeaders, testAuth);

    let fetchedUser = await getUserByEmail(userToLogin.email, signedInHeaders, testAuth) as AppUser;

    const {user} = await loginUser(userToLogin.email, userToLogin.password, false, testAuth);

    expect(user?.email).toBe(userToLogin.email);
  });

});
