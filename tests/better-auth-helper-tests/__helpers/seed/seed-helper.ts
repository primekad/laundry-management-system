import type { CreateUserData } from '@/lib/better-auth-helpers/types';
import {MAIN_BRANCH_ID} from "@/constants";
import { exec } from 'child_process';
import {Database as BetterSqlite3Database} from 'better-sqlite3';
import { PrismaClient as MainPrisma } from '@prisma/client';
import { PrismaClient as TestPrisma } from '../prisma/client';
import {seedBranchData} from "@/prisma/seed-data";
// A consistent set of test users to be used across all helper tests
export const testUsers: Record<string, CreateUserData> = {
  admin: {
    email: 'admin@test.com',
    password: 'password123',
    name: 'Test Admin',
    role: 'admin',
    defaultBranchId: MAIN_BRANCH_ID,
    assignedBranches: [MAIN_BRANCH_ID],
  },
  manager: {
    email: 'manager@test.com',
    password: 'password123',
    name: 'Test Manager',
    role: 'manager',
    defaultBranchId: MAIN_BRANCH_ID,
    assignedBranches: [MAIN_BRANCH_ID]
  },
  staff: {
    email: 'staff@test.com',
    password: 'password123',
    name: 'Test Staff',
    role: 'staff',
    defaultBranchId: MAIN_BRANCH_ID,
    assignedBranches: [MAIN_BRANCH_ID]
  },
};

/**
 * A type-safe helper to create a user for testing purposes.
 * @param auth - The test auth instance.
 * @param userData - The user data to create.
 */
export async function createTestUser(
  auth: any,
  userData: CreateUserData
) {
  await auth.api.createUser({
    body: userData,
  });
}





export async function seedBranches(prisma:MainPrisma |TestPrisma ) {
      // @ts-ignore
  await  seedBranchData(prisma)
}