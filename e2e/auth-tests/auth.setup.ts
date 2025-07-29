import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  
  // Use the provided test credentials
  await page.locator('input[name="email"]').fill('primekad@gmail.com');
  await page.locator('input[name="password"]').fill('@Admin1234');
  
  // Click the sign in button
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for successful redirect to dashboard
  await page.waitForURL('**/dashboard');

  await page.context().storageState({ path: authFile });
});
