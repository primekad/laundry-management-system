"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import { format } from "date-fns";
import type { ExpenseListItem } from "./types";
import { ExpenseActions } from "./buttons";

export const columns: ColumnDef<ExpenseListItem>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-slate-700 hover:bg-transparent"
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="space-y-1">
          <div className="font-medium text-slate-900 max-w-[200px] truncate" title={description}>
            {description}
          </div>
          <div className="text-sm text-slate-600">
            {row.original.category.name}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const description = row.getValue(id) as string;
      const category = row.original.category.name;
      const searchValue = value.toLowerCase();
      return (
        description.toLowerCase().includes(searchValue) ||
        category.toLowerCase().includes(searchValue)
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-slate-700 hover:bg-transparent"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
      }).format(amount);

      return <div className="font-medium text-slate-900">{formatted}</div>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-slate-700 hover:bg-transparent"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return (
        <div className="space-y-1">
          <div className="text-slate-900">{format(date, "MMM dd, yyyy")}</div>
          <div className="text-sm text-slate-600">{format(date, "HH:mm")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => {
      const branch = row.getValue("branch") as ExpenseListItem["branch"];
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {branch.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.getValue("user") as ExpenseListItem["user"];
      return (
        <div className="text-slate-900">{user.name}</div>
      );
    },
  },
  {
    accessorKey: "order",
    header: "Order",
    cell: ({ row }) => {
      const order = row.getValue("order") as ExpenseListItem["order"];
      return order ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {order.invoiceNumber}
        </Badge>
      ) : (
        <span className="text-slate-400">-</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const expense = row.original;
      const meta = table.options.meta;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta?.viewExpense?.(expense)}
            className="h-8 px-2 text-slate-600 hover:text-slate-900"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <ExpenseActions expense={expense} />
        </div>
      );
    },
  },
];
