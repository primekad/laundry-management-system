import { fetchUserById } from '@/lib/data/users';
import { fetchBranches } from '@/lib/data-services/branch-data-service';
import { UserForm } from '@/app/(core-app)/admin/users/user-form';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [user, branches] = await Promise.all([
    fetchUserById(id),
    fetchBranches(),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Users',
            href: '/admin/users',
          },
          {
            label: 'Edit User',
            href: `/admin/users/${id}/edit`,
            active: true,
          },
        ]}
      />
      <UserForm user={user} branches={branches} intent="edit" />
    </main>
  );
}
