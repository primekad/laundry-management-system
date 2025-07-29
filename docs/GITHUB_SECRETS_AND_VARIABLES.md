# GitHub Secrets and Variables Configuration

This document outlines the required GitHub repository secrets and variables for your CI/CD workflows.

## Repository Variables

These are non-sensitive configuration values that can be stored as repository variables in GitHub.

### Required Variables

Navigate to: **Settings → Secrets and variables → Actions → Variables tab**

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `DATABASE_PROVIDER` | Database provider type | `postgresql` |
| `EMAIL_FROM` | Default sender email address | `noreply@yourdomain.com` |
| `SEND_ACTUAL_EMAIL` | Whether to send real emails | `true` or `false` |

### How to Set Repository Variables

1. Go to your GitHub repository
2. Click **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click the **Variables** tab
5. Click **New repository variable**
6. Add each variable with its name and value

## Repository Secrets

These are sensitive values that should be stored as encrypted secrets in GitHub.

### Required Secrets

Navigate to: **Settings → Secrets and variables → Actions → Secrets tab**

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DATABASE_URL` | Production database connection string | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Direct database connection (for migrations) | `postgresql://user:pass@host:5432/db` |
| `RESEND_API_KEY` | Resend email service API key | `re_xxxxxxxxxx` |

### Optional Secrets

| Secret Name | Description | When Needed |
|-------------|-------------|-------------|
| `NEXTAUTH_SECRET` | NextAuth.js secret key | If using NextAuth |
| `BETTER_AUTH_SECRET` | Better Auth secret key | If using Better Auth |
| `STAGING_DATABASE_URL` | Staging database URL | If using staging environment |
| `STAGING_DIRECT_URL` | Staging direct database URL | If using staging environment |

### How to Set Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click the **Secrets** tab
5. Click **New repository secret**
6. Add each secret with its name and value

## Environment-Specific Configuration

### CI Environment (Automatic)

The CI workflow automatically uses:
- **Temporary PostgreSQL service** for testing
- **Test values** for authentication secrets
- **Repository variables** for configuration
- **Test or disabled email** functionality

### Production Environment

For production deployments, ensure these are set:
- `DATABASE_URL` - Your production database
- `DIRECT_URL` - Same as DATABASE_URL or connection pooling URL
- `RESEND_API_KEY` - Your production email API key
- All repository variables with production values

### Staging Environment (Optional)

For staging deployments, you may want:
- `STAGING_DATABASE_URL` - Your staging database
- `STAGING_DIRECT_URL` - Staging direct connection
- Repository variables can be shared or environment-specific

## Workflow Usage

### CI Workflow (`ci.yml`)
**Uses:**
- Repository variables: `DATABASE_PROVIDER`, `EMAIL_FROM`, `SEND_ACTUAL_EMAIL`
- Secrets: `RESEND_API_KEY` (optional for testing)
- Temporary database for testing

### Deploy Workflow (`deploy.yml`)
**Uses:**
- Repository variables: All variables
- Secrets: `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`
- Production/staging database

### Migration Workflow (`migrate.yml`)
**Uses:**
- Repository variables: `DATABASE_PROVIDER`, `EMAIL_FROM`, `SEND_ACTUAL_EMAIL`
- Secrets: `DIRECT_URL`
- Target environment database

### Seed Workflow (`seed.yml`)
**Uses:**
- Repository variables: All variables
- Secrets: `DIRECT_URL`
- Target environment database

## Security Best Practices

### For Secrets
1. **Never commit secrets** to your repository
2. **Use different secrets** for different environments
3. **Rotate secrets regularly**
4. **Limit access** to repository secrets
5. **Use least privilege** principle

### For Variables
1. **Use variables for non-sensitive** configuration
2. **Document variable purposes** clearly
3. **Use consistent naming** conventions
4. **Review variables regularly**

## Troubleshooting

### Common Issues

**Workflow fails with "secret not found":**
- Check secret name spelling
- Verify secret is set in repository settings
- Ensure secret has a value

**Workflow fails with "variable not found":**
- Check variable name spelling
- Verify variable is set in repository variables
- Ensure variable has a value

**Database connection fails:**
- Verify `DATABASE_URL` format
- Check database server accessibility
- Ensure credentials are correct

**Email functionality not working:**
- Check `RESEND_API_KEY` is valid
- Verify `EMAIL_FROM` is authorized
- Check `SEND_ACTUAL_EMAIL` setting

### Validation Commands

You can test your configuration locally:

```bash
# Check if variables are accessible (will show in CI logs)
echo "DATABASE_PROVIDER: $DATABASE_PROVIDER"
echo "EMAIL_FROM: $EMAIL_FROM"
echo "SEND_ACTUAL_EMAIL: $SEND_ACTUAL_EMAIL"

# Test database connection
pnpm db:status

# Test email configuration (if applicable)
# Your application's email test endpoint
```

## Environment File Template

For local development, create a `.env` file:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env

# Edit with your local configuration
DATABASE_URL="postgresql://username:password@localhost:5432/laundry_management"
DATABASE_PROVIDER="postgresql"
EMAIL_FROM="test@localhost"
SEND_ACTUAL_EMAIL="false"
RESEND_API_KEY="your-local-test-key"
```

## Migration from Old Setup

If you're migrating from hardcoded values:

1. **Identify current values** in your workflows
2. **Create repository variables** for non-sensitive values
3. **Create repository secrets** for sensitive values
4. **Update workflow files** to use variables/secrets
5. **Test workflows** to ensure they work
6. **Remove hardcoded values** from code

## Support

For issues with GitHub secrets and variables:

1. Check GitHub documentation on Actions secrets
2. Verify repository permissions
3. Test with simple echo commands
4. Contact repository administrators
5. Review GitHub Actions logs for specific errors
