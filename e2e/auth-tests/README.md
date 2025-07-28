# Authentication E2E Test Suite

This directory contains comprehensive end-to-end tests for the login functionality and authentication system using Playwright.

## Test Files Overview

### 1. `auth.setup.ts`
- **Purpose**: Sets up authenticated state for tests that require login
- **Credentials**: Uses `primekad@gmail.com` with password `@Admin1234`
- **Output**: Saves authentication state to `playwright/.auth/user.json`

### 2. `auth.spec.ts` - Core Login Functionality
- **Successful Login Flow**
  - Valid credentials login and redirect
  - "Remember me" functionality
- **Failed Login Scenarios**
  - Invalid credentials handling
  - Non-existent user handling
- **Form Validation**
  - Empty field validation
  - Invalid email format validation
  - Multiple field validation
- **UI and UX**
  - Loading states during submission
  - Form structure and accessibility
- **Security and Edge Cases**
  - Error message security
  - Special character handling
  - Multiple submission prevention

### 3. `access.spec.ts` - Access Control
- **Unauthenticated Users**
  - Protected route redirections
  - API route protection
  - Session management
- **Role-Based Access**
  - Admin access verification
  - Future regular user access tests (skipped)

### 4. `logout.spec.ts` - Logout Functionality
- **Successful Logout Flow**
  - Basic logout and redirect
  - Authentication state clearing
  - Logout from different pages
- **Logout Button UI and UX**
  - Button visibility and accessibility
  - Keyboard navigation support
  - Loading states (if implemented)
- **Error Handling**
  - Network error graceful handling
  - Server error fallback behavior
  - Slow response handling
- **Session Management**
  - Protected route access prevention
  - Cookie/token clearing verification
  - Multiple logout attempt handling
- **Cross-Tab Behavior**
  - Multi-tab logout synchronization
- **Performance Testing**
  - Logout timing verification
  - Memory leak prevention

### 5. `login-form-behavior.spec.ts` - Form Behavior & UX
- **Form Interaction**
  - Focus management
  - Keyboard navigation
  - Form submission methods
- **Visual Feedback**
  - Loading states
  - Error highlighting
  - Dynamic error clearing
- **Browser Compatibility**
  - Autofill handling
  - Copy-paste functionality
  - Long input handling
  - Special character support
- **Accessibility**
  - Keyboard navigation
  - Screen reader support
  - ARIA attributes
- **Performance**
  - Load time verification
  - Responsive design testing

## Test Credentials

**Admin User (for successful login tests):**
- Email: `primekad@gmail.com`
- Password: `@Admin1234`

> **Note**: These credentials will be updated by the user later as needed.

## Running the Tests

```bash
# Run all auth tests
npx playwright test e2e/auth-tests/

# Run specific test file
npx playwright test e2e/auth-tests/auth.spec.ts

# Run tests with UI mode
npx playwright test e2e/auth-tests/ --ui

# Run tests in headed mode (see browser)
npx playwright test e2e/auth-tests/ --headed
```

## Test Coverage

The test suite covers:

✅ **Authentication Flow**
- Successful login with valid credentials
- Failed login with invalid credentials
- Form validation (client-side and server-side)
- Session management and persistence

✅ **Access Control**
- Unauthenticated user redirections
- Protected route access
- Session expiration handling
- Cross-tab authentication

✅ **User Experience**
- Loading states and visual feedback
- Form interaction and navigation
- Error message display and clearing
- Accessibility compliance

✅ **Security**
- Error message information disclosure prevention
- Multiple submission prevention
- Special character handling
- Input validation

✅ **Browser Compatibility**
- Responsive design across viewports
- Keyboard navigation
- Autofill compatibility
- Performance benchmarks

## Test Dependencies

The tests assume:
1. A user with email `primekad@gmail.com` and password `@Admin1234` exists in the system
2. The login form is accessible at `/login`
3. Successful login redirects to `/dashboard`
4. Unauthenticated users are redirected to `/login`

## Future Enhancements

- **Multi-role Testing**: Add tests for different user roles (regular users, managers, etc.)
- **Password Reset Flow**: Add tests for forgot password functionality
- **Two-Factor Authentication**: Add tests if 2FA is implemented
- **Social Login**: Add tests for OAuth providers if implemented
- **Rate Limiting**: Add tests for login attempt rate limiting

## Maintenance Notes

- Update test credentials when they change in the system
- Adjust selectors if UI components change
- Update expected URLs if routing changes
- Review and update security tests as new threats emerge
