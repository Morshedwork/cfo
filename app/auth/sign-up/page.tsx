"use client"

import type React from "react"

import { signInWithGoogle, signUpWithEmail } from "@/lib/firebase/auth"
import { createCompany } from "@/lib/firebase/db"
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
    setIsGoogleLoading(true)
    setError(null)

    try {
      console.log('[Sign Up] Starting Google OAuth with Firebase...')
      const result = await signInWithGoogle()
      
      console.log('[Sign Up] Google auth successful:', result.user.email)
      
      // Create company for new user
      await createCompany({
        userId: result.user.uid,
        name: companyName || (result.user.displayName ? `${result.user.displayName}'s Company` : 'My Company'),
        industry: 'Technology',
        teamSize: 1,
        fundingStage: 'pre-seed',
      })
      
      console.log('[Sign Up] Redirecting to onboarding...')
      router.push("/onboarding")
    } catch (error: unknown) {
      console.error('[Sign Up] Google OAuth Error:', error)
      setError(error instanceof Error ? error.message : "Failed to sign up with Google")
      setIsGoogleLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      console.log('[Sign Up] Creating account with Firebase...')
      const fullName = email.split('@')[0] // Use email prefix as default name
      const result = await signUpWithEmail(email, password, fullName)
      
      console.log('[Sign Up] Account created successfully:', result.user.email)
      
      // Create company for new user
      await createCompany({
        userId: result.user.uid,
        name: companyName || 'My Company',
        industry: 'Technology',
        teamSize: 1,
        fundingStage: 'pre-seed',
      })
      
      console.log('[Sign Up] Company created, redirecting to onboarding...')
      router.push("/onboarding")
    } catch (error: unknown) {
      console.error('[Sign Up] Error:', error)
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
                    minLength={6}
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
