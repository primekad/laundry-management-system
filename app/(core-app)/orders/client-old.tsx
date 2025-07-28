'use client';

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  AlertTriangle,
  CalendarIcon,
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  MoreHorizontal,
  Plus, 
  Search,
  Eye,
  Edit,
  Printer
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useBranch } from "@/components/providers/branch-provider";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type { Order } from "./types";

// Date formatter helper function
function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  return format(new Date(date), "MMM d, yyyy");
}

// Render status badge with proper coloring
function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    PROCESSING: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    COMPLETED: "bg-green-100 text-green-800 hover:bg-green-100",
    CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge 
      className={cn(
        "font-medium",
        statusColors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
      )}
      variant="outline"
    >
      {status}
    </Badge>
  );
}

// Render payment status badge with proper coloring
function PaymentBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    PAID: "bg-green-100 text-green-800 hover:bg-green-100",
    PARTIALLY_PAID: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    UNPAID: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge 
      className={cn(
        "font-medium",
        statusColors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
      )}
      variant="outline"
    >
      {status.replace('_', ' ')}
    </Badge>
  );
}

// Helper to build URL with updated search parameters
function getFilterUrl(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  
  return `?${searchParams.toString()}`;
}

// Actions menu component that replaces OrderGridActions
function OrderActionMenu({ order }: { order: Order }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/orders/${order.id}/view`}>
          <DropdownMenuItem className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>View details</span>
          </DropdownMenuItem>
        </Link>
        <Link href={`/orders/${order.id}/edit`}>
          <DropdownMenuItem className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit order</span>
          </DropdownMenuItem>
        </Link>
        <Link href={`/orders/${order.id}/print`}>
          <DropdownMenuItem className="cursor-pointer">
            <Printer className="mr-2 h-4 w-4" />
            <span>Print invoice</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Date picker component for filter UI
function DatePickerWithRange({
  date,
  setDate,
  placeholder,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface OrdersClientProps {
  orders: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  status?: string;
  payment?: string;
  search?: string;
  branchId?: string;
  orderDateFrom?: string;
  orderDateTo?: string;
  expectedDateFrom?: string;
  expectedDateTo?: string;
}

export function OrdersClient({
  orders,
  meta,
  status,
  payment,
  search,
  branchId,
  orderDateFrom,
  orderDateTo,
  expectedDateFrom,
  expectedDateTo
}: OrdersClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { activeBranch, userBranches } = useBranch();

  // States for date pickers
  const [orderDateStart, setOrderDateStart] = useState<Date | undefined>(
    orderDateFrom ? new Date(orderDateFrom) : undefined
  );
  const [orderDateEnd, setOrderDateEnd] = useState<Date | undefined>(
    orderDateTo ? new Date(orderDateTo) : undefined
  );
  const [expectedDateStart, setExpectedDateStart] = useState<Date | undefined>(
    expectedDateFrom ? new Date(expectedDateFrom) : undefined
  );
  const [expectedDateEnd, setExpectedDateEnd] = useState<Date | undefined>(
    expectedDateTo ? new Date(expectedDateTo) : undefined
  );

  // State for search input
  const [searchValue, setSearchValue] = useState(search || "");

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Column filters state for TanStack table
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Define table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice Number",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("invoiceNumber")}</div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-500">{customer.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => <PaymentBadge status={row.getValue("paymentStatus")} />,
    },
    {
      accessorKey: "createdAt",
      header: "Order Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Expected Delivery",
      cell: ({ row }) => formatDate(row.original.expectedDeliveryDate),
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => {
        const branch = row.original.branch;
        return branch ? branch.name : "-";
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ${Number(row.getValue("amount")).toFixed(2)}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <OrderActionMenu order={row.original} />,
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Handle filter changes
  const handleFilter = () => {
    const filterParams = {
      page: "1", // Reset to first page when filtering
      status,
      payment,
      search: searchValue,
      branchId,
      orderDateFrom: orderDateStart ? format(orderDateStart, "yyyy-MM-dd") : undefined,
      orderDateTo: orderDateEnd ? format(orderDateEnd, "yyyy-MM-dd") : undefined,
      expectedDateFrom: expectedDateStart ? format(expectedDateStart, "yyyy-MM-dd") : undefined,
      expectedDateTo: expectedDateEnd ? format(expectedDateEnd, "yyyy-MM-dd") : undefined,
    };

    // Navigate with updated search params
    router.push(`/orders${getFilterUrl(filterParams)}`);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchValue("");
    setOrderDateStart(undefined);
    setOrderDateEnd(undefined);
    setExpectedDateStart(undefined);
    setExpectedDateEnd(undefined);
    router.push("/orders");
  };

  // Handle new order with branch warning
  const handleNewOrder = () => {
    if (branchId === "all") {
      toast({
        title: "Branch Selection",
        description: "You have 'All branches' selected. The order will be created under your default branch.",
        icon: <AlertTriangle className="h-4 w-4" />,
        duration: 5000,
      });
    }
    router.push("/orders/new");
  };

  // Get total pages for pagination
  const { totalPages } = meta;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Button onClick={handleNewOrder}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search invoice or customer..." 
                className="flex-1"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            
            {/* Status filter */}
            <Select value={status} onValueChange={(value) => router.push(`/orders${getFilterUrl({ ...meta, status: value })}`)}>
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Payment status filter */}
            <Select value={payment} onValueChange={(value) => router.push(`/orders${getFilterUrl({ ...meta, payment: value })}`)}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Payments</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Branch filter */}
            {userBranches.length > 1 && (
              <Select value={branchId} onValueChange={(value) => router.push(`/orders${getFilterUrl({ ...meta, branchId: value })}`)}>
                <SelectTrigger>
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {userBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Order date from */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order Date From</p>
              <DatePickerWithRange 
                date={orderDateStart}
                setDate={setOrderDateStart}
                placeholder="Select date"
              />
            </div>
            
            {/* Order date to */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order Date To</p>
              <DatePickerWithRange 
                date={orderDateEnd}
                setDate={setOrderDateEnd}
                placeholder="Select date"
              />
            </div>
            
            {/* Expected delivery date from */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Delivery Date From</p>
              <DatePickerWithRange 
                date={expectedDateStart}
                setDate={setExpectedDateStart}
                placeholder="Select date"
              />
            </div>
            
            {/* Expected delivery date to */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Delivery Date To</p>
              <DatePickerWithRange 
                date={expectedDateEnd}
                setDate={setExpectedDateEnd}
                placeholder="Select date"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Showing {orders.length} of {meta.total} orders
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentPage = Number(meta.page || 1);
                if (currentPage > 1) {
                  const previousPage = currentPage - 1;
                  router.push(`/orders${getFilterUrl({ ...meta, page: previousPage.toString() })}`);
                }
              }}
              disabled={Number(meta.page || 1) === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <div className="text-sm">
              Page {meta.page || 1} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentPage = Number(meta.page || 1);
                if (currentPage < (totalPages || 1)) {
                  const nextPage = currentPage + 1;
                  router.push(`/orders${getFilterUrl({ ...meta, page: nextPage.toString() })}`);
                }
              }}
              disabled={Number(meta.page || 1) >= (totalPages || 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  AlertTriangle,
  CalendarIcon,
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  MoreHorizontal,
  Plus, 
  Search,
  Eye,
  Edit,
  Printer
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useBranch } from "@/components/providers/branch-provider";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type { Order } from "./types";

// Date formatter helper function
function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  return format(new Date(date), "MMM d, yyyy");
}

// Render status badge with proper coloring
function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    PROCESSING: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    COMPLETED: "bg-green-100 text-green-800 hover:bg-green-100",
    CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge 
      className={cn(
        "font-medium",
        statusColors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
      )}
      variant="outline"
    >
      {status}
    </Badge>
  );
}

// Render payment status badge with proper coloring
function PaymentBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    PAID: "bg-green-100 text-green-800 hover:bg-green-100",
    PARTIALLY_PAID: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    UNPAID: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge 
      className={cn(
        "font-medium",
        statusColors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
      )}
      variant="outline"
    >
      {status.replace('_', ' ')}
    </Badge>
  );
}

// Helper to build URL with updated search parameters
function getFilterUrl(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  
  return `?${searchParams.toString()}`;
}

// Actions menu component that replaces OrderGridActions
function OrderActionMenu({ order }: { order: Order }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/orders/${order.id}/view`}>
          <DropdownMenuItem className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>View details</span>
          </DropdownMenuItem>
        </Link>
        <Link href={`/orders/${order.id}/edit`}>
          <DropdownMenuItem className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit order</span>
          </DropdownMenuItem>
        </Link>
        <Link href={`/orders/${order.id}/print`}>
          <DropdownMenuItem className="cursor-pointer">
            <Printer className="mr-2 h-4 w-4" />
            <span>Print invoice</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Date picker component for filter UI
