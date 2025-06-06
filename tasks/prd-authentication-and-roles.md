# PRD: Authentication & Roles

## 1. Introduction/Overview

This document outlines the requirements for the Authentication and Roles feature of the Laundry Management System. The primary goal is to provide secure access to the system, ensuring that users can only perform actions and view data appropriate to their designated roles. This feature will utilize the Better Auth library with a Prisma adapter and a PostgreSQL database to manage user credentials and sessions. It aims to prevent unauthorized data access, ensure staff perform only allowed actions, and streamline user management for administrators.

## 2. Goals

*   Implement a secure email and password-based login system.
*   Define distinct user roles (Staff, Manager, Admin) with specific permissions.
*   Restrict access to system features and data based on user roles.
*   Enable administrators to manage user accounts effectively (add, edit, soft delete, reset passwords).
*   Ensure users can only operate within their assigned branch(es) but can switch between them if they have rights to multiple.

## 3. User Stories

*   **As a Staff member, I want to:**
    *   Log in securely with my email and password.
    *   Create new orders for customers.
    *   Add or edit customer information.
    *   Update the status of orders.
    *   Record payments received for orders.
    *   Log expenses incurred.
    *   Perform all these actions, with data context (entries, reports, dashboards) limited to the currently selected active branch.
    *   Have a primary (default) branch and can be assigned secondary branches.
    *   Switch their active branch context (e.g., via a sidebar dropdown, as shown in UI mockups) to any of their assigned branches.
*   **As a Manager, I want to:**
    *   Perform all actions available to a Staff member.
    *   View reports on revenue, orders, expenses, and outstanding payments.
    *   View audit trails for system activities.
*   **As an Admin, I want to:**
    *   Perform all actions available to a Manager.
    *   Manage user accounts (add new users, edit existing user details, soft delete users, trigger password resets).
    *   Access and configure system-wide settings (e.g., pricing, branch management - covered in other PRDs).
    *   Perform any other administrative actions on the system.

## 4. Functional Requirements

### 4.1 Login & Session Management

1.  **FR1.1:** Users must be able to log in using their email address and password.
2.  **FR1.2:** The system must use Better Auth for authentication.
3.  **FR1.3:** User sessions must be managed securely.
4.  **FR1.4:** A "Remember me" option should be available on the login page to persist sessions.
5.  **FR1.5:** A "Forgot password?" link should be available, initiating a password reset process (see FR4.3.6).

### 4.2 User Roles & Permissions

1.  **FR2.1:** The system must support the following user roles:
    *   `Staff`
    *   `Manager`
    *   `Admin`
2.  **FR2.2:** `Staff` permissions:
    *   Create, view, and update orders within their assigned branch(es).
    *   Manage customers linked to their orders/branch(es).
    *   Record payments for orders within their assigned branch(es).
    *   Log expenses for their assigned branch(es).
    *   Switch active branch if assigned to multiple.
3.  **FR2.3:** `Manager` permissions:
    *   All permissions of `Staff`, including primary/secondary branch assignment and the ability to switch active branch context.
    *   Access to view all reports (revenue, orders, expenses, outstanding payments) filterable by branch.
    *   Access to view audit logs.
4.  **FR2.4:** `Admin` permissions:
    *   All permissions of `Manager`.
    *   Can view data across all branches simultaneously by default (e.g., an "All Branches" view selector, potentially in the sidebar as shown in UI mockups for branch switching).
    *   When an Admin has "All Branches" selected, data entry forms must require branch selection for the new record. Grids and reports should display branch allocation information for records.
    *   Can also select a specific branch to limit their view and operations to that branch, similar to Staff/Manager.
    *   Full user management capabilities (see section 4.3).
    *   Access to system configuration settings (details in other PRDs).
5.  **FR2.5:** Navigation menus and accessible UI elements must be dynamically rendered based on the logged-in user's role. Links/buttons for actions a user is not permitted to perform should not be visible.
6.  **FR2.6:** If a user attempts to access a URL or resource they are not authorized for (e.g., by direct URL manipulation), they must be redirected to an "Access Denied" page. This page should display a generic access denied message, provide a link to their main dashboard, and offer contact information for an administrator.

### 4.3 User Account Management (Admin)

1.  **FR3.1:** Admins must be able to create new user accounts.
    *   Required fields: First Name, Surname, Email, Role, Default Branch.
    *   Optional fields: Phone Number.
