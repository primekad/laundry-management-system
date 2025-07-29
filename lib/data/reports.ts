import { db } from '@/lib/db';
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  format, 
  startOfDay, 
  endOfDay,
  startOfYear,
  endOfYear,
  subYears
} from 'date-fns';

/**
 * Get monthly revenue and expense data for the past 6 months
 */
export async function getMonthlyRevenueExpenses(branchId: string | 'all', period: string = 'this-year') {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfMonth(now);
  
  // Determine date range based on period
  switch(period) {
    case 'this-year':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    case 'last-year':
      const lastYear = subYears(now, 1);
      startDate = startOfYear(lastYear);
      endDate = endOfYear(lastYear);
      break;
    case 'this-month':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    default: // Default to last 6 months
      startDate = subMonths(startOfMonth(now), 5);
      break;
  }

  const result = [];
  let currentDate = startDate;

  // Generate monthly data
  while (currentDate <= endDate) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get revenue from orders for the month
    const monthlyRevenue = await db.order.aggregate({
      where: {
        ...(branchId !== 'all' ? { branchId } : {}),
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        },
        status: {
          not: 'CANCELLED'
        }
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get expenses for the month
    const monthlyExpenses = await db.expense.aggregate({
      where: {
        ...(branchId !== 'all' ? { branchId } : {}),
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      _sum: {
        amount: true,
      },
    });

    // Get orders count for the month
    const monthlyOrders = await db.order.count({
      where: {
        ...(branchId !== 'all' ? { branchId } : {}),
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        },
        status: {
          not: 'CANCELLED'
        }
      },
    });

    // Calculate profit
    const revenue = monthlyRevenue._sum.totalAmount || 0;
    const expenses = monthlyExpenses._sum.amount || 0;
    const profit = revenue - expenses;

    result.push({
      month: format(monthStart, 'MMM'),
      revenue,
      expenses,
      profit,
      orders: monthlyOrders
    });

    // Move to next month
    currentDate = subMonths(currentDate, -1);
  }

  return result;
}

/**
 * Get orders by status distribution
 */
export async function getOrdersByStatus(branchId: string | 'all', period: string = 'this-month') {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);
  
  // Determine date range based on period
  switch(period) {
    case 'today':
      startDate = startOfDay(now);
      break;
    case 'this-week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      break;
    case 'this-month':
      startDate = startOfMonth(now);
      break;
    case 'this-year':
      startDate = startOfYear(now);
      break;
    default:
      startDate = startOfMonth(now);
      break;
  }

  // Get all possible statuses from schema
  const statuses = ['PENDING', 'PROCESSING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
  
  // Initialize results with all statuses set to zero
  let totalOrders = 0;
  const statusCounts = await db.order.groupBy({
    by: ['status'],
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _count: {
      status: true,
    },
  });
  
  // Calculate total count for percentage calculation
  statusCounts.forEach(item => {
    totalOrders += item._count.status;
  });

  // Map statuses to friendly display names
  const statusDisplayNames: Record<string, string> = {
    'PENDING': 'Pending',
    'PROCESSING': 'Processing',
    'READY_FOR_PICKUP': 'Ready',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled'
  };

  // Format data for display
  const results = statusCounts.map(item => ({
    status: statusDisplayNames[item.status] || item.status,
    count: item._count.status,
    percentage: Math.round((item._count.status / (totalOrders || 1)) * 100)
  }));

  return results;
}

/**
 * Get profit trend data for the specified period
 */
export async function getProfitTrend(branchId: string | 'all', period: string = 'this-year') {
  // This is similar to getMonthlyRevenueExpenses but focused on profit
  const data = await getMonthlyRevenueExpenses(branchId, period);
  return data;
}

/**
 * Get revenue summary metrics for reports page
 */
export async function getRevenueSummary(branchId: string | 'all', period: string = 'this-month') {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);
  let prevStartDate: Date;
  let prevEndDate: Date;
  
  // Determine date range based on period
  switch(period) {
    case 'today':
      startDate = startOfDay(now);
      prevStartDate = startOfDay(new Date(now.setDate(now.getDate() - 1)));
      prevEndDate = endOfDay(new Date(now.setDate(now.getDate() - 1)));
      break;
    case 'this-week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(startDate.getDate() - 7);
      prevEndDate = new Date(startDate);
      prevEndDate.setDate(startDate.getDate() - 1);
      break;
    case 'this-month':
      startDate = startOfMonth(now);
      prevStartDate = startOfMonth(subMonths(now, 1));
      prevEndDate = endOfMonth(subMonths(now, 1));
      break;
    case 'this-year':
      startDate = startOfYear(now);
      prevStartDate = startOfYear(subYears(now, 1));
      prevEndDate = endOfYear(subYears(now, 1));
      break;
    default:
      startDate = startOfMonth(now);
      prevStartDate = startOfMonth(subMonths(now, 1));
      prevEndDate = endOfMonth(subMonths(now, 1));
      break;
  }

  // Current period revenue
  const currentRevenue = await db.order.aggregate({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        not: 'CANCELLED'
      }
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Previous period revenue
  const previousRevenue = await db.order.aggregate({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: prevStartDate,
        lte: prevEndDate
      },
      status: {
        not: 'CANCELLED'
      }
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Current period orders
  const currentOrders = await db.order.count({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        not: 'CANCELLED'
      }
    },
  });

  // Previous period orders
  const previousOrders = await db.order.count({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: prevStartDate,
        lte: prevEndDate
      },
      status: {
        not: 'CANCELLED'
      }
    },
  });

  // New customers
  const newCustomers = await db.customer.count({
    where: {
      orders: {
        some: {
          ...(branchId !== 'all' ? { branchId } : {}),
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    },
  });

  // Previous period new customers
  const prevNewCustomers = await db.customer.count({
    where: {
      orders: {
        some: {
          ...(branchId !== 'all' ? { branchId } : {}),
          createdAt: {
            gte: prevStartDate,
            lte: prevEndDate
          }
        }
      }
    },
  });

  // Current period expenses
  const currentExpenses = await db.expense.aggregate({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true,
    },
  });

  // Previous period expenses
  const previousExpenses = await db.expense.aggregate({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      date: {
        gte: prevStartDate,
        lte: prevEndDate
      }
    },
    _sum: {
      amount: true,
    },
  });

  // Calculate changes
  const currentRevenueValue = currentRevenue._sum.totalAmount || 0;
  const previousRevenueValue = previousRevenue._sum.totalAmount || 0;
  const revenueChange = previousRevenueValue === 0 
    ? 100 
    : ((currentRevenueValue - previousRevenueValue) / previousRevenueValue) * 100;
  
  const ordersChange = previousOrders === 0 
    ? 100 
    : ((currentOrders - previousOrders) / previousOrders) * 100;
  
  const customersChange = prevNewCustomers === 0 
    ? 100 
    : ((newCustomers - prevNewCustomers) / prevNewCustomers) * 100;

  const currentExpensesValue = currentExpenses._sum.amount || 0;
  const previousExpensesValue = previousExpenses._sum.amount || 0;
  
  // Net Profit
  const currentProfit = currentRevenueValue - currentExpensesValue;
  const previousProfit = previousRevenueValue - previousExpensesValue;
  const profitChange = previousProfit === 0 
    ? 100 
    : ((currentProfit - previousProfit) / previousProfit) * 100;

  return {
    totalRevenue: currentRevenueValue,
    revenueChange: parseFloat(revenueChange.toFixed(1)),
    revenueTrend: revenueChange >= 0 ? 'up' : 'down',
    
    totalOrders: currentOrders,
    ordersChange: parseFloat(ordersChange.toFixed(1)),
    ordersTrend: ordersChange >= 0 ? 'up' : 'down',
    
    newCustomers,
    customersChange: parseFloat(customersChange.toFixed(1)),
    customersTrend: customersChange >= 0 ? 'up' : 'down',
    
    netProfit: currentProfit,
    profitChange: parseFloat(profitChange.toFixed(1)),
    profitTrend: profitChange >= 0 ? 'up' : 'down',
  };
}

