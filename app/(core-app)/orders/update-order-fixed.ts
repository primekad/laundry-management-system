/**
 * Update an existing order - Fixed version that handles payment-only updates
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
      
      // 2. Only modify order items if this is not a payment-only update
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
            categoryId: item.categoryId || null,
            quantity: item.quantity,
            price: item.unitPrice || item.price,
            subtotal: item.total || item.subtotal,
            notes: item.notes || null,
            size: item.size || null
          })),
        })
      }
      
      // 3. Create new payment if amount is greater than 0
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
