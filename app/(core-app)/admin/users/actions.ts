'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setSuccessNotification } from '@/lib/utils/notification-cookies';
import {
  validateCreateUserData,
  validateUpdateUserData,
  extractCreateUserData,
  extractUpdateUserData,
  extractFormFields,
  createValidationErrorResponse,
  createFailureResponse,
  createSuccessResponse,
  type UserActionState,
} from './user-action-helpers';
import {
  createUser as createUserCommand,
  updateUser as updateUserCommand,
  deleteUser as deleteUserCommand,
  reactivateUser as reactivateUserCommand,
  triggerPasswordReset as triggerPasswordResetCommand,
} from '@/lib/data/user-commands';
import { AppUser } from '@/lib/better-auth-helpers/types';

// Re-export the types for backward compatibility
export type State = UserActionState;

export async function createUser(prevState: State, formData: FormData): Promise<State> {
  // Validate form data
  const validation = validateCreateUserData(formData);
  
  if (!validation.success) {

    return createValidationErrorResponse(
      validation.error.flatten().fieldErrors,
      formData
    );
  }

  let newUser: AppUser;
  
  try {
    // Extract and create user data
    const userData = extractCreateUserData(formData);

    newUser = await createUserCommand(userData);
    console.log(newUser);
    // Trigger password reset for new user (with newusr type)
    try {
      await triggerPasswordResetCommand(newUser.id, 'newusr');
      console.log(`Password reset email sent to new user: ${newUser.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email to new user:', emailError);
      // Don't fail the user creation if email fails
    }
    
    // Revalidate on success
    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Create user action error:', error);

    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('email') || error.message.includes('unique')) {
        return createValidationErrorResponse(
          { email: ['Email already in use.'] },
          formData
        );
      }
    }
    
    return createFailureResponse('Failed to create user. Please try again.', extractFormFields(formData));
  }
  
  // Set success notification in cookie and redirect to user view page (outside try-catch to avoid catching NEXT_REDIRECT)
  const successMessage = `User ${newUser.name || newUser.email} created successfully!`;
  await setSuccessNotification(successMessage);
  redirect(`/admin/users/${newUser.id}`);
}

export async function updateUser(id: string, prevState: State, formData: FormData): Promise<State> {
  // Add id to form data for validation
  formData.append('id', id);
  
  console.log("formData",formData);
  // Validate form data
  const validation = validateUpdateUserData(formData);
  
  if (!validation.success) {

    return createValidationErrorResponse(
      validation.error.flatten().fieldErrors,
      formData
    );
  }

  try {
    // Extract and update user data
    const userData = extractUpdateUserData(formData);
    await updateUserCommand(id, userData);
    
    // Revalidate on success
    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Update user action error:', error);

    
    return createFailureResponse('Failed to update user. Please try again.', extractFormFields(formData));
  }
  
  // Set success notification in cookie and redirect to user view page after successful update (outside try-catch to avoid catching NEXT_REDIRECT)
  await setSuccessNotification('User updated successfully!');
  redirect(`/admin/users/${id}`);
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await deleteUserCommand(id);
    revalidatePath('/admin/users');
    return result;
  } catch (error) {
    console.error('Delete user action error:', error);
    return { success: false, message: 'Failed to delete user. Please try again.' };
  }
}

export async function reactivateUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await reactivateUserCommand(id);
    revalidatePath('/admin/users');
    return result;
  } catch (error) {
    console.error('Reactivate user action error:', error);
    return { success: false, message: 'Failed to reactivate user. Please try again.' };
  }
}

export async function triggerPasswordReset(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await triggerPasswordResetCommand(id);
    revalidatePath('/admin/users');
    return result;
  } catch (error) {
    console.error('Password reset action error:', error);
    return { success: false, message: 'Failed to trigger password reset. Please try again.' };
  }
}
