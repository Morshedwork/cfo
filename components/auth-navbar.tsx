"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Menu, User, LogOut, Settings } from "lucide-react"
import { useState, useEffect as ReactUseEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export function AuthNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, profile, signOut, loading, refreshProfile } = useAuth()
  const router = useRouter()

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/runway", label: "Runway" },
    { href: "/bookkeeping", label: "Bookkeeping" },
    { href: "/sales", label: "Sales" },
    { href: "/data-management", label: "Data" },
    { href: "/ai-assistant", label: "AI Assistant" },
    { href: "/voice-assistant", label: "Voice AI" },
  ]

  // Prevent hydration mismatch by only showing auth state after mount
  ReactUseEffect(() => {
    setMounted(true)
  }, [])

  // Get display name from profile or user metadata (Google account)
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.user_metadata?.name) return user.user_metadata.name
    if (user?.email) return user.email.split('@')[0]
    return "User"
  }

  // Get email from profile or user
  const getDisplayEmail = () => {
    if (profile?.email) return profile.email
    if (user?.email) return user.email
    return ""
  }

  // Get avatar URL from profile or user metadata (Google account)
  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url
    if (user?.user_metadata?.picture) return user.user_metadata.picture
    return ""
  }

  const handleSignOut = async () => {
    // SignOut now handles redirect internally, no need to redirect again
    await signOut()
  }

  // Refresh profile when component mounts
  ReactUseEffect(() => {
    console.log('[Navbar] Auth state - loading:', loading, 'user:', !!user, 'profile:', !!profile)
    if (user) {
      console.log('[Navbar] User metadata:', user.user_metadata)
    }
    if (user && !profile && !loading) {
      console.log('[Navbar] User logged in but no profile, refreshing...')
      refreshProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, loading])

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Don't show loading state during SSR to avoid hydration mismatch
  // Auth state loads on client only, so skip loading spinner

  // Render neutral state during SSR and initial mount to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="gradient-text">Aura</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {/* Placeholder for auth buttons to maintain layout */}
            <div className="h-10 w-32 hidden md:block" />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    )
  }

  // Authenticated view
  if (user) {
    console.log('[Navbar] Showing authenticated view')
    return (
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-xl group">
            <Sparkles className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="gradient-text transition-all duration-300">Aura</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 relative link-smooth"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-110 transition-all duration-300">
                  <Avatar className="h-10 w-10 transition-all duration-300">
                    <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(getDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getDisplayEmail()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(getDisplayName())}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getDisplayName()}</p>
                      <p className="text-sm text-muted-foreground">{getDisplayEmail()}</p>
                    </div>
                  </div>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <Link href="/settings">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    )
  }

  // Unauthenticated view
  console.log('[Navbar] Showing unauthenticated view')
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="gradient-text">Aura</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="hidden md:inline-flex bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Get Started
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 mt-4">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary">Get Started</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
