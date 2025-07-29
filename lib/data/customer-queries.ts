import { db } from '@/lib/db';
import type { BaseCustomer, CustomerWithRelations, CustomerListItem } from '@/app/(core-app)/customers/types';

/**
 * Gets a customer by ID with all relations
 */
export async function getCustomerById(customerId: string): Promise<CustomerWithRelations | null> {
  try {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: true,
      },
    });

    if (!customer) return null;

    return customer as CustomerWithRelations;
  } catch (error) {
    console.error(`Failed to fetch customer with ID ${customerId}:`, error);
    throw new Error(`Failed to fetch customer with ID ${customerId}`);
  }
}

/**
 * Gets all customers with order count for list display
 */
export async function getAllCustomers(): Promise<CustomerListItem[]> {
  try {
    const customers = await db.customer.findMany({
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,

      _count: {
        orders: customer._count.orders,
      },
    })) as CustomerListItem[];
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    throw new Error('Failed to fetch customers');
  }
}

/**
 * Gets customers by search term (name or email)
 */
export async function searchCustomers(searchTerm: string): Promise<CustomerListItem[]> {
  try {
    const customers = await db.customer.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,

      _count: {
        orders: customer._count.orders,
      },
    })) as CustomerListItem[];
  } catch (error) {
    console.error(`Failed to search customers with term "${searchTerm}":`, error);
    throw new Error(`Failed to search customers with term "${searchTerm}"`);
  }
}

/**
 * Check if email is already taken by another customer
 */
export async function isEmailTaken(email: string, excludeCustomerId?: string): Promise<boolean> {
  try {
    const existingCustomer = await db.customer.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!existingCustomer) return false;
    
    // If we're updating a customer, exclude their own email
    if (excludeCustomerId && existingCustomer.id === excludeCustomerId) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Failed to check if email ${email} is taken:`, error);
    throw new Error(`Failed to check if email ${email} is taken`);
  }
}

/**
 * Gets customer statistics
 */
export async function getCustomerStats() {
  try {
    const [totalCustomers, customersWithOrders, recentCustomers] = await Promise.all([
      db.customer.count(),
      db.customer.count({
        where: {
          orders: {
            some: {},
          },
        },
      }),
      db.customer.count(),
    ]);

    return {
      totalCustomers,
      customersWithOrders,
      customersWithoutOrders: totalCustomers - customersWithOrders,
      recentCustomers,
    };
  } catch (error) {
    console.error('Failed to fetch customer statistics:', error);
    throw new Error('Failed to fetch customer statistics');
  }
}
