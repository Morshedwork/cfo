"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Firebase handles OAuth callbacks automatically through redirects
// This page is kept for compatibility but redirects immediately
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    console.log('[Auth Callback] Firebase handles auth automatically, redirecting to dashboard...')
    
    // Small delay to ensure Firebase auth state is updated
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Completing sign in...</p>
        <p className="text-sm text-muted-foreground mt-2">You'll be redirected in a moment</p>
      </div>
    </div>
  )
}
