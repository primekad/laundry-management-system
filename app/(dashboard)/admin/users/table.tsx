import { fetchUsers } from '@/lib/data/users';

import { CreateUser } from '@/app/(dashboard)/admin/users/buttons';
import { UserDataTable } from './user-data-table';
import { columns } from './columns';

export default async function UsersTable() {
  const users = await fetchUsers();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Users</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <CreateUser />
      </div>
      <UserDataTable columns={columns} data={users} />
    </div>
  );
}
