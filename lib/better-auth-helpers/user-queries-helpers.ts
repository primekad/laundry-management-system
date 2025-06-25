
import { auth as defaultAuth } from '@/lib/auth';
import type {
  AppUser,
  CheckUserPermissionParams,
  ListUsersQuery,
  PaginatedUsersResponse,
  UserRole,
} from './types';

/**
 * Fetches a list of users with optional pagination, sorting, and filtering.
 */
export async function getUsers(
  query: ListUsersQuery = {},
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<PaginatedUsersResponse> {
  try {
    const result = await auth.api.listUsers({ query, headers });
    return result as PaginatedUsersResponse;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users.');
  }
}

/**
 * Finds a single user by their email address.
 */
export async function getUserByEmail(
  email: string,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<AppUser | null> {
  try {
    const { users } = await getUsers(
      {
        searchField: 'email',
        searchOperator: 'contains',
        searchValue: email,
        limit: 1,
      },
      headers,
      auth
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error(`Error fetching user by email (${email}):`, error);
    throw new Error('Failed to fetch user by email.');
  }
}

/**
 * Fetches a single user by their ID.
 */
export async function getUserById(
  id: string,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<AppUser | null> {
  try {
    const { users } = await getUsers(
      {
        filterField: 'id',
        filterOperator: 'eq',
        filterValue: id,
        limit: 1,
      },
      headers,
      auth
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error(`Error fetching user by ID (${id}):`, error);
    throw new Error('Failed to fetch user by ID.');
  }
}

/**
 * Fetches all users assigned a specific role.
 */
export async function getUsersByRole(
  role: UserRole,
  queryOptions: Omit<
    ListUsersQuery,
    'filterField' | 'filterOperator' | 'filterValue'
  > = {},
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<PaginatedUsersResponse> {
  try {
    const query: ListUsersQuery = {
      ...queryOptions,
      filterField: 'role',
      filterOperator: 'eq',
      filterValue: role,
    };
    return await getUsers(query, headers, auth);
  } catch (error) {
    console.error(`Error fetching users by role (${role}):`, error);
    throw new Error('Failed to fetch users by role.');
  }
}

/**
 * Fetches all users who are currently banned.
 */
export async function getBannedUsers(
  queryOptions: Omit<
    ListUsersQuery,
    'filterField' | 'filterOperator' | 'filterValue'
  > = {},
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<PaginatedUsersResponse> {
  try {
    const query: ListUsersQuery = {
      ...queryOptions,
      filterField: 'isBanned',
      filterOperator: 'eq',
      filterValue: 'true',
    };
    return await getUsers(query, headers, auth);
  } catch (error) {
    console.error('Error fetching banned users:', error);
    throw new Error('Failed to fetch banned users.');
  }
}

/**
 * Lists all active sessions for a given user.
 */
export const listUserSessions = async (
  userId: string,
  headers?: HeadersInit,
  auth = defaultAuth
): Promise<any[]> => {
  try {
    const sessions = await auth.api.listSessions({
      query: { userId },
      headers: headers || new Headers(),
    });
    return sessions;
  } catch (error) {
    console.error(`Error listing sessions for user (${userId}):`, error);
    throw new Error('An unexpected error occurred while listing user sessions.');
  }
};