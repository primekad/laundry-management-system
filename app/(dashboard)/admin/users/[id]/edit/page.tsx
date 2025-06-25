import { EditUserForm } from '@/app/(dashboard)/admin/users/[id]/edit-form';
import { fetchUserById, fetchBranches } from '@/lib/data/users';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit User</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <EditUserForm user={user} branches={branches} />
    </main>
  );
}
