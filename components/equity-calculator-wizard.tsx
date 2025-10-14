"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calculator, Users, DollarSign, CheckCircle2, ArrowRight } from "lucide-react"
import { EquityCalculator, type EquityCalculationInput } from "@/lib/equity-calculator"
import { EquityCalculatorView } from "@/components/equity-calculator-view"

interface WizardProps {
  roundName: string
  onSendMessage: (message: string) => void
}

type Step = 
  | 'ask_founders' 
  | 'input_founders' 
  | 'ask_shares' 
  | 'ask_option_pool' 
  | 'ask_valuation' 
  | 'ask_investment' 
  | 'ready_to_calculate' 
  | 'show_results'

export function EquityCalculatorWizard({ roundName, onSendMessage }: WizardProps) {
  const [step, setStep] = useState<Step>('ask_founders')
  const [data, setData] = useState({
    numFounders: 0,
    founders: [] as Array<{ name: string; percentage: number }>,
    totalShares: 10000000,
    optionPoolPercent: 15,
    preMoneyValuation: 0,
    investment: 0,
    investorName: ''
  })
  const [result, setResult] = useState<any>(null)

  // Step: Ask how many founders
  if (step === 'ask_founders') {
    return (
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {roundName} Equity Calculator
          </CardTitle>
          <CardDescription>
            Let's calculate equity step by step
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <strong>Step 1:</strong> How many founders does your company have?
          </p>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <Button
                key={num}
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setData({ ...data, numFounders: num })
                  setStep('input_founders')
                }}
              >
                {num}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step: Input founder details
  if (step === 'input_founders') {
    const handleSubmitFounders = () => {
      const total = data.founders.reduce((sum, f) => sum + f.percentage, 0)
      if (Math.abs(total - 100) > 0.1) {
        alert(`⚠️ Founder percentages must add up to 100%.\nCurrently: ${total.toFixed(1)}%`)
        return
      }
      setStep('ask_shares')
    }

    return (
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Founder Details
          </CardTitle>
          <CardDescription>
            Enter details for {data.numFounders} founder{data.numFounders > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <strong>Step 2:</strong> What is each founder's ownership percentage?
          </p>

          <div className="space-y-3">
            {Array.from({ length: data.numFounders }).map((_, index) => {
              const founder = data.founders[index] || { name: `Founder ${index + 1}`, percentage: 0 }
              
              return (
                <div key={index} className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Founder {index + 1} Name</Label>
                    <Input
                      placeholder={`e.g., John Doe`}
                      value={founder.name}
                      onChange={(e) => {
                        const updated = [...data.founders]
                        updated[index] = { ...founder, name: e.target.value }
                        setData({ ...data, founders: updated })
                      }}
                    />
                  </div>
                  <div>
                    <Label>Ownership %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g., 50"
                      value={founder.percentage || ''}
                      onChange={(e) => {
                        const updated = [...data.founders]
                        updated[index] = { ...founder, percentage: Number(e.target.value) }
                        setData({ ...data, founders: updated })
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Total:</span>
            <Badge variant="secondary" className="text-lg">
              {data.founders.reduce((sum, f) => sum + (f.percentage || 0), 0).toFixed(1)}%
            </Badge>
          </div>

          <Button onClick={handleSubmitFounders} className="w-full gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Step: Ask about total shares
  if (step === 'ask_shares') {
    return (
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle>Company Shares</CardTitle>
          <CardDescription>
            How many total shares has your company authorized?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <strong>Step 3:</strong> Choose total shares (most startups use 10 million)
          </p>

          <div className="space-y-2">
            {[
              { label: '1 Million', value: 1000000 },
              { label: '10 Million (Recommended)', value: 10000000 },
              { label: '100 Million', value: 100000000 },
            ].map(option => (
              <Button
                key={option.value}
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  setData({ ...data, totalShares: option.value })
                  setStep('ask_option_pool')
                }}
              >
                {option.label}
                <Badge variant="secondary">{option.value.toLocaleString()}</Badge>
              </Button>
            ))}
          </div>

          <div className="pt-2">
            <Label>Or enter custom amount:</Label>
            <Input
              type="number"
              min="1000000"
              step="1000000"
              placeholder="e.g., 10000000"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                  setData({ ...data, totalShares: Number((e.target as HTMLInputElement).value) })
                  setStep('ask_option_pool')
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step: Ask about option pool
  if (step === 'ask_option_pool') {
    return (
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle>Employee Option Pool</CardTitle>
          <CardDescription>
            What percentage do you want to reserve for employees?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <strong>Step 4:</strong> Choose option pool size (typically 10-15%)
          </p>

          <div className="space-y-2">
            {[
              { label: '0% - No option pool', value: 0 },
              { label: '10% - Small team', value: 10 },
              { label: '15% - Standard (Recommended)', value: 15 },
              { label: '20% - Large team', value: 20 },
            ].map(option => (
              <Button
                key={option.value}
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  setData({ ...data, optionPoolPercent: option.value })
                  setStep('ask_valuation')
                }}
              >
                {option.label}
                <Badge variant="secondary">{option.value}%</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step: Ask about pre-money valuation
  if (step === 'ask_valuation') {
    return (
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {roundName} Valuation
          </CardTitle>
          <CardDescription>
            What is your pre-money valuation?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <strong>Step 5:</strong> Enter your pre-money valuation for the {roundName} round
          </p>

          <div>
            <Label>Pre-Money Valuation ($)</Label>
            <Input
              type="number"
              min="0"
              step="100000"
              placeholder="e.g., 1000000"
              value={data.preMoneyValuation || ''}
              onChange={(e) => setData({ ...data, preMoneyValuation: Number(e.target.value) })}
            />
            {data.preMoneyValuation > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                ${(data.preMoneyValuation / 1000000).toFixed(1)}M
              </p>
            )}
          </div>

          <Button
            onClick={() => setStep('ask_investment')}
            disabled={data.preMoneyValuation === 0}
            className="w-full gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Step: Ask about investment amount
  if (step === 'ask_investment') {
    return (
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Investment Amount
          </CardTitle>
          <CardDescription>
            How much are you raising in this round?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <strong>Step 6:</strong> Enter the investment amount and investor name
          </p>

          <div>
            <Label>Investment Amount ($)</Label>
            <Input
              type="number"
              min="0"
              step="50000"
              placeholder="e.g., 200000"
              value={data.investment || ''}
              onChange={(e) => setData({ ...data, investment: Number(e.target.value) })}
            />
            {data.investment > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                ${(data.investment / 1000).toFixed(0)}K
              </p>
            )}
          </div>

          <div>
            <Label>Investor Name</Label>
            <Input
              placeholder="e.g., Acme Ventures"
              value={data.investorName}
              onChange={(e) => setData({ ...data, investorName: e.target.value })}
            />
          </div>

          {data.preMoneyValuation > 0 && data.investment > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
              <div className="font-semibold">Quick Preview:</div>
              <div className="text-muted-foreground">
                Post-Money: ${((data.preMoneyValuation + data.investment) / 1000000).toFixed(1)}M
              </div>
              <div className="text-muted-foreground">
                Investor Gets: {((data.investment / (data.preMoneyValuation + data.investment)) * 100).toFixed(2)}%
              </div>
            </div>
          )}

          <Button
            onClick={() => setStep('ready_to_calculate')}
            disabled={data.investment === 0 || !data.investorName}
            className="w-full gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Step: Ready to calculate
  if (step === 'ready_to_calculate') {
    const handleCalculate = () => {
      const input: EquityCalculationInput = {
        founders: data.founders.map(f => ({ name: f.name, percentage: f.percentage })),
        totalShares: data.totalShares,
        optionPoolPercent: data.optionPoolPercent,
        rounds: [
          {
            name: roundName,
            preMoneyValuation: data.preMoneyValuation,
            investment: data.investment,
            investorName: data.investorName
          }
        ]
      }

      const calculationResult = EquityCalculator.calculateEquity(input)
      setResult(calculationResult)
      setStep('show_results')
    }

    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Ready to Calculate!
          </CardTitle>
          <CardDescription>
            Review your details before calculating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Founders:</span>
              <span className="font-medium">{data.founders.length}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Total Shares:</span>
              <span className="font-medium">{data.totalShares.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Option Pool:</span>
              <span className="font-medium">{data.optionPoolPercent}%</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Pre-Money:</span>
              <span className="font-medium">${(data.preMoneyValuation / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Investment:</span>
              <span className="font-medium">${(data.investment / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Investor:</span>
              <span className="font-medium">{data.investorName}</span>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            size="lg"
            className="w-full text-lg gap-2 bg-gradient-to-r from-primary to-secondary"
          >
            <Calculator className="h-5 w-5" />
            Calculate Equity Distribution
          </Button>

          <Button
            onClick={() => setStep('ask_founders')}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Start Over
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Step: Show results
  if (step === 'show_results' && result) {
    return (
      <div className="space-y-4">
        <Button onClick={() => {
          setStep('ask_founders')
          setResult(null)
          setData({
            numFounders: 0,
            founders: [],
            totalShares: 10000000,
            optionPoolPercent: 15,
            preMoneyValuation: 0,
            investment: 0,
            investorName: ''
          })
        }} variant="outline">
          ← Calculate Another Round
        </Button>
        <EquityCalculatorView result={result} />
      </div>
    )
  }

  return null
}

