"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import type { PaymentListItem } from "./types";

interface PaymentsDataTableProps {
  data: PaymentListItem[];
}

export function PaymentsDataTable({ data }: PaymentsDataTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      filterColumn="customerName"
      filterPlaceholder="Filter by customer..."
    />
  );
}
