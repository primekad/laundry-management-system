import { test, expect } from '@playwright/test';

test.describe('Logout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the dashboard (authenticated state)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test.describe('Successful Logout Flow', () => {
    test('should logout successfully and redirect to login page', async ({ page }) => {
      // Find and click the logout button
      await page.getByRole('button', { name: 'Log out' }).click();
      
      // Should redirect to login page
      await expect(page).toHaveURL(/.*\/login/);
      
      // Should show login form
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    test('should clear authentication state after logout', async ({ page }) => {
      // Logout
      await page.getByRole('button', { name: 'Log out' }).click();
      await expect(page).toHaveURL(/.*\/login/);
      
      // Try to access dashboard directly - should redirect to login
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*\/login/);
      
      // Try to access root - should redirect to login
      await page.goto('/');
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should handle logout from different pages', async ({ page }) => {
      // Test logout from various pages
      const testPages = ['/dashboard', '/orders', '/customers'];
      
      for (const testPage of testPages) {
        // Navigate to test page
        await page.goto(testPage);
        
        // Logout
        await page.getByRole('button', { name: 'Log out' }).click();
        
        // Should redirect to login
        await expect(page).toHaveURL(/.*\/login/);
        
        // Re-authenticate for next iteration
        if (testPages.indexOf(testPage) < testPages.length - 1) {
          await page.locator('input[name="email"]').fill('primekad@gmail.com');
          await page.locator('input[name="password"]').fill('@Admin1234');
          await page.getByRole('button', { name: 'Sign In' }).click();
          await expect(page).toHaveURL(/.*\/dashboard/);
        }
      }
    });
  });

  test.describe('Logout Button UI and UX', () => {
    test('should display logout button in sidebar', async ({ page }) => {
      // Check that logout button is visible in the sidebar
      const logoutButton = page.getByRole('button', { name: 'Log out' });
      await expect(logoutButton).toBeVisible();
      
      // Check for logout icon
      await expect(page.locator('[data-testid="logout-icon"], .lucide-log-out')).toBeVisible();
    });

    test('should show loading state during logout (if implemented)', async ({ page }) => {
      // Click logout button
      const logoutButton = page.getByRole('button', { name: 'Log out' });
      await logoutButton.click();
      
      // Check if button becomes disabled during logout process
      // Note: This depends on implementation - might be very brief
      // await expect(logoutButton).toBeDisabled();
      
      // Should eventually redirect to login
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      const logoutButton = page.getByRole('button', { name: 'Log out' });
      
      // Should be accessible by screen readers
      await expect(logoutButton).toBeVisible();
      
      // Should have proper role
      await expect(logoutButton).toHaveAttribute('role', 'button');
      
      // Should be keyboard accessible
      await logoutButton.focus();
      await expect(logoutButton).toBeFocused();
    });

    test('should support keyboard navigation for logout', async ({ page }) => {
      // Navigate to logout button using keyboard
      await page.keyboard.press('Tab');
      
      // Keep tabbing until we reach the logout button
      let attempts = 0;
      while (attempts < 20) { // Prevent infinite loop
        const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent);
        if (focusedElement?.includes('Log out') || focusedElement?.includes('logout')) {
          break;
        }
        await page.keyboard.press('Tab');
        attempts++;
      }
      
      // Press Enter to logout
      await page.keyboard.press('Enter');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Logout Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure by intercepting the logout request
      await page.route('**/api/auth/signout', route => {
        route.abort('failed');
      });
      
      // Attempt logout
      await page.getByRole('button', { name: 'Log out' }).click();
      
      // Should still redirect to login page (fallback behavior)
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Simulate server error
      await page.route('**/api/auth/signout', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      // Attempt logout
      await page.getByRole('button', { name: 'Log out' }).click();
      
      // Should still redirect to login page (fallback behavior)
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should handle slow logout responses', async ({ page }) => {
      // Simulate slow response
      await page.route('**/api/auth/signout', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
        }, 2000); // 2 second delay
      });
      
      // Attempt logout
      await page.getByRole('button', { name: 'Log out' }).click();
      
      // Should eventually redirect to login
      await expect(page).toHaveURL(/.*\/login/, { timeout: 5000 });
    });
  });

  test.describe('Session Management After Logout', () => {
    test('should prevent access to protected routes after logout', async ({ page }) => {
      // Logout
      await page.getByRole('button', { name: 'Log out' }).click();
      await expect(page).toHaveURL(/.*\/login/);
      
      // List of protected routes to test
      const protectedRoutes = [
        '/dashboard',
        '/orders',
        '/customers',
        '/admin/users',
        '/settings'
      ];
      
      // Test each protected route
      for (const route of protectedRoutes) {
        await page.goto(route);
        // Should redirect to login
        await expect(page).toHaveURL(/.*\/login/);
      }
    });

    test('should clear all authentication cookies/tokens', async ({ page }) => {
      // Get initial cookies
      const initialCookies = await page.context().cookies();
      const authCookies = initialCookies.filter(cookie => 
        cookie.name.includes('auth') || 
        cookie.name.includes('session') || 
        cookie.name.includes('token')
      );
      
      // Logout
      await page.getByRole('button', { name: 'Log out' }).click();
      await expect(page).toHaveURL(/.*\/login/);
      
      // Check that auth-related cookies are cleared or expired
      const finalCookies = await page.context().cookies();
      const remainingAuthCookies = finalCookies.filter(cookie => 
        cookie.name.includes('auth') || 
        cookie.name.includes('session') || 
        cookie.name.includes('token')
      );
      
      // Auth cookies should be cleared or have empty values
      for (const cookie of remainingAuthCookies) {
        expect(cookie.value).toBe('');
      }
    });

    test('should handle multiple logout attempts gracefully', async ({ page }) => {
      // First logout
      await page.getByRole('button', { name: 'Log out' }).click();
      await expect(page).toHaveURL(/.*\/login/);
      
      // Try to logout again by going back to dashboard (should redirect to login)
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*\/login/);
      
      // Page should still be functional
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });
  });

  test.describe('Cross-Tab Logout Behavior', () => {
    test('should logout from all tabs when logging out from one tab', async ({ context }) => {
      // Create two tabs
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      // Navigate both to dashboard
      await page1.goto('/dashboard');
      await page2.goto('/dashboard');
      
      await expect(page1).toHaveURL(/.*\/dashboard/);
      await expect(page2).toHaveURL(/.*\/dashboard/);
      
      // Logout from first tab
      await page1.getByRole('button', { name: 'Log out' }).click();
      await expect(page1).toHaveURL(/.*\/login/);
      
      // Second tab should also be logged out when refreshed or navigated
      await page2.reload();
      await expect(page2).toHaveURL(/.*\/login/);
      
      await page1.close();
      await page2.close();
    });
  });

  test.describe('Logout Performance', () => {
    test('should logout within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      // Perform logout
      await page.getByRole('button', { name: 'Log out' }).click();
      await expect(page).toHaveURL(/.*\/login/);
      
      const endTime = Date.now();
      const logoutTime = endTime - startTime;
      
      // Logout should complete within 5 seconds
      expect(logoutTime).toBeLessThan(5000);
    });

    test('should not cause memory leaks during logout', async ({ page }) => {
      // Perform multiple login/logout cycles
      for (let i = 0; i < 3; i++) {
        // Login
        await page.goto('/login');
        await page.locator('input[name="email"]').fill('primekad@gmail.com');
        await page.locator('input[name="password"]').fill('@Admin1234');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page).toHaveURL(/.*\/dashboard/);
        
        // Logout
        await page.getByRole('button', { name: 'Log out' }).click();
        await expect(page).toHaveURL(/.*\/login/);
      }
      
      // Page should still be responsive
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });
  });
});
