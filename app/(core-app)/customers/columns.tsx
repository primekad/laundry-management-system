"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { CustomerDialog } from "./customer-dialog";
// Use the Customer type from actions.ts
import type { Customer } from "./types";

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Customer Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "totalOrders",
    header: "Total Orders",
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => (
      <div className="font-medium">₵{(row.getValue("totalSpent") as number).toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "amountPaid",
    header: "Amount Paid",
    cell: ({ row }) => (
      <div className="font-medium">₵{(row.getValue("amountPaid") as number).toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "amountToPay",
    header: "Amount Due",
    cell: ({ row }) => {
      const amount = row.getValue("amountToPay") as number;
      return (
        <div className={`font-medium ${amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
          ₵{amount.toFixed(2)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <div className="flex justify-end gap-2">
          <CustomerDialog customer={customer} viewOnly={true}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </CustomerDialog>
          <CustomerDialog customer={customer} viewOnly={false}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </CustomerDialog>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/orders?customer=${customer.id}`}>
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];
