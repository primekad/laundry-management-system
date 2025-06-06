import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { admin } from "better-auth/plugins";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    // For PostgreSQL, the provider type will be inferred by Prisma 
    // or can be explicitly set if needed, but often not required here
    // provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
  ],
});
