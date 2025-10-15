"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { UserProfile, getCurrentUserProfile } from "@/lib/supabase/profile-utils"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  // Start with false to avoid hydration mismatch (SSR can't check auth)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Mark as mounted (client-side only)
    setMounted(true)
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[Auth] Getting initial session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[Auth] Session error:', sessionError)
          return
        }
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('[Auth] Loading profile for user:', session.user.id)
          try {
            const userProfile = await getCurrentUserProfile()
            if (userProfile) {
              console.log('[Auth] Profile loaded:', userProfile.full_name || userProfile.email)
            } else {
              console.log('[Auth] No profile found - user may need to complete onboarding')
            }
            setProfile(userProfile)
          } catch (profileError) {
            console.error('[Auth] Profile load error:', profileError)
            // Continue even if profile fails - user is still authenticated
            setProfile(null)
          }
        } else {
          // Clear profile when user logs out
          setProfile(null)
        }
      } catch (error) {
        console.error('[Auth] Error getting initial session:', error)
      } finally {
        console.log('[Auth] Initial session load complete')
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State changed:', event, session?.user?.id)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const userProfile = await getCurrentUserProfile()
            if (userProfile) {
              console.log('[Auth] Profile updated:', userProfile.full_name || userProfile.email)
            } else {
              console.log('[Auth] No profile found after auth change')
            }
            setProfile(userProfile)
          } catch (error) {
            console.error('[Auth] Profile update error:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    try {
      console.log('[Auth] Starting sign out...')
      
      // Clear local state first (immediate UI feedback)
      setUser(null)
      setProfile(null)
      
      // Sign out from Supabase (this clears all auth cookies)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[Auth] Sign out error:', error)
      }
      
      console.log('[Auth] Sign out complete, redirecting...')
      
      // Force a full page reload to clear all state and cookies
      // This ensures complete cleanup of auth state
      window.location.href = "/"
    } catch (error) {
      console.error('[Auth] Error during sign out:', error)
      // Still clear state and redirect even on error
      setUser(null)
      setProfile(null)
      window.location.href = "/"
    }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile for user:', user.id)
      const userProfile = await getCurrentUserProfile()
      console.log('Profile refreshed:', userProfile)
      setProfile(userProfile)
      return userProfile
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

