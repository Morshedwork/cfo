"use client"

import { usePathname } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardErrorBoundary } from "@/components/dashboard-error-boundary"
import { VoiceChatbotWidget } from "@/components/voice-chatbot-widget"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isVoiceAssistantPage = pathname === "/voice-assistant"

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
        {!isVoiceAssistantPage && <VoiceChatbotWidget />}
      </DashboardErrorBoundary>
    </AuthGuard>
  )
}
