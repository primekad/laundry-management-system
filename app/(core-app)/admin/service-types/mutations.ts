"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createServiceType, deleteServiceType, updateServiceType } from "./actions"
import { toast } from "sonner"

export const useCreateServiceTypeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => createServiceType(formData),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error("Failed to create service type")
      } else {
        toast.success("Service type created successfully")
        queryClient.invalidateQueries({ queryKey: ["service-types"] })
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.")
    },
  })
}

export const useUpdateServiceTypeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updateServiceType(formData),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error("Failed to update service type")
      } else {
        toast.success("Service type updated successfully")
        queryClient.invalidateQueries({ queryKey: ["service-types"] })
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.")
    },
  })
}

export const useDeleteServiceTypeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteServiceType(id),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error("Failed to delete service type")
      } else {
        toast.success("Service type deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["service-types"] })
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.")
    },
  })
}
