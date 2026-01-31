"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      try {
        console.log('[Auth Callback] Processing OAuth callback...')
        
        // Check for error in URL params
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          console.error('[Auth Callback] OAuth error:', errorParam, errorDescription)
          setError(errorDescription || errorParam)
          setTimeout(() => {
            router.push('/auth/login?error=' + encodeURIComponent(errorDescription || errorParam))
          }, 3000)
          return
        }

        // Wait a bit for Supabase to process the callback and set cookies
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Exchange the code for a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[Auth Callback] Session error:', sessionError)
          setError(sessionError.message)
          setTimeout(() => {
            router.push('/auth/login?error=' + encodeURIComponent(sessionError.message))
          }, 3000)
          return
        }

        if (session) {
          console.log('[Auth Callback] Session established for user:', session.user.id)
          
          // Create profile and company if they don't exist
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!profile && !profileError) {
              console.log('[Auth Callback] Creating profile for new user...')
              await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  company_name: session.user.user_metadata?.company_name || 'My Company',
                })
            }

            const { data: company, error: companyError } = await supabase
              .from('companies')
              .select('*')
              .eq('user_id', session.user.id)
              .single()

            if (!company && !companyError) {
              console.log('[Auth Callback] Creating company for new user...')
              await supabase
                .from('companies')
                .insert({
                  user_id: session.user.id,
                  name: session.user.user_metadata?.company_name || 'My Company',
                  industry: 'Technology',
                  founded_date: new Date().toISOString(),
                  team_size: 1,
                  funding_stage: 'pre-seed',
                })
            }
          } catch (dbError) {
            console.warn('[Auth Callback] Database setup warning:', dbError)
            // Continue even if database operations fail
          }

          console.log('[Auth Callback] Redirecting to dashboard...')
          router.push('/dashboard')
        } else {
          console.log('[Auth Callback] No session found, waiting and retrying...')
          // Retry after a short delay - sometimes session takes a moment to be available
          await new Promise(resolve => setTimeout(resolve, 1000))
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          
          if (retrySession) {
            console.log('[Auth Callback] Session found on retry, redirecting to dashboard...')
            router.push('/dashboard')
          } else {
            console.log('[Auth Callback] No session after retry, redirecting to login...')
            setError('Authentication failed. Please try again.')
            setTimeout(() => {
              router.push('/auth/login?error=no_session')
            }, 3000)
          }
        }
      } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error)
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
        setTimeout(() => {
          router.push('/auth/login?error=unexpected_error')
        }, 3000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-destructive mb-4">
              <p className="text-lg font-medium">Authentication Error</p>
              <p className="text-sm mt-2">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">Redirecting to login...</p>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Completing sign in...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we set up your account</p>
          </>
        )}
      </div>
    </div>
  )
}
