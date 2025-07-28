"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { Customer } from "./types";
import { OrderStatus } from "@prisma/client";

// Export explicitly to ensure proper importing
export async function getCustomers(): Promise<Customer[]> {
  try {
    // Fetch customers from database
    const dbCustomers = await db.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            amountPaid: true,
            amountDue: true,
            status: true,
          },
        },
      },
    });

    // Transform database customers to include calculated fields
    return dbCustomers.map((customer) => {
      // Calculate total orders (only completed orders)
      const totalOrders = customer.orders.length;
      
      // Calculate total spent across all orders
      const totalSpent = customer.orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      
      // Calculate amount paid and amount to pay
      const amountPaid = customer.orders.reduce(
        (sum, order) => sum + order.amountPaid,
        0
      );
      
      const amountToPay = customer.orders.reduce(
        (sum, order) => sum + order.amountDue,
        0
      );

      // Return the customer with calculated fields
      return {
        ...customer,
        totalOrders,
        totalSpent,
        amountPaid,
        amountToPay,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    // Get the customer by ID
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            totalAmount: true,
            amountPaid: true,
            amountDue: true,
          },
        },
      },
    });

    if (!customer) return null;
    
    // Calculate derived values
    const totalOrders = customer.orders.length;
    const totalSpent = customer.orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    
    // Calculate amount paid and amount to pay
    const amountPaid = customer.orders.reduce(
      (sum, order) => sum + order.amountPaid,
      0
    );
    
    const amountToPay = customer.orders.reduce(
      (sum, order) => sum + order.amountDue,
      0
    );

    // Return the customer with calculated fields
    return {
      ...customer,
      totalOrders,
      totalSpent,
      amountPaid,
      amountToPay,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error(`Failed to fetch customer with ID ${id}:`, error);
    throw new Error(`Failed to fetch customer with ID ${id}`);
  }
}

export async function createCustomer(data: Omit<Customer, "id" | "totalOrders" | "totalSpent" | "amountPaid" | "amountToPay">): Promise<Customer> {
  try {
    // Create customer in the database
    const customer = await db.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
    
    // Revalidate the customers page to show the new data
    revalidatePath('/customers');
    
    // Return created customer with calculated fields
    return {
      ...customer,
      totalOrders: 0,
      totalSpent: 0,
      amountPaid: 0,
      amountToPay: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Failed to create customer:", error);
    throw new Error("Failed to create customer");
  }
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, "id" | "totalOrders" | "totalSpent" | "amountPaid" | "amountToPay" | "createdAt" | "updatedAt">>
): Promise<Customer> {
  try {
    // Update customer in the database
    const customer = await db.customer.update({
      where: {
        id,
      },
      data,
    });
    
    // Revalidate the customers page to show the updated data
    revalidatePath('/customers');
    
    // Return updated customer with calculated fields
    return {
      ...customer,
      totalOrders: 0,
      totalSpent: 0,
      amountPaid: 0,
      amountToPay: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Failed to update customer:", error);
    throw new Error("Failed to update customer");
  }
}

export async function deleteCustomer(id: string): Promise<Customer> {
  try {
    // Check if customer has related orders
    const customerWithOrders = await db.customer.findUnique({
      where: { id },
      include: { orders: { take: 1 } },
    });

    if (customerWithOrders?.orders.length) {
      // If customer has orders, don't allow deletion to maintain referential integrity
      throw new Error("Cannot delete customer with existing orders");
    }

    // Get the customer data by ID before deletion
    const customer = await getCustomerById(id);
    
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    // Delete the customer
    await db.customer.delete({
      where: { id },
    });
    
    return customer;
  } catch (error) {
    console.error("Failed to delete customer:", error);
    throw new Error("Failed to delete customer: " + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
