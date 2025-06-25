import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';
import {
  getUsers as getUsersHelper,
  getUserById as getUserByIdHelper,
} from '@/lib/better-auth-helpers/user-queries-helpers';
import { db } from '@/lib/db';

export async function fetchUsers() {
  noStore();
  try {
    console.log('Fetching users...');
    // The helper function returns a paginated response. We extract the users array.
    // Sorting by creation date is often a default or can be passed as a query param.
    const requestHeaders = await headers();
    const { users } = await getUsersHelper(
      { sortBy: 'created_at', sortDirection: 'desc' },
        requestHeaders,
    );
    console.log('Fetched users:', users.length);
    return users;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchUserById(id: string) {
  noStore();
  try {
    // The helper function should handle fetching related data like assignedBranches.
    const requestHeaders = await headers();
    const user = await getUserByIdHelper(id, requestHeaders);
    return user;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchBranches() {
  noStore();
  try {
    console.log('Fetching branches...');
    const branches = await db.branch.findMany({
      orderBy: {
        name: 'asc',
      },
    });
        console.log('Fetched branches:', branches.length);
        return branches;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch branches.');
    }
}
