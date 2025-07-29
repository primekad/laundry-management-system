"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Customer } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { searchCustomers } from "../actions-standardized"
import { Check, ChevronsUpDown, UserPlus, User, Loader2 } from "lucide-react"

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer | null) => void
}

export function CustomerSearch({ onSelectCustomer }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [customerType, setCustomerType] = useState("existing")
  const [searchQuery, setSearchQuery] = useState("") 
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  // Use TanStack Query to fetch and cache customers
  const { data: customers, isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching all customers via TanStack Query')
      const results = await searchCustomers('')
      console.log(`TanStack Query: fetched ${results.length} customers`)
      return results
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  })

  // Create a filtered list of customers based on the search query
  const filteredBySearch = customers?.filter(customer => {
    if (!searchQuery || searchQuery.length < 2) return true
    
    const query = searchQuery.toLowerCase()
    return (
      (customer.name && customer.name.toLowerCase().includes(query)) ||
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      (customer.phone && customer.phone.toLowerCase().includes(query))
    )
  }) || []
  
  // Ensure we always show at least the first 3 customers if they exist
  const filteredCustomers = [...new Set([
    ...(customers?.slice(0, 3) || []), // Always include first 3 customers
    ...filteredBySearch // Add any additional filtered results
  ])].sort((a, b) => {
    // Prioritize matches by putting them first
    const queryLower = searchQuery.toLowerCase()
    const aMatches = queryLower.length >= 2 && a.name?.toLowerCase().includes(queryLower)
    const bMatches = queryLower.length >= 2 && b.name?.toLowerCase().includes(queryLower)
    
    if (aMatches && !bMatches) return -1
    if (!aMatches && bMatches) return 1
    
    // Then sort alphabetically
    return (a.name || '').localeCompare(b.name || '')
  })

  const handleSearchInputChange = (value: string) => {
    console.log('Search input changed:', value)
    setSearchQuery(value)
  }

  const handleSelectCustomer = (customer: Customer) => {
    console.log('Customer selected:', customer)
    setSelectedCustomer(customer)
    setOpen(false)
    onSelectCustomer(customer)
  }
  
  const handlePopoverOpenChange = (open: boolean) => {
    console.log('Popover open changed:', open)
    setOpen(open)
  }

  const handleCustomerTypeChange = (value: string) => {
    setCustomerType(value)
    
    if (value === "new") {
      setSelectedCustomer(null)
      onSelectCustomer(null)
    }
  }

  const handleNewCustomerChange = (field: string, value: string) => {
    const updatedData = { ...customerData, [field]: value }
    setCustomerData(updatedData)
    onSelectCustomer({ ...updatedData, id: "" } as Customer)
  }

  return (
    <div className="space-y-4">
      <RadioGroup 
        value={customerType} 
        onValueChange={handleCustomerTypeChange} 
        className="flex flex-col space-y-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Existing Customer
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            New Customer
          </Label>
        </div>
      </RadioGroup>

      {customerType === "existing" ? (
        <div className="space-y-4">
          <Popover open={open} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-white border-slate-200 text-left font-normal"
              >
                {selectedCustomer ? selectedCustomer.name : "Search for a customer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Search by name, phone, or email..." 
                  value={searchQuery}
                  onValueChange={handleSearchInputChange}
                  autoFocus
                />
                <CommandList>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading customers...
                    </div>
                  ) : isError ? (
                    <CommandEmpty>Error loading customers.</CommandEmpty>
                  ) : filteredCustomers.length === 0 ? (
                    <CommandEmpty>No customers found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          onSelect={() => handleSelectCustomer(customer)}
                          className="flex flex-col items-start"
                        >
                          <div className="flex w-full items-center justify-between">
                            <span>{customer.name}</span>
                            {selectedCustomer?.id === customer.id && <Check className="h-4 w-4" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {customer.phone && <span className="mr-2">{customer.phone}</span>}
                            {customer.email}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedCustomer && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-md">
              <div><span className="font-medium">Name:</span> {selectedCustomer.name}</div>
              {selectedCustomer.phone && <div><span className="font-medium">Phone:</span> {selectedCustomer.phone}</div>}
              {selectedCustomer.email && <div><span className="font-medium">Email:</span> {selectedCustomer.email}</div>}
              {selectedCustomer.address && <div><span className="font-medium">Address:</span> {selectedCustomer.address}</div>}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={customerData.name}
              onChange={(e) => handleNewCustomerChange("name", e.target.value)}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={customerData.phone}
              onChange={(e) => handleNewCustomerChange("phone", e.target.value)}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerData.email}
              onChange={(e) => handleNewCustomerChange("email", e.target.value)}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={customerData.address}
              onChange={(e) => handleNewCustomerChange("address", e.target.value)}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}
    </div>
  )
}
