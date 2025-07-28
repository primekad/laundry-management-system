import { fetchBranches } from '@/lib/data/branches';

import { CreateBranch } from '@/app/(core-app)/admin/branches/buttons';
import { BranchDataTable } from './branch-data-table';
import { columns } from './columns';

export default async function BranchesTable() {
  const branches = await fetchBranches();

  return <BranchDataTable columns={columns} data={branches} />;
}
