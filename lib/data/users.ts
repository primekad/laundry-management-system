import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';
import {
  getUserById as getUserByIdHelper,
  getUsers,
} from '@/lib/better-auth-helpers/user-queries-helpers';
import type { ListUsersQuery, PaginatedUsersResponse } from '@/lib/better-auth-helpers/types';
import { db } from '@/lib/db';
import type { User } from '@/lib/definitions';

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export async function fetchUsers(params: FetchUsersParams = {}): Promise<{
  users: User[];
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
}> {
  noStore();
  try {
    console.log('Fetching users with params:', params);
    const headersList = await headers();
    
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortDirection = 'desc'
    } = params;
    
    // Build query for better-auth helpers
    const query: ListUsersQuery = {
      limit,
      offset: (page - 1) * limit,
      sortBy,
      sortDirection,
    };
    
    // Add search functionality - search in name field
    if (search && search.trim()) {
      query.searchField = 'name';
      query.searchOperator = 'contains';
      query.searchValue = search.trim();
    }
    
    // Add role filtering
    if (role && role !== 'all') {
      query.filterField = 'role';
      query.filterOperator = 'eq';
      query.filterValue = role.toUpperCase(); // Convert to uppercase for better-auth
    }
    
    const result = await getUsers(query, headersList);
    
    // Enrich AppUser data with branch relationships from Prisma
    let enrichedUsers = await Promise.all(
      result.users.map(async (appUser) => {
        const prismaUser = await db.user.findUnique({
          where: { id: appUser.id },
          include: {
            defaultBranch: true,
            assignedBranches: true,
          },
        });
        
        if (!prismaUser) {
          throw new Error(`User with id ${appUser.id} not found in database`);
        }
        
        return prismaUser;
      })
    );
    
    // Apply additional filtering that better-auth doesn't support
    let filteredUsers = enrichedUsers;
    let filteredTotal = result.total;
    
    // Filter by status (active/inactive) - this needs to be done client-side
    if (status && status !== 'all') {
      const isActiveFilter = status === 'active';
      filteredUsers = enrichedUsers.filter(user => user.isActive === isActiveFilter);
      filteredTotal = filteredUsers.length;
    }
    
    // Apply email search if no results from name search
    if (search && search.trim() && filteredUsers.length === 0) {
      // Try searching by email
      const emailQuery: ListUsersQuery = {
        ...query,
        searchField: 'email',
        searchOperator: 'contains',
        searchValue: search.trim(),
      };
      
      const emailResult = await getUsers(emailQuery, headersList);
      
      if (emailResult.users.length > 0) {
        const emailEnrichedUsers = await Promise.all(
          emailResult.users.map(async (appUser) => {
            const prismaUser = await db.user.findUnique({
              where: { id: appUser.id },
              include: {
                defaultBranch: true,
                assignedBranches: true,
              },
            });
            
            if (!prismaUser) {
              throw new Error(`User with id ${appUser.id} not found in database`);
            }
            
            return prismaUser;
          })
        );
        
        filteredUsers = emailEnrichedUsers;
        filteredTotal = emailResult.total;
        
        // Apply status filter to email results too
        if (status && status !== 'all') {
          const isActiveFilter = status === 'active';
          filteredUsers = emailEnrichedUsers.filter(user => user.isActive === isActiveFilter);
          filteredTotal = filteredUsers.length;
        }
      }
    }
    
    const totalPages = Math.ceil(filteredTotal / limit);
    
    console.log('Fetched users:', filteredUsers.length, 'of', filteredTotal);
    return {
      users: filteredUsers,
      total: filteredTotal,
      limit,
      offset: (page - 1) * limit,
      page,
      totalPages,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchUserById(id: string): Promise<User | null> {
  noStore();
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        defaultBranch: true,
        assignedBranches: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}
