import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { BranchProvider } from '@/components/providers/branch-provider';
import { QueryProvider } from '@/components/providers/query-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <BranchProvider>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Sidebar />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <main className="p-8">{children}</main>
          </div>
        </div>
    </BranchProvider>
    </QueryProvider>
  )
}
