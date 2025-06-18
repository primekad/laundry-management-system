"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  ShoppingBag,
  Plus,
  Users,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
  Zap,
} from "lucide-react"
import {authClient} from "@/lib/auth-client";
import { useRouter } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const mainNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    name: "New Order",
    href: "/orders/new",
    icon: Plus,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
]

const financeNavItems: NavItem[] = [
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
]

const settingsNavItems: NavItem[] = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const {data:session} = authClient.useSession()
  const router = useRouter()


  return (
    <div
      className={cn(
        "group relative flex h-screen flex-col bg-white border-r border-slate-200/60 transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[280px]",
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-6">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-xl font-bold text-slate-900">LaundroTrack</p>
              <p className="text-xs text-slate-500 font-medium">Management System</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg",
            collapsed && "absolute right-[-14px] top-14 h-7 w-7 rounded-full border bg-white shadow-lg z-10",
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-6">
        <div className="px-4 space-y-8">
          <div className="space-y-2">
            <div className={cn("mb-4 px-3", collapsed ? "hidden" : "block")}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Main Menu</h3>
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700",
                        collapsed && "mr-0",
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <div className={cn("mb-4 px-3", collapsed ? "hidden" : "block")}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Finance</h3>
            </div>
            <nav className="space-y-1">
              {financeNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700",
                        collapsed && "mr-0",
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <div className={cn("mb-4 px-3", collapsed ? "hidden" : "block")}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">System</h3>
            </div>
            <nav className="space-y-1">
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700",
                        collapsed && "mr-0",
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-slate-200/60 p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src="/placeholder.svg" alt="Kwasi Danso" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-sm">
                KD
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{session?.user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{session?.user?.role}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={ async ()=> await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/login"); // redirect to login page
                  },
                },
              })}
            >
              <LogOut className="h-4 w-4"  />
              <span className="sr-only">Log out</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
