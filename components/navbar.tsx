"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/runway", label: "Runway" },
    { href: "/bookkeeping", label: "Bookkeeping" },
    { href: "/sales", label: "Sales" },
    { href: "/data-management", label: "Data" },
    { href: "/ai-assistant", label: "AI Assistant" },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl group">
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
          <Link href="/auth/login">
            <Button variant="ghost" className="hidden md:inline-flex hover:scale-105">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="hidden md:inline-flex bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-primary/30">
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
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-2 stagger-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
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
