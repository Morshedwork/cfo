"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardErrorBoundary } from "@/components/dashboard-error-boundary"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardErrorBoundary>
        <div className="flex min-h-screen bg-background">
          <DashboardSidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </DashboardErrorBoundary>
    </AuthGuard>
  )
}
