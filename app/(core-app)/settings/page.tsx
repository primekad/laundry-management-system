"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Receipt, Building, Bell, Shield, CreditCard, Zap, Settings } from "lucide-react"

const settingsCategories = [
  {
    title: "User Management",
    description: "Manage system users and their permissions",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Branch Management",
    description: "Manage business branches and their details",
    icon: Building,
    href: "/admin/branches",
  },
  {
    title: "Laundry Categories",
    description: "Manage the categories of laundry services you offer",
    icon: Zap,
    href: "/admin/laundry-categories",
  },
  {
    title: "Service Types",
    description: "Manage the types of services your laundry offers",
    icon: Settings,
    href: "/admin/service-types",
  },
  {
    title: "Pricing Rules",
    description: "Set up pricing for different item types and services",
    icon: CreditCard,
    href: "/admin/pricing-rules",
  },
  {
    title: "Expense Categories",
    description: "Manage categories for business expenses",
    icon: Receipt,
    href: "/admin/expense-categories",
  },
  {
    title: "Business Information",
    description: "Update your business details and contact information",
    icon: Building,
    href: "/settings/business",
  },
  {
    title: "Notification Settings",
    description: "Configure SMS and email notification preferences",
    icon: Bell,
    href: "/settings/notifications",
  },
  {
    title: "Security Settings",
    description: "Manage security settings and access controls",
    icon: Shield,
    href: "/settings/security",
  },
  {
    title: "Payment Methods",
    description: "Configure payment methods and integrations",
    icon: CreditCard,
    href: "/settings/payments",
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Configure your laundry management system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => (
          <Card key={category.title} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">{category.title}</CardTitle>
              </div>
              <CardDescription className="pt-2">{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                asChild
              >
                <Link href={category.href}>Manage</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
