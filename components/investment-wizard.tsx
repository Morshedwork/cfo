"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { DollarSign, TrendingUp, Users, Rocket } from "lucide-react"
import type { InvestmentInput, StartupStage } from "@/lib/investment-analyzer"

interface InvestmentWizardProps {
  onComplete: (input: InvestmentInput) => void
  onCancel?: () => void
}

export function InvestmentWizard({ onComplete, onCancel }: InvestmentWizardProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<InvestmentInput>>({
    stage: 'seed',
  })

  const updateData = (field: keyof InvestmentInput, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const canContinue = () => {
    switch (step) {
      case 1:
        return data.investmentAmount && data.investmentAmount > 0
      case 2:
        return data.currentRevenue !== undefined && data.grossMargin !== undefined
      case 3:
        return data.operatingExpenses !== undefined && data.netIncome !== undefined
      case 4:
        return data.stage && data.teamSize && data.monthlyBurn
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      onComplete(data as InvestmentInput)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Investment Allocation Wizard</CardTitle>
            <CardDescription>Step {step} of 4 - Let's optimize your capital deployment</CardDescription>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Investment Amount */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Investment Details</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment">How much investment did you receive? *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="investment"
                  type="number"
                  placeholder="500000"
                  className="pl-7"
                  value={data.investmentAmount || ''}
                  onChange={(e) => updateData('investmentAmount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the total amount of funding you just raised
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> This analysis works best for investments between $100K - $10M. 
                We'll help you allocate funds strategically across product, marketing, operations, and reserves.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Revenue & Margin */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Current Performance</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="89000"
                  className="pl-7"
                  value={data.currentRevenue || ''}
                  onChange={(e) => updateData('currentRevenue', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin">Gross Margin *</Label>
              <div className="relative">
                <Input
                  id="margin"
                  type="number"
                  placeholder="85"
                  className="pr-8"
                  value={data.grossMargin || ''}
                  onChange={(e) => updateData('grossMargin', parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                (Revenue - Cost of Goods Sold) / Revenue × 100
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Expenses & Income */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Financial Position</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses">Annual Operating Expenses *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="expenses"
                  type="number"
                  placeholder="147200"
                  className="pl-7"
                  value={data.operatingExpenses || ''}
                  onChange={(e) => updateData('operatingExpenses', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="netincome">Net Income (Annual) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="netincome"
                  type="number"
                  placeholder="-71250"
                  className="pl-7"
                  value={data.netIncome || ''}
                  onChange={(e) => updateData('netIncome', parseFloat(e.target.value) || 0)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Use negative number if you're not profitable yet (e.g., -71250)
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Company Details */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Company Profile</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Startup Stage *</Label>
              <select
                id="stage"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={data.stage || 'seed'}
                onChange={(e) => updateData('stage', e.target.value as StartupStage)}
              >
                <option value="pre-seed">Pre-Seed (Idea to MVP)</option>
                <option value="seed">Seed (MVP to Product-Market Fit)</option>
                <option value="series-a">Series A (Scaling Growth)</option>
                <option value="series-b">Series B (Rapid Expansion)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamsize">Team Size *</Label>
              <Input
                id="teamsize"
                type="number"
                placeholder="6"
                value={data.teamSize || ''}
                onChange={(e) => updateData('teamSize', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="burn">Current Monthly Burn Rate *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="burn"
                  type="number"
                  placeholder="23750"
                  className="pl-7"
                  value={data.monthlyBurn || ''}
                  onChange={(e) => updateData('monthlyBurn', parseFloat(e.target.value) || 0)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                How much cash you spend per month (before this investment)
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : handleBack}
            disabled={!onCancel && step === 1}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={handleNext} disabled={!canContinue()}>
            {step === 4 ? '🚀 Analyze Investment' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

