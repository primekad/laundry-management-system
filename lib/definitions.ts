import { User as PrismaUser, Branch as PrismaBranch } from '@prisma/client';

export type User = PrismaUser & {
  defaultBranch: PrismaBranch | null;
  assignedBranches: PrismaBranch[];
};

export type Branch = PrismaBranch;

