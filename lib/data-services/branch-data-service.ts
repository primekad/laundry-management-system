import { unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db';

export async function fetchBranches() {
  noStore();
  try {
    console.log('Fetching branches...');
    const branches = await db.branch.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    console.log('Fetched branches:', branches.length);
    return branches;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch branches.');
  }
}