"use server"

import { db } from "@/lib/db"
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { getNextInvoiceNumber } from "../settings/invoice-settings/actions"

/**
 * Search for customers by name, phone, or email
 */
export async function searchCustomers(query: string) {
  try {
    // Allow empty query to return all customers (limited to 10)
    // This helps with initially populating the dropdown
    if (!query) {
      console.log('Empty query, returning all customers (max 10)');
      const allCustomers = await db.customer.findMany({
        take: 10,
        orderBy: { name: 'asc' }
      });
      console.log(`Found ${allCustomers.length} total customers`);
      return allCustomers;
    }
    
    // For very short queries, still require at least 2 characters
    if (query.length < 2) {
      console.log('Query too short, returning empty array');
      return [];
    }

    console.log(`Searching for customers with query: "${query}"`);
    const customers = await db.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10,
      orderBy: { name: 'asc' }
    });

    console.log(`Search found ${customers.length} matching customers`);
    return customers;
  } catch (error) {
    console.error('Error searching customers:', error);
    return [];
  }
}

/**
 * Fetch active laundry categories
 */
export async function fetchLaundryCategories() {
  try {
    const categories = await db.laundryCategory.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: 'asc' },
    })
    return categories
  } catch (error) {
    console.error('Error fetching laundry categories:', error)
    return []
  }
}

/**
 * Fetch active service types
 */
export async function fetchServiceTypes() {
  try {
    const serviceTypes = await db.serviceType.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true
      },
      where: {
        status: "ACTIVE"
      },
      orderBy: { name: 'asc' },
    })
    console.log('fetchServiceTypes result:', serviceTypes)
    return serviceTypes
  } catch (error) {
    console.error('Error fetching service types:', error)
    return []
  }
}

/**
 * Fetch services for order items (using ServiceType model)
 */
export async function fetchServices() {
  try {
    // Using ServiceType model instead of Service
    const services = await db.serviceType.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true
      },
      where: {
        status: "ACTIVE"
      },
      orderBy: { name: 'asc' },
    })
    console.log('Fetched services:', services)
    return services
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

/**
 * Fetch pricing rule for a specific laundry category and service type
 */
export async function fetchPricingRule(laundryCategoryId: string, serviceTypeId: string) {
  try {
    const pricingRule = await db.pricingRule.findFirst({
      where: {
        laundryCategoryId,
        serviceTypeId,
        status: "ACTIVE",
      },
      include: {
        laundryCategory: true,
        serviceType: true,
      },
    })
    
    return pricingRule
  } catch (error) {
    console.error('Error fetching pricing rule:', error)
    return null
  }
}

/**
 * Fetch all active pricing rules
 */
