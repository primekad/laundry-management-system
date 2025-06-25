import { auth as defaultAuth } from '@/lib/auth';
import type {
  AppUser,
  AssignableRole,
  CreateUserData,
} from './types';

/**
 * Creates a new user.
 */
export async function createUser(
  userData: CreateUserData,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<AppUser> {
  try {
    const result = await auth.api.createUser({ body: userData, headers });
    return result.user as AppUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user.');
  }
}

/**
 * Deletes a user permanently from the database.
 */
export async function deleteUser(
  userId: string,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<void> {
  try {
    await auth.api.removeUser({ body: { userId }, headers });
  } catch (error) {
    console.error(`Error deleting user (${userId}):`, error);
    throw new Error('Failed to delete user.');
  }
}

/**
 * Sets or updates the role(s) for a specific user.
 */
export async function setUserRole(
  userId: string,
  role: AssignableRole | AssignableRole[],
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<AppUser> {
  try {
    const result = await auth.api.setRole({ body: { userId, role }, headers });
    return result.user as AppUser;
  } catch (error) {
    console.error(`Error setting role for user (${userId}):`, error);
    throw new Error('Failed to set user role.');
  }
}

/**
 * Bans a user, preventing them from signing in.
 */
export async function banUser(
  userId: string,
  banReason?: string,
  banExpiresIn?: number,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<AppUser> {
  try {
    const result = await auth.api.banUser({
      body: { userId, banReason, banExpiresIn },
      headers,
    });
    return result.user as AppUser;
  } catch (error) {
    console.error(`Error banning user (${userId}):`, error);
    throw new Error('Failed to ban user.');
  }
}

/**
 * Unbans a user, allowing them to sign in again.
 */
export async function unbanUser(
  userId: string,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<AppUser> {
  try {
    const result = await auth.api.unbanUser({ body: { userId }, headers });
    return result.user as AppUser;
  } catch (error) {
    console.error(`Error unbanning user (${userId}):`, error);
    throw new Error('Failed to unban user.');
  }
}

/**
 * Revokes a specific session for a user.
 */
export async function revokeUserSession(
  sessionToken: string,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<void> {
  try {
    await auth.api.revokeUserSession({ body: { sessionToken }, headers });
  } catch (error) {
    console.error(`Error revoking session (${sessionToken}):`, error);
    throw new Error('Failed to revoke user session.');
  }
}

/**
 * Revokes all active sessions for a user.
 */
export async function revokeAllUserSessions(
  userId: string,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<void> {
  try {
    await auth.api.revokeUserSessions({ body: { userId }, headers });
  } catch (error) {
    console.error(`Error revoking all sessions for user (${userId}):`, error);
    throw new Error('Failed to revoke all user sessions.');
  }
}

/**
 * Allows an admin to start impersonating another user.
 */
export async function impersonateUser(
  userId: string,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<any> {
  try {
    return await auth.api.impersonateUser({ body: { userId }, headers });
  } catch (error) {
    console.error(`Error impersonating user (${userId}):`, error);
    throw new Error('Failed to impersonate user.');
  }
}

/**
 * Stops the current impersonation session.
 */
export async function stopImpersonating(
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<void> {
  try {
    await auth.api.stopImpersonating({ headers });
  } catch (error) {
    console.error('Error stopping impersonation:', error);
    throw new Error('Failed to stop impersonation.');
  }
}
