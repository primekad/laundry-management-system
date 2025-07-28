import { Button } from "@/components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { PaymentsGrid } from "./grid";
import { Suspense } from "react";
import { PaymentsTable } from "./table";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600 mt-1">
            Track and manage all payment transactions
          </p>
        </div>
        <Link href="/payments/create">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <PlusCircledIcon className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentsGrid />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentsTable />
      </Suspense>
    </div>
  );
}
