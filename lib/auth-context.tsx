"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUserProfile, ensureUserProfile } from "@/lib/supabase/profile-utils"
import type { UserProfile as SupabaseProfile } from "@/lib/supabase/profile-utils"

// Profile shape that supports both snake_case (Supabase) and camelCase (legacy UI)
export interface AuthProfile {
  id: string
  email: string
  full_name: string | null
  fullName?: string | null
  avatar_url: string | null
  avatarUrl?: string | null
  company_name?: string | null
  role?: string
  onboarding_completed?: boolean
  created_at?: string
  updated_at?: string
  createdAt?: Date
  updatedAt?: Date
}

function mapSupabaseProfileToAuth(p: SupabaseProfile | null): AuthProfile | null {
  if (!p) return null
  return {
    ...p,
    fullName: p.full_name,
    avatarUrl: p.avatar_url,
    createdAt: p.created_at ? new Date(p.created_at) : undefined,
    updatedAt: p.updated_at ? new Date(p.updated_at) : undefined,
  }
}

interface AuthContextType {
  user: User | null
  profile: AuthProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<AuthProfile | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null
      setUser(u)

      if (u) {
        setProfile(null)
        getCurrentUserProfile()
          .then((p) => {
            if (p) {
              setProfile(mapSupabaseProfileToAuth(p))
            } else {
              ensureUserProfile().then(({ profile: ensured }) => {
                setProfile(mapSupabaseProfileToAuth(ensured))
              })
            }
          })
          .catch(() => {
            setProfile(
              mapSupabaseProfileToAuth({
                id: u.id,
                email: u.email ?? "",
                full_name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split("@")[0] ?? "User",
                avatar_url: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? null,
                company_name: null,
                role: "owner",
                onboarding_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            )
          })
      } else {
        setProfile(null)
      }
    })

    // Initial session — set loading false as soon as we know; don't wait for profile
    // Use try/catch so loading is never stuck if getSession fails or rejects
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          getCurrentUserProfile().then((p) => {
            if (p) setProfile(mapSupabaseProfileToAuth(p))
            else ensureUserProfile().then(({ profile: ensured }) => setProfile(mapSupabaseProfileToAuth(ensured)))
          }).catch(() => {
            ensureUserProfile().then(({ profile: ensured }) => setProfile(mapSupabaseProfileToAuth(ensured)))
          })
        } else {
          setProfile(null)
        }
      })
      .catch((err) => {
        console.error("[Auth] getSession failed:", err)
        setUser(null)
        setProfile(null)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      setUser(null)
      setProfile(null)
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("[Auth] Error during sign out:", error)
      setUser(null)
      setProfile(null)
      window.location.href = "/"
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const p = await getCurrentUserProfile()
      const mapped = mapSupabaseProfileToAuth(p)
      setProfile(mapped)
      return mapped
    }
    return null
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
