"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExpenseCategory } from "@prisma/client";
import { toast } from "sonner";
import { useDeleteExpenseCategoryMutation } from "./mutations";
import { ExpenseCategoryDialog } from "./category-dialog";

function ActionsCell({ category }: { category: ExpenseCategory }) {
  const deleteMutation = useDeleteExpenseCategoryMutation();

  const handleDelete = () => {
    toast.error("Are you sure you want to delete this category?", {
      action: {
        label: "Delete",
        onClick: () => deleteMutation.mutate(category.id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <ExpenseCategoryDialog initialData={category}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        </ExpenseCategoryDialog>
        <DropdownMenuItem onClick={handleDelete} disabled={deleteMutation.isPending}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<ExpenseCategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return <ActionsCell category={category} />;
    },
  },
];
