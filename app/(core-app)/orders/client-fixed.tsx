'use client';

import {useState} from "react";
import {format} from "date-fns";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MoreHorizontal,
  Printer,
  Search,
  Settings,
} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {EditOrderButton} from "@/components/edit-order-button";
import {cn} from "@/lib/utils";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible";
import {Label} from "@/components/ui/label";
import {useBranch} from "@/components/providers/branch-provider";
import {useToast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";
// Import types from proper location
import {OrderStatus, PaymentStatus} from "@prisma/client";

// Status and payment labels mapping
const orderStatusLabels: Record<string, string> = {
  "PENDING": "Pending",
  "PROCESSING": "Washing",
  "COMPLETED": "Ready for pickup",
  "DELIVERED": "Delivered",
  "CANCELLED": "Cancelled",
};

// Map backend payment status values to display labels
// Important: Use the actual backend enum values (PAID, PARTIAL, PENDING) for filtering
// but display user-friendly labels in the UI
const paymentStatusLabels: Record<string, string> = {
  "PAID": "Paid",
  "PARTIAL": "Partially Paid",
  "PENDING": "Unpaid",
};

// Helper for formatting dates
function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  return format(new Date(date), "MMM d, yyyy");
}

// Render status badge with proper coloring
function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    PROCESSING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    COMPLETED: "bg-green-100 text-green-800 hover:bg-green-100",
    DELIVERED: "bg-purple-100 text-purple-800 hover:bg-purple-100",
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
      {orderStatusLabels[status] || status.replace('_', ' ')}
    </Badge>
  );
}

// Render payment status badge with proper coloring
function PaymentBadge({ status }: { status: string }) {
  // Color mappings use the actual backend enum values directly
  const statusColors: Record<string, string> = {
    PAID: "bg-green-100 text-green-800 hover:bg-green-100",
    PARTIAL: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    PENDING: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge 
      className={cn(
        "font-medium",
        statusColors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
      )}
      variant="outline"
    >
      {paymentStatusLabels[status] || status.replace('_', ' ')}
    </Badge>
  );
}

// Helper to build URL with updated search parameters
function getFilterUrl(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }
  
  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

