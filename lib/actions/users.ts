'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import {
  createUser as createUserHelper,
  deleteUser as deleteUserHelper,
  setUserRole,
  unbanUser,
  banUser,
} from '@/lib/better-auth-helpers/user-commands-helpers';
import { getUserById } from '@/lib/better-auth-helpers/user-queries-helpers';
import type { CreateUserData } from '@/lib/better-auth-helpers/types';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserFormSchema } from '@/lib/actions/userFormSchema';

export type State = {
  errors: {
    id?: string[];
    firstName?: string[];
    surname?: string[];
    phoneNumber?: string[];
    role?: string[];
    isActive?: string[];
    defaultBranchId?: string[];
    secondaryBranchIds?: string[];
    email?: string[];
  };
  message: string;
};

const CreateUser = UserFormSchema.omit({ id: true, isActive: true });
const UpdateUser = UserFormSchema.omit({ email: true });

export async function createUser(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = CreateUser.safeParse({
    firstName: formData.get('firstName'),
    surname: formData.get('surname'),
    email: formData.get('email'),
    role: formData.get('role'),
    defaultBranchId: formData.get('defaultBranchId'),
    phoneNumber: formData.get('phoneNumber'),
    secondaryBranchIds: formData.get('secondaryBranchIds'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create User.',
    };
  }

  const { firstName, surname, email, role, defaultBranchId, phoneNumber, secondaryBranchIds } = validatedFields.data;
  const name = `${firstName} ${surname}`;

  const createUserData: CreateUserData = {
    name,
    email,
    password: 'password', // Default password, user should reset
    role,
    data: {
      defaultBranchId,
      phoneNumber,
    },
  };

  try {
    const newUser = await createUserHelper(createUserData);
    const branchIds = secondaryBranchIds?.split(',').filter(id => id.trim() !== '').map(id => ({ id })) || [];

    if (branchIds.length > 0) {
      await db.user.update({
        where: { id: newUser.id },
        data: {
          assignedBranches: {
            connect: branchIds,
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return {
        errors: { email: ['Email already in use.'] },
        message: 'Email already in use. Failed to Create User.',
      };
    }
    return {
      errors: {},
      message: 'Database Error: Failed to Create User.',
    };
  }

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function updateUser(id: string, prevState: State, formData: FormData): Promise<State> {
  const validatedFields = UpdateUser.safeParse({
    id,
    firstName: formData.get('firstName'),
    surname: formData.get('surname'),
    role: formData.get('role'),
    defaultBranchId: formData.get('defaultBranchId'),
    isActive: formData.get('isActive') === 'on',
    phoneNumber: formData.get('phoneNumber'),
    secondaryBranchIds: formData.get('secondaryBranchIds'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update User.',
    };
  }

  const { firstName, surname, role, defaultBranchId, isActive, phoneNumber, secondaryBranchIds } = validatedFields.data;
  const name = `${firstName} ${surname}`;
  const branchIds = secondaryBranchIds?.split(',').map(id => ({ id })) || [];

  try {
    await setUserRole(id, role as 'admin' | 'manager' | 'staff');

    if (isActive) {
      await unbanUser(id);
    } else {
      await banUser(id);
    }

    // The auth helpers do not support updating arbitrary user profile data,
    // so we still need to call the database directly for these fields.
    await db.user.update({
      where: { id },
      data: {
        name,
        defaultBranchId,
        phoneNumber,
        updatedAt: new Date(),
        assignedBranches: {
          set: branchIds,
        },
      },
    });
  } catch (error) {
    return { errors: {}, message: 'Database Error: Failed to Update User.' };
  }

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await deleteUserHelper(id);
    revalidatePath('/admin/users');
    return { success: true, message: 'User deleted.' };
  } catch (error) {
    return { success: false, message: 'Database Error: Failed to Delete User.' };
  }
}

export async function reactivateUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await unbanUser(id);
    revalidatePath('/admin/users');
    return { success: true, message: 'User reactivated successfully.' };
  } catch (error) {
    return { success: false, message: 'Database Error: Failed to Reactivate User.' };
  }
}

export async function triggerPasswordReset(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getUserById(id);
    if (user && user.email) {
      await auth.api.forgetPassword({ body: { email: user.email } });
      return { success: true, message: 'Password reset link sent.' };
    }
    return { success: false, message: 'User not found.' };
  } catch (error) {
    return { success: false, message: 'Database Error: Failed to trigger password reset.' };
  }
}
