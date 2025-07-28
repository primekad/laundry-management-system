"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPricingRule, deletePricingRule, updatePricingRule } from "./actions"
import { toast } from "sonner"

export const useCreatePricingRuleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => createPricingRule(formData),
    onSuccess: (data) => {
      if (data?.error) {
        const fieldErrors = Object.values(data.error).flat();
        const errorMessage = fieldErrors[0] || "Failed to create pricing rule. Please check your input.";
        toast.error(errorMessage);
      } else {
        toast.success("Pricing rule created successfully")
        queryClient.invalidateQueries({ queryKey: ["pricing-rules"] })
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.")
    },
  })
}

export const useUpdatePricingRuleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updatePricingRule(formData),
    onSuccess: (data) => {
      if (data?.error) {
        const fieldErrors = Object.values(data.error).flat();
        const errorMessage = fieldErrors[0] || "Failed to update pricing rule. Please check your input.";
        toast.error(errorMessage);
      } else {
        toast.success("Pricing rule updated successfully")
        queryClient.invalidateQueries({ queryKey: ["pricing-rules"] })
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.")
    },
  })
}

export const useDeletePricingRuleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePricingRule(id),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error("Failed to delete pricing rule")
      } else {
        toast.success("Pricing rule deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["pricing-rules"] })
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.")
    },
  })
}
