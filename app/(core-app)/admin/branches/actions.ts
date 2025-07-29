'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type State = {
  errors?: {
    name?: string[];
    address?: string[];
    phone?: string[];
  };
  message?: string;
};

const BranchFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
});

const CreateBranch = BranchFormSchema.omit({ id: true });
const UpdateBranch = BranchFormSchema;

export async function createBranch(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = CreateBranch.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Branch.',
    };
  }

  const { name, address, phone } = validatedFields.data;

  try {
    await db.branch.create({
      data: {
        name,
        address,
        phone,
      },
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Branch.',
    };
  }

  revalidatePath('/admin/branches');
  redirect('/admin/branches');
}

export async function updateBranch(id: string, prevState: State, formData: FormData): Promise<State> {
  const validatedFields = UpdateBranch.safeParse({
    id,
    name: formData.get('name'),
    address: formData.get('address'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Branch.',
    };
  }

  const { name, address, phone } = validatedFields.data;

  try {
    await db.branch.update({
      where: { id },
      data: {
        name,
        address,
        phone,
      },
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Update Branch.' };
  }

  revalidatePath('/admin/branches');
  redirect('/admin/branches');
}

export async function deleteBranch(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await db.branch.delete({ where: { id } });
    revalidatePath('/admin/branches');
    return { success: true, message: 'Branch deleted.' };
  } catch (error) {
    return { success: false, message: 'Database Error: Failed to Delete Branch.' };
  }
}

export async function getBranches() {
  try {
    return await db.branch.findMany();
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch branches.');
  }
}

export async function getBranchById(id: string) {
  try {
    return await db.branch.findUnique({ where: { id } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch branch.');
  }
}