"use client"

import { DashboardShell } from "@/components/dashboard-shell"

export default function DataManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
