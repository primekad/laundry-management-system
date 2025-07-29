import { headers } from 'next/headers';
import {
  getUserById as getUserByIdHelper,
  getUserByEmail as getUserByEmailHelper,
  getUsers as getUsersHelper,
  getUsersByRole as getUsersByRoleHelper,
  getBannedUsers as getBannedUsersHelper,
} from '@/lib/better-auth-helpers/user-queries-helpers';
import type { AppUser, UserRole } from '@/lib/better-auth-helpers/types';

/**
 * Gets a user by their ID
 */
export async function getUserById(userId: string): Promise<AppUser | null> {
  try {
    const headersList = await headers();
    const user = await getUserByIdHelper(userId, headersList);
    return user;
  } catch (error) {
    console.error('Error in getUserById query:', error);
    return null;
  }
}

/**
 * Gets a user by their email address
 */ 
export async function getUserByEmail(email: string): Promise<AppUser | null> {
  try {
    const headersList = await headers();
    const user = await getUserByEmailHelper(email, headersList);
    return user;
  } catch (error) {
    console.error('Error in getUserByEmail query:', error);
    return null;
  }
}

/**
 * Gets all users with optional filtering
 */
export async function getAllUsers(): Promise<AppUser[]> {
  try {
    const headersList = await headers();
    const result = await getUsersHelper({}, headersList);
    return result.users || [];
  } catch (error) {
    console.error('Error in getAllUsers query:', error);
    return [];
  }
}

/**
 * Gets users by role
 */
export async function getUsersByRole(role: UserRole): Promise<AppUser[]> {
  try {
    const headersList = await headers();
    const result = await getUsersByRoleHelper(role, {}, headersList);
    return result.users || [];
  } catch (error) {
    console.error('Error in getUsersByRole query:', error);
    return [];
  }
}

/**
 * Gets active users only (non-banned users)
 */
export async function getActiveUsers(): Promise<AppUser[]> {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => !user.banned);
  } catch (error) {
    console.error('Error in getActiveUsers query:', error);
    return [];
  }
}

/**
 * Gets banned users only
 */
export async function getBannedUsers(): Promise<AppUser[]> {
  try {
    const headersList = await headers();
    const result = await getBannedUsersHelper({}, headersList);
    return result.users || [];
  } catch (error) {
    console.error('Error in getBannedUsers query:', error);
    return [];
  }
}

/**
 * Gets users by branch ID
 */
export async function getUsersByBranch(branchId: string): Promise<AppUser[]> {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => 
      user.defaultBranchId === branchId || 
      (user.secondaryBranchIds && user.secondaryBranchIds.includes(branchId))
    );
  } catch (error) {
    console.error('Error in getUsersByBranch query:', error);
    return [];
  }
}

/**
 * Checks if a user exists by email
 */
export async function userExistsByEmail(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email);
    return user !== null;
  } catch (error) {
    console.error('Error in userExistsByEmail query:', error);
    return false;
  }
}
