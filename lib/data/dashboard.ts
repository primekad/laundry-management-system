import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay, format } from 'date-fns';

export async function getRevenueDataForChart(branchId: string) {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dailyRevenue = await db.payment.aggregate({
      where: {
        order: {
          branchId: branchId,
        },
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    data.push({
      day: format(date, 'EEE'),
      revenue: dailyRevenue._sum.amount || 0,
    });
  }
  return data;
}

export async function getRecentOrders(branchId: string) {
  return db.order.findMany({
    where: {
      branchId: branchId,
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
          phoneNumber: true,
        },
      },
    },
  });
}

export async function getRecentExpenses(branchId: string) {
  return db.expense.findMany({
    where: {
      branchId: branchId,
    },
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getDashboardStats(branchId: string) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const totalRevenue = await db.payment.aggregate({
    where: {
      order: {
        branchId: branchId,
      },
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const ordersThisMonth = await db.order.count({
    where: {
      branchId: branchId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const outstandingPayments = await db.order.aggregate({
    where: {
      branchId: branchId,
      paymentStatus: 'PENDING',
    },
    _sum: {
      totalAmount: true,
    },
  });

  const expensesThisMonth = await db.expense.aggregate({
    where: {
      branchId: branchId,
      date: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    ordersThisMonth,
    outstandingPayments: outstandingPayments._sum.totalAmount || 0,
    expensesThisMonth: expensesThisMonth._sum.amount || 0,
  };
}
