/**
 * Represents the shape of a user object from better-auth.
 */
/**
 * Defines the possible roles a user can have.
 */
export type UserRole = "admin" | "manager" | "staff" | "user";

export type AssignableRole = Exclude<UserRole, 'user'>;

/**
 * Represents a set of permissions for checking access control.
 * The key is the resource name (e.g., 'order', 'customer') and the value is an array of actions (e.g., ['create', 'delete']).
 * @example
 * const permissions: Permissions = {
 *   order: ['create', 'update'],
 *   customer: ['list']
 * };
 */
export type Permissions = {
  [resource: string]: string[];
};

/**
 * Interface for the parameters required to check a user's permissions.
 */
export interface CheckUserPermissionParams {
  userId: string;
  permissions: Permissions;
}

export interface AppUser {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: UserRole | UserRole[];
    banned?: boolean;
    [key: string]: any; // Allow other custom fields
}

/**
 * Represents pagination and filtering options for listing users.
 */
export interface ListUsersQuery {
    searchField?: 'email' | 'name';
    searchOperator?: 'contains' | 'starts_with' | 'ends_with';
    searchValue?: string;
    limit?: number;
    offset?: number;
    sortBy?: string; // e.g., 'createdAt'
    sortDirection?: 'asc' | 'desc';
    filterField?: string; // e.g., 'role', 'banned'
    filterOperator?: 'eq' | 'contains';
    filterValue?: string;
}

/**
 * Represents the paginated response for a list of users.
 */
export interface PaginatedUsersResponse {
    users: AppUser[];
    total: number;
    limit?: number;
    offset?: number;
}

/**
 * Represents the data required to create a new user.
 */
export interface CreateUserData {
    name: string;
    email: string;
    password: string; // Password is required for user creation via admin API
    role?: AssignableRole | AssignableRole[];
    defaultBranchId?: string;
    assignedBranches?: string[];
    phoneNumber?: string;
    data?: Record<string, any>;
}


export interface UpdateUserData {
    name?: string;
    email?: string;
    role?: AssignableRole | AssignableRole[];
    defaultBranchId?: string;
    assignedBranches?: string[];
    phoneNumber?: string;
    data?: Record<string, any>;
}