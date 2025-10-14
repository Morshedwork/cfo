import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { FloatingNotificationButton } from "@/components/floating-notification-button"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Aura - AI Virtual CFO for Startups",
  description:
    "The AI-powered financial brain for early-stage startups. Manage runway, forecast cash flow, and make smarter financial decisions.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="w-full">
      <body 
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} w-full m-0 p-0`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <FloatingNotificationButton />
          <Toaster position="top-right" richColors />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
