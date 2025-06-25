'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function switchActiveBranch(branchId: string) {
  const cookieStore = await cookies();
  cookieStore.set('active-branch-id', branchId, {
    httpOnly: true,
    path: '/',
  });
  revalidatePath('/');
}
