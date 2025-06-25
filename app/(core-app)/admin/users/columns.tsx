"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/definitions";
import { deleteUser, reactivateUser, triggerPasswordReset } from '@/lib/actions/users';
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'defaultBranch',
    header: 'Default Branch',
    cell: ({ row }) => {
      return <div>{row.original.defaultBranch?.name}</div>;
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      const handleDelete = async () => {
        const result = await deleteUser(user.id);
        if (!result.success) {
          toast.error(result.message);
        } else {
          toast.success(result.message);
        }
      };

      const handleReactivate = async () => {
        const result = await reactivateUser(user.id);
        if (!result.success) {
          toast.error(result.message);
        } else {
          toast.success(result.message);
        }
      };

      const handlePasswordReset = async () => {
        const result = await triggerPasswordReset(user.id);
        if (!result.success) {
          toast.error(result.message);
        } else {
          toast.success(result.message);
        }
      };

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.isActive ? (
                <DropdownMenuItem
                  onSelect={handleDelete}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={handleReactivate}>
                  Reactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={handlePasswordReset}>
                Send Password Reset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

