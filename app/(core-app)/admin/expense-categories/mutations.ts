"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  updateExpenseCategory,
} from "./actions";
import { toast } from "sonner";

export const useCreateExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createExpenseCategory(formData),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Expense category created successfully");
        queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.");
    },
  });
};

export const useUpdateExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updateExpenseCategory(formData),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Expense category updated successfully");
        queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.");
    },
  });
};

export const useDeleteExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpenseCategory(id),
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Expense category deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred.");
    },
  });
};
