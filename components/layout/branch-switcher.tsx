'use client';

import {usePathname} from 'next/navigation';
import {useBranch} from '@/components/providers/branch-provider';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {useToast} from '@/components/ui/use-toast';

export function BranchSwitcher() {
  const { activeBranch, setActiveBranch, userBranches } = useBranch();
  const { toast } = useToast();
  const pathname = usePathname();
  
  // Don't render if no active branch or user has only one branch
  if (!activeBranch || userBranches.length <= 1) {
    return null;
  }
  
  const handleBranchChange = (value: string) => {
    // Check if we're on the new order page and switching to "all"
    if (value === 'all' && pathname === '/orders/new-standardized') {
      toast({
        title: "Creating order with default branch",
        description: "You have 'All Branches' selected. This order will be created under your default branch.",
        variant: "destructive",
        duration: 5000,
      });
    }
    
    setActiveBranch(value);
  };
  
  return (
    <div className="px-4 mb-4">
      <Select 
        onValueChange={handleBranchChange} 
        defaultValue={activeBranch.id === 'all' ? 'all' : activeBranch.id}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
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
