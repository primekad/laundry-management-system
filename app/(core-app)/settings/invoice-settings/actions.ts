"use server"

import { db } from "@/lib/db"
import { createDefaultInvoiceSettings, generateInvoiceNumber } from "@/lib/invoice-utils"
import { revalidatePath } from "next/cache"

/**
 * Get all invoice settings
 */
export async function getInvoiceSettings() {
  try {
    const settings = await db.invoiceSettings.findMany({
      include: {
        branch: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return settings
  } catch (error) {
    console.error('Error fetching invoice settings:', error)
    return []
  }
}

/**
 * Get default invoice settings or create if not exists
 */
export async function getDefaultInvoiceSettings() {
  try {
    let defaultSettings = await db.invoiceSettings.findFirst({
      where: { isDefault: true }
    })
    
    // If no default settings exist, create one
    if (!defaultSettings) {
      const defaultConfig = createDefaultInvoiceSettings()
      defaultSettings = await db.invoiceSettings.create({
        data: defaultConfig
      })
    }
    
    return defaultSettings
  } catch (error) {
    console.error('Error getting default invoice settings:', error)
    throw new Error('Failed to get default invoice settings')
  }
}

/**
 * Update invoice settings
 */
export async function updateInvoiceSettings(id: string, data: any) {
  try {
    // Convert string values to the correct types
    const updatedData = {
      ...data,
      counterDigits: parseInt(data.counterDigits),
      counterStart: parseInt(data.counterStart),
      currentCounter: parseInt(data.currentCounter),
      includeMonth: Boolean(data.includeMonth),
      includeDay: Boolean(data.includeDay),
      resetCounterYearly: Boolean(data.resetCounterYearly),
      isDefault: Boolean(data.isDefault),
    }
    
    // If this setting is being made default, unset any other defaults
    if (updatedData.isDefault) {
      await db.invoiceSettings.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }
    
    const settings = await db.invoiceSettings.update({
      where: { id },
      data: updatedData
    })
    
    revalidatePath('/settings/invoice')
    return settings
  } catch (error) {
    console.error('Error updating invoice settings:', error)
    throw new Error('Failed to update invoice settings')
  }
}

/**
 * Create new invoice settings
 */
export async function createInvoiceSettings(data: any) {
  try {
    // Convert string values to the correct types
    const parsedData = {
      ...data,
      counterDigits: parseInt(data.counterDigits),
      counterStart: parseInt(data.counterStart),
      currentCounter: parseInt(data.currentCounter),
      includeMonth: Boolean(data.includeMonth),
      includeDay: Boolean(data.includeDay),
      resetCounterYearly: Boolean(data.resetCounterYearly),
      isDefault: Boolean(data.isDefault),
    }
    
    // If this setting is being made default, unset any other defaults
    if (parsedData.isDefault) {
      await db.invoiceSettings.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }
    
    const settings = await db.invoiceSettings.create({
      data: parsedData
    })
    
    revalidatePath('/settings/invoice')
    return settings
  } catch (error) {
    console.error('Error creating invoice settings:', error)
    throw new Error('Failed to create invoice settings')
  }
}

/**
 * Delete invoice settings
 */
export async function deleteInvoiceSettings(id: string) {
  try {
    // Check if this is a default setting
    const settings = await db.invoiceSettings.findUnique({
      where: { id }
    })
    
    if (!settings) {
      throw new Error('Invoice settings not found')
    }
    
    // Don't allow deleting the last or default settings
    const count = await db.invoiceSettings.count()
    
    if (count <= 1) {
      throw new Error('Cannot delete the last invoice settings')
    }
    
    if (settings.isDefault) {
      throw new Error('Cannot delete default invoice settings. Make another one default first.')
    }
    
    await db.invoiceSettings.delete({
      where: { id }
    })
    
    revalidatePath('/settings/invoice')
    return true
  } catch (error) {
    console.error('Error deleting invoice settings:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to delete invoice settings')
  }
}

/**
 * Get a new invoice number based on settings
 */
export async function getNextInvoiceNumber(invoiceSettingsId?: string, manualNumber?: string) {
  try {
    // If manual number provided and not empty, use it
    if (manualNumber && manualNumber.trim() !== '') {
      // Check if invoice number already exists
      const existingOrder = await db.order.findUnique({
        where: { invoiceNumber: manualNumber }
      })
      
      if (existingOrder) {
        throw new Error(`Invoice number ${manualNumber} already exists`)
      }
      
      return manualNumber
    }
    
    // Otherwise, generate based on settings
    let settings
    
    if (invoiceSettingsId) {
      // Use specified settings
      settings = await db.invoiceSettings.findUnique({
        where: { id: invoiceSettingsId }
      })
      
      if (!settings) {
        throw new Error('Invoice settings not found')
      }
    } else {
      // Use default settings
      settings = await db.invoiceSettings.findFirst({
        where: { isDefault: true }
      })
      
      if (!settings) {
        // Create default if it doesn't exist
        settings = await getDefaultInvoiceSettings()
      }
    }
    
    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber(settings)
    
    // Update counter
    await db.invoiceSettings.update({
      where: { id: settings.id },
      data: { currentCounter: settings.currentCounter + 1 }
    })
    
    return invoiceNumber
  } catch (error) {
    console.error('Error generating invoice number:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to generate invoice number')
  }
}
