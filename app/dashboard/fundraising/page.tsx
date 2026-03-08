"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InvestorFinderCard } from "@/components/ai-message-types"
import { Search, Loader2, Brain, DollarSign, X } from "lucide-react"

export default function DashboardFundraisingPage() {
  const router = useRouter()
  const [data, setData] = useState<{
    investors: Array<{ name: string; companies: string[]; lastFundingRound?: string; totalInvestmentUsd?: number }>
    companies: Array<{ company_name?: string; company_website_domain?: string; last_funding_round_type?: string; total_investment_usd?: number }>
    source?: string
    message?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchInvestors = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/fundraising/investors")
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to load investors")
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const { filteredInvestors, filteredCompanies } = useMemo(() => {
    if (!data) return { filteredInvestors: [], filteredCompanies: [] }
    const q = searchQuery.trim().toLowerCase()
    if (!q) {
      return { filteredInvestors: data.investors ?? [], filteredCompanies: data.companies ?? [] }
    }
    const investors = (data.investors ?? []).filter(
      (inv) =>
        inv.name.toLowerCase().includes(q) ||
        inv.companies.some((c) => c.toLowerCase().includes(q))
    )
    const companies = (data.companies ?? []).filter(
      (c) =>
        (c.company_name?.toLowerCase().includes(q)) ||
        (c.company_website_domain?.toLowerCase().includes(q))
    )
    return { filteredInvestors: investors, filteredCompanies: companies }
  }, [data, searchQuery])

  useEffect(() => {
    fetchInvestors()
  }, [])

  return (
    <div className="page-transition">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Fundraising</h1>
            <p className="text-muted-foreground">
              Find investors powered by Crust Data — companies with similar funding profiles and their investors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchInvestors} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Loading…" : "Refresh"}
            </Button>
            <Button size="sm" asChild>
              <Link href="/ai-assistant?q=Find+investors+using+Crust+Data+for+fundraising" className="gap-2">
                <Brain className="h-4 w-4" />
                Open in AI Assistant
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-2 border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
                Find investors (Crust Data)
              </CardTitle>
              <CardDescription>
                Investors from companies that have raised $1M+ and have 5+ employees. Use this list to prioritize outreach.
              </CardDescription>
              {!loading && !error && data && (data.investors?.length ?? 0) > 0 && (
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search by investor or company name…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted text-muted-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading investor data…</span>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
              {!loading && !error && data && (
                <>
                  {searchQuery.trim() && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Showing {filteredInvestors.length} of {data.investors?.length ?? 0} investors
                    </p>
                  )}
                  <InvestorFinderCard
                    investors={filteredInvestors}
                    companies={filteredCompanies}
                    source={data.source}
                    totalCompanies={data.companies?.length ?? 0}
                    onRefresh={fetchInvestors}
                    onViewInvestorKPIs={() => router.push("/ai-assistant?q=Show+me+investor+KPIs+and+prepare+a+dashboard+for+due+diligence")}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
              <CardDescription>Fundraising workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href="/ai-assistant?q=Find+investors+using+Crust+Data+for+fundraising">
                  <Search className="h-4 w-4" />
                  Find investors (Crust Data)
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href="/ai-assistant?q=Show+me+investor+KPIs+and+prepare+a+dashboard+for+due+diligence">
                  <DollarSign className="h-4 w-4" />
                  Investor KPIs dashboard
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href="/ai-assistant?q=Calculate+startup+equity+across+Pre-Seed,+Seed,+Series+A">
                  <DollarSign className="h-4 w-4" />
                  Equity calculator
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
