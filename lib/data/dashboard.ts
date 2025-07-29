import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay, format, startOfWeek, endOfWeek } from 'date-fns';

export async function getRevenueDataForChart(branchId: string | 'all') {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dailyRevenue = await db.payment.aggregate({
      where: {
        order: branchId !== 'all' ? { branchId } : {},
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });
    
    // Count orders for the day
    const dailyOrders = await db.order.count({
      where: {
        ...(branchId !== 'all' ? { branchId } : {}),
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: {
          not: 'CANCELLED'
        }
      },
    });

    data.push({
      day: format(date, 'EEE'),
      revenue: dailyRevenue._sum.amount || 0,
      orders: dailyOrders,
    });
  }
  return data;
}

export async function getRecentOrders(branchId: string | 'all') {
  return db.order.findMany({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
    },
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true, // Updated to match schema
        },
      },
      payments: {
        select: {
          amount: true,
        },
      },
    },
  });
}

export async function getRecentExpenses(branchId: string | 'all') {
  try {
    const expenses = await db.expense.findMany({
      where: {
        ...(branchId !== 'all' ? { branchId } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        category: true,
      },
    });

    return expenses;
  } catch (error) {
    console.error('Error fetching recent expenses:', error);
    return [];
  }
}

export async function getOrderStatusDistribution(branchId: string | 'all') {
  try {
    // Get all possible statuses from schema
    const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'DELIVERED'];
    
    // Initialize results with all statuses set to zero
    const results = statuses.map(status => ({ status, count: 0 }));
    
    // Get counts for each status from the database
    const statusCounts = await db.order.groupBy({
      by: ['status'],
      where: {
        ...(branchId !== 'all' ? { branchId } : {}),
      },
      _count: {
        status: true,
      },
    });
    
    // Update counts for statuses that have orders
    statusCounts.forEach(item => {
      const statusIndex = results.findIndex(r => r.status === item.status);
      if (statusIndex !== -1) {
        results[statusIndex].count = item._count.status;
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    return [];
  }
}

export async function getDashboardStats(branchId: string | 'all') {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Weekly revenue
  const weeklyRevenue = await db.order.aggregate({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: weekStart,
        lte: weekEnd
      },
      status: {
        not: 'CANCELLED'
      }
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Weekly orders
  const weeklyOrders = await db.order.count({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: weekStart,
        lte: weekEnd
      },
      status: {
        not: 'CANCELLED'
      }
    },
  });

  // Monthly revenue
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

  // Monthly orders
  const monthlyOrders = await db.order.count({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: monthStart,
        lte: monthEnd
      }
    }
  });

  // Get previous week's data for comparison
  const prevWeekStart = subDays(weekStart, 7);
  const prevWeekEnd = subDays(weekEnd, 7);
  
  const prevWeeklyRevenue = await db.order.aggregate({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: prevWeekStart,
        lte: prevWeekEnd
      },
      status: {
        not: 'CANCELLED'
      }
    },
    _sum: {
      totalAmount: true,
    },
  });

  const prevWeeklyOrders = await db.order.count({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: prevWeekStart,
        lte: prevWeekEnd
      },
      status: {
        not: 'CANCELLED'
      }
    },
  });

  // Calculate percentage changes
  const currentWeekRevenue = weeklyRevenue._sum?.totalAmount || 0;
  const previousWeekRevenue = prevWeeklyRevenue._sum?.totalAmount || 0;
  const revenueChange = previousWeekRevenue === 0 
    ? 100 
    : ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;
  
  const ordersChange = prevWeeklyOrders === 0 
    ? 100 
    : ((weeklyOrders - prevWeeklyOrders) / prevWeeklyOrders) * 100;

  // Outstanding payments
  const outstandingPayments = await db.payment.aggregate({
    where: {
      status: 'PENDING',
      order: branchId !== 'all' ? { branchId } : undefined
    },
    _sum: {
      amount: true,
    },
  });

  // Monthly expenses
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

  // Get new clients this week - count unique customers with first orders this week
  const ordersThisWeek = await db.order.findMany({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      }
    },
    select: {
      customerId: true,
    },
  });
  
  // Use Set to get unique customer IDs
  const uniqueCustomerIds = new Set(ordersThisWeek.map(order => order.customerId));
  const newClients = uniqueCustomerIds.size;

  // Get previous week's new clients for comparison using the same approach
  const ordersPrevWeek = await db.order.findMany({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      createdAt: {
        gte: prevWeekStart,
        lte: prevWeekEnd,
      }
    },
    select: {
      customerId: true,
    },
  });
  
  const uniquePrevCustomerIds = new Set(ordersPrevWeek.map(order => order.customerId));
  const prevWeekNewClients = uniquePrevCustomerIds.size;

  const clientsChange = prevWeekNewClients === 0 
    ? 100 
    : ((newClients - prevWeekNewClients) / prevWeekNewClients) * 100;

  // Calculate average processing time (in hours) for completed orders this week
  const completedOrders = await db.order.findMany({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      status: 'COMPLETED',
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  let totalProcessingTime = 0;
  completedOrders.forEach(order => {
    const processingTime = (order.updatedAt.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60); // Hours
    totalProcessingTime += processingTime;
  });

  const avgProcessingTime = completedOrders.length > 0 
    ? (totalProcessingTime / completedOrders.length).toFixed(1) 
    : 0;

  // Calculate previous week's average processing time
  const prevCompletedOrders = await db.order.findMany({
    where: {
      ...(branchId !== 'all' ? { branchId } : {}),
      status: 'COMPLETED',
      createdAt: {
        gte: prevWeekStart,
        lte: prevWeekEnd,
      },
    },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  let prevTotalProcessingTime = 0;
  prevCompletedOrders.forEach(order => {
    const processingTime = (order.updatedAt.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60);
    prevTotalProcessingTime += processingTime;
  });

  const prevAvgProcessingTime = prevCompletedOrders.length > 0 
    ? (prevTotalProcessingTime / prevCompletedOrders.length) 
    : 0;

  const processingTimeChange = prevAvgProcessingTime === 0 
    ? 0 
    : ((prevAvgProcessingTime - Number(avgProcessingTime)) / prevAvgProcessingTime) * 100;

  return {
    weeklyRevenue: currentWeekRevenue,
    weeklyOrders,
    revenueChange: parseFloat(revenueChange.toFixed(1)),
    revenueChangeTrend: revenueChange >= 0 ? 'up' : 'down',
    ordersChange: parseFloat(ordersChange.toFixed(1)),
    ordersChangeTrend: ordersChange >= 0 ? 'up' : 'down',
    monthlyRevenue: monthlyRevenue._sum?.totalAmount || 0,
    monthlyOrders,
    outstandingPayments: outstandingPayments._sum?.amount || 0,
    monthlyExpenses: monthlyExpenses._sum.amount || 0,
    newClients,
    clientsChange: parseFloat(clientsChange.toFixed(1)),
    clientsChangeTrend: clientsChange >= 0 ? 'up' : 'down',
    avgProcessingTime,
    processingTimeChange: parseFloat(processingTimeChange.toFixed(1)),
    processingTimeChangeTrend: processingTimeChange >= 0 ? 'down' : 'up', // Lower processing time is better
  };
}
