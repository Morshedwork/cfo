"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Supabase OAuth callback: code exchange is done in route.ts.
// This page is shown when redirecting back from provider; route handler redirects to dashboard.
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Completing sign in...</p>
        <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
      </div>
    </div>
  )
}
