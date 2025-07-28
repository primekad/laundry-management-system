"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import type { LaundryCategory, PricingRule, ServiceType, PricingType, UnitOfMeasurement } from "@prisma/client";
import { useDeletePricingRuleMutation } from "./mutations";
import { PricingRuleDialog } from "./pricing-rule-dialog";

export interface PricingRuleColumn extends PricingRule {
  laundryCategory: LaundryCategory;
  serviceType: ServiceType;
}

interface GetColumnsOptions {
  onEdit: (rule: PricingRuleColumn) => void;
  laundryCategories: LaundryCategory[];
  serviceTypes: ServiceType[];
}

// Helper function to get badge color based on pricing type
const getPricingTypeBadge = (pricingType: PricingType) => {
  switch (pricingType) {
    case "FLAT_RATE":
      return "bg-blue-100 text-blue-800";
    case "SIZE_BASED":
      return "bg-green-100 text-green-800";
    case "RANGE_BASED":
      return "bg-purple-100 text-purple-800";
    case "PER_UNIT":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to format unit of measurement
const formatUnit = (unit: UnitOfMeasurement | null) => {
  if (!unit) return "";
  
  switch (unit) {
    case "METRES":
      return "per metres";
    case "YARDS":
      return "per yards";
    case "PIECES":
      return "per piece";
    case "KILOGRAMS":
      return "per kg";
    default:
      return "";
  }
};

// Separate component for action cell to prevent infinite update loops
const ActionCell = React.memo(({ row, onEdit, laundryCategories, serviceTypes }: { 
  row: any; 
  onEdit: (rule: PricingRuleColumn) => void;
  laundryCategories: LaundryCategory[];
  serviceTypes: ServiceType[];
}) => {
  const deleteMutation = useDeletePricingRuleMutation();
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this pricing rule?")) {
      deleteMutation.mutate(row.original.id);
    }
  };
  
  return (
    <div className="flex items-center space-x-2 justify-end">
      <PricingRuleDialog
        initialData={row.original}
        laundryCategories={laundryCategories}
        serviceTypes={serviceTypes}
      >
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 py-0"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </PricingRuleDialog>
      <Button 
        onClick={handleDelete} 
        variant="outline" 
        size="sm" 
        className="h-8 px-2 py-0 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
});

export function getColumns({ onEdit, laundryCategories, serviceTypes }: GetColumnsOptions): ColumnDef<PricingRuleColumn>[] {
  return [
    {
      id: "laundryCategory",
      accessorKey: "laundryCategory.name",
      header: "Category",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.laundryCategory.name}</div>
      ),
    },
    {
      id: "serviceType",
      accessorKey: "serviceType.name",
      header: "Service Type",
      cell: ({ row }) => <div>{row.original.serviceType.name}</div>,
    },
    {
      id: "pricingModel",
      accessorKey: "laundryCategory.pricingType",
      header: "Pricing Model",
      cell: ({ row }) => {
        const pricingType = row.original.laundryCategory.pricingType;
        return (
          <Badge className={`font-medium ${getPricingTypeBadge(pricingType)}`}>
            {pricingType.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      id: "priceDetails",
      header: "Price Details",
      cell: ({ row }) => {
        const pricingType = row.original.laundryCategory.pricingType;
        const { price, minPrice, maxPrice, unitOfMeasurement, sizeBasedRates } = row.original;
        
        // Flat rate pricing
        if (pricingType === "FLAT_RATE" && price !== null) {
          return <div>{formatCurrency(price)}</div>;
        }
        
        // Size-based pricing
        if (pricingType === "SIZE_BASED" && sizeBasedRates) {
          try {
            const rates = typeof sizeBasedRates === 'string' 
              ? JSON.parse(sizeBasedRates) 
              : sizeBasedRates;
              
            if (Array.isArray(rates)) {
              return (
                <div className="space-y-1">
                  {rates.map((rate, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-muted-foreground">{rate.size}:</span> {formatCurrency(rate.price)}
                    </div>
                  ))}
                </div>
              );
            }
          } catch (e) {
            return <div className="text-red-500">Invalid size rates data</div>;
          }
        }
        
        // Range-based pricing
        if (pricingType === "RANGE_BASED" && minPrice !== null && maxPrice !== null) {
          return (
            <div>
              {formatCurrency(minPrice)} - {formatCurrency(maxPrice)} 
              {unitOfMeasurement && <span className="text-sm text-muted-foreground"> {formatUnit(unitOfMeasurement)}</span>}
            </div>
          );
        }
        
        // Per unit pricing
        if (pricingType === "PER_UNIT" && price !== null) {
          return (
            <div>
              {formatCurrency(price)}
              {unitOfMeasurement && <span className="text-sm text-muted-foreground"> {formatUnit(unitOfMeasurement)}</span>}
            </div>
          );
        }
        
        return <div className="text-muted-foreground">Not set</div>;
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={`${status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return <ActionCell 
          row={row} 
          onEdit={onEdit} 
          laundryCategories={laundryCategories} 
          serviceTypes={serviceTypes} 
        />;
      },
    },
  ];
}
