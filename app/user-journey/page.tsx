"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  UserPlus,
  Database,
  Brain,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Mic,
  BarChart3,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

export default function UserJourneyPage() {
  const [activePhase, setActivePhase] = useState(0)

  const journeyPhases = [
    {
      phase: "Discovery & Signup",
      icon: UserPlus,
      color: "bg-primary/10 text-primary",
      steps: [
        {
          title: "Land on Homepage",
          description: "Discover Aura's AI-powered financial intelligence platform",
          action: "View live demos of top 3 features",
        },
        {
          title: "Sign Up",
          description: "Create account with email and company name",
          action: "Email verification sent automatically",
        },
        {
          title: "Smart Onboarding",
          description: "5-step guided setup collecting company and financial data",
          action: "AI calculates initial runway forecast",
        },
      ],
    },
    {
      phase: "Data Integration",
      icon: Database,
      color: "bg-secondary/10 text-secondary",
      steps: [
        {
          title: "Connect Data Sources",
          description: "Import transactions from Excel/CSV files",
          action: "AI automatically categorizes and validates data",
        },
        {
          title: "Voice Data Entry",
          description: "Add transactions naturally using voice commands",
          action: "Say 'Add $500 marketing expense' - AI processes instantly",
        },
        {
          title: "Manual Entry",
          description: "Add individual transactions or sales records",
          action: "Forms with AI-powered suggestions and autocomplete",
        },
      ],
    },
    {
      phase: "AI Analysis",
      icon: Brain,
      color: "bg-accent/10 text-accent",
      steps: [
        {
          title: "Automatic Categorization",
          description: "AI categorizes all transactions with 95% accuracy",
          action: "Review and approve AI suggestions",
        },
        {
          title: "Insight Generation",
          description: "AI analyzes spending patterns and generates insights",
          action: "Receive proactive alerts for anomalies",
        },
        {
          title: "Forecast Updates",
          description: "Runway forecast updates automatically with new data",
          action: "View real-time cash position and burn rate",
        },
      ],
    },
    {
      phase: "Strategic Planning",
      icon: Target,
      color: "bg-primary/10 text-primary",
      steps: [
        {
          title: "Scenario Modeling",
          description: "Model impact of hiring, marketing spend, or revenue changes",
          action: "Compare multiple scenarios side-by-side",
        },
        {
          title: "Runway Forecasting",
          description: "Adjust assumptions and see instant forecast updates",
          action: "Plan fundraising timeline based on runway",
        },
        {
          title: "AI Chat Advisor",
          description: "Ask questions about your finances in natural language",
          action: "Get CFO-level strategic recommendations",
        },
      ],
    },
    {
      phase: "Reporting & Actions",
      icon: BarChart3,
      color: "bg-secondary/10 text-secondary",
      steps: [
        {
          title: "Interactive Dashboards",
          description: "Explore financial metrics with interactive charts",
          action: "Download charts as JPG for investor presentations",
        },
        {
          title: "Financial Statements",
          description: "Generate P&L and Cash Flow statements automatically",
          action: "Export to Excel for accountants",
        },
        {
          title: "Sales Analytics",
          description: "Track sales performance and website metrics",
          action: "Monitor conversion funnels and channel performance",
        },
      ],
    },
  ]

  const gameChangers = [
    {
      icon: Mic,
      title: "Voice-First Data Entry",
      description:
        "First CFO platform with natural language voice input. No more manual data entry - just speak naturally.",
      impact: "90% faster data entry",
    },
    {
      icon: Brain,
      title: "Real-Time AI Forecasting",
      description:
        "Machine learning adapts to your spending patterns and updates forecasts automatically as new data arrives.",
      impact: "95% forecast accuracy",
    },
    {
      icon: Zap,
      title: "Unified Financial Intelligence",
      description: "Single source of truth combining transactions, sales, forecasts, and AI insights in one platform.",
      impact: "Zero data silos",
    },
    {
      icon: DollarSign,
      title: "SME-Optimized Pricing",
      description:
        "CFO-level intelligence at startup pricing. Built specifically for Japanese SMEs and early-stage companies.",
      impact: "1/10th the cost of hiring a CFO",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 gradient-bg-1">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/50">User Journey</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">From Signup to Strategic Insights</h1>
            <p className="text-lg text-muted-foreground">
              See how Aura transforms financial chaos into strategic clarity in 5 simple phases
            </p>
          </div>

          {/* Journey Timeline */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
              {journeyPhases.map((phase, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhase(index)}
                  className={`flex flex-col items-center gap-2 min-w-[120px] transition-all ${
                    activePhase === index ? "scale-110" : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center ${
                      activePhase === index
                        ? "bg-gradient-to-br from-primary to-secondary ring-4 ring-primary/20"
                        : "bg-muted"
                    }`}
                  >
                    <phase.icon className="h-8 w-8" />
                  </div>
                  <span className="text-sm font-medium text-center">{phase.phase}</span>
                </button>
              ))}
            </div>

            {/* Active Phase Content */}
            <Card className="border-2 border-primary/20 shadow-xl animate-scale-in">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-lg ${journeyPhases[activePhase].color}`}>
                    {(() => {
                      const IconComponent = journeyPhases[activePhase].icon
                      return <IconComponent className="h-6 w-6" />
                    })()}
                  </div>
                  <div>
                    <Badge variant="secondary">Phase {activePhase + 1}</Badge>
                    <CardTitle className="text-2xl mt-2">{journeyPhases[activePhase].phase}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {journeyPhases[activePhase].steps.map((step, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/50 hover-lift">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-accent" />
                          <span className="text-accent font-medium">{step.action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
                    disabled={activePhase === 0}
                    className="bg-transparent"
                  >
                    Previous Phase
                  </Button>
                  <Button
                    onClick={() => setActivePhase(Math.min(journeyPhases.length - 1, activePhase + 1))}
                    disabled={activePhase === journeyPhases.length - 1}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    Next Phase
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Game Changers Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/50">What Makes Aura Different</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Game-Changing Features</h2>
            <p className="text-lg text-muted-foreground">
              These innovations make Aura the most advanced AI CFO platform for SMEs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {gameChangers.map((feature, index) => (
              <Card key={index} className="p-6 hover-lift hover-glow border-2 border-primary/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                    <Badge className="bg-accent/10 text-accent border-accent/50">{feature.impact}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Flow Diagram */}
      <section className="py-20 gradient-bg-2">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Data Flows Through Aura</h2>
            <p className="text-lg text-muted-foreground">
              From raw transactions to strategic insights - fully automated
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { icon: FileSpreadsheet, label: "Import Data", desc: "Excel/Voice/Manual" },
                { icon: Brain, label: "AI Processing", desc: "Categorize & Validate" },
                { icon: Database, label: "Store Securely", desc: "Encrypted Database" },
                { icon: TrendingUp, label: "Generate Insights", desc: "Forecasts & Alerts" },
                { icon: BarChart3, label: "Visualize", desc: "Charts & Reports" },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <Card className="p-4 text-center hover-lift">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{step.label}</h4>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </Card>
                  {index < 4 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-6 -translate-y-1/2 h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="p-12 bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground text-center animate-gradient-shift">
            <Sparkles className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience the Journey?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Start your free trial and see how Aura transforms your financial management in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10"
                >
                  View Live Demos
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
