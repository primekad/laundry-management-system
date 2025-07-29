"use client"

import React, { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PricingType } from "@prisma/client"
import { Trash2 } from "lucide-react"
import { LaundryCategory, ServiceType } from "@prisma/client"

// Type for size-based pricing options
type SizeOption = {
  size: string
  price: number
}

// Type for a pricing rule
type PricingRule = {
  id: string
  laundryCategoryId: string
  serviceTypeId: string
  price?: number
  minPrice?: number
  maxPrice?: number
  sizeBasedRates?: SizeOption[]
  laundryCategory: {
    id: string
    name: string
    pricingType: PricingType
  }
  serviceType: {
    id: string
    name: string
  }
}

interface LaundryItemRowProps {
  index: number
  item: {
    id?: string
    categoryId: string
    serviceTypeId: string
    quantity: number
    unitPrice: number
    size?: string
    notes?: string
    total: number
  }
  categories: LaundryCategory[]
  services: ServiceType[]
  pricingRules: PricingRule[]
  onChangeField: (index: number, field: string, value: any) => void
  onRemove: () => void
}

export function LaundryItemRow({
  index,
  item,
  categories,
  services,
  pricingRules,
  onChangeField,
  onRemove
}: LaundryItemRowProps): React.ReactNode {
  const [sizeOptions, setSizeOptions] = useState<Array<{ size: string; price: number }>>([]);
  const priceInitializedRef = useRef<{categoryId?: string; serviceTypeId?: string}>({});
  
  // Find the applicable pricing rule from the provided array using service ID
  const pricingRule = React.useMemo(() => {
    if (!item.categoryId || !item.serviceTypeId) return null;
    
    // Find matching service
    const service = services.find(s => s.id === item.serviceTypeId);
    
    // If no matching service, return null
    if (!service) return null;
    
    // Look for a matching pricing rule based on category and service
    return pricingRules.find(rule => 
      rule.laundryCategoryId === item.categoryId && 
      (service.name === rule.serviceType?.name || service.id === rule.serviceTypeId)
    ) || null;
  }, [item.categoryId, item.serviceTypeId, pricingRules, services]);
  
  // Derive pricing information from the pricing rule
  const priceType = pricingRule?.laundryCategory?.pricingType || "";
  const minPrice = priceType === PricingType.RANGE_BASED ? 
    (typeof pricingRule?.minPrice === 'string' ? parseFloat(pricingRule.minPrice as string) : pricingRule?.minPrice) : 
    null;
  const maxPrice = priceType === PricingType.RANGE_BASED ? 
    (typeof pricingRule?.maxPrice === 'string' ? parseFloat(pricingRule.maxPrice as string) : pricingRule?.maxPrice) : 
    null;
  const showSizeOptions = priceType === PricingType.SIZE_BASED && 
    pricingRule?.sizeBasedRates && 
    Array.isArray(pricingRule.sizeBasedRates) && 
    pricingRule.sizeBasedRates.length > 0;
  
  // Process pricing rule when it changes
  useEffect(() => {
    if (!pricingRule) return;
    
    // Check if we've already initialized prices for this category/service combination
    const ruleKey = `${item.categoryId}-${item.serviceTypeId}`;
    const currentRuleKey = `${priceInitializedRef.current.categoryId}-${priceInitializedRef.current.serviceTypeId}`;
    
    // Only update prices if this is a different rule than we've seen before
    if (ruleKey !== currentRuleKey) {
      switch (priceType) {
        case PricingType.FLAT_RATE:
          const flatPrice = typeof pricingRule.price === 'string' ? 
            parseFloat(pricingRule.price as string) : pricingRule.price;
          onChangeField(index, "unitPrice", flatPrice);
          break;
          
        case PricingType.RANGE_BASED:
          onChangeField(index, "unitPrice", minPrice);
          break;
          
        case PricingType.SIZE_BASED:
          if (showSizeOptions && pricingRule.sizeBasedRates) {
            const formattedSizeRates = pricingRule.sizeBasedRates.map((rate: SizeOption) => ({
              size: rate.size,
              price: typeof rate.price === 'string' ? parseFloat(rate.price as string) : rate.price
            }));
            setSizeOptions(formattedSizeRates);
            
            // Set default size and price if not already set
            if (!item.size && formattedSizeRates.length > 0) {
              onChangeField(index, "size", formattedSizeRates[0].size);
              onChangeField(index, "unitPrice", formattedSizeRates[0].price);
            }
          }
          break;
      }
      
      // Update our ref to remember this rule has been processed
      priceInitializedRef.current = {
        categoryId: item.categoryId,
        serviceTypeId: item.serviceTypeId
      };
    }
  }, [pricingRule, priceType, index, onChangeField, item, minPrice, showSizeOptions]);

  // Update total when quantity or unitPrice changes
  const updateTotal = (quantity: number, price: number) => {
    const total = quantity * price;
    onChangeField(index, "total", total);
  };

  // Handle quantity change
  const handleQuantityChange = (quantity: number) => {
    onChangeField(index, "quantity", quantity);
    updateTotal(quantity, item.unitPrice);
  };

  // Handle price change
  const handlePriceChange = (price: number) => {
    onChangeField(index, "unitPrice", price);
    updateTotal(item.quantity, price);
  };

  // Handle size change
  const handleSizeChange = (size: string) => {
    onChangeField(index, "size", size)

    // Update price based on size
    const sizeRate = sizeOptions.find(option => option.size === size)
    if (sizeRate) {
      const price = typeof sizeRate.price === 'string' ? parseFloat(sizeRate.price) : sizeRate.price
      onChangeField(index, "unitPrice", price)
      updateTotal(item.quantity, price)
    }
  }

  return (
    <>
      <td className="py-2">
        <Select 
          value={item.categoryId} 
          onValueChange={(value) => onChangeField(index, "categoryId", value)}
        >
          <SelectTrigger className="w-[160px] bg-white border-slate-200">
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category: LaundryCategory) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2">
        <Select
          value={item.serviceTypeId} 
          onValueChange={(value) => onChangeField(index, "serviceTypeId", value)}
        >
          <SelectTrigger className="w-[140px] bg-white border-slate-200">
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service: ServiceType) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2">
        <Input
          type="number"
          className="w-16 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          min="1"
        />
      </td>
      <td className="py-2">
        {!pricingRule ? (
          <Badge variant="outline" className="h-9 flex items-center justify-center">Select items</Badge>
        ) : showSizeOptions ? (
          <Select 
            value={item.size} 
            onValueChange={handleSizeChange}
          >
            <SelectTrigger className="w-24 bg-white border-slate-200">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map((option, i) => (
                <SelectItem key={i} value={option.size}>
                  {option.size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline" className="h-9 flex items-center justify-center">N/A</Badge>
        )}
      </td>
      <td className="py-2">
        <Input
          className="w-32 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Special notes"
          value={item.notes || ''}
          onChange={(e) => onChangeField(index, "notes", e.target.value)}
        />
      </td>
      <td className="py-2">
        <div className="space-y-1">
          <Input
            type="number"
            className={`w-24 bg-white border-slate-200 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              priceType === PricingType.FLAT_RATE ? "bg-slate-50" : ""
            }`}
            value={item.unitPrice}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
            min={minPrice !== null && minPrice !== undefined ? minPrice.toString() : undefined}
            max={maxPrice !== null && maxPrice !== undefined ? maxPrice.toString() : undefined}
            disabled={priceType === PricingType.FLAT_RATE}
          />
          {priceType === PricingType.RANGE_BASED && (
            <div className="text-xs text-gray-500">
              Range: GHS {minPrice ? minPrice.toFixed(2) : '0.00'} - {maxPrice ? maxPrice.toFixed(2) : '0.00'}
            </div>
          )}
        </div>
      </td>
      <td className="py-2 font-bold text-right">GHS {item.total.toFixed(2)}</td>
      <td className="py-2">
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </>
  )
}
