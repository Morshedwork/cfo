"use client"

import { DashboardShell } from "@/components/dashboard-shell"

export default function BookkeepingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