function DatePickerWithRange({
  date,
  setDate,
  placeholder,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface OrdersClientProps {
  orders: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  status?: string;
  payment?: string;
  search?: string;
  branchId?: string;
  orderDateFrom?: string;
  orderDateTo?: string;
  expectedDateFrom?: string;
  expectedDateTo?: string;
}

export function OrdersClient({
  orders,
  meta,
  status,
  payment,
  search,
  branchId,
  orderDateFrom,
  orderDateTo,
  expectedDateFrom,
  expectedDateTo
}: OrdersClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { activeBranch, userBranches } = useBranch();

  // States for date pickers
  const [orderDateStart, setOrderDateStart] = useState<Date | undefined>(
    orderDateFrom ? new Date(orderDateFrom) : undefined
  );
  const [orderDateEnd, setOrderDateEnd] = useState<Date | undefined>(
    orderDateTo ? new Date(orderDateTo) : undefined
  );
  const [expectedDateStart, setExpectedDateStart] = useState<Date | undefined>(
    expectedDateFrom ? new Date(expectedDateFrom) : undefined
  );
  const [expectedDateEnd, setExpectedDateEnd] = useState<Date | undefined>(
    expectedDateTo ? new Date(expectedDateTo) : undefined
  );

  // State for search input
  const [searchValue, setSearchValue] = useState(search || "");

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Column filters state for TanStack table
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Define table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice Number",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("invoiceNumber")}</div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-500">{customer.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => <PaymentBadge status={row.getValue("paymentStatus")} />,
    },
    {
      accessorKey: "createdAt",
      header: "Order Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Expected Delivery",
      cell: ({ row }) => formatDate(row.original.expectedDeliveryDate),
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => {
        const branch = row.original.branch;
        return branch ? branch.name : "-";
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ${Number(row.getValue("amount")).toFixed(2)}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <OrderActionMenu order={row.original} />,
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Handle filter changes
  const handleFilter = () => {
    const filterParams = {
      page: "1", // Reset to first page when filtering
      status,
      payment,
      search: searchValue,
      branchId,
      orderDateFrom: orderDateStart ? format(orderDateStart, "yyyy-MM-dd") : undefined,
      orderDateTo: orderDateEnd ? format(orderDateEnd, "yyyy-MM-dd") : undefined,
      expectedDateFrom: expectedDateStart ? format(expectedDateStart, "yyyy-MM-dd") : undefined,
      expectedDateTo: expectedDateEnd ? format(expectedDateEnd, "yyyy-MM-dd") : undefined,
    };

    // Navigate with updated search params
    router.push(`/orders${getFilterUrl(filterParams)}`);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchValue("");
    setOrderDateStart(undefined);
    setOrderDateEnd(undefined);
    setExpectedDateStart(undefined);
    setExpectedDateEnd(undefined);
    router.push("/orders");
  };

  // Handle new order with branch warning
  const handleNewOrder = () => {
    if (branchId === "all") {
      toast({
        title: "Branch Selection",
        description: "You have 'All branches' selected. The order will be created under your default branch.",
        icon: <AlertTriangle className="h-4 w-4" />,
        duration: 5000,
      });
    }
    router.push("/orders/new");
  };

  // Get total pages for pagination
  const { totalPages } = meta;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Button onClick={handleNewOrder}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search invoice or customer..." 
                className="flex-1"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            
            {/* Status filter */}
            <Select value={status} onValueChange={(value) => router.push(`/orders${getFilterUrl({ ...meta, status: value })}`)}>
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Payment status filter */}
            <Select value={payment} onValueChange={(value) => router.push(`/orders${getFilterUrl({ ...meta, payment: value })}`)}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Payments</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Branch filter */}
            {userBranches.length > 1 && (
              <Select value={branchId} onValueChange={(value) => router.push(`/orders${getFilterUrl({ ...meta, branchId: value })}`)}>
                <SelectTrigger>
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {userBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Order date from */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order Date From</p>
              <DatePickerWithRange 
                date={orderDateStart}
                setDate={setOrderDateStart}
                placeholder="Select date"
              />
            </div>
            
            {/* Order date to */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order Date To</p>
              <DatePickerWithRange 
                date={orderDateEnd}
                setDate={setOrderDateEnd}
                placeholder="Select date"
              />
            </div>
            
            {/* Expected delivery date from */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Delivery Date From</p>
              <DatePickerWithRange 
                date={expectedDateStart}
                setDate={setExpectedDateStart}
                placeholder="Select date"
              />
            </div>
            
            {/* Expected delivery date to */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Delivery Date To</p>
              <DatePickerWithRange 
                date={expectedDateEnd}
                setDate={setExpectedDateEnd}
                placeholder="Select date"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Showing {orders.length} of {meta.total} orders
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentPage = Number(meta.page || 1);
                if (currentPage > 1) {
                  const previousPage = currentPage - 1;
                  router.push(`/orders${getFilterUrl({ ...meta, page: previousPage.toString() })}`);
                }
              }}
              disabled={Number(meta.page || 1) === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <div className="text-sm">
              Page {meta.page || 1} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentPage = Number(meta.page || 1);
                if (currentPage < (totalPages || 1)) {
                  const nextPage = currentPage + 1;
                  router.push(`/orders${getFilterUrl({ ...meta, page: nextPage.toString() })}`);
                }
              }}
              disabled={Number(meta.page || 1) >= (totalPages || 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
