"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Building2,
  DollarSign,
  Users,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Rocket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createCompany, createAIInsight } from "@/lib/firebase/db"

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false) // No delay
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    stage: "",
    cashBalance: "",
    monthlyBurn: "",
    monthlyRevenue: "",
    teamSize: "",
    fundingGoal: "",
  })
  const router = useRouter()

  useEffect(() => {
    // Load immediately
    setLoading(false)
  }, [])

  const steps = [
    {
      id: 0,
      title: "Welcome to Aura",
      description: "Let's set up your financial intelligence platform",
      icon: Sparkles,
    },
    {
      id: 1,
      title: "Company Information",
      description: "Tell us about your startup",
      icon: Building2,
    },
    {
      id: 2,
      title: "Financial Snapshot",
      description: "Your current financial position",
      icon: DollarSign,
    },
    {
      id: 3,
      title: "Team & Goals",
      description: "Team size and fundraising plans",
      icon: Target,
    },
    {
      id: 4,
      title: "All Set!",
      description: "Your AI CFO is ready",
      icon: Rocket,
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding - save to database
      setSaving(true)
      try {
        // Create company directly via client Firestore (authenticated)
        const companyId = await createCompany({
          name: formData.companyName || "My Company",
          industry: formData.industry,
          fundingStage: formData.stage,
          teamSize: Number.parseInt(formData.teamSize) || 0,
          currentCash: Number.parseFloat(formData.cashBalance) || 0,
          monthlyBurn: Number.parseFloat(formData.monthlyBurn) || 0,
        })

        // Generate initial AI insight for this company
        await createAIInsight({
          companyId,
          type: "onboarding",
          title: "Welcome to Aura!",
          description: `Your financial dashboard is ready. Based on your current cash of $${formData.cashBalance} and monthly burn of $${formData.monthlyBurn}, you have approximately ${(Number.parseFloat(formData.cashBalance) / Number.parseFloat(formData.monthlyBurn)).toFixed(1)} months of runway.`,
          severity: "info",
          data: { onboarding_complete: true },
          isRead: false,
        })

        router.push("/dashboard")
      } catch (error) {
        console.error("[v0] Onboarding error:", error)
        alert("Failed to complete onboarding. Please try again.")
      } finally {
        setSaving(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold gradient-text">Aura</span>
            </div>
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center transition-all",
                  index <= currentStep
                    ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  index === currentStep && "ring-4 ring-primary/20 scale-110",
                )}
              >
                {index < currentStep ? <CheckCircle2 className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center hidden md:block",
                  index <= currentStep ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Content Card */}
        <Card className="border-2 border-primary/20 shadow-xl animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                {(() => {
                  const IconComponent = steps[currentStep].icon
                  return <IconComponent className="h-8 w-8 text-primary" />
                })()}
              </div>
            </div>
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-base">{steps[currentStep].description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="space-y-6 text-center py-8">
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Aura is your AI-powered virtual CFO designed specifically for early-stage startups. We'll help you
                  manage your runway, forecast cash flow, and make strategic financial decisions.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  {[
                    { icon: DollarSign, label: "Track Finances", desc: "Real-time insights" },
                    { icon: Target, label: "Forecast Runway", desc: "AI-powered predictions" },
                    { icon: Sparkles, label: "Smart Advice", desc: "Strategic recommendations" },
                  ].map((feature, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50 hover-lift">
                      <feature.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-semibold mb-1">{feature.label}</p>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Acme Inc."
                    value={formData.companyName}
                    onChange={(e) => updateFormData("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., SaaS, E-commerce, FinTech"
                    value={formData.industry}
                    onChange={(e) => updateFormData("industry", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Funding Stage</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Pre-seed", "Seed", "Series A", "Series B+"].map((stage) => (
                      <Button
                        key={stage}
                        variant={formData.stage === stage ? "default" : "outline"}
                        onClick={() => updateFormData("stage", stage)}
                        className={formData.stage === stage ? "bg-primary" : ""}
                      >
                        {stage}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Financial Snapshot */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cashBalance">Current Cash Balance</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="cashBalance"
                      type="number"
                      placeholder="0"
                      className="pl-7"
                      value={formData.cashBalance}
                      onChange={(e) => updateFormData("cashBalance", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyBurn">Monthly Burn Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="monthlyBurn"
                      type="number"
                      placeholder="0"
                      className="pl-7"
                      value={formData.monthlyBurn}
                      onChange={(e) => updateFormData("monthlyBurn", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">How much you spend per month</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRevenue">Monthly Revenue</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="monthlyRevenue"
                      type="number"
                      placeholder="0"
                      className="pl-7"
                      value={formData.monthlyRevenue}
                      onChange={(e) => updateFormData("monthlyRevenue", e.target.value)}
                    />
                  </div>
                </div>
                {formData.cashBalance && formData.monthlyBurn && (
                  <Card className="bg-accent/10 border-accent/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span className="font-semibold text-accent">Quick Calculation</span>
                      </div>
                      <p className="text-sm">
                        Based on your inputs, you have approximately{" "}
                        <strong>
                          {(Number.parseFloat(formData.cashBalance) / Number.parseFloat(formData.monthlyBurn)).toFixed(
                            1,
                          )}{" "}
                          months
                        </strong>{" "}
                        of runway remaining.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Team & Goals */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.teamSize}
                    onChange={(e) => updateFormData("teamSize", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Number of full-time employees</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundingGoal">Next Fundraising Goal (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="fundingGoal"
                      type="number"
                      placeholder="0"
                      className="pl-7"
                      value={formData.fundingGoal}
                      onChange={(e) => updateFormData("fundingGoal", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">How much are you planning to raise?</p>
                </div>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Optimized for SMEs</p>
                        <p className="text-sm text-muted-foreground">
                          Aura is specifically designed for small and medium enterprises in the Japan market, with
                          features tailored to your unique needs.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="space-y-6 text-center py-8">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-success/20 to-accent/20 flex items-center justify-center animate-bounce-subtle">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">You're All Set!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your AI-powered financial intelligence platform is ready. Let's start managing your finances
                    smarter.
                  </p>
                </div>
                <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/50">
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-sm">Dashboard configured with your data</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-sm">AI advisor trained on your metrics</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-sm">Runway forecast calculated</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-sm">Ready to connect data sources</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>

          {/* Navigation */}
          <div className="border-t border-border p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || saving}
                className="gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={saving}
                className="gap-2 bg-gradient-to-r from-primary to-secondary"
              >
                {saving ? (
                  "Saving..."
                ) : currentStep === steps.length - 1 ? (
                  <>
                    Go to Dashboard
                    <Rocket className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact our support team or check out our{" "}
          <a href="#" className="text-primary hover:underline">
            documentation
          </a>
        </p>
      </div>
    </div>
  )
}