// Actions menu component that replaces OrderGridActions
function OrderActionMenu({ order }: { order: Order }) {
  const router = useRouter();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => {
          e.preventDefault();
        }}>
          <div className="flex items-center w-full">
            <EditOrderButton
              order={{
                id: order.id,
                status: order.status,
                notes: order.notes || null,
                expectedDeliveryDate: order.expectedDeliveryDate ? order.expectedDeliveryDate.toISOString().split('T')[0] : null,
                orderDate: order.orderDate ? order.orderDate.toISOString().split('T')[0] : null
              }}
              variant="ghost"
              iconOnly={false}
              size="sm"
              className="w-full justify-start p-0 h-auto"
            />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}/invoice`)}>
          <Printer className="mr-2 h-4 w-4" /> Print Invoice
        </DropdownMenuItem>
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

// Define our complete Order type with all required properties
type Order = {
  id: string;
  invoiceNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  amount?: number; // Optional for backward compatibility
  totalAmount?: number; // Primary amount field from database
  createdAt: Date;
  expectedDeliveryDate?: Date | null; // Match database type
  orderDate?: Date | null; // Match database type
  notes?: string | null; // Add notes property
  customer?: {
    name: string;
    phone: string | null;
    email: string;
    address: string | null;
    id: string;
  };
  branch?: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  payments?: {
    id: string;
    amount: number;
    date: Date;
  }[];
  items?: any[]; // Match database type
  amountDue?: number; // Added for amount pending calculation
  amountPaid?: number; // Added for amount paid calculation
};

type OrdersClientProps = {
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
};

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
  expectedDateTo,
}: OrdersClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { userBranches } = useBranch();
  
  // Local state for form values
  const [searchValue, setSearchValue] = useState(search || "");
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
  
  // Table sort state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Define columns for the order table
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice",
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div className="font-medium">{row.original.invoiceNumber}</div>
        );
      },
    },
    {
      accessorKey: "customer",
      header: "Customer",
      enableSorting: true,
      cell: ({ row }) => {
        const customer = row.original.customer;
        if (!customer) return "-";
        
        return (
          <div className="flex flex-col">
            <div className="font-medium">{customer.name}</div>
            <div className="text-xs text-muted-foreground">{customer.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      enableSorting: true,
      cell: ({ row }) => <PaymentBadge status={row.original.paymentStatus} />,
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.orderDate),
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Expected Delivery",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.expectedDeliveryDate),
    },
    {
      accessorKey: "branch",
      header: "Branch",
      enableSorting: true,
      cell: ({ row }) => {
        return row.original.branch?.name || "-";
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      enableSorting: true,
      cell: ({ row }) => {
        const amount = row.original.totalAmount || row.original.amount || 0;
        return (
          <div className="text-right font-medium">
            GHS {amount.toFixed(2)}
          </div>
        );
      },
    },
    {
      id: "amountPending",
      header: "Amount Pending",
      enableSorting: true,
      cell: ({ row }) => {
        const totalAmount = row.original.totalAmount || row.original.amount || 0;
        let pendingAmount = totalAmount;
        
        // Use the actual payment status from database and backend calculated amount due
        if (row.original.paymentStatus === "PAID") {
          pendingAmount = 0;
        } else if (row.original.paymentStatus === "PARTIAL") {
          // Use the backend amount due if available, otherwise fall back to simple calculation
          pendingAmount = row.original.amountDue || totalAmount * 0.5;
        }
        
        return (
          <div className="text-right font-medium">
            GHS {pendingAmount.toFixed(2)}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => <OrderActionMenu order={row.original} />,
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Handle filter submission
  const handleFilter = () => {
    const params: Record<string, string | undefined> = {
      page: "1",
      status,
      payment,
      search: searchValue,
      branchId,
      orderDateFrom: orderDateStart ? format(orderDateStart, "yyyy-MM-dd") : undefined,
      orderDateTo: orderDateEnd ? format(orderDateEnd, "yyyy-MM-dd") : undefined,
      expectedDateFrom: expectedDateStart ? format(expectedDateStart, "yyyy-MM-dd") : undefined,
      expectedDateTo: expectedDateEnd ? format(expectedDateEnd, "yyyy-MM-dd") : undefined,
    };
    router.push(`/orders${getFilterUrl(params)}`);
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
        variant: "destructive",
        duration: 5000,
      });
    }
    router.push("/orders/new-standardized");
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardContent className="p-4">
          {/* Search - always visible */}
          <div className="mb-4 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search invoice or customer..." 
                className="pl-10 w-full"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
            
          {/* Advanced Filters Disclosure */}
          <Collapsible className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 gap-1">
                  <Settings className="h-4 w-4" />
                  Advanced Filters
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
              
            <CollapsibleContent className="space-y-6 pt-4">
              {/* Status and Payment filters in first row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-medium">Order Status</Label>
                  <Select 
                    value={status} 
                    onValueChange={(value) => {
                      const params: Record<string, string | undefined> = {
                        page: "1",
                        status: value, 
                        payment, 
                        search: searchValue,
                        orderDateFrom: orderDateStart ? format(orderDateStart, "yyyy-MM-dd") : undefined,
                        orderDateTo: orderDateEnd ? format(orderDateEnd, "yyyy-MM-dd") : undefined,
                        expectedDateFrom: expectedDateStart ? format(expectedDateStart, "yyyy-MM-dd") : undefined,
                        expectedDateTo: expectedDateEnd ? format(expectedDateEnd, "yyyy-MM-dd") : undefined,
                      };
                      router.push(`/orders${getFilterUrl(params)}`);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Order Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  
                <div className="space-y-2">
                  <Label className="font-medium">Payment Status</Label>
                  <Select 
                    value={payment} 
                    onValueChange={(value) => {
                      const params: Record<string, string | undefined> = {
                        page: "1",
                        status,
                        payment: value, 
                        search: searchValue,
                        orderDateFrom: orderDateStart ? format(orderDateStart, "yyyy-MM-dd") : undefined,
                        orderDateTo: orderDateEnd ? format(orderDateEnd, "yyyy-MM-dd") : undefined,
                        expectedDateFrom: expectedDateStart ? format(expectedDateStart, "yyyy-MM-dd") : undefined,
                        expectedDateTo: expectedDateEnd ? format(expectedDateEnd, "yyyy-MM-dd") : undefined,
                      };
                      router.push(`/orders${getFilterUrl(params)}`);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                      <SelectItem value="PENDING">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Date filters in second row, grouped by type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 border rounded-md p-4">
                  <h4 className="font-medium border-b pb-2">Order Date Range</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">From</Label>
                      <DatePickerWithRange 
                        date={orderDateStart}
                        setDate={setOrderDateStart}
                        placeholder="Select date"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">To</Label>
                      <DatePickerWithRange 
                        date={orderDateEnd}
                        setDate={setOrderDateEnd}
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 border rounded-md p-4">
                  <h4 className="font-medium border-b pb-2">Delivery Date Range</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">From</Label>
                      <DatePickerWithRange 
                        date={expectedDateStart}
                        setDate={setExpectedDateStart}
                        placeholder="Select date"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">To</Label>
                      <DatePickerWithRange 
                        date={expectedDateEnd}
                        setDate={setExpectedDateEnd}
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
            
            {/* Apply/Reset buttons below advanced filters */}
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleResetFilters} size="sm">
                Reset
              </Button>
              <Button onClick={handleFilter} size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </Collapsible>
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
                  const params: Record<string, string | undefined> = {
                    page: previousPage.toString(),
                    status,
                    payment,
                    search: searchValue,
                    branchId,
                    orderDateFrom: orderDateStart ? format(orderDateStart, "yyyy-MM-dd") : undefined,
                    orderDateTo: orderDateEnd ? format(orderDateEnd, "yyyy-MM-dd") : undefined,
                    expectedDateFrom: expectedDateStart ? format(expectedDateStart, "yyyy-MM-dd") : undefined,
                    expectedDateTo: expectedDateEnd ? format(expectedDateEnd, "yyyy-MM-dd") : undefined,
                  };
                  router.push(`/orders${getFilterUrl(params)}`);
                }
              }}
              disabled={Number(meta.page || 1) === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <div className="text-sm">
              Page {meta.page || 1} of {meta.totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentPage = Number(meta.page || 1);
                if (currentPage < (meta.totalPages || 1)) {
                  const nextPage = currentPage + 1;
                  const params: Record<string, string | undefined> = {
                    page: nextPage.toString(),
                    status,
                    payment,
                    search: searchValue,
                    branchId,
                    orderDateFrom: orderDateStart ? format(orderDateStart, "yyyy-MM-dd") : undefined,
                    orderDateTo: orderDateEnd ? format(orderDateEnd, "yyyy-MM-dd") : undefined,
                    expectedDateFrom: expectedDateStart ? format(expectedDateStart, "yyyy-MM-dd") : undefined,
                    expectedDateTo: expectedDateEnd ? format(expectedDateEnd, "yyyy-MM-dd") : undefined,
                  };
                  router.push(`/orders${getFilterUrl(params)}`);
                }
              }}
              disabled={Number(meta.page || 1) >= (meta.totalPages || 1)}
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
