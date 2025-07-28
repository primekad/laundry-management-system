"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PricingRule, LaundryCategory, ServiceType, UnitOfMeasurement, PricingType } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePricingRuleMutation, useUpdatePricingRuleMutation } from "./mutations";
import { PRICING_TYPES } from "../laundry-categories/config";
import { UNITS_OF_MEASUREMENT } from "./config";
import { PlusIcon, Trash2 } from "lucide-react";

const formSchema = z.object({
  laundryCategoryId: z.string().min(1, "Category is required."),
  serviceTypeId: z.string().min(1, "Service type is required."),
  price: z.coerce.number().optional().nullable(),
  minPrice: z.coerce.number().optional().nullable(),
  maxPrice: z.coerce.number().optional().nullable(),
  unitOfMeasurement: z.nativeEnum(UnitOfMeasurement).optional().nullable(),
  sizeBasedRates: z.string().optional().nullable(), // Will be a JSON string
});

interface PricingRuleDialogProps {
  children: React.ReactNode;
  initialData?: PricingRule | null;
  laundryCategories: LaundryCategory[];
  serviceTypes: ServiceType[];
}

export function PricingRuleDialog({
  children,
  initialData,
  laundryCategories,
  serviceTypes,
}: PricingRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!initialData;
  const [sizeRates, setSizeRates] = useState<{ size: string; price: number | string }[]>([{ size: "", price: "" }]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [selectedCategory, setSelectedCategory] = useState<LaundryCategory | undefined>();
  const watchedCategoryId = form.watch("laundryCategoryId");

  useEffect(() => {
    const category = laundryCategories.find(c => c.id === watchedCategoryId);
    setSelectedCategory(category);
  }, [watchedCategoryId, laundryCategories]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          laundryCategoryId: initialData.laundryCategoryId,
          serviceTypeId: initialData.serviceTypeId,
          price: initialData.price,
          minPrice: initialData.minPrice,
          maxPrice: initialData.maxPrice,
          unitOfMeasurement: initialData.unitOfMeasurement,
        });
        if (Array.isArray(initialData.sizeBasedRates) && initialData.sizeBasedRates.length > 0) {
          setSizeRates(initialData.sizeBasedRates as any);
        } else {
          setSizeRates([{ size: "", price: "" }]);
        }
      } else {
        form.reset({
          laundryCategoryId: "",
          serviceTypeId: "",
          price: null,
          minPrice: null,
          maxPrice: null,
          unitOfMeasurement: null,
        });
        setSizeRates([{ size: "", price: "" }]);
      }
    }
  }, [initialData, open, form]);

  const createMutation = useCreatePricingRuleMutation();
  const updateMutation = useUpdatePricingRuleMutation();

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    
    // Clear empty optional fields so they don't get sent to the server
    const cleanedValues: Partial<typeof values> = {};
    for (const [key, value] of Object.entries(values)) {
      if (value !== null && value !== undefined && value !== "") {
        cleanedValues[key as keyof typeof values] = value;
      }
    }

    Object.entries(cleanedValues).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    if (selectedCategory?.pricingType === PricingType.SIZE_BASED) {
      const validSizeRates = sizeRates.filter(r => r.size && r.price);
      formData.set("sizeBasedRates", JSON.stringify(validSizeRates));
    }

    const mutationCallback = (data: any) => {
      if (data?.error) {
        for (const [field, messages] of Object.entries(data.error)) {
          form.setError(field as any, { type: "server", message: (messages as string[]).join(", ") });
        }
      } else {
        handleClose();
      }
    };

    if (isEditMode && initialData) {
      formData.append("id", initialData.id);
      updateMutation.mutate(formData, { onSuccess: mutationCallback });
    } else {
      createMutation.mutate(formData, { onSuccess: mutationCallback });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Add"} Pricing Rule</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update an existing" : "Create a new"} pricing rule for a service.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="laundryCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {laundryCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCategory && (
              <div>
                <h3 className="text-lg font-medium mt-4">Pricing Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  {PRICING_TYPES.find((p) => p.value === selectedCategory.pricingType)?.label}
                </p>

                {selectedCategory.pricingType === PricingType.FLAT_RATE && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., GHS 10.00" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedCategory.pricingType === PricingType.RANGE_BASED && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="minPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Price</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., GHS 5.00" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Price</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., GHS 20.00" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {selectedCategory.pricingType === PricingType.SIZE_BASED && (
                  <div className="space-y-4 mt-4">
                    <FormLabel>Size Based Rates</FormLabel>
                    {sizeRates.map((rate, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Size (e.g., Small)"
                          value={rate.size}
                          onChange={(e) => {
                            const newRates = [...sizeRates];
                            newRates[index].size = e.target.value;
                            setSizeRates(newRates);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={rate.price}
                          onChange={(e) => {
                            const newRates = [...sizeRates];
                            newRates[index].price = e.target.value;
                            setSizeRates(newRates);
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            if (sizeRates.length > 1) {
                              const newRates = sizeRates.filter((_, i) => i !== index);
                              setSizeRates(newRates);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSizeRates([...sizeRates, { size: "", price: "" }])}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Rate
                    </Button>
                  </div>
                )}

                {selectedCategory.pricingType === PricingType.PER_UNIT && (
                  <div className="mt-4 space-y-4">
                     <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Unit</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., GHS 2.50" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitOfMeasurement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNITS_OF_MEASUREMENT.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
