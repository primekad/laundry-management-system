"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Payment, columns } from "./columns";

interface PaymentsDataTableProps {
  data: Payment[];
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
