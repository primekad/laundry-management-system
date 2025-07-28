import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getOrders } from "./actions"
import { OrdersClient } from "./client"
import { getCurrentUser } from "@/lib/auth-server"

import { type Order } from "./types";

// Server component to fetch data on the server
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    limit?: string; 
    status?: string; 
    payment?: string; 
    search?: string; 
    sort?: string;
    branchId?: string;
    orderDateFrom?: string;
    orderDateTo?: string;
    expectedDateFrom?: string;
    expectedDateTo?: string;
  }>;
}) {

  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const limit = resolvedSearchParams.limit ? parseInt(resolvedSearchParams.limit) : 10;
  const status = resolvedSearchParams.status || 'ALL';
  const payment = resolvedSearchParams.payment || 'ALL';
  const search = resolvedSearchParams.search || '';
  const branchId = resolvedSearchParams.branchId || '';
  const orderDateFrom = resolvedSearchParams.orderDateFrom || '';
  const orderDateTo = resolvedSearchParams.orderDateTo || '';
  const expectedDateFrom = resolvedSearchParams.expectedDateFrom || '';
  const expectedDateTo = resolvedSearchParams.expectedDateTo || '';
  
  // Get current user for default branch info if no branch is selected
  const session = await getCurrentUser();

  // Parse assigned branches from session
  const assignedBranchesString = session?.user?.assignedBranches as unknown as string;
  const defaultBranchString = session?.user?.defaultBranch as unknown as string;
  const assignedBranches = JSON.parse(assignedBranchesString || '[]');
  const defaultBranch = JSON.parse(defaultBranchString || 'null');
  
  // Determine which branch ID to use for filtering
  let activeBranchId = branchId;
  
  // If no specific branch ID is provided or it's 'ALL', but user only has one branch,
  // use their default branch
  if ((!activeBranchId || activeBranchId === 'ALL') && assignedBranches.length === 1) {
    activeBranchId = assignedBranches[0].id;
  }
  
  // Fetch orders with pagination & filters
  const { orders, meta } = await getOrders({
    page,
    limit,
    status: status !== 'ALL' ? status : undefined,
    paymentStatus: payment !== 'ALL' ? payment : undefined,
    branchId: activeBranchId !== 'ALL' ? activeBranchId : undefined,
    search: search || undefined,
    orderDateFrom: orderDateFrom || undefined,
    orderDateTo: orderDateTo || undefined,
    expectedDateFrom: expectedDateFrom || undefined,
    expectedDateTo: expectedDateTo || undefined,
  });

  if (!orders) {
    redirect('/orders?page=1');
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">Orders</h2>
          <p className="text-sm text-slate-600">Manage customer laundry orders</p>
        </div>
        <Button asChild>
          <Link href="/orders/new" className="gap-1">
            <Plus className="h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>
      
      {/* Client component handles all UI rendering with TanStack React Table */}
      <OrdersClient 
        orders={orders} 
        meta={meta} 
        status={status} 
        payment={payment} 
        search={search}
      />
    </div>
  )
}
