import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLaundryCategory, deleteLaundryCategory, updateLaundryCategory } from "./actions";

export function useCreateLaundryCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => createLaundryCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laundry-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useUpdateLaundryCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => updateLaundryCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laundry-categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useDeleteLaundryCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const formData = new FormData();
      formData.append("id", id);
      return deleteLaundryCategory(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laundry-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}
