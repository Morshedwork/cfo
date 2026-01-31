"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LoadingScreen } from "@/components/loading-screen"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = "/auth/login"
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  if (loading) {
    return <LoadingScreen />
  }

  if (requireAuth && !user) {
    return <LoadingScreen />
  }

  if (!requireAuth && user) {
    return <LoadingScreen />
  }

  return <>{children}</>
}
