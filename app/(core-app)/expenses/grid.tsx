'use client';

import * as React from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ExpenseDataTable } from './expense-data-table';
import { columns } from './columns';
import { Expense } from '@/lib/types';

interface ExpensesGridProps {
  initialData: Expense[];
}

export function ExpensesGrid({ initialData }: ExpensesGridProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const descriptionFilter = (columnFilters.find(f => f.id === 'description')?.value as string) ?? '';

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setColumnFilters(prev => {
      const otherFilters = prev.filter(f => f.id !== 'description');
      if (value) {
        return [...otherFilters, { id: 'description', value }];
      }
      return otherFilters;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by description..."
              value={descriptionFilter}
              onChange={handleFilterChange}
              className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
         <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">All Expenses ({initialData.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
            <ExpenseDataTable
                data={initialData}
                columns={columns}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
            />
        </CardContent>
      </Card>
    </div>
  );
}
