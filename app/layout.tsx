import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { FloatingNotificationButton } from "@/components/floating-notification-button"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Aura - Strategic Financial Growth Manager for Startups",
  description:
    "Your real-time strategic financial brain: internal finance + market intelligence. Revenue growth optimization, smarter capital allocation, competitive awareness, and data-driven scaling for startups and SMEs.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="w-full">
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable} w-full m-0 p-0`} suppressHydrationWarning>
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
