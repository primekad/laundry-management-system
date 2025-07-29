import { fetchBranches } from '@/lib/data-services/branch-data-service';
import { UserForm } from '@/app/(core-app)/admin/users/user-form';
import Breadcrumbs  from '@/components/ui/breadcrumbs';

export default async function Page() {
  const branches = await fetchBranches();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Users',
            href: '/admin/users',
          },
          {
            label: 'Create User',
            href: '/admin/users/create',
            active: true,
          },
        ]}
      />
      <UserForm branches={branches} intent="create" />
    </main>
  );
}
