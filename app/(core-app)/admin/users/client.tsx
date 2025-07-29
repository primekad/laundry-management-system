'use client';

import { useState } from "react";
import { format } from "date-fns";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { columns } from './columns';
import { CreateUser } from './buttons';
import { User } from "@/lib/definitions";

// Helper to build URL with updated search parameters
function getFilterUrl(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'undefined') {
      searchParams.set(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

interface UsersClientProps {
  users: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: string;
}

export function UsersClient({
  users,
  meta,
  search,
  role,
  status,
  sortBy,
  sortDirection,
}: UsersClientProps) {
  const router = useRouter();
  
  // Local state for form values
  const [searchValue, setSearchValue] = useState(search || "");
  const [selectedRole, setSelectedRole] = useState(role || "");
  const [selectedStatus, setSelectedStatus] = useState(status || "");
  
  // Table sort state
  const [sorting, setSorting] = useState<SortingState>(
    sortBy && sortDirection ? [{ id: sortBy, desc: sortDirection === 'desc' }] : []
  );

  // Create table instance
  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Handle filter submission
  const handleFilter = () => {
    // Don't send "all" to the backend - convert to undefined
    const roleFilter = selectedRole === "all" ? undefined : selectedRole;
    const statusFilter = selectedStatus === "all" ? undefined : selectedStatus;
    
    const params: Record<string, string | undefined> = {
      page: "1",
      search: searchValue || undefined,
      role: roleFilter,
      status: statusFilter,
    };
    
    router.push(`/admin/users${getFilterUrl(params)}`);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedRole("");
    setSelectedStatus("");
    router.push("/admin/users");
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600 mt-1">Manage and track all users</p>
        </div>
        <CreateUser />
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4">
          {/* Search - always visible */}
          <div className="mb-4 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search users by name or email..." 
                className="pl-10 w-full"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
            
          {/* Advanced Filters Disclosure */}
          <Collapsible className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 gap-1">
                  <Settings className="h-4 w-4" />
                  Advanced Filters
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
              
            <CollapsibleContent className="space-y-6 pt-4">
              {/* Role and Status filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-medium">Role</Label>
                  <Select 
                    value={selectedRole || "all"} 
                    onValueChange={(value) => setSelectedRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="User Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  
                <div className="space-y-2">
                  <Label className="font-medium">Status</Label>
                  <Select 
                    value={selectedStatus || "all"} 
                    onValueChange={(value) => setSelectedStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="User Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
            
            {/* Apply/Reset buttons below advanced filters */}
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleResetFilters} size="sm">
                Reset
              </Button>
              <Button onClick={handleFilter} size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </Collapsible>
        </CardContent>
      </Card>
      
      {/* Users Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            All Users ({meta.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Showing {users.length} of {meta.total} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentPage = Number(meta.page || 1);
                if (currentPage > 1) {
                  const previousPage = currentPage - 1;
                  const params: Record<string, string | undefined> = {
                    page: previousPage.toString(),
                    search: searchValue || undefined,
                    role: selectedRole === "all" ? undefined : selectedRole,
                    status: selectedStatus === "all" ? undefined : selectedStatus,
                  };
                  router.push(`/admin/users${getFilterUrl(params)}`);
                }
              }}
              disabled={Number(meta.page || 1) === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <div className="text-sm">
              Page {meta.page || 1} of {meta.totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentPage = Number(meta.page || 1);
                if (currentPage < (meta.totalPages || 1)) {
                  const nextPage = currentPage + 1;
                  const params: Record<string, string | undefined> = {
                    page: nextPage.toString(),
                    search: searchValue || undefined,
                    role: selectedRole === "all" ? undefined : selectedRole,
                    status: selectedStatus === "all" ? undefined : selectedStatus,
                  };
                  router.push(`/admin/users${getFilterUrl(params)}`);
                }
              }}
              disabled={Number(meta.page || 1) >= (meta.totalPages || 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
