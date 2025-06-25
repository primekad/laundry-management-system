'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Branch } from '@prisma/client';
import { authClient } from '@/lib/auth-client';
import { switchActiveBranch } from '@/lib/actions/branch-actions';


interface BranchContextType {
  activeBranch: Branch | null;
  setActiveBranch: (branchId: string) => void;
  userBranches: Branch[];
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);
  const [userBranches, setUserBranches] = useState<Branch[]>([]);

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
    const branch = userBranches.find(b => b.id === branchId);
    if (branch) {
      setActiveBranchState(branch);
      await switchActiveBranch(branchId);
    }
  };

  if (isPending) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <BranchContext.Provider value={{ activeBranch, setActiveBranch: handleSetBranch, userBranches }}>
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
