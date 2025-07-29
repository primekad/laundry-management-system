# Email Configuration

This document outlines the email configuration settings for the laundry management system.

## Environment Variables

Add the following environment variables to your `.env` file:

### Email Service Configuration

```env
# Resend API Configuration
RESEND_API_KEY="your_resend_api_key_here"
EMAIL_FROM="your-sender@yourdomain.com"

# Email Control Settings
SEND_ACTUAL_EMAIL="true"  # Set to "false" to log emails instead of sending
ONLY_SEND_TO=""           # Optional: Override all email recipients (for testing)
```

### Email Control Features

1. **SEND_ACTUAL_EMAIL**: 
   - `true`: Emails are sent via Resend API
   - `false`: Emails are logged to SQLite database (`email-logs.db`) instead of being sent

2. **ONLY_SEND_TO**: 
   - When set, all emails will be sent to this address instead of the intended recipient
   - Useful for testing in development environments

3. **EMAIL_FROM**: 
   - The sender address for all outgoing emails
   - Defaults to `onboarding@resend.dev` if not set

## Email Templates

The system uses three email templates based on the reset context:

### 1. Forgot Password (`typ=fgp` or no parameter)
- **Template**: `lib/email-templates/forgot-password.html`
- **Subject**: "Reset Your Password"
- **Used when**: User requests password reset themselves

### 2. New User (`typ=newusr`)
- **Template**: `lib/email-templates/new-user.html`
- **Subject**: "Welcome - Set Your Password"
- **Used when**: Admin creates a new user account

### 3. Admin Reset (`typ=admreq`)
- **Template**: `lib/email-templates/admin-reset.html`
- **Subject**: "Password Reset Required"
- **Used when**: Admin triggers password reset for existing user

## Email Logging

When `SEND_ACTUAL_EMAIL=false`, emails are logged to an SQLite database:

- **Database**: `email-logs.db` (created in project root)
- **Table**: `email_logs`
- **Fields**: `id`, `to_email`, `subject`, `html`, `timestamp`, `status`

## User Creation Flow

1. Admin creates user with form data (no password field)
2. System generates secure random password
3. User account is created with generated password
4. Password reset email is automatically sent with `typ=newusr`
5. User receives welcome email with password setup link

## Testing

For development/testing:

```env
SEND_ACTUAL_EMAIL="false"
ONLY_SEND_TO="test@example.com"
```

This will:
- Log all emails to database instead of sending
- Override recipient to `test@example.com` if emails were to be sent
