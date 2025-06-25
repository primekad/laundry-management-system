import { join } from "path";
import {readFileSync} from "fs";
import {writeFileSync} from "node:fs";

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