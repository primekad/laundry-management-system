#!/usr/bin/env tsx

/**
 * Environment Variables Verification Script
 * 
 * This script checks if all required environment variables are set
 * and validates their format where applicable.
 */

interface EnvCheck {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
  example?: string;
}

const ENV_CHECKS: EnvCheck[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'Database connection string',
    validator: (value) => value.startsWith('postgresql://'),
    example: 'postgresql://user:pass@host:5432/db'
  },
  {
    name: 'DATABASE_PROVIDER',
    required: true,
    description: 'Database provider type',
    validator: (value) => ['postgresql', 'mysql', 'sqlite'].includes(value),
    example: 'postgresql'
  },
  {
    name: 'EMAIL_FROM',
    required: true,
    description: 'Default sender email address',
    validator: (value) => value.includes('@'),
    example: 'noreply@yourdomain.com'
  },
  {
    name: 'SEND_ACTUAL_EMAIL',
    required: true,
    description: 'Whether to send real emails',
    validator: (value) => ['true', 'false'].includes(value.toLowerCase()),
    example: 'true'
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend email service API key',
    validator: (value) => value.startsWith('re_'),
    example: 're_xxxxxxxxxx'
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: false,
    description: 'NextAuth.js secret key',
    validator: (value) => value.length >= 32,
    example: 'your-32-character-secret-key-here'
  },
  {
    name: 'BETTER_AUTH_SECRET',
    required: false,
    description: 'Better Auth secret key',
    validator: (value) => value.length >= 32,
    example: 'your-32-character-secret-key-here'
  },
  {
    name: 'BETTER_AUTH_URL',
    required: false,
    description: 'Better Auth URL',
    validator: (value) => value.startsWith('http'),
    example: 'https://yourdomain.com'
  }
];

function checkEnvironmentVariable(check: EnvCheck): boolean {
  const value = process.env[check.name];
  
  console.log(`\n🔍 Checking ${check.name}:`);
  console.log(`   Description: ${check.description}`);
  
  if (!value) {
    if (check.required) {
      console.log(`   ❌ MISSING (required)`);
      if (check.example) {
        console.log(`   💡 Example: ${check.example}`);
      }
      return false;
    } else {
      console.log(`   ⚠️  Not set (optional)`);
      return true;
    }
  }
  
  // Mask sensitive values
  const displayValue = check.name.toLowerCase().includes('secret') || 
                      check.name.toLowerCase().includes('key') || 
                      check.name.toLowerCase().includes('password')
    ? value.substring(0, 8) + '...'
    : value;
  
  console.log(`   ✅ Set: ${displayValue}`);
  
  if (check.validator && !check.validator(value)) {
    console.log(`   ⚠️  Format may be invalid`);
    if (check.example) {
      console.log(`   💡 Expected format: ${check.example}`);
    }
    return false;
  }
  
  return true;
}

function checkDatabaseConnection(): boolean {
  console.log(`\n🔍 Testing database connection:`);
  
  if (!process.env.DATABASE_URL) {
    console.log(`   ❌ Cannot test - DATABASE_URL not set`);
    return false;
  }
  
  try {
    // Basic URL parsing test
    const url = new URL(process.env.DATABASE_URL);
    console.log(`   ✅ URL format valid`);
    console.log(`   📊 Host: ${url.hostname}`);
    console.log(`   📊 Port: ${url.port || 'default'}`);
    console.log(`   📊 Database: ${url.pathname.substring(1)}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Invalid URL format: ${error}`);
    return false;
  }
}

function generateEnvTemplate(): void {
  console.log(`\n📝 Environment template (.env file):`);
  console.log(`# Copy this to your .env file and fill in the values\n`);
  
  ENV_CHECKS.forEach(check => {
    const comment = check.required ? '# Required' : '# Optional';
    const example = check.example || 'your-value-here';
    console.log(`${comment} - ${check.description}`);
    console.log(`${check.name}="${example}"`);
    console.log('');
  });
}

async function main() {
  console.log('🔧 Environment Variables Verification');
  console.log('=====================================');
  
  let allValid = true;
  let requiredMissing = 0;
  
  // Check all environment variables
  for (const check of ENV_CHECKS) {
    const isValid = checkEnvironmentVariable(check);
    if (!isValid) {
      allValid = false;
      if (check.required) {
        requiredMissing++;
      }
    }
  }
  
  // Test database connection
  const dbConnectionValid = checkDatabaseConnection();
  if (!dbConnectionValid) {
    allValid = false;
  }
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   Total checks: ${ENV_CHECKS.length}`);
  console.log(`   Required missing: ${requiredMissing}`);
  console.log(`   Database connection: ${dbConnectionValid ? '✅' : '❌'}`);
  
  if (allValid && requiredMissing === 0) {
    console.log(`\n🎉 All environment variables are properly configured!`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some issues found. Please review and fix the above.`);
    
    if (requiredMissing > 0) {
      generateEnvTemplate();
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
