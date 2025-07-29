# Production Setup Guide

This guide walks you through setting up your laundry management system for production deployment on Netlify with GitHub Actions CI/CD.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Production Database**: PostgreSQL database (recommended: Neon, Supabase, or Railway)
4. **Resend Account**: For email functionality at [resend.com](https://resend.com)

## Step 1: Database Setup

### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://username:password@host/database`)

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings > Database and copy the connection string

### Option C: Railway
1. Go to [railway.app](https://railway.app) and create an account
2. Create a new PostgreSQL database
3. Copy the connection string from the database settings

## Step 2: Email Setup (Resend)

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your domain (or use their test domain for now)
3. Create an API key in the dashboard
4. Note your verified sender email address

## Step 3: GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

```
DATABASE_URL=postgresql://your-database-connection-string
BETTER_AUTH_SECRET=your-32-character-random-secret
BETTER_AUTH_URL=https://your-app-name.netlify.app
RESEND_API_KEY=re_your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
SEND_ACTUAL_EMAIL=true
NETLIFY_SITE_ID=your-netlify-site-id
NETLIFY_API_TOKEN=your-netlify-api-token
```

### How to generate BETTER_AUTH_SECRET:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## Step 4: Netlify Setup

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account and select your repository

2. **Configure Build Settings**:
   - Build command: `pnpm prisma generate && pnpm build`
   - Publish directory: `.next`
   - Node version: `22`

3. **Get Netlify Credentials**:
   - **Site ID**: Go to Site settings → General → Site details → Site ID
   - **API Token**: Go to User settings → Applications → Personal access tokens → New access token

4. **Environment Variables in Netlify**:
   Go to Site settings → Environment variables and add:
   ```
   DATABASE_URL=your-database-connection-string
   BETTER_AUTH_SECRET=your-32-character-secret
   BETTER_AUTH_URL=https://your-app-name.netlify.app
   RESEND_API_KEY=your-resend-api-key
   EMAIL_FROM=noreply@yourdomain.com
   SEND_ACTUAL_EMAIL=true
   NODE_ENV=production
   ```

## Step 5: Database Migration

After setting up the database, you need to run the initial migration:

1. **Local Setup** (one-time):
   ```bash
   # Set your production database URL temporarily
   export DATABASE_URL="your-production-database-url"
   
   # Run migrations
   pnpm prisma migrate deploy
   
   # Create admin user
   pnpm setup:admin
   ```

2. **Or use GitHub Actions**: The CI/CD pipeline will automatically run migrations on deployment.

## Step 6: Deploy

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Configure production deployment"
   git push origin main
   ```

2. **Monitor deployment**:
   - Check GitHub Actions tab for build status
   - Check Netlify dashboard for deployment status

## Step 7: Post-Deployment Setup

1. **Create Admin User** (if not done locally):
   - The default admin credentials are in `constants.ts`
   - Email: `primekad@gmail.com`
   - Password: `@Admin1234`
   - You can change these after first login

2. **Test Email Functionality**:
   - Try creating a user to test email sending
   - Check Resend dashboard for email logs

3. **Custom Domain** (Optional):
   - In Netlify: Site settings → Domain management → Add custom domain
   - Update `BETTER_AUTH_URL` in both GitHub secrets and Netlify environment variables

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**:
   - Verify DATABASE_URL is correct
   - Ensure database allows connections from Netlify IPs

2. **Build Failures**:
   - Check GitHub Actions logs
   - Ensure all environment variables are set

3. **Authentication Issues**:
   - Verify BETTER_AUTH_URL matches your actual domain
   - Check BETTER_AUTH_SECRET is set correctly

4. **Email Not Sending**:
   - Verify RESEND_API_KEY is correct
   - Check EMAIL_FROM is a verified sender in Resend
   - Ensure SEND_ACTUAL_EMAIL is set to "true"

### Logs and Monitoring:

- **GitHub Actions**: Repository → Actions tab
- **Netlify**: Site dashboard → Functions tab for serverless function logs
- **Database**: Check your database provider's logs
- **Email**: Resend dashboard → Logs

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to git
2. **Database**: Use connection pooling for production
3. **Secrets**: Rotate secrets regularly
4. **HTTPS**: Always use HTTPS in production (Netlify provides this automatically)

## Maintenance

1. **Database Backups**: Set up automated backups with your database provider
2. **Monitoring**: Consider adding error tracking (Sentry, LogRocket, etc.)
3. **Updates**: Keep dependencies updated regularly
4. **Security**: Monitor for security vulnerabilities

Your app should now be ready for production! 🚀
