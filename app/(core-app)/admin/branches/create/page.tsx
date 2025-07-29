import { BranchForm } from '@/app/(core-app)/admin/branches/branch-form';
import Breadcrumbs  from '@/components/ui/breadcrumbs';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Branches',
            href: '/admin/branches',
          },
          {
            label: 'Create Branch',
            href: '/admin/branches/create',
            active: true,
          },
        ]}
      />
      <BranchForm intent="create" />
    </main>
  );
}