2.  **FR3.2:** Admins must be able to edit existing user accounts.
    *   Editable fields: First Name, Surname, Role, Phone Number, Branch assignment(s).
    *   Non-editable fields by Admin: Email (should be displayed as read-only in user edit forms). Password (can only be reset via the password reset mechanism, not directly edited by an Admin).
3.  **FR3.3:** Admins must be able to soft delete user accounts. Soft-deleted users should not be able to log in and should be clearly marked as inactive in admin views.
4.  **FR3.4:** Admins must be able to trigger a password reset for a user. This action will send a user-friendly email to the user's registered email address containing a secure, time-limited link to set a new password. The content of the email should be clear and guide the user through the reset process.
5.  **FR3.5:** User passwords must meet default strength requirements as defined by the Better Auth library.
6.  **FR3.6:** Phone numbers should be validated. While the system should support international formats, it should default to a Ghanaian phone number format if no country code is provided.

### 4.4 User Profile Fields (as per original PRD)

1.  **FR4.1:** First Name (required)
2.  **FR4.2:** Surname (required)
3.  **FR4.3:** Email (required, unique, used for login)
4.  **FR4.4:** Role (required, defaults to `Staff` if not explicitly specified by an Admin during user creation).
5.  **FR4.5:** Phone Number (optional, validated)
6.  **FR4.6:** Branch assignment: Users (Staff, Manager, Admin) must be assigned a primary (default) branch. Staff and Managers can additionally be assigned multiple secondary branches. Admins have access to all branches by default (though they also have a primary/default branch for context when not in 'All Branches' view) and can switch context similar to Staff/Managers or select an 'All Branches' view.

## 5. Non-Goals (Out of Scope)

*   `PublicUser` role.
*   `SystemAdmin` role (Admin role encompasses highest-level permissions for this system).
*   Login via phone number, GitHub, Twitter, or any other social providers.
*   Complex password recovery flows beyond an email-based reset link (e.g., security questions).
*   Two-factor authentication (2FA).
*   Specific session timeout policies (will use Better Auth defaults for now).
*   Self-registration for new users (users are created by Admins).
*   Account lockout policies after multiple failed login attempts (will use Better Auth defaults if available, otherwise not implemented in this iteration).

## 6. Design Considerations

*   **Login Page:**
    *   The UI should be based on the provided screenshot and React code snippet (`LoginPage.tsx`).
    *   Key elements include: App logo ("LaundroTrack" with receipt icon), tagline, email input, password input, "Remember me" checkbox, "Sign In" button, "Forgot password?" link.
    *   The page should feature a modern, clean aesthetic with subtle background animations and a card-based layout for the login form as shown in the example.
    *   Error messages for invalid login attempts should be clearly displayed.
*   **User Management (Admin):**
    *   A simple, intuitive interface for user management, likely a table view listing users with options for add, edit, delete (soft), and reset password.
    *   Forms for adding/editing users should clearly indicate required fields.
*   **Access Denied Page:**
    *   A simple, user-friendly page indicating that access to the requested resource is not permitted for their role.
    *   The page should display a generic access denied message.
    *   It should include a link to navigate back to the user's dashboard.
    *   It should provide contact information for an administrator for assistance.

## 7. Technical Considerations

*   **Authentication Library:** Better Auth.
*   **ORM & Database:** Prisma with PostgreSQL.
*   **Frontend Framework:** Next.js (App Router).
*   **Styling:** TailwindCSS.
*   **Password Strength:** Utilize default password strength rules provided by Better Auth.
*   **User Deletion:** Implement soft deletes for user accounts (e.g., an `isActive` flag in the database).
*   **Password Reset:** Implement via a secure, time-limited token sent to the user's email.
*   We will be testing BDD style scenarios for this feature for our e2e. For unit testing we will make sure to isolate logic so that we only tests behaviour of the logic and not for UI.

## 8. Success Metrics

*   Users can successfully log in with their email and password.
*   Access to features and data is correctly restricted based on the defined user roles (Staff, Manager, Admin).
*   Administrators can successfully create, edit, soft delete, and trigger password resets for user accounts.
*   Unauthorized access attempts are correctly blocked and/or redirected to an "Access Denied" page.


<!-- All open questions previously listed here have been addressed and integrated into the document. -->
