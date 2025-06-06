"use client"

import { useState } from "react"
import { AppSidebar } from "./components/app-sidebar"
import Dashboard from "./components/dashboard"
import OrderForm from "./components/order-form"
import OrdersList from "./components/orders-list"
import CustomersList from "./components/customers-list"
import ExpensesPage from "./components/expenses-page"
import ReportsPage from "./components/reports-page"
import UserManagement from "./pages/settings/user-management"
import PricingConfiguration from "./pages/settings/pricing-configuration"
import LoginPage from "./components/login-page"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function LaundryManagementSystem() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <LoginPage />
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setIsLoggedIn(true)} className="w-full">
                Demo Login (Skip Authentication)
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "orders":
        return <OrdersList />
      case "orders/new":
        return <OrderForm />
      case "customers":
        return <CustomersList />
      case "expenses":
        return <ExpensesPage />
      case "reports":
        return <ReportsPage />
      case "settings/pricing":
        return <PricingConfiguration />
      case "settings/users":
        return <UserManagement />
      default:
        return <Dashboard />
    }
  }

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      orders: "All Orders",
      "orders/new": "Create New Order",
      customers: "Customers",
      expenses: "Expenses",
      reports: "Reports",
      "settings/pricing": "Pricing Configuration",
      "settings/users": "User Management",
    }
    return titles[currentPage as keyof typeof titles] || "Dashboard"
  }

  const handleNavigation = (page: string) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
      <SidebarProvider>
        <AppSidebar onNavigate={handleNavigation} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="#"
                    onClick={() => setCurrentPage("dashboard")}
                    className="text-primary hover:text-primary/80"
                  >
                    LaundroTrack
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900 font-medium">{getPageTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6">{renderPage()}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
