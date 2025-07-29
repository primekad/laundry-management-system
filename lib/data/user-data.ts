import { db } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchUserById(id: string) {
  noStore();
  try {
    const userData = await db.user.findUnique({
      where: { id },
      include: {
        defaultBranch: true,
        assignedBranches: true,
      },
    });

    if (!userData) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}
