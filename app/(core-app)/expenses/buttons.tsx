'use client';

import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteExpense } from './actions';
import { toast } from 'sonner';
import type { ExpenseListItem } from './types';

export function CreateExpense() {
  return (
    <Button asChild className="bg-primary hover:bg-primary/90 text-white">
      <Link href="/expenses/create" className="gap-1">
        <Plus className="h-4 w-4" />
        New Expense
      </Link>
    </Button>
  );
}

interface ExpenseActionsProps {
  expense: ExpenseListItem;
}

export function ExpenseActions({ expense }: ExpenseActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      toast.success('Expense deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/expenses/${expense.id}`} className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/expenses/${expense.id}/edit`} className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit Expense
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Expense
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense record
              for ₵{expense.amount.toFixed(2)} - {expense.description}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ViewExpense({ expenseId }: { expenseId: string }) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/expenses/${expenseId}`}>
        <Eye className="h-4 w-4 mr-2" />
        View
      </Link>
    </Button>
  );
}

export function EditExpense({ expenseId }: { expenseId: string }) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/expenses/${expenseId}/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Link>
    </Button>
  );
}
