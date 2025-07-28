import { auth as defaultAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  AppUser,
  AssignableRole,
  CreateUserData, UpdateUserData,
} from './types';
import {getUserByEmail, getUserById} from './user-queries-helpers';

import {LoginSchema} from "@/app/(auth)/auth-schemas";

/**
 * Creates a new user.
 */
export async function createUser(
  userData: CreateUserData,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<AppUser> {
  try {
    // Create user with better-auth API (without branch relationships)
    const result = await auth.api.createUser({ body: userData, headers });
    return result.user as AppUser;
  } catch (error) {
    console.error('Error creating user with better-auth:', error);
    throw new Error('Failed to create user.');
  }
}


/**
 * Updates an existing user.
 */
export async function updateUser(
  userId: string,
  userData: UpdateUserData,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<AppUser> {
  try {
    console.log('Updating user with better-auth:', { userId, userData });
    
    // Extract branch data before updating user (better-auth doesn't handle relationships)
    const { assignedBranches, defaultBranchId, ...userDataWithoutBranches } = userData.data || {};
    const cleanUserData = {
      name: userData.name,
      email: userData.email,
      role: Array.isArray(userData.role) ? userData.role[0] : userData.role, // Ensure single role
      data: userDataWithoutBranches
    };
    
    // Update user with better-auth API (without branch relationships)
    const result = await auth.api.updateUser(
        {body: cleanUserData, headers }
    );
    
    // Get the updated user since the API response structure varies
    return await getUserById(userId, headers, auth) as AppUser;

  } catch (error) {
    console.error(`Error updating user with better-auth (${userId}):`, error);
    throw new Error('Failed to update user.');
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

type signInUserResponse = ReturnType<typeof defaultAuth.api.signInEmail>;

export async function loginUser(
  email: string,
  password: string,
  rememberMe?: boolean,
  auth = defaultAuth
): Promise<signInUserResponse> {
  try {
    return await auth.api.signInEmail({ body: { email, password, rememberMe } });
  } catch (error) {
    console.error(`Error logging in user (${email}):`, error);
    throw error;
  }
}

/**
 * Requests a password reset for a user.
 * @param email - User's email address
 * @param resetType - Type of reset: 'fgp' (forgot password), 'newusr' (new user), 'admreq' (admin request)
 * @param auth - Auth instance
 * TODO: Write tests for this function.
 */
export async function requestPasswordReset(
  email: string,
  resetType: 'fgp' | 'newusr' | 'admreq' = 'fgp',
  auth = defaultAuth
): Promise<void> {
  try {
    // Build redirectTo URL with reset type parameter
    const baseUrl = '/reset-password';
    const redirectTo = resetType === 'fgp' ? baseUrl : `${baseUrl}?typ=${resetType}`;
    
    await auth.api.forgetPassword({
      body: {
        email,
        redirectTo
      }
    });
  } catch (error) {
    console.error(`Error requesting password reset for user (${email}):`, error);
    throw error;
  }
}

/**
 * Resets a user's password using a reset token.
 * TODO: Write tests for this function.
 */
export async function resetPassword(
  newPassword: string,
  token: string,
  auth = defaultAuth
): Promise<void> {
  try {
    await auth.api.resetPassword({
      body: {
        newPassword,
        token
      }
    });
  } catch (error) {
    console.error(`Error resetting password with token:`, error);
    throw error;
  }
}