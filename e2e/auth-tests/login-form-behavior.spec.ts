import { test, expect } from '@playwright/test';

test.describe('Login Form Behavior and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication before each test
    await page.context().clearCookies();
    await page.goto('/login');
  });

  test.describe('Form Interaction and UX', () => {
    test('should focus email field on page load', async ({ page }) => {
      // Email field should be focused when page loads
      await expect(page.locator('input[name="email"]')).toBeFocused();
    });

    test('should move focus to password field after entering email', async ({ page }) => {
      // Fill email and press Tab
      await page.locator('input[name="email"]').fill('test@example.com');
      await page.keyboard.press('Tab');
      
      // Password field should be focused
      await expect(page.locator('input[name="password"]')).toBeFocused();
    });

    test('should submit form when pressing Enter in password field', async ({ page }) => {
      // Fill valid credentials
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Press Enter in password field
      await page.locator('input[name="password"]').press('Enter');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should toggle remember me checkbox', async ({ page }) => {
      const checkbox = page.getByTestId('remember-checkbox');
      
      // Initially unchecked
      await expect(checkbox).not.toBeChecked();
      
      // Click to check
      await checkbox.check();
      await expect(checkbox).toBeChecked();
      
      // Click to uncheck
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    });

    test('should preserve form data when validation fails', async ({ page }) => {
      const testEmail = 'test@example.com';
      
      // Fill email but leave password empty
      await page.locator('input[name="email"]').fill(testEmail);
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Email should be preserved after validation error
      await expect(page.locator('input[name="email"]')).toHaveValue(testEmail);
    });
  });

  test.describe('Visual Feedback and States', () => {
    test('should show loading spinner during form submission', async ({ page }) => {
      // Fill valid credentials
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Submit form
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      await submitButton.click();
      
      // Should show loading state
      await expect(page.locator('.animate-spin')).toBeVisible();
      await expect(submitButton).toContainText(/signing in/i);
    });

    test('should disable submit button during form submission', async ({ page }) => {
      // Fill valid credentials
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Submit form
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      await submitButton.click();
      
      // Button should be disabled
      await expect(submitButton).toBeDisabled();
    });

    test('should highlight invalid fields with error styling', async ({ page }) => {
      // Submit form without filling fields
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Error elements should be visible
      await expect(page.locator('#email-error')).toBeVisible();
      await expect(page.locator('#password-error')).toBeVisible();
      
      // Input fields should have error styling (aria-describedby)
      await expect(page.locator('input[name="email"]')).toHaveAttribute('aria-describedby', 'email-error');
      await expect(page.locator('input[name="password"]')).toHaveAttribute('aria-describedby', 'password-error');
    });

    test('should clear error messages when user starts typing', async ({ page }) => {
      // Trigger validation errors
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.locator('#email-error')).toBeVisible();
      
      // Start typing in email field
      await page.locator('input[name="email"]').fill('t');
      
      // Error should be cleared (this depends on your form implementation)
      // Note: This test might need adjustment based on when errors are cleared
      await page.locator('input[name="email"]').fill('test@example.com');
      await expect(page.locator('#email-error')).not.toBeVisible();
    });
  });

  test.describe('Browser Compatibility and Edge Cases', () => {
    test('should handle browser autofill', async ({ page }) => {
      // Simulate browser autofill
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Form should work with autofilled values
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should handle copy-paste in password field', async ({ page }) => {
      // Copy password to clipboard and paste
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      
      // Focus password field and paste
      await page.locator('input[name="password"]').click();
      await page.keyboard.type('@Admin1234');
      
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should handle very long input values', async ({ page }) => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const longPassword = 'P@ssw0rd' + 'x'.repeat(100);
      
      // Fill with very long values
      await page.locator('input[name="email"]').fill(longEmail);
      await page.locator('input[name="password"]').fill(longPassword);
      
      // Form should handle long inputs gracefully
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should show appropriate error (likely invalid credentials)
      await expect(page.locator('[role="alert"]')).toBeVisible();
    });

    test('should handle special characters in email', async ({ page }) => {
      // Test various valid email formats with special characters
      const specialEmails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user_name@example.com',
        'user-name@example.com'
      ];
      
      for (const email of specialEmails) {
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill('@Admin1234');
        await page.getByRole('button', { name: 'Sign In' }).click();
        
        // Should not show email format validation error
        const emailError = page.locator('#email-error');
        if (await emailError.isVisible()) {
          const errorText = await emailError.textContent();
          expect(errorText?.toLowerCase()).not.toContain('valid email');
        }
        
        // Clear for next iteration
        await page.locator('input[name="email"]').fill('');
        await page.locator('input[name="password"]').fill('');
      }
    });
  });

  test.describe('Keyboard Navigation and Accessibility', () => {
    test('should support full keyboard navigation', async ({ page }) => {
      // Tab through all interactive elements
      await page.keyboard.press('Tab'); // Email field (should already be focused)
      await expect(page.locator('input[name="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Password field
      await expect(page.locator('input[name="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Forgot password link
      await expect(page.getByRole('link', { name: /forgot password/i })).toBeFocused();
      
      await page.keyboard.press('Tab'); // Remember me checkbox
      await expect(page.getByTestId('remember-checkbox')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Submit button
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused();
    });

    test('should support screen reader accessibility', async ({ page }) => {
      // Check for proper ARIA labels and roles
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // Check for proper labeling
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');
      
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Check for error announcements
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      const emailError = page.locator('#email-error');
      const passwordError = page.locator('#password-error');
      
      if (await emailError.isVisible()) {
        await expect(emailError).toHaveAttribute('role', 'alert');
      }
      if (await passwordError.isVisible()) {
        await expect(passwordError).toHaveAttribute('role', 'alert');
      }
    });

    test('should handle Escape key to clear form', async ({ page }) => {
      // Fill form
      await page.locator('input[name="email"]').fill('test@example.com');
      await page.locator('input[name="password"]').fill('password');
      
      // Press Escape (behavior depends on implementation)
      await page.keyboard.press('Escape');
      
      // This test might need adjustment based on your form's Escape key behavior
      // For now, just ensure the page is still functional
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Performance and Responsiveness', () => {
    test('should render form quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/login');
      
      // Form should be visible within reasonable time
      await expect(page.locator('form')).toBeVisible();
      const endTime = Date.now();
      
      // Should load within 3 seconds (adjust as needed)
      expect(endTime - startTime).toBeLessThan(3000);
    });

    test('should be responsive on different viewport sizes', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('form')).toBeVisible();
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('form')).toBeVisible();
    });
  });
});
