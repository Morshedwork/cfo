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

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignUp = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      console.log('[Sign Up] Starting Google OAuth...')
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
      console.error('[Sign Up] Google OAuth Error:', error)
      setError(error instanceof Error ? error.message : "Failed to sign up with Google")
      setIsGoogleLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Sign up with auto-confirm (no email verification required)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            company_name: companyName,
            full_name: email.split('@')[0], // Use email prefix as default name
          },
        },
      })
      
      if (error) {
        console.error('[Sign Up] Auth error:', error)
        // Supabase errors can have different formats
        const errorMessage = error.message || error.toString() || 'Unknown error'
        throw new Error(errorMessage)
      }

      if (!data.user) {
        throw new Error('User creation failed. No user data returned.')
      }

      // Check if user is automatically confirmed (no email confirmation required)
      if (data.session) {
        // User is auto-confirmed and logged in
        // Profile and company should be created automatically via database triggers
        // If triggers don't work, we'll create them on the onboarding page
        console.log('[Sign Up] User created successfully, redirecting to onboarding...')
        window.location.href = "/onboarding"
      } else if (data.user && !data.session) {
        // Email confirmation is required - check if user needs to verify
        // For development/demo, automatically sign them in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) {
          // If sign in fails, they need to confirm email
          window.location.href = "/auth/sign-up-success"
        } else {
          // Successfully signed in, go to onboarding
          window.location.href = "/onboarding"
        }
      } else {
        // Fallback: redirect to onboarding
        window.location.href = "/onboarding"
      }
    } catch (error: unknown) {
      console.error('[Sign Up] Error:', error)
      
      if (error instanceof Error) {
        // Provide more helpful error messages
        const errorMsg = error.message.toLowerCase()
        
        if (errorMsg.includes('user already registered') || errorMsg.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.')
        } else if (errorMsg.includes('invalid email') || errorMsg.includes('email format')) {
          setError('Please enter a valid email address.')
        } else if (errorMsg.includes('password') && (errorMsg.includes('short') || errorMsg.includes('length'))) {
          setError('Password must be at least 6 characters long.')
        } else if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
          setError('Database tables not found. Please run the SQL scripts in Supabase first.')
        } else if (errorMsg.includes('permission denied') || errorMsg.includes('row-level security')) {
          setError('Permission denied. Please check your database RLS policies.')
        } else if (errorMsg.includes('database error') || errorMsg.includes('failed to create')) {
          // Show the actual database error message
          setError(error.message)
        } else {
          // Show the actual error message for debugging
          setError(error.message || 'Failed to create account. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please check the browser console for details.')
      }
    } finally {
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
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Start your journey to financial clarity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                {/* Google Sign-Up Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignUp}
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
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your Company"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
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
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Confirm Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
