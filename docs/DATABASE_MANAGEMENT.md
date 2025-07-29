# Database Management

This document outlines how to manage database migrations and operations in different environments.

## Overview

The project uses Prisma as the ORM and PostgreSQL as the database. Database management is handled through:

1. **Prisma CLI commands** - Direct database operations
2. **npm scripts** - Convenient shortcuts
3. **GitHub Actions workflows** - Automated CI/CD operations
4. **Management script** - Advanced operations

## Quick Start

### Local Development

```bash
# Initial setup
pnpm db:setup

# Daily development
pnpm db:migrate:dev
pnpm db:seed
```

### Production Deployment

```bash
# Run migrations
pnpm db:migrate

# Check status
pnpm db:status
```

## Available Commands

### npm Scripts

| Command | Description | Use Case |
|---------|-------------|----------|
| `pnpm db:generate` | Generate Prisma client | After schema changes |
| `pnpm db:push` | Push schema to DB (dev) | Development |
| `pnpm db:migrate` | Run production migrations | Production |
| `pnpm db:migrate:dev` | Run dev migrations | Development |
| `pnpm db:reset` | Reset database | Development |
| `pnpm db:seed` | Seed database | Development/Staging |
| `pnpm db:studio` | Open Prisma Studio | Development |
| `pnpm db:setup` | Full setup (migrate + seed) | New environments |
| `pnpm db:ci` | CI setup | CI/CD |
| `pnpm db:status` | Check migration status | All environments |

### Management Script

```bash
# Full setup for new environment
tsx scripts/db-management.ts setup

# CI-specific setup
tsx scripts/db-management.ts ci

# Check migration status
tsx scripts/db-management.ts status

# Reset database (WARNING: deletes all data)
tsx scripts/db-management.ts reset
```

## Workflows

### Development Workflow

1. **Make schema changes** in `prisma/schema.prisma`
2. **Create migration**: `pnpm db:migrate:dev`
3. **Test changes**: Run your application
4. **Commit**: Include both schema and migration files

### Production Deployment

1. **Test locally**: Ensure migrations work
2. **Deploy code**: Push to main branch
3. **Run migrations**: Automatic via GitHub Actions
4. **Verify**: Check application functionality

### CI/CD Pipeline

The CI pipeline automatically:

1. **Sets up PostgreSQL** service
2. **Generates Prisma client**
3. **Runs migrations** (`db:push` for testing)
4. **Runs tests** with real database
5. **Builds application**

## GitHub Actions Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

- **Trigger**: Push/PR to main
- **Purpose**: Test code with database
- **Database**: Temporary PostgreSQL service
- **Operations**: Generate client, push schema, run tests

### 2. Migration Workflow (`.github/workflows/migrate.yml`)

- **Trigger**: Manual dispatch
- **Purpose**: Run migrations in specific environment
- **Database**: Environment-specific (production/staging)
- **Operations**: Generate client, run migrations, verify status

### 3. Seeding Workflow (`.github/workflows/seed.yml`)

- **Trigger**: Manual dispatch
- **Purpose**: Seed database with initial data
- **Database**: Environment-specific
- **Operations**: Generate client, run migrations, seed data

### 4. Deploy Workflow (`.github/workflows/deploy.yml`)

- **Trigger**: Push to main or manual dispatch
- **Purpose**: Full deployment pipeline
- **Database**: Production/staging
- **Operations**: Test → Migrate → Deploy

## Environment Setup

### Required Environment Variables

```bash
# Database connection
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication (for CI)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### GitHub Secrets

Set these in your repository settings:

- `DATABASE_URL` - Production database URL
- `STAGING_DATABASE_URL` - Staging database URL (if applicable)

## Best Practices

### Migration Guidelines

1. **Always test migrations locally** before deploying
2. **Use descriptive migration names**
3. **Avoid breaking changes** in production
4. **Backup database** before major migrations
5. **Review generated SQL** before applying

### Development Tips

1. **Use `db:push`** for rapid prototyping
2. **Use `db:migrate:dev`** for permanent changes
3. **Reset database** when schema gets messy
4. **Seed data** for consistent testing

### Production Safety

1. **Never use `db:push`** in production
2. **Always use `db:migrate`** for production
3. **Check `db:status`** before and after migrations
4. **Monitor application** after migrations
5. **Have rollback plan** ready

## Troubleshooting

### Common Issues

**Migration fails in CI:**
```bash
# Check if schema and migrations are in sync
pnpm db:status
```

**Database connection issues:**
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL
```

**Prisma client out of sync:**
```bash
# Regenerate client
pnpm db:generate
```

**Tests failing with database errors:**
```bash
# Reset test database
pnpm db:reset
pnpm db:setup
```

### Recovery Procedures

**Rollback migration:**
1. Identify last good migration
2. Reset to that point
3. Fix schema issues
4. Create new migration

**Database corruption:**
1. Stop application
2. Restore from backup
3. Replay migrations from backup point
4. Restart application

## Monitoring

### Health Checks

- **Migration status**: `pnpm db:status`
- **Database connectivity**: Application health endpoint
- **Schema drift**: Compare schema with migrations

### Alerts

Set up monitoring for:
- Failed migrations
- Database connection issues
- Schema drift detection
- Long-running migrations

## Support

For database-related issues:

1. Check this documentation
2. Review Prisma documentation
3. Check GitHub Actions logs
4. Contact development team
