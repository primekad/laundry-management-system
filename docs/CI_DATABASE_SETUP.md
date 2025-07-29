# CI Database Migration Setup

This document explains the database migration setup that has been added to your CI/CD pipeline.

## What Was Added

### 1. Package.json Scripts

New database management scripts have been added:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:reset": "prisma migrate reset --force",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:setup": "tsx scripts/db-management.ts setup",
    "db:ci": "tsx scripts/db-management.ts ci",
    "db:status": "tsx scripts/db-management.ts status",
    "db:check": "tsx scripts/check-migrations.ts"
  }
}
```

### 2. GitHub Actions Workflows

#### Updated CI Workflow (`.github/workflows/ci.yml`)
- **Added PostgreSQL service** for testing
- **Database setup** before running tests
- **Environment variables** for database connection
- **Migration execution** as part of CI

#### New Migration Workflow (`.github/workflows/migrate.yml`)
- **Manual trigger** for running migrations
- **Environment selection** (production/staging/development)
- **Migration verification** after execution

#### New Seeding Workflow (`.github/workflows/seed.yml`)
- **Manual trigger** for database seeding
- **Force option** to reset data before seeding
- **Environment selection**

#### New Deploy Workflow (`.github/workflows/deploy.yml`)
- **Complete deployment pipeline**
- **Test → Migrate → Deploy** sequence
- **Environment-specific deployments**

### 3. Management Scripts

#### Database Management Script (`scripts/db-management.ts`)
- **Unified interface** for all database operations
- **Environment validation**
- **Error handling and logging**
- **CI-specific operations**

#### Migration Check Script (`scripts/check-migrations.ts`)
- **Database connection validation**
- **Migration status checking**
- **Schema drift detection**
- **Pre-deployment verification**

### 4. Documentation

- **Database Management Guide** (`docs/DATABASE_MANAGEMENT.md`)
- **CI Database Setup** (this document)

## How It Works

### CI Pipeline Flow

1. **Code Push/PR** → Triggers CI workflow
2. **PostgreSQL Service** → Starts temporary database
3. **Dependencies** → Install packages
4. **Database Setup** → Generate client + push schema
5. **Type Checking** → Verify TypeScript
6. **Linting** → Check code quality
7. **Tests** → Run with real database
8. **Build** → Verify application builds

### Production Deployment Flow

1. **Code Merge** → Triggers deploy workflow
2. **Test Phase** → Run full CI pipeline
3. **Migration Phase** → Apply database migrations
4. **Deploy Phase** → Deploy application

### Manual Operations

- **Run Migrations**: Use migration workflow
- **Seed Database**: Use seeding workflow
- **Check Status**: Use management scripts

## Environment Variables

### Required for CI

```bash
# Automatically set by CI
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db
NEXTAUTH_SECRET=test-secret-for-ci
NEXTAUTH_URL=http://localhost:3000
```

### Required for Production

Set these as GitHub Secrets:

```bash
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=your-production-url
```

## Usage Examples

### Local Development

```bash
# Initial setup
pnpm db:setup

# Daily development
pnpm db:migrate:dev
pnpm dev

# Reset when needed
pnpm db:reset
```

### CI/CD Operations

```bash
# Check migration status
pnpm db:check

# CI database setup
pnpm db:ci

# Production migration
pnpm db:migrate
```

### Manual Workflows

1. **Run Migration**:
   - Go to Actions tab
   - Select "Database Migration"
   - Choose environment
   - Run workflow

2. **Seed Database**:
   - Go to Actions tab
   - Select "Database Seeding"
   - Choose environment and options
   - Run workflow

## Benefits

### For Development
- **Consistent database state** across environments
- **Automated testing** with real database
- **Easy local setup** with single command

### For CI/CD
- **Reliable migrations** in pipeline
- **Database validation** before deployment
- **Environment isolation** for testing

### For Production
- **Safe migration process** with verification
- **Rollback capabilities** if needed
- **Monitoring and status checking**

## Best Practices

### Migration Safety
1. **Test locally** before pushing
2. **Review generated SQL** in migrations
3. **Backup database** before major changes
4. **Monitor application** after deployment

### CI/CD Safety
1. **Use temporary databases** for testing
2. **Validate migrations** before applying
3. **Check status** after operations
4. **Have rollback plan** ready

### Development Workflow
1. **Make schema changes** in Prisma schema
2. **Generate migration** with descriptive name
3. **Test migration** locally
4. **Commit both schema and migration**
5. **Push and let CI validate**

## Troubleshooting

### Common Issues

**CI fails with database errors:**
- Check DATABASE_URL format
- Verify PostgreSQL service is running
- Check migration files are committed

**Migration fails in production:**
- Check database connectivity
- Verify migration status
- Review migration SQL for issues

**Tests fail with database errors:**
- Ensure test database is clean
- Check for schema drift
- Verify seed data is correct

### Recovery Steps

1. **Check status**: `pnpm db:status`
2. **Verify connection**: `pnpm db:check`
3. **Review logs**: Check GitHub Actions logs
4. **Manual intervention**: Use management scripts
5. **Rollback if needed**: Reset to last known good state

## Next Steps

1. **Set up production database** with proper credentials
2. **Configure GitHub Secrets** for production environment
3. **Test migration workflow** in staging environment
4. **Set up monitoring** for database operations
5. **Train team** on new workflows and commands

## Support

For issues with database migrations:

1. Check this documentation
2. Review GitHub Actions logs
3. Use management scripts for diagnosis
4. Contact development team for assistance
