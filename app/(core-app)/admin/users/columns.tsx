"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/definitions";
import { deleteUser, reactivateUser, triggerPasswordReset } from './actions';
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const { name, image } = row.original;
      const fallback = name?.charAt(0).toUpperCase() || 'U';
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={image || ''} alt={name || 'User avatar'} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <p className="font-medium">{name || 'N/A'}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const role = row.original.role as 'admin' | 'manager' | 'staff';
      const roleStyles = {
        admin: 'bg-red-100 text-red-800 hover:bg-red-100',
        manager: 'bg-blue-800 text-blue-100 hover:bg-blue-800',
        staff: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      };

      return (
        <Badge className={`capitalize ${roleStyles[role]}`}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge 
          className={isActive 
            ? 'bg-green-100 text-green-800 hover:bg-green-100'
            : 'bg-red-100 text-red-800 hover:bg-red-100'}
        >
          {isActive ? 'Active' : 'Blocked'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.original.updatedAt;
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const user = row.original;
      const viewUser = table.options.meta?.viewUser;

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
                <Link href={`/admin/users/${user.id}`}>
                  View
                </Link>
              </DropdownMenuItem>
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
