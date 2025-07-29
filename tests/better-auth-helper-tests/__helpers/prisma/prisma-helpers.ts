import { join } from "path";
import {readFileSync} from "fs";
import {writeFileSync} from "node:fs";
import {exec} from "child_process";
import {promisify} from "node:util";
import {seedBranches} from "@/tests/better-auth-helper-tests/__helpers/seed/seed-helper";
import { PrismaClient } from "@prisma/client";

// Create a promise-based version of exec
const execPromise = promisify(exec);

export function createTestSchema():string{
    const originalSchmaPath = join(__dirname, "..","..", "..","..", "prisma", "schema.prisma");
    const testSchemaPath = join(__dirname, "schema-test.prisma")

    //read the original schema file
     const originalSchema = readFileSync(originalSchmaPath, "utf-8");

    // Replace the datasource provider with SQLite
    const testSchema = originalSchema.replace(
        /datasource db \{[\s\S]*?\}/,
        `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`
    ).replace(
        /generator client \{[\s\S]*?\}/,
        `generator client {
  provider = "prisma-client-js"
  output   = "./client"
}`);
    // Write the modified schema to tests folder
    writeFileSync(testSchemaPath, testSchema);
    return testSchemaPath;
}

//run prisma generate
export async function runPrismaGenerate() {
    // 1. Create a reliable, absolute path to the schema file
    const schemaPath = join(
        __dirname, "schema-test.prisma"
    );

    // 2. Use the absolute path in the command
    const command = `npx prisma generate --schema=${schemaPath}`;
    console.log(`Running command: ${command}`);

    try {
        // 3. Await the promise-based command
        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            // Log standard error but don't treat it as a failure
            console.warn(`prisma generate stderr: ${stderr}`);
        }

        console.log(`prisma generate output: ${stdout}`);
        console.log('prisma generate finished successfully');
    } catch (error) {
        // 4. Catch and re-throw actual execution errors
        console.error('prisma generate failed:', error);
        throw error;
    }
}
// run seed script
export function runSeedScript() {
    return new Promise<void>((resolve, reject) => {
        exec('npx prisma db seed', (error, stdout, stderr) => {
            if (error) {
                console.error(`seed error: ${stderr}`);
                return reject(error);
            } else {
                console.log(`seed output: ${stdout}`);
            }
            console.log('seed script finished');
            resolve();
        });
    });
}

export async function setupTestDB(prisma:PrismaClient) {
    createTestSchema();
    await runPrismaGenerate();
    await seedBranches(prisma);
}