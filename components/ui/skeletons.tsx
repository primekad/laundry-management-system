import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function UsersTableSkeleton() {
  return (
    <div>
      <div className="flex items-center py-4">
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-6 w-32" /></TableHead>
              <TableHead><Skeleton className="h-6 w-24" /></TableHead>
              <TableHead><Skeleton className="h-6 w-48" /></TableHead>
              <TableHead><Skeleton className="h-6 w-20" /></TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="mt-1 h-4 w-40" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}