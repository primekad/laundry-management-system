"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateLaundryCategoryMutation, useUpdateLaundryCategoryMutation } from "./mutations"
import { useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRICING_TYPES } from "./config"
import { LaundryCategory } from "@prisma/client"

export function LaundryCategoryDialog({ children, initialData }: { children: React.ReactNode, initialData?: LaundryCategory }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const createMutation = useCreateLaundryCategoryMutation()
  const updateMutation = useUpdateLaundryCategoryMutation()

  const isEditMode = !!initialData

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const mutation = isEditMode ? updateMutation : createMutation
    if (isEditMode) {
      formData.append("id", initialData.id)
    }

    mutation.mutate(formData, {
      onSuccess: () => {
        setOpen(false)
        formRef.current?.reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Add"} Laundry Category</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of this laundry category." : "Create a new laundry category for your business."}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" name="name" defaultValue={initialData?.name} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" name="description" defaultValue={initialData?.description ?? ""} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pricingType" className="text-right">
              Pricing Type
            </Label>
            <Select name="pricingType" defaultValue={initialData?.pricingType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a pricing type" />
              </SelectTrigger>
              <SelectContent>
                {PRICING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

