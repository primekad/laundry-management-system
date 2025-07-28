import { Role } from '@prisma/client';

/**
 * Centralized role management using Prisma's generated enum
 */

// Export the Prisma Role enum for use throughout the app
export { Role } from '@prisma/client';

// Role values as const array for validation and iteration
export const ROLE_VALUES = [Role.admin, Role.manager, Role.staff] as const;

// Type for role values (same as Prisma Role but explicit)
export type UserRole = Role;

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [Role.admin]: 'Admin',
  [Role.manager]: 'Manager', 
  [Role.staff]: 'Staff',
} as const;

// Role hierarchy for permissions (higher number = more permissions)
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.staff]: 1,
  [Role.manager]: 2,
  [Role.admin]: 3,
} as const;

// Utility functions
export const roleUtils = {
  /**
   * Check if a role has permission level >= required role
   */
  hasPermission: (userRole: Role, requiredRole: Role): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  },

  /**
   * Get display name for a role
   */
  getDisplayName: (role: Role): string => {
    return ROLE_DISPLAY_NAMES[role];
  },

  /**
   * Check if a string is a valid role
   */
  isValidRole: (value: string): value is Role => {
    return ROLE_VALUES.includes(value as Role);
  },

  /**
   * Convert string to Role enum (with validation)
   */
  fromString: (value: string): Role | null => {
    return roleUtils.isValidRole(value) ? value as Role : null;
  },

  /**
   * Get all roles as options for forms/selects
   */
  getOptions: () => ROLE_VALUES.map(role => ({
    value: role,
    label: ROLE_DISPLAY_NAMES[role],
  })),
};

// Default role
export const DEFAULT_ROLE: Role = Role.staff;

// Type guard for role validation
export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && roleUtils.isValidRole(value);
}