/**
 * Generate CSV content for reports
 */
export async function generateReportCSV(
  reportType: 'revenue' | 'orders' | 'expenses' | 'customers',
  branchId: string | 'all',
  period: string = 'this-month'
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);
  
  // Determine date range based on period
  switch(period) {
    case 'today':
      startDate = startOfDay(now);
      break;
    case 'this-week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      break;
    case 'this-month':
      startDate = startOfMonth(now);
      break;
    case 'this-year':
      startDate = startOfYear(now);
      break;
    case 'custom':
      // Custom range would need start and end dates passed separately
      startDate = startOfYear(now); // Default to year if custom with no dates
      break;
    default:
      startDate = startOfMonth(now);
      break;
  }

  let csvContent = '';
  let data: any[] = [];

  // Generate appropriate CSV based on report type
  switch (reportType) {
    case 'revenue':
      // Get orders with customer and payment info
      data = await db.order.findMany({
        where: {
          ...(branchId !== 'all' ? { branchId } : {}),
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: {
            not: 'CANCELLED'
          }
        },
        include: {
          customer: true,
          payments: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // CSV headers
      csvContent = 'Date,Invoice Number,Customer,Customer Email,Branch,Total Amount,Amount Paid,Amount Due,Payment Status,Payment Method,Created At\n';
      
      // Add each order as a row
      data.forEach(order => {
        const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
        const time = format(new Date(order.createdAt), 'HH:mm:ss');
        const paymentMethod = order.payments && order.payments.length > 0 
          ? order.payments[0].method 
          : 'N/A';
        const branchName = order.branch?.name || 'Unknown';
        
        csvContent += `${date},${order.invoiceNumber},"${order.customer.name}","${order.customer.email}","${branchName}",${order.totalAmount},${order.amountPaid},${order.amountDue},${order.paymentStatus},"${paymentMethod}","${date} ${time}"\n`;
      });
      break;

    case 'orders':
      // Get orders with status info
      data = await db.order.findMany({
        where: {
          ...(branchId !== 'all' ? { branchId } : {}),
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              serviceType: true,
              category: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // CSV headers
      csvContent = 'Date,Invoice Number,Customer,Customer Contact,Status,Processing Status,Items Count,Service Types,Pickup Date,Delivery Date,Total Amount\n';
      
      // Add each order as a row
      data.forEach(order => {
        const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
        const customerContact = order.customer.phone || order.customer.email || 'N/A';
        const pickupDate = order.pickupDate ? format(new Date(order.pickupDate), 'yyyy-MM-dd') : 'Not set';
        const deliveryDate = order.deliveryDate ? format(new Date(order.deliveryDate), 'yyyy-MM-dd') : 'Not set';
        
        // Extract unique service types from items
        const serviceTypes = [...new Set(order.items
          .filter((item: any) => item.serviceType?.name)
          .map((item: any) => item.serviceType.name))]
          .join(', ');
        
        csvContent += `${date},${order.invoiceNumber},"${order.customer.name}","${customerContact}",${order.status},${order.processingStatus || 'N/A'},${order.items.length},"${serviceTypes}","${pickupDate}","${deliveryDate}",${order.totalAmount}\n`;
      });
      break;

    case 'expenses':
      // Get expenses with category info
      data = await db.expense.findMany({
        where: {
          ...(branchId !== 'all' ? { branchId } : {}),
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          category: true,
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      // CSV headers
      csvContent = 'Date,Description,Category,Amount,Payment Method,Receipt Number,Created By,Branch,Notes\n';
      
      // Add each expense as a row
      data.forEach(expense => {
        const date = format(new Date(expense.date), 'yyyy-MM-dd');
        const branchName = expense.branch?.name || 'Unknown';
        const paymentMethod = expense.paymentMethod || 'Cash';
        const receiptNumber = expense.receiptNumber || 'N/A';
        const notes = expense.notes?.replace(/\n/g, ' ').replace(/\"/g, '""') || '';
        
        csvContent += `${date},"${expense.description}","${expense.category.name}",${expense.amount},"${paymentMethod}","${receiptNumber}","${expense.user.name}","${branchName}","${notes}"\n`;
      });
      break;

    case 'customers':
      // Get customers with their orders
      data = await db.customer.findMany({
        where: {
          orders: {
            some: {
              ...(branchId !== 'all' ? { branchId } : {}),
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        },
        include: {
          orders: {
            where: {
              ...(branchId !== 'all' ? { branchId } : {}),
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      });

      // CSV headers
      csvContent = 'Name,Email,Phone,Address,First Order Date,Last Order Date,Total Orders,Total Items,Total Spent,Average Order Value,Most Common Service\n';
      
      // Add each customer as a row
      data.forEach(customer => {
        // Calculate various customer metrics
        const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
        const totalOrders = customer.orders.length;
        const avgOrderValue = totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : '0.00';
        
        // Get first and last order dates
        const orderDates = customer.orders
          .filter((order: any) => order.createdAt)
          .map((order: any) => new Date(order.createdAt).getTime());
        
        let firstOrderDate = 'N/A';
        let lastOrderDate = 'N/A';
        
        if (orderDates.length > 0) {
          firstOrderDate = format(new Date(Math.min(...orderDates)), 'yyyy-MM-dd');
          lastOrderDate = format(new Date(Math.max(...orderDates)), 'yyyy-MM-dd');
        }
        
        // Calculate total items across all orders
        const totalItems = customer.orders.reduce(
          (sum: number, order: any) => sum + (order.items?.length || 0), 
          0
        );
        
        // Clean address for CSV format
        const address = customer.address?.replace(/\n/g, ' ').replace(/\"/g, '""') || '';
        
        // Most common service logic would go here if we had detailed item data
        const mostCommonService = 'N/A'; // Placeholder
        
        csvContent += `"${customer.name}","${customer.email}","${customer.phone || ''}","${address}","${firstOrderDate}","${lastOrderDate}",${totalOrders},${totalItems},${totalSpent},${avgOrderValue},"${mostCommonService}"\n`;
      });
      break;
  }

  return csvContent;
}
