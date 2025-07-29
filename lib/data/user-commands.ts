import { headers } from 'next/headers';
import { db } from '@/lib/db';
import {
  createUser as createUserHelper,
  updateUser as updateUserHelper,
  deleteUser as deleteUserHelper,
  setUserRole,
  banUser,
  unbanUser,
  requestPasswordReset,
} from '@/lib/better-auth-helpers/user-commands-helpers';
import { getUserById } from '@/lib/better-auth-helpers/user-queries-helpers';
import type { CreateUserData, UpdateUserData, AppUser } from '@/lib/better-auth-helpers/types';

/**
 * Creates a new user with the provided data and handles branch relationships
 */
export async function createUser(userData: CreateUserData): Promise<AppUser> {
  try {
    const headersList = await headers();
    
    // Step 1: Create user with better-auth (without branch relationships)
    const createdUser = await createUserHelper(userData, headersList);
    
    // Step 2: Handle branch relationships with Prisma
    const { assignedBranches, defaultBranchId } = userData || {};
    if (assignedBranches && assignedBranches.length > 0) {
      await db.user.update({
        where: { id: createdUser.id },
        data: {
          defaultBranchId: defaultBranchId || null,
          assignedBranches: {
            connect: assignedBranches.map((id: string) => ({ id }))
          }
        }
      });
    }
    
    // Step 3: Return the user with branch relationships loaded
    return await getUserById(createdUser.id, headersList) as AppUser;
  } catch (error) {
    console.error('Error in createUser command:', error);
    throw new Error('Failed to create user. Please try again.');
  }
}

/**
 * Updates an existing user and handles branch relationships
 */
export async function updateUser(userId: string, userData: UpdateUserData): Promise<AppUser> {
  try {
    const headersList = await headers();
    
    // Step 1: Update user with better-auth (without branch relationships)
    await updateUserHelper(userId, userData, headersList);
    
    // Step 2: Handle branch relationships with Prisma
    const { assignedBranches, defaultBranchId } = userData || {};

    if (assignedBranches !== undefined) {
      // First disconnect all existing branches, then connect the new ones
      await db.user.update({
        where: { id: userId },
        data: {
          defaultBranchId: defaultBranchId || null,
          assignedBranches: {
            set: [], // Clear existing relationships
            connect: assignedBranches.length > 0 ? assignedBranches.map((id: string) => ({ id })) : []
          }
        }
      });
    }
    
    // Step 3: Return the user with branch relationships loaded
    return await getUserById(userId, headersList) as AppUser;
  } catch (error) {
    console.error('Error in updateUser command:', error);
    throw new Error('Failed to update user. Please try again.');
  }
}

/**
 * Deletes a user (soft delete by deactivating)
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const headersList = await headers();
    await deleteUserHelper(userId, headersList);
    return {
      success: true,
      message: 'User deleted successfully.',
    };
  } catch (error) {
    console.error('Error in deleteUser command:', error);
    return {
      success: false,
      message: 'Failed to delete user. Please try again.',
    };
  }
}

/**
 * Reactivates a previously deleted/deactivated user
 */
export async function reactivateUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const headersList = await headers();
    await unbanUser(userId, headersList);
    return {
      success: true,
      message: 'User reactivated successfully.',
    };
  } catch (error) {
    console.error('Error in reactivateUser command:', error);
    return {
      success: false,
      message: 'Failed to reactivate user. Please try again.',
    };
  }
}

/**
 * Updates a user's role
 */
export async function updateUserRole(
  userId: string, 
  role: 'admin' | 'manager' | 'staff'
): Promise<AppUser> {
  try {
    const headersList = await headers();
    const result = await setUserRole(userId, role, headersList);
    return result;
  } catch (error) {
    console.error('Error in updateUserRole command:', error);
    throw new Error('Failed to update user role. Please try again.');
  }
}

/**
 * Bans a user
 */
export async function banUserAccount(
  userId: string, 
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const headersList = await headers();
    await banUser(userId, reason, undefined, headersList);
    return {
      success: true,
      message: 'User banned successfully.',
    };
  } catch (error) {
    console.error('Error in banUserAccount command:', error);
    return {
      success: false,
      message: 'Failed to ban user. Please try again.',
    };
  }
}

/**
 * Unbans a user
 */
export async function unbanUserAccount(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const headersList = await headers();
    await unbanUser(userId, headersList);
    return {
      success: true,
      message: 'User unbanned successfully.',
    };
  } catch (error) {
    console.error('Error in unbanUserAccount command:', error);
    return {
      success: false,
      message: 'Failed to unban user. Please try again.',
    };
  }
}

/**
 * Triggers a password reset for a user
 * @param userId - The user's ID
 * @param resetType - The type of reset: 'fgp' (forgot password), 'newusr' (new user), 'admreq' (admin request)
 */
export async function triggerPasswordReset(
  userId: string, 
  resetType: 'fgp' | 'newusr' | 'admreq' = 'fgp'
): Promise<{ success: boolean; message: string }> {
  try {
    const headersList = await headers();
    
    // Get the user's email using the better-auth helper
    const user = await getUserById(userId, headersList);
    
    if (!user?.email) {
      return {
        success: false,
        message: 'User not found or email not available.',
      };
    }

    // Pass the reset type to the requestPasswordReset function
    await requestPasswordReset(user.email, resetType);
    return {
      success: true,
      message: 'Password reset email sent successfully.',
    };
  } catch (error) {
    console.error('Error in triggerPasswordReset command:', error);
    return {
      success: false,
      message: 'Failed to send password reset email. Please try again.',
    };
  }
}
