"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MinusCircle, Calculator, Users, DollarSign } from "lucide-react"
import { EquityCalculator, type EquityCalculationInput } from "@/lib/equity-calculator"
import { EquityCalculatorView } from "@/components/equity-calculator-view"

export function EquityCalculatorForm() {
  const [founders, setFounders] = useState([
    { name: 'Founder 1', percentage: 60 },
    { name: 'Founder 2', percentage: 40 }
  ])
  
  const [totalShares, setTotalShares] = useState(10000000)
  const [optionPoolPercent, setOptionPoolPercent] = useState(15)
  
  const [rounds, setRounds] = useState([
    {
      name: 'Pre-Seed',
      preMoneyValuation: 1000000,
      investment: 200000,
      investorName: 'Pre-Seed Investor'
    }
  ])

  const [result, setResult] = useState<any>(null)
  const [showForm, setShowForm] = useState(true)

  const addFounder = () => {
    setFounders([...founders, { name: `Founder ${founders.length + 1}`, percentage: 0 }])
  }

  const removeFounder = (index: number) => {
    if (founders.length > 1) {
      setFounders(founders.filter((_, i) => i !== index))
    }
  }

  const updateFounder = (index: number, field: 'name' | 'percentage', value: string | number) => {
    const updated = [...founders]
    if (field === 'name') {
      updated[index].name = value as string
    } else {
      updated[index].percentage = Number(value)
    }
    setFounders(updated)
  }

  const addRound = () => {
    const roundNumber = rounds.length + 1
    const roundNames = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D']
    const roundName = roundNames[roundNumber - 1] || `Round ${roundNumber}`
    
    setRounds([...rounds, {
      name: roundName,
      preMoneyValuation: 0,
      investment: 0,
      investorName: `${roundName} Investor`
    }])
  }

  const removeRound = (index: number) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter((_, i) => i !== index))
    }
  }

  const updateRound = (index: number, field: keyof typeof rounds[0], value: string | number) => {
    const updated = [...rounds]
    if (field === 'name' || field === 'investorName') {
      updated[index][field] = value as string
    } else {
      updated[index][field] = Number(value)
    }
    setRounds(updated)
  }

  const calculateEquity = () => {
    // Validate inputs
    const totalFounderPercent = founders.reduce((sum, f) => sum + f.percentage, 0)
    
    if (Math.abs(totalFounderPercent - 100) > 0.1) {
      alert(`⚠️ Founder percentages must add up to 100%.\nCurrently: ${totalFounderPercent.toFixed(1)}%`)
      return
    }

    const hasEmptyRounds = rounds.some(r => 
      r.preMoneyValuation === 0 || r.investment === 0 || !r.investorName
    )
    
    if (hasEmptyRounds) {
      alert('⚠️ Please fill in all funding round details.')
      return
    }

    // Calculate
    const input: EquityCalculationInput = {
      founders: founders.map(f => ({ name: f.name, percentage: f.percentage })),
      totalShares,
      optionPoolPercent,
      rounds: rounds.map(r => ({
        name: r.name,
        preMoneyValuation: r.preMoneyValuation,
        investment: r.investment,
        investorName: r.investorName
      }))
    }

    const calculationResult = EquityCalculator.calculateEquity(input)
    setResult(calculationResult)
    setShowForm(false)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
    return `$${num.toLocaleString()}`
  }

  const resetForm = () => {
    setShowForm(true)
    setResult(null)
  }

  if (!showForm && result) {
    return (
      <div className="space-y-4">
        <Button onClick={resetForm} variant="outline">
          ← Back to Form (Edit Values)
        </Button>
        <EquityCalculatorView result={result} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Custom Equity Calculator
          </CardTitle>
          <CardDescription>
            Enter your company's details and funding rounds to calculate equity distribution
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Founders Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Founders
              </CardTitle>
              <CardDescription>
                Define founder ownership (must total 100%)
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg">
              Total: {founders.reduce((sum, f) => sum + f.percentage, 0).toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {founders.map((founder, index) => (
            <div key={index} className="flex items-end gap-4">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`founder-name-${index}`}>Founder Name</Label>
                  <Input
                    id={`founder-name-${index}`}
                    value={founder.name}
                    onChange={(e) => updateFounder(index, 'name', e.target.value)}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor={`founder-percent-${index}`}>Ownership %</Label>
                  <Input
                    id={`founder-percent-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={founder.percentage}
                    onChange={(e) => updateFounder(index, 'percentage', e.target.value)}
                    placeholder="e.g., 60"
                  />
                </div>
              </div>
              {founders.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFounder(index)}
                  className="text-destructive"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button onClick={addFounder} variant="outline" className="w-full gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Founder
          </Button>
        </CardContent>
      </Card>

      {/* Company Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Company Setup</CardTitle>
          <CardDescription>Total shares and employee option pool</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="total-shares">Total Shares</Label>
            <Input
              id="total-shares"
              type="number"
              min="1000000"
              step="1000000"
              value={totalShares}
              onChange={(e) => setTotalShares(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Typically 10,000,000
            </p>
          </div>
          <div>
            <Label htmlFor="option-pool">Employee Option Pool %</Label>
            <Input
              id="option-pool"
              type="number"
              min="0"
              max="30"
              step="1"
              value={optionPoolPercent}
              onChange={(e) => setOptionPoolPercent(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Typically 10-15%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Funding Rounds */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Funding Rounds
              </CardTitle>
              <CardDescription>
                Add each funding round with valuation and investment details
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {rounds.length} Round{rounds.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {rounds.map((round, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{round.name}</CardTitle>
                  {rounds.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRound(index)}
                      className="text-destructive"
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`round-name-${index}`}>Round Name</Label>
                    <Input
                      id={`round-name-${index}`}
                      value={round.name}
                      onChange={(e) => updateRound(index, 'name', e.target.value)}
                      placeholder="e.g., Pre-Seed"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`investor-name-${index}`}>Investor Name</Label>
                    <Input
                      id={`investor-name-${index}`}
                      value={round.investorName}
                      onChange={(e) => updateRound(index, 'investorName', e.target.value)}
                      placeholder="e.g., Acme Ventures"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`pre-money-${index}`}>Pre-Money Valuation ($)</Label>
                    <Input
                      id={`pre-money-${index}`}
                      type="number"
                      min="0"
                      step="100000"
                      value={round.preMoneyValuation}
                      onChange={(e) => updateRound(index, 'preMoneyValuation', e.target.value)}
                      placeholder="e.g., 1000000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {round.preMoneyValuation > 0 ? formatNumber(round.preMoneyValuation) : 'Enter amount'}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor={`investment-${index}`}>Investment Amount ($)</Label>
                    <Input
                      id={`investment-${index}`}
                      type="number"
                      min="0"
                      step="50000"
                      value={round.investment}
                      onChange={(e) => updateRound(index, 'investment', e.target.value)}
                      placeholder="e.g., 200000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {round.investment > 0 ? formatNumber(round.investment) : 'Enter amount'}
                    </p>
                  </div>
                </div>

                {round.preMoneyValuation > 0 && round.investment > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="font-semibold text-foreground mb-1">Quick Preview:</div>
                    <div className="space-y-1 text-muted-foreground">
                      <div>Post-Money: {formatNumber(round.preMoneyValuation + round.investment)}</div>
                      <div>Investor Gets: {((round.investment / (round.preMoneyValuation + round.investment)) * 100).toFixed(2)}%</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button onClick={addRound} variant="outline" className="w-full gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Funding Round
          </Button>
        </CardContent>
      </Card>

      {/* Calculate Button */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="pt-6">
          <Button 
            onClick={calculateEquity} 
            size="lg" 
            className="w-full text-lg gap-2"
          >
            <Calculator className="h-5 w-5" />
            Calculate Equity Distribution
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Click to see detailed breakdown, insights, and downloadable cap table
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

