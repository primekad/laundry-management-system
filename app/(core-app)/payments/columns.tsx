"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import { format } from "date-fns";
import type { PaymentListItem } from "./types";
import { PaymentActions } from "./buttons";

export const columns: ColumnDef<PaymentListItem>[] = [
  {
    accessorKey: "order",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-slate-700 hover:bg-transparent"
        >
          Order / Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const order = row.getValue("order") as PaymentListItem["order"];
      return (
        <div className="space-y-1">
          <div className="font-medium text-slate-900">{order.invoiceNumber}</div>
          <div className="text-sm text-slate-600">{order.customer.name}</div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const order = row.getValue(id) as PaymentListItem["order"];
      const searchValue = value.toLowerCase();
      return (
        order.invoiceNumber.toLowerCase().includes(searchValue) ||
        order.customer.name.toLowerCase().includes(searchValue)
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
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as string;
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          {method.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const statusConfig = {
        PAID: { variant: "default" as const, className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        PENDING: { variant: "secondary" as const, className: "bg-amber-100 text-amber-800 border-amber-200" },
        FAILED: { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200" },
        REFUNDED: { variant: "outline" as const, className: "bg-slate-100 text-slate-800 border-slate-200" },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

      return (
        <Badge variant={config.variant} className={config.className}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
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
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="space-y-1">
          <div className="text-slate-900">{format(date, "MMM dd, yyyy")}</div>
          <div className="text-sm text-slate-600">{format(date, "HH:mm")}</div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const payment = row.original;
      const meta = table.options.meta;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta?.viewPayment?.(payment)}
            className="h-8 px-2 text-slate-600 hover:text-slate-900"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <PaymentActions payment={payment} />
        </div>
      );
    },
  },
];
