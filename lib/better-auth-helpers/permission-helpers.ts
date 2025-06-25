import { auth } from '@/lib/auth';
import { Permissions, UserRole } from './types';
import { getUserById } from './user-queries-helpers';

/**
 * Checks if a user has a specific permission.
 * @param userId - The ID of the user to check.
 * @param permissions - The permission to check for.
 * @param headers - The request headers for authentication.
 * @param authInstance - Optional auth instance to use for the request.
 * @returns A boolean indicating whether the user has the permission.
 */
export async function checkUserPermission(
  userId: string,
  permissions: Permissions,
  headers: Headers,
  authInstance= auth
) {
  try {
    const response = await authInstance.api.userHasPermission(
      {
        body: {
          userId,
          permissions,
        },
        headers,
      }
    );

    if (!response.success) {
      // Log the error or handle it as needed
      console.error('User does not have the required permission:', response.error);
      return false;
    }
    return true;

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return false;
  }
}

/**
 * Checks if a user has a specific role or one of several roles.
 * @param userId - The ID of the user to check.
 * @param role - The role or roles to check for.
 * @param headers - The request headers for authentication.
 * @param authInstance - Optional auth instance to use for the request.
 * @returns A boolean indicating whether the user has the role.
 */
export async function userHasRole(
  userId: string,
  role: UserRole | UserRole[],
  headers: Headers,
  authInstance = auth
) {
  try {
    const user = await getUserById(userId, headers, authInstance);
    if (!user || !user.role) {
      return false;
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const requiredRoles = Array.isArray(role) ? role : [role];

    return requiredRoles.some(r => userRoles.includes(r));
  } catch (error) {
    console.error('An unexpected error occurred while checking user role:', error);
    return false;
  }
}
