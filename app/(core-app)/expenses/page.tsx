import { getExpenses } from './actions';
import { ExpensesClient } from './client';
import { CreateExpense } from './buttons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';
import { NotificationHandler } from '@/components/ui/notification-handler';

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="space-y-6">
      <NotificationHandler />

      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">Expenses</h2>
          <p className="text-sm text-slate-600">Manage expense records and transactions</p>
        </div>
        <CreateExpense />
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search expenses..."
                  className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            All Expenses ({expenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ExpensesClient expenses={expenses} />
        </CardContent>
      </Card>
    </div>
  );
}
