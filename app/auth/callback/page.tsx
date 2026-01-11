"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      try {
        console.log('[Auth Callback] Processing OAuth callback...')
        
        // Exchange the code for a session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth Callback] Error:', error)
          router.push('/auth/login?error=auth_callback_error')
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
          console.log('[Auth Callback] No session found, redirecting to login...')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Completing sign in...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  )
}
