import { fetchBranches } from '@/lib/data/branches';
import { BranchesClient } from './client';

export default async function Page() {
  const branches = await fetchBranches();
  return <BranchesClient branches={branches} />;
}