export async function fetchAllPricingRules() {
  try {
    const pricingRules = await db.pricingRule.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        laundryCategory: true,
        serviceType: true,
      },
    })
    
    return pricingRules
  } catch (error) {
    console.error('Error fetching pricing rules:', error)
    return []
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(data: any) {
  try {
    const customer = await db.customer.create({
      data: {
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      },
    })
    return customer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw new Error('Failed to create customer')
  }
}

/**
 * Create a new order with all related data
 */
export async function createOrder(data: any) {
  try {
    // Get customer information from the data
    let customer = null

    if (data.customerId) {
      // If we have a customerId, find the existing customer
      customer = await db.customer.findUnique({
        where: { id: data.customerId }
      })
      if (!customer) {
        throw new Error('Customer not found')
      }
    } else if (data.customerName) {
      // If we have customer details but no ID, create a new customer
      customer = await createCustomer({
        name: data.customerName,
        email: data.customerEmail || `${Date.now()}@placeholder.com`,
        phone: data.customerPhone || '',
        address: data.customerAddress || ''
      })
    } else {
      // No customer information provided
      throw new Error('Customer information is required')
    }
    
    // Calculate totals
    const subtotal = data.items.reduce((sum: number, item: any) => sum + item.total, 0)
    const totalAmount = subtotal - (data.discount || 0)
    const amountDue = totalAmount - (data.amountPaid || 0)
    const paymentStatus = amountDue <= 0 ? 'PAID' : amountDue < totalAmount ? 'PARTIAL' : 'PENDING'
    
    // Validate that branchId exists
    if (!data.branchId) {
      throw new Error('Branch ID is required')
    }
    
    // Validate that all serviceTypeIds exist in the ServiceType table
    const serviceTypeIds = data.items.map((item: any) => item.serviceTypeId);
    const existingServiceTypes = await db.serviceType.findMany({
      where: {
        id: { in: serviceTypeIds }
      },
      select: { id: true }
    });
    
    // Check if all serviceType IDs exist in the database
    const existingServiceTypeIds = new Set(existingServiceTypes.map(s => s.id));
    const missingServiceTypeIds = serviceTypeIds.filter((id: string) => !existingServiceTypeIds.has(id));
    
    if (missingServiceTypeIds.length > 0) {
      throw new Error(`Invalid serviceType IDs: ${missingServiceTypeIds.join(', ')}. Please select valid service types.`);
    }
    
    // Generate invoice number or use provided custom number
    const invoiceNumber = await getNextInvoiceNumber(
      data.invoiceSettingsId || undefined,
      data.customInvoiceNumber || undefined
    );
    
    // Create the order with related items and payment
    const order = await db.order.create({
      data: {
        notes: data.notes || '',
        totalAmount,
        amountPaid: data.amountPaid || 0,
        amountDue,
        status: OrderStatus.PENDING,
        paymentStatus,
        invoiceNumber, // Use generated or custom invoice number
        // Connect to existing branch
        branch: {
          connect: { id: data.branchId }
        },
        // Connect to existing customer
        customer: {
          connect: { id: customer.id }
        },
        
        // Create order items with validated serviceType IDs
        items: {
          create: data.items.map((item: any) => ({
            serviceTypeId: item.serviceTypeId,
            quantity: item.quantity,
            price: item.unitPrice,
            subtotal: item.total,
          })),
        },
        
        // Create initial payment if amount is greater than 0
        payments: data.amountPaid > 0 ? {
          create: {
            amount: data.amountPaid,
            paymentMethod: data.paymentMethod as PaymentMethod,
          },
        } : undefined,
      },
      include: {
        customer: true,
        items: true,
        payments: true,
        branch: true, // Include branch in the response
      },
    })
    
    revalidatePath('/orders')
    return order
  } catch (error) {
    console.error('Error creating order:', error)
    throw new Error('Failed to create order')
  }
}

/**
 * Update an existing order
 */
export async function updateOrder(id: string, data: any) {
  try {
    // Get the existing order to compare changes
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      },
    })
    
    if (!existingOrder) {
      throw new Error('Order not found')
    }
    
    let customer = data.customer
    
    // If customer doesn't have an ID, create a new customer
    if (customer && !customer.id) {
      customer = await createCustomer(customer)
    }
    
    // Determine if this is a payment-only update
    const isPaymentOnly = data.payments && (!data.items || !Array.isArray(data.items))
    
    // Calculate totals
    let totalAmount = existingOrder.totalAmount
    
    // Only recalculate totals if items are provided
    if (!isPaymentOnly && data.items && Array.isArray(data.items)) {
      const subtotal = data.items.reduce((sum: number, item: any) => sum + item.total, 0)
      totalAmount = subtotal - (data.discount || 0)
    }
    
    // Process payments
    let newPaymentAmount = 0
    let paymentMethod = undefined
    let transactionId = undefined
    
    if (data.payments && Array.isArray(data.payments) && data.payments.length > 0) {
      // Handle payment from RecordPaymentDialog
      newPaymentAmount = data.payments[0].amount || 0
      paymentMethod = data.payments[0].paymentMethod
      transactionId = data.payments[0].transactionId
    } else if (data.amountPaid > 0) {
      // Handle payment from edit form
      newPaymentAmount = data.amountPaid
      paymentMethod = data.paymentMethod
    }
    
    // Calculate total payments (existing + new payment if provided)
    const payments = await db.payment.findMany({ where: { orderId: id } })
    const existingPaymentsTotal = payments.reduce(
      (sum: number, payment: any) => sum + payment.amount, 0
    )
    const totalPayments = existingPaymentsTotal + newPaymentAmount
    
    // Calculate amountDue and payment status
    const amountDue = totalAmount - totalPayments
    const paymentStatus = amountDue <= 0 ? 'PAID' : amountDue < totalAmount ? 'PARTIAL' : 'PENDING'
    
    // Create transaction for multiple database operations
    const order = await db.$transaction(async (prisma) => {
      // 1. Update the order
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          customerId: customer?.id || existingOrder.customerId,
          notes: data.notes ?? existingOrder.notes,
          totalAmount,
          amountPaid: totalPayments,
          amountDue,
          status: data.status || existingOrder.status,
          paymentStatus: paymentStatus as any,
          updatedAt: new Date(),
        },
      })

      // 2. Track status changes if status is being updated
      if (data.status && data.status !== existingOrder.status) {
        await prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            previousStatus: existingOrder.status,
            newStatus: data.status,
          },
        })
      }

      // 3. Only update order items if this is not a payment-only update
      if (!isPaymentOnly && data.items && Array.isArray(data.items)) {
        // Delete existing order items
        await prisma.orderItem.deleteMany({
          where: { orderId: id },
        })

        // Create new order items
        await prisma.orderItem.createMany({
          data: data.items.map((item: any) => ({
            orderId: id,
            serviceTypeId: item.serviceTypeId,
            categoryId: item.categoryId,
            quantity: item.quantity,
            price: item.unitPrice || item.price,
            subtotal: item.total || item.subtotal,
            notes: item.notes || null,
            size: item.size || null
          })),
        })
      }

      // 4. Create new payment if amount is greater than 0
      if (newPaymentAmount > 0 && paymentMethod) {
        await prisma.payment.create({
          data: {
            orderId: id,
            amount: newPaymentAmount,
            paymentMethod: paymentMethod as PaymentMethod,
            transactionId,
            status: PaymentStatus.PAID,
          },
        })
      }
      
      return updatedOrder
    })
    
    revalidatePath(`/orders/${id}`)
    revalidatePath('/orders')
    
    return order
  } catch (error) {
    console.error('Error updating order:', error)
    throw new Error('Failed to update order')
  }
}

