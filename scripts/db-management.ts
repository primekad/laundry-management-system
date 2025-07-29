#!/usr/bin/env tsx

/**
 * Database Management Script
 * 
 * This script provides utilities for managing the database in different environments.
 * It can be used locally or in CI/CD pipelines.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const COMMANDS = {
  generate: 'npx prisma generate',
  push: 'npx prisma db push',
  migrate: 'npx prisma migrate deploy',
  migrateDev: 'npx prisma migrate dev',
  reset: 'npx prisma migrate reset --force',
  seed: 'npx prisma db seed',
  status: 'npx prisma migrate status',
  studio: 'npx prisma studio',
  setup: 'npx prisma migrate deploy && npx prisma db seed',
  ci: 'npx prisma generate && npx prisma db push',
} as const;

type Command = keyof typeof COMMANDS;

function executeCommand(command: string, description: string) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error);
    process.exit(1);
  }
}

function checkDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  console.log('✅ DATABASE_URL is configured');
}

function checkPrismaSchema() {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (!existsSync(schemaPath)) {
    console.error('❌ Prisma schema not found at prisma/schema.prisma');
    process.exit(1);
  }
  console.log('✅ Prisma schema found');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] as Command;

  console.log('🗄️  Database Management Script');
  console.log('================================');

  // Check prerequisites
  checkPrismaSchema();
  checkDatabaseUrl();

  switch (command) {
    case 'generate':
      executeCommand(COMMANDS.generate, 'Generating Prisma client');
      break;

    case 'push':
      executeCommand(COMMANDS.generate, 'Generating Prisma client');
      executeCommand(COMMANDS.push, 'Pushing database schema');
      break;

    case 'migrate':
      executeCommand(COMMANDS.generate, 'Generating Prisma client');
      executeCommand(COMMANDS.migrate, 'Running database migrations');
      break;

    case 'migrateDev':
      executeCommand(COMMANDS.generate, 'Generating Prisma client');
      executeCommand(COMMANDS.migrateDev, 'Running development migrations');
      break;

    case 'reset':
      console.log('⚠️  This will reset your database and delete all data!');
      executeCommand(COMMANDS.reset, 'Resetting database');
      break;

    case 'seed':
      executeCommand(COMMANDS.generate, 'Generating Prisma client');
      executeCommand(COMMANDS.seed, 'Seeding database');
      break;

    case 'status':
      executeCommand(COMMANDS.status, 'Checking migration status');
      break;

    case 'studio':
      executeCommand(COMMANDS.studio, 'Opening Prisma Studio');
      break;

    case 'setup':
      // Full setup for new environments
      executeCommand(COMMANDS.generate, 'Generating Prisma client');
      executeCommand(COMMANDS.migrate, 'Running database migrations');
      executeCommand(COMMANDS.seed, 'Seeding database');
      console.log('🎉 Database setup completed!');
      break;

    case 'ci':
      // CI-specific setup
      executeCommand(COMMANDS.generate, 'Generating Prisma client');
      executeCommand(COMMANDS.push, 'Pushing database schema');
      console.log('🎉 CI database setup completed!');
      break;

    default:
      console.log('Usage: tsx scripts/db-management.ts <command>');
      console.log('\nAvailable commands:');
      console.log('  generate    - Generate Prisma client');
      console.log('  push        - Push schema to database (for development)');
      console.log('  migrate     - Run production migrations');
      console.log('  migrateDev  - Run development migrations');
      console.log('  reset       - Reset database (WARNING: deletes all data)');
      console.log('  seed        - Seed database with initial data');
      console.log('  status      - Check migration status');
      console.log('  studio      - Open Prisma Studio');
      console.log('  setup       - Full setup (migrate + seed)');
      console.log('  ci          - CI setup (generate + push)');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
