'use client';

import { useBranch } from '@/components/providers/branch-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function BranchSwitcher() {
  const { activeBranch, setActiveBranch, userBranches } = useBranch();

  if (!activeBranch || userBranches.length <= 1) {
    return null;
  }

  return (
    <div className="px-4 mb-4">
      <Select onValueChange={setActiveBranch} defaultValue={activeBranch.id}>
        <SelectTrigger>
          <SelectValue placeholder="Select a branch" />
        </SelectTrigger>
        <SelectContent>
          {userBranches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
