import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Global setup for Playwright tests
  // Admin user is assumed to already exist with credentials:
  // Email: primekad@gmail.com
  // Password: @Admin1234
  
  console.log('🚀 Starting Playwright tests...');
  console.log('📧 Expected admin credentials: primekad@gmail.com');
  
  // Any future global setup logic can be added here
}

export default globalSetup;
