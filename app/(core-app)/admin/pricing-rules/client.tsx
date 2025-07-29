"use client";

import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import { PricingRuleDialog } from "./pricing-rule-dialog";
import { Button } from "@/components/ui/button";
import { Filter, Plus, Search } from "lucide-react";
import type { LaundryCategory, PricingRule, ServiceType } from "@prisma/client";
import type { PricingRuleColumn } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
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

interface PricingRulesClientProps {
  pricingRules: (PricingRule & {
    laundryCategory: LaundryCategory;
    serviceType: ServiceType;
  })[];
  laundryCategories: LaundryCategory[];
  serviceTypes: ServiceType[];
}

export function PricingRulesClient({
  pricingRules,
  laundryCategories,
  serviceTypes,
}: PricingRulesClientProps) {
  // Move state to the top and memoize where possible
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRuleColumn | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }); // Control pagination explicitly

  const handleEdit = (rule: PricingRuleColumn) => {
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRule(null);
    // Dialog opening now handled by the Dialog component itself
  };

  const onDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
  };

  // Memoize expensive calculations and configuration
  const columns = useMemo(
    () => getColumns({ 
      onEdit: handleEdit, 
      laundryCategories,
      serviceTypes
    }),
    [handleEdit, laundryCategories, serviceTypes]
  );
  
  // Memoize data transformation to prevent unnecessary re-renders
  const data = useMemo<PricingRuleColumn[]>(
    () => pricingRules.map((rule) => ({ ...rule })),
    [pricingRules]
  );

  // Create table instance with optimized configuration
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination, // Control pagination state explicitly
    state: {
      sorting,
      columnFilters,
      pagination, // Controlled pagination state
    },
    // Improve pagination performance
    manualPagination: false,
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pricing Rules</h1>
            <p className="text-slate-600 mt-1">Set specific pricing for each service type within categories</p>
          </div>
          <PricingRuleDialog
            initialData={null}
            laundryCategories={laundryCategories}
            serviceTypes={serviceTypes}
          >
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Pricing Rule
            </Button>
          </PricingRuleDialog>
        </div>

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
                    placeholder="Search by category..."
                    value={(table.getColumn("laundryCategory")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      table.getColumn("laundryCategory")?.setFilterValue(event.target.value)
                    }
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by service type..."
                    value={(table.getColumn("serviceType")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      table.getColumn("serviceType")?.setFilterValue(event.target.value)
                    }
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">All Rules ({table.getFilteredRowModel().rows.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
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
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No pricing rules found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {/* Optimize calculation to avoid expensive operations during render */}
                Showing {table.getState().pagination.pageSize * table.getState().pagination.pageIndex + 1} to {Math.min(
                  table.getState().pagination.pageSize * (table.getState().pagination.pageIndex + 1),
                  table.getFilteredRowModel().rows.length
                )} of {table.getFilteredRowModel().rows.length} rules
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
