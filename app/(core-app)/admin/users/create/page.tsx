import { CreateUserForm } from '@/app/(core-app)/admin/users/create-form';
import { fetchBranches } from '@/lib/data/users';
import Breadcrumbs from '@/components/ui/breadcrumbs';
 
export default async function Page() {
  const branches = await fetchBranches();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Users', href: '/admin/users' },
          {
            label: 'Create User',
            href: '/admin/users/create',
            active: true,
          },
        ]}
      />
      <CreateUserForm branches={branches} />
    </main>
  );
}
