"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sparkles } from "lucide-react"
import { GoogleIcon } from "@/components/google-icon"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      console.log('[Login] Starting Google OAuth...')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) throw error
    } catch (error: unknown) {
      console.error('[Login] Google OAuth Error:', error)
      setError(error instanceof Error ? error.message : "Failed to sign in with Google")
      setIsGoogleLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log('[Login] Starting authentication...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      console.log('[Login] Auth successful, checking profile...')
      
      // Profile and company will be created by database triggers
      // Just verify they exist (don't wait if tables don't exist)
      if (data.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          // If no profile exists, create one (only if table exists)
          if (!profile && !profileError) {
            console.log('[Login] Creating profile...')
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email || email,
                full_name: data.user.user_metadata?.full_name || email.split('@')[0],
                company_name: data.user.user_metadata?.company_name || 'My Company',
              })
          }
          
          // Verify user has a company
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', data.user.id)
            .single()
          
          // If no company exists, create one (only if table exists)
          if (!company && !companyError) {
            console.log('[Login] Creating company...')
            await supabase
              .from('companies')
              .insert({
                user_id: data.user.id,
                name: data.user.user_metadata?.company_name || 'My Company',
                industry: 'Technology',
                founded_date: new Date().toISOString(),
                team_size: 1,
                funding_stage: 'pre-seed',
              })
          }
        } catch (dbError) {
          // If database operations fail (tables don't exist), continue anyway
          console.warn('[Login] Database check skipped:', dbError)
        }
      }
      
      console.log('[Login] Redirecting to dashboard...')
      // Redirect to dashboard - router.push for faster navigation
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error('[Login] Error:', error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Aura
            </h1>
          </div>
          <p className="text-muted-foreground">Your AI-Powered Virtual CFO</p>
        </div>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your financial dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                {/* Google Sign-In Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                >
                  <GoogleIcon className="mr-2 h-5 w-5" />
                  {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
