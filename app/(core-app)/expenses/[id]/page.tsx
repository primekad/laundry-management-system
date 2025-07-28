import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2, ExternalLink } from 'lucide-react';

import { getExpenseById } from '@/lib/data/expense-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseActions } from '../buttons';
import Breadcrumbs from '@/components/ui/breadcrumbs';

export default async function ExpenseDetailsPage({ params }: { params: { id: string } }) {
  const expense = await getExpenseById(params.id);

  if (!expense) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Expenses', href: '/expenses' },
          { label: 'Expense Details', href: `/expenses/${expense.id}`, active: true },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/expenses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expense Details</h1>
            <p className="text-slate-600">
              {expense.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/expenses/${expense.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense Information */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Amount</label>
                <p className="text-xl font-semibold text-slate-900">
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
                <label className="text-sm font-medium text-slate-600">Receipt</label>
                {expense.receiptUrl ? (
                  <Button variant="outline" size="sm" asChild className="mt-1">
                    <Link href={expense.receiptUrl} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Receipt
                    </Link>
                  </Button>
                ) : (
                  <p className="text-slate-400 mt-1">No receipt</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Created</label>
              <p className="text-slate-900">{format(expense.createdAt, "PPP 'at' p")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Related Information */}
        <Card>
          <CardHeader>
            <CardTitle>Related Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Branch</label>
              <div className="mt-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {expense.branch.name}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Added By</label>
              <div className="space-y-1">
                <p className="text-slate-900 font-medium">{expense.user.name}</p>
                <p className="text-sm text-slate-600">{expense.user.email}</p>
              </div>
            </div>

            {expense.order && (
              <div>
                <label className="text-sm font-medium text-slate-600">Linked Order</label>
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {expense.order.invoiceNumber}
                  </Badge>
                  <p className="text-sm text-slate-600">Customer: {expense.order.customer.name}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orders/${expense.order.id}`}>
                      View Order Details
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
