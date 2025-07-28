import { fetchBranchById } from '@/lib/data/branches';
import { BranchForm } from '@/app/(core-app)/admin/branches/branch-form';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const branch = await fetchBranchById(id);

  if (!branch) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Branches',
            href: '/admin/branches',
          },
          {
            label: 'Edit Branch',
            href: `/admin/branches/${id}/edit`,
            active: true,
          },
        ]}
      />
      <BranchForm branch={branch} intent="edit" />
    </main>
  );
}