/**
 * Fetch a single order by ID with all related data
 */
export async function getOrderById(id: string) {
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            serviceType: true,
            category: true
          }
        },
        payments: true,
        branch: true
      },
    })
    
    if (!order) {
      throw new Error('Order not found')
    }
    
    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    throw new Error('Failed to fetch order')
  }
}

/**
 * Fetch orders with pagination and filters
 */
export async function getOrders(params: any) {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    paymentStatus, 
    search, 
    sort,
    branchId,
    orderDateFrom,
    orderDateTo,
    expectedDateFrom,
    expectedDateTo
  } = params
  const skip = (page - 1) * limit
  
  try {
    // Build where clause based on filters
    const where: any = {}
    
    // Filter by status
    if (status && status.toUpperCase() !== 'ALL') {
      where.status = status
    }

    // Filter by payment status
    if (paymentStatus && paymentStatus.toUpperCase() !== 'ALL') {
      where.paymentStatus = paymentStatus
    }

    // Filter by branch ID
    if (branchId && branchId.toUpperCase() !== 'ALL') {
      where.branchId = branchId
    }
    
    // Filter by order date range
    if (orderDateFrom || orderDateTo) {
      where.createdAt = {}
      
      if (orderDateFrom) {
        where.createdAt.gte = new Date(orderDateFrom)
      }
      
      if (orderDateTo) {
        // Set time to end of day for the to-date
        const endDate = new Date(orderDateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }
    
    // Filter by expected delivery date range
    if (expectedDateFrom || expectedDateTo) {
      where.expectedDeliveryDate = {}
      
      if (expectedDateFrom) {
        where.expectedDeliveryDate.gte = new Date(expectedDateFrom)
      }
      
      if (expectedDateTo) {
        // Set time to end of day for the to-date
        const endDate = new Date(expectedDateTo)
        endDate.setHours(23, 59, 59, 999)
        where.expectedDeliveryDate.lte = endDate
      }
    }
    
    // Search by invoice number or customer info
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
      ]
    }
    
    // Build orderBy based on sort parameter
    let orderBy: any = { createdAt: 'desc' }
    if (sort) {
      const [field, direction] = sort.split(':')
      orderBy = { [field]: direction.toLowerCase() }
    }
    
    // Get total count for pagination
    const total = await db.order.count({ where })
    
    // Search and paginate orders
    const orders = await db.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        customer: true,
        items: true,
        branch: true,
      },
    })
    
    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw new Error('Failed to fetch orders')
  }
}
