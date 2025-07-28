'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Branch } from '@prisma/client';
import { authClient } from '@/lib/auth-client';
import { switchActiveBranch } from '@/lib/actions/branch-actions';


// Virtual branch for 'all branches' option
const ALL_BRANCHES_OPTION = {
  id: 'all',
  name: 'All Branches',
  createdAt: new Date(),
  updatedAt: new Date(),
  address: null,
  phone: null,
};

interface BranchContextType {
  activeBranch: Branch | null | typeof ALL_BRANCHES_OPTION;
  setActiveBranch: (branchId: string) => void;
  userBranches: Branch[];
  allBranchesOption: typeof ALL_BRANCHES_OPTION;
  isAllBranches: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);
  const [userBranches, setUserBranches] = useState<Branch[]>([]);
  
  if(session?.user){
    console.log(document.cookie);
  }
  useEffect(() => {
    if (session?.user) {
      const assignedBranchesString = session.user.assignedBranches as unknown as string;
      const defaultBranchString = session.user.defaultBranch as unknown as string;
      
      const assignedBranches = JSON.parse(assignedBranchesString || '[]') as Branch[];
      const defaultBranch = JSON.parse(defaultBranchString || 'null') as Branch | null;

      setUserBranches(assignedBranches);

      const cookieBranchId = document.cookie.split('; ').find(row => row.startsWith('active-branch-id='))?.split('=')[1];
      const initialBranch = assignedBranches.find(b => b.id === cookieBranchId) || defaultBranch || assignedBranches[0] || null;
      
      setActiveBranchState(initialBranch);
      if (initialBranch) {
        document.cookie = `active-branch-id=${initialBranch.id}; path=/`;
      }
    }
  }, [session, isPending]);

  const handleSetBranch = async (branchId: string) => {
    if (branchId === 'all') {
      setActiveBranchState(ALL_BRANCHES_OPTION);
      await switchActiveBranch(branchId);
      return;
    }
    
    const branch = userBranches.find(b => b.id === branchId);
    if (branch) {
      setActiveBranchState(branch);
      await switchActiveBranch(branchId);
    }
  };

  if (isPending || !activeBranch) {
    //load proper spinner
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  const isAllBranches = activeBranch?.id === 'all';

  return (
    <BranchContext.Provider value={{ 
      activeBranch, 
      setActiveBranch: handleSetBranch, 
      userBranches, 
      allBranchesOption: ALL_BRANCHES_OPTION,
      isAllBranches
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
