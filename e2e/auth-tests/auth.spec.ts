import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  test.describe('Successful Login Flow', () => {
    test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in valid credentials
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Submit the form
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should remember user when "Remember me" is checked', async ({ page }) => {
      await page.goto('/login');
      
      // Fill credentials and check remember me
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      await page.getByTestId('remember-checkbox').check();
      
      // Submit form
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // Verify remember me checkbox was checked
      await page.goto('/login');
      await expect(page.getByTestId('remember-checkbox')).toBeChecked();
    });
  });

  test.describe('Failed Login Scenarios', () => {
    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in invalid credentials
      await page.locator('input[name="email"]').fill('invalid@example.com');
      await page.locator('input[name="password"]').fill('wrongpassword');
      
      // Submit form
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should show error message
      await expect(page.locator('[role="alert"]')).toBeVisible();
      await expect(page.locator('[role="alert"]')).toContainText(/invalid|incorrect|failed/i);
      
      // Should remain on login page
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should show error for non-existent user', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in non-existent user credentials
      await page.locator('input[name="email"]').fill('nonexistent@example.com');
      await page.locator('input[name="password"]').fill('password123');
      
      // Submit form
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should show error message
      await expect(page.locator('[role="alert"]')).toBeVisible();
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/login');
      
      // Leave email empty, fill password
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Try to submit
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should show email validation error
      await expect(page.locator('#email-error')).toBeVisible();
      await expect(page.locator('#email-error')).toContainText(/email.*required|please.*email/i);
    });

    test('should show validation error for empty password', async ({ page }) => {
      await page.goto('/login');
      
      // Fill email, leave password empty
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      
      // Try to submit
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should show password validation error
      await expect(page.locator('#password-error')).toBeVisible();
      await expect(page.locator('#password-error')).toContainText(/password.*required/i);
    });

    test('should show validation error for invalid email format', async ({ page }) => {
      await page.goto('/login');
      
      // Fill invalid email format
      await page.locator('input[name="email"]').fill('invalid-email');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Try to submit
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should show email format validation error
      await expect(page.locator('#email-error')).toBeVisible();
      await expect(page.locator('#email-error')).toContainText(/valid.*email/i);
    });

    test('should show validation errors for both empty fields', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit without filling any fields
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should show both validation errors
      await expect(page.locator('#email-error')).toBeVisible();
      await expect(page.locator('#password-error')).toBeVisible();
    });
  });

  test.describe('UI and UX', () => {
    test('should display loading state during login', async ({ page }) => {
      await page.goto('/login');
      
      // Fill valid credentials
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Submit form and check for loading state
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should show loading text (briefly)
      await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible();
    });

    test('should have proper form structure and labels', async ({ page }) => {
      await page.goto('/login');
      
      // Check form elements exist
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      
      // Check for "Forgot password" link
      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
      
      // Check for "Contact administrator" link
      await expect(page.getByRole('link', { name: /contact.*administrator/i })).toBeVisible();
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      await page.goto('/login');
      
      // Check ARIA attributes
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');
      
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Check for proper labeling
      await expect(emailInput).toHaveAttribute('id', 'email');
      await expect(passwordInput).toHaveAttribute('id', 'password');
    });
  });

  test.describe('Security and Edge Cases', () => {
    test('should not expose sensitive information in error messages', async ({ page }) => {
      await page.goto('/login');
      
      // Try various invalid inputs
      await page.locator('input[name="email"]').fill('test@example.com');
      await page.locator('input[name="password"]').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Error should be generic, not revealing if user exists
      const errorMessage = page.locator('[role="alert"]');
      await expect(errorMessage).toBeVisible();
      
      // Should not contain sensitive info like "user not found" vs "wrong password"
      const errorText = await errorMessage.textContent();
      expect(errorText?.toLowerCase()).not.toContain('user not found');
      expect(errorText?.toLowerCase()).not.toContain('user does not exist');
    });

    test('should handle special characters in password', async ({ page }) => {
      await page.goto('/login');
      
      // Test with the actual password that contains special characters
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should prevent multiple rapid form submissions', async ({ page }) => {
      await page.goto('/login');
      
      await page.locator('input[name="email"]').fill('primekad@gmail.com');
      await page.locator('input[name="password"]').fill('@Admin1234');
      
      // Click submit button multiple times rapidly
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      await submitButton.click();
      await submitButton.click();
      await submitButton.click();
      
      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled();
    });
  });
});

test.describe('Authentication State Management', () => {
  // This test assumes the user is already logged in thanks to auth.setup.ts
  test('should redirect authenticated user to dashboard from login page', async ({ page }) => {
    // Try to access login page when already authenticated
    await page.goto('/login');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should redirect to dashboard when accessing root while authenticated', async ({ page }) => {
    await page.goto('/');
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should allow user to log out successfully', async ({ page }) => {
    await page.goto('/dashboard');

    // Click the logout button
    await page.getByRole('button', { name: 'Log out' }).click();

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Should not be able to access dashboard without re-authentication
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
