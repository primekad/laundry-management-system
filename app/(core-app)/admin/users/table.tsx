import { fetchUsers } from '@/lib/data/users';

import { CreateUser } from '@/app/(core-app)/admin/users/buttons';
import { UserDataTable } from './user-data-table';
import { columns } from './columns';

export default async function UsersTable() {
  const result = await fetchUsers();

  return <UserDataTable columns={columns} data={result.users} />;
}
