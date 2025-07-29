#!/usr/bin/env tsx

/**
 * Migration Check Script
 * 
 * This script checks if there are pending migrations and validates
 * the current state of the database schema.
 */

import { execSync } from 'child_process';

function executeCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    throw error;
  }
}

function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');
  try {
    executeCommand('npx prisma db execute --stdin <<< "SELECT 1;"');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed');
    return false;
  }
}

function checkMigrationStatus() {
  console.log('🔍 Checking migration status...');
  try {
    const output = executeCommand('npx prisma migrate status');
    console.log(output);
    
    if (output.includes('Database schema is up to date!')) {
      console.log('✅ All migrations are applied');
      return true;
    } else if (output.includes('Following migration(s) have not yet been applied:')) {
      console.log('⚠️  Pending migrations found');
      return false;
    } else {
      console.log('❓ Unknown migration status');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check migration status');
    return false;
  }
}

function checkSchemaDrift() {
  console.log('🔍 Checking for schema drift...');
  try {
    executeCommand('npx prisma db pull --print');
    console.log('✅ No schema drift detected');
    return true;
  } catch (error) {
    console.error('⚠️  Schema drift detected - database schema differs from Prisma schema');
    return false;
  }
}

async function main() {
  console.log('🗄️  Migration Check Script');
  console.log('===========================');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  let allChecksPass = true;

  // Check database connection
  if (!checkDatabaseConnection()) {
    allChecksPass = false;
  }

  // Check migration status
  if (!checkMigrationStatus()) {
    allChecksPass = false;
  }

  // Check for schema drift
  if (!checkSchemaDrift()) {
    allChecksPass = false;
  }

  console.log('\n📊 Summary:');
  if (allChecksPass) {
    console.log('✅ All checks passed - database is ready');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed - please review and fix issues');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
