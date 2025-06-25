import UsersTable from '@/app/(core-app)/admin/users/table';
import { Suspense } from 'react';
import { UsersTableSkeleton } from '@/components/ui/skeletons';

export default async function Page() {
  return (
    <div className="w-full">
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
