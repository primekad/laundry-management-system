import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Defines the resources and the actions that can be performed on them.
 * We merge our custom statements with the default ones provided by better-auth (user, session).
 * Using `as const` ensures TypeScript infers the types correctly.
 */
export const statements = {
  ...defaultStatements,
  order: ['create', 'read', 'update', 'delete', 'list', 'change_status'],
  customer: ['create', 'read', 'update', 'delete', 'list'],
  payment: ['create', 'read', 'update', 'delete', 'list'],
  expense: ['create', 'read', 'update', 'delete', 'list'],
  report: ['view', 'export'],
  settings: ['update_pricing', 'update_branch'],
} as const;

// Create the access control instance
export const ac = createAccessControl(statements);

// --- Define Roles and Their Permissions ---

/**
 * Default user role with no specific permissions.
 */
export const user = ac.newRole({});

/**
 * Staff role: Can manage day-to-day laundry operations.
 */
export const staff = ac.newRole({
  order: ['create', 'read', 'update', 'list', 'change_status'],
  customer: ['create', 'read', 'update', 'list'],
  payment: ['create', 'read', 'update', 'list'],
});

/**
 * Manager role: Has all staff permissions plus access to financial data and reports.
 */
export const manager = ac.newRole({
  ...staff.statements,
  order: [...staff.statements.order, 'delete'],
  customer: [...staff.statements.customer, 'delete'],
  expense: ['create', 'read', 'update', 'delete', 'list'],
  report: ['view', 'export'],
});

/**
 * Admin role: Full system access.
 * Inherits all default admin permissions from better-auth and all manager permissions.
 */
export const admin = ac.newRole({
  ...adminAc.statements, // Default admin permissions (user management, etc.)
  ...manager.statements, // All manager permissions
  settings: ['update_pricing', 'update_branch'], // Additional admin-only settings
});
