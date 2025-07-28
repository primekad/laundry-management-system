import { fetchUsers } from '@/lib/data/users';
import { ToastHandler } from './toast-handler';
import { UsersClient } from './client';

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const role = params.role || '';
  const status = params.status || '';
  const sortBy = params.sortBy || 'createdAt';
  const sortDirection = (params.sortDirection as 'asc' | 'desc') || 'desc';

  // Fetch users with all parameters
  const result = await fetchUsers({
    page,
    search,
    role,
    status,
    sortBy,
    sortDirection,
  });

  return (
    <div className="space-y-6">
      <ToastHandler />
      <UsersClient
        users={result.users}
        meta={{
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }}
        search={search}
        role={role}
        status={status}
        sortBy={sortBy}
        sortDirection={sortDirection}
      />
    </div>
  );
}
