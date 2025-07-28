'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { ExpenseListItem } from './types';

interface ExpenseDetailsModalProps {
  expense: ExpenseListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDetailsModal({ expense, open, onOpenChange }: ExpenseDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Expense Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Amount</label>
                <p className="text-lg font-semibold text-slate-900">
                  {new Intl.NumberFormat("en-GH", {
                    style: "currency",
                    currency: "GHS",
                  }).format(expense.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Date</label>
                <p className="text-slate-900">{format(expense.date, "PPP")}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Description</label>
              <p className="text-slate-900">{expense.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Category</label>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                    {expense.category.name}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Branch</label>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {expense.branch.name}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Added By</label>
                <p className="text-slate-900">{expense.user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Order</label>
                {expense.order ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {expense.order.invoiceNumber}
                  </Badge>
                ) : (
                  <p className="text-slate-400">No order linked</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" asChild>
              <Link href={`/expenses/${expense.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Full Details
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/expenses/${expense.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Expense
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
