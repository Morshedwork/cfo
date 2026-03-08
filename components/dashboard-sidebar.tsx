"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  ShoppingCart,
  Database,
  Brain,
  Mic,
  Settings,
  Bell,
  Sparkles,
  Globe,
  LineChart,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/runway", label: "Runway", icon: TrendingUp },
  { href: "/bookkeeping", label: "Bookkeeping", icon: BookOpen },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/dashboard/scenarios", label: "Growth Scenarios", icon: LineChart },
  { href: "/dashboard/market-intelligence", label: "Market Intelligence", icon: Globe },
  { href: "/dashboard/fundraising", label: "Fundraising", icon: DollarSign },
  { href: "/data-management", label: "Data", icon: Database },
  { href: "/ai-assistant", label: "AI Assistant", icon: Brain },
  { href: "/voice-assistant", label: "Voice AI", icon: Mic },
]

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
]

export function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Sparkles className="h-6 w-6 text-primary shrink-0" />
        <div className="min-w-0">
          <span className="font-semibold gradient-text block">Aura</span>
          <span className="text-[10px] text-muted-foreground block truncate">Growth Manager</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Finance & Growth
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <p className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Account
        </p>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/settings" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/** Desktop-only sidebar; use in layout as first column. */
export function DashboardSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <SidebarContent />
    </aside>
  )
}

/** Mobile menu trigger + sheet; use in dashboard header. */
export function DashboardSidebarMobile() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        <SidebarContent onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
