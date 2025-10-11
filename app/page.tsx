"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Navbar } from "@/components/navbar"
import { ParticlesBackground } from "@/components/particles-bg"
import { FeaturePreview } from "@/components/feature-preview"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  Brain,
  Mic,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Database,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const topFeatures = [
    {
      id: "ai-forecasting",
      title: "AI-Powered Runway Forecasting",
      description:
        "Get precise cash runway predictions with machine learning that adapts to your spending patterns and revenue trends in real-time.",
      icon: TrendingUp,
      preview: "See your runway forecast update in real-time as you adjust assumptions",
      color: "bg-primary/10 text-primary",
    },
    {
      id: "voice-data",
      title: "Voice-Activated Data Entry",
      description:
        "Simply speak to add transactions, expenses, or revenue. Our AI understands natural language and categorizes everything automatically.",
      icon: Mic,
      preview: "Say 'Add $500 marketing expense' and watch it appear instantly",
      color: "bg-accent/10 text-accent",
    },
    {
      id: "smart-analytics",
      title: "Smart Analytics Dashboard",
      description:
        "Visualize your financial health with interactive charts, AI-generated insights, and downloadable reports for investors.",
      icon: BarChart3,
      preview: "Explore interactive charts with one-click JPG export for presentations",
      color: "bg-secondary/10 text-secondary",
    },
  ]

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background relative">
      <ParticlesBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-bg-2" />
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="gap-2 px-4 py-2 animate-slide-up hover-glow">
              <Sparkles className="h-4 w-4 animate-pulse" />
              AI-Powered Financial Intelligence for SMEs
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance animate-slide-up [animation-delay:0.1s]">
              Your AI-Powered <span className="animate-text-shimmer">Virtual CFO</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance animate-slide-up [animation-delay:0.2s]">
              Aura is the strategic financial intelligence layer for early-stage startups and SMEs. Manage runway,
              forecast cash flow, and make smarter decisions—without the six-figure CFO salary.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up [animation-delay:0.3s]">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-lg px-8 animate-gradient-shift hover-glow"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent hover-lift">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4 animate-fade-in [animation-delay:0.4s]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Free for 30 days
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Features Preview Section */}
      <section className="py-20 gradient-bg-1 relative">
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/50">Top Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience the Power of AI-Driven Finance</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how Aura transforms financial management with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {topFeatures.map((feature, i) => (
              <div key={feature.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <FeaturePreview feature={feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From Financial Chaos to Strategic Clarity</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how Aura transforms your financial management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 border-2 border-destructive/20 hover-lift">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-2xl">😰</span>
                </div>
                <h3 className="text-2xl font-bold text-destructive">Before Aura</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Manually stitching data from 5+ tools",
                  "Outdated spreadsheets and guesswork",
                  "No idea when you'll run out of cash",
                  "Can't afford a $200K+ CFO",
                  "Missing critical financial insights",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-destructive mt-1">✗</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border-2 border-accent/50 bg-gradient-to-br from-accent/5 to-secondary/5 hover-lift hover-glow">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-accent">With Aura</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Unified view of all financial accounts",
                  "Real-time, AI-powered forecasting",
                  "Precise runway calculations updated daily",
                  "CFO-level insights at startup pricing",
                  "Proactive alerts and recommendations",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 gradient-bg-2">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Manage Your Startup's Finances
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Aura unifies your financial data and provides strategic intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Unified Dashboard",
                description:
                  "See all your key financial metrics in one place. Real-time cash position, burn rate, and runway.",
                href: "/dashboard",
              },
              {
                icon: TrendingUp,
                title: "Runway Forecasting",
                description: "Know exactly when you'll run out of money with constantly updated, accurate forecasts.",
                href: "/runway",
              },
              {
                icon: Zap,
                title: "Scenario Modeling",
                description: "Model the impact of new hires, marketing spend, or revenue changes on your runway.",
                href: "/scenarios",
              },
              {
                icon: Brain,
                title: "AI Bookkeeping",
                description: "Automatically categorize transactions with 85%+ accuracy. No manual data entry.",
                href: "/bookkeeping",
              },
              {
                icon: Shield,
                title: "Sales Analytics",
                description: "Track sales performance, website metrics, and e-commerce data in real-time.",
                href: "/sales",
              },
              {
                icon: Database,
                title: "Voice Data Entry",
                description:
                  "Add financial data naturally with voice commands. AI handles categorization automatically.",
                href: "/data-voice",
              },
            ].map((feature, i) => (
              <Link key={i} href={feature.href}>
                <Card className="p-6 h-full hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer hover-lift hover-glow">
                  <div className="flex flex-col gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-auto" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 gradient-bg-1">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { value: "90%", label: "Time Saved on Financial Forecasting" },
              { value: "38%", label: "Of Startups Fail Due to Cash Issues" },
              { value: "$200K+", label: "Annual Cost of a Full-Time CFO" },
            ].map((stat, i) => (
              <div key={i} className="text-center animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl md:text-5xl font-bold animate-text-shimmer mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="p-12 bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground text-center hover-lift animate-gradient-shift">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of startups and SMEs using Aura to manage their runway and make smarter financial decisions.
            </p>
            <Link href="/onboarding">
              <Button size="lg" variant="secondary" className="text-lg px-8 hover-glow">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Aura</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Aura. Empowering startups and SMEs with AI-powered financial intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
