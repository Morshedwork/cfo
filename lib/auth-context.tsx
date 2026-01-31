"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "firebase/auth"
import { onAuthStateChange, signOut as firebaseSignOut } from "@/lib/firebase/auth"
import { getUserProfile } from "@/lib/firebase/db"
import { UserProfile } from "@/lib/firebase/types"

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

  useEffect(() => {
    // Mark as mounted (client-side only)
    setMounted(true)
    
    // Listen for auth changes with Firebase
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('[Firebase Auth] State changed:', firebaseUser?.email)
      setUser(firebaseUser)
      
      if (firebaseUser) {
        console.log('[Firebase Auth] User authenticated:', firebaseUser.email)
        // Don't block on profile load - do it in background
        // This makes sign-in instant!
        setProfile(null) // Set null immediately
        
        // Load profile in background (non-blocking)
        getUserProfile(firebaseUser.uid)
          .then(userProfile => {
            if (userProfile) {
              console.log('[Firebase Auth] Profile loaded:', userProfile.fullName || userProfile.email)
              setProfile(userProfile)
            } else {
              console.log('[Firebase Auth] No profile found - creating from auth metadata')
              // Create a basic profile from Firebase auth data
              const basicProfile: UserProfile = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                fullName: firebaseUser.displayName || undefined,
                avatarUrl: firebaseUser.photoURL || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
              setProfile(basicProfile)
            }
          })
          .catch(profileError => {
            console.log('[Firebase Auth] Profile load skipped:', profileError)
            // Don't show error - it's okay to not have a database profile
            // Use Firebase auth data as fallback
            const basicProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || undefined,
              avatarUrl: firebaseUser.photoURL || undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            setProfile(basicProfile)
          })
      } else {
        // Clear profile when user logs out
        setProfile(null)
      }
      
      console.log('[Firebase Auth] Auth state update complete')
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      console.log('[Firebase Auth] Starting sign out...')
      
      // Clear local state first (immediate UI feedback)
      setUser(null)
      setProfile(null)
      
      // Sign out from Firebase
      await firebaseSignOut()
      
      console.log('[Firebase Auth] Sign out complete, redirecting...')
      
      // Force a full page reload to clear all state
      // This ensures complete cleanup of auth state
      window.location.href = "/"
    } catch (error) {
      console.error('[Firebase Auth] Error during sign out:', error)
      // Still clear state and redirect even on error
      setUser(null)
      setProfile(null)
      window.location.href = "/"
    }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log('[Firebase Auth] Refreshing profile for user:', user.uid)
      const userProfile = await getUserProfile(user.uid)
      console.log('[Firebase Auth] Profile refreshed:', userProfile)
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

