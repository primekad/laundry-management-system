"use client";

import { ColumnDef } from "@tanstack/react-table";
import { deletePayment } from "./actions";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { Payment } from "@/lib/types";

export const columns: ColumnDef<Payment>[] = [
  {
    id: "customerName",
    accessorKey: "order.customer.name",
    header: "Customer",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS", // TODO: Make this dynamic
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      return <Badge>{row.getValue("paymentMethod")}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const dateValue = row.getValue("createdAt");
      // Check if the value is already a Date object or needs parsing
      const date = dateValue instanceof Date 
        ? dateValue 
        : typeof dateValue === 'string'
          ? parseISO(dateValue)
          : new Date();
      return format(date, "dd/MM/yyyy");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

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
            <DropdownMenuItem asChild>
              <Link href={`/payments/${payment.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                toast.promise(deletePayment(payment.id), {
                  loading: "Deleting payment...",
                  success: "Payment deleted successfully",
                  error: "Failed to delete payment",
                });
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
