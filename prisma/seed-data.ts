import {MAIN_BRANCH_ID} from "@/constants";
import { PrismaClient } from "@prisma/client";

export async function seedBranchData(prisma:PrismaClient) {
    const mainBranch = await prisma.branch.upsert({
        where: {  name: "Main"},
        update: {},
        create: {
            id: MAIN_BRANCH_ID,
            name: "Main",
            address: "Main Branch",
            phone: "0241234567",
            createdAt: new Date(),
        }
    });
    console.log({ mainBranch })
}