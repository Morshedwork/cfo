"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Globe,
  TrendingUp,
  BarChart3,
  Search,
  Target,
  Lightbulb,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  Play,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts"

const STORAGE_KEY = "aura_competitor_domains"

type AgentResult = { summary: string; bullets: string[]; recommendations: string[] }
type TabTask = "overview" | "competitors" | "ad_spend" | "seo" | "benchmarks" | "opportunities"

// Sample data for trend and benchmark charts (replace with API data when available)
const revenueTrendData = [
  { month: "Jan", revenue: 12000, marketAvg: 14500 },
  { month: "Feb", revenue: 15000, marketAvg: 15200 },
  { month: "Mar", revenue: 18000, marketAvg: 16100 },
  { month: "Apr", revenue: 22000, marketAvg: 16800 },
  { month: "May", revenue: 28000, marketAvg: 17500 },
  { month: "Jun", revenue: 35000, marketAvg: 18200 },
]

const benchmarkComparisonData = [
  { metric: "Gross Margin", you: 72, industry: 65, unit: "%" },
  { metric: "Burn Multiple", you: 2.1, industry: 2.8, unit: "x" },
  { metric: "Revenue Growth", you: 85, industry: 55, unit: "%" },
  { metric: "CAC Payback", you: 14, industry: 18, unit: "mo" },
]

const adSpendTrendData = [
  { month: "Jan", spend: 12, meta: 5, google: 4, linkedin: 3 },
  { month: "Feb", spend: 14, meta: 6, google: 5, linkedin: 3 },
  { month: "Mar", spend: 15, meta: 6, google: 5, linkedin: 4 },
  { month: "Apr", spend: 17, meta: 7, google: 6, linkedin: 4 },
  { month: "May", spend: 18, meta: 8, google: 6, linkedin: 4 },
  { month: "Jun", spend: 20, meta: 9, google: 7, linkedin: 4 },
]

export default function MarketIntelligencePage() {
  const [competitors, setCompetitors] = useState<string[]>([])
  const [configureOpen, setConfigureOpen] = useState(false)
  const [newEntry, setNewEntry] = useState("")
  const [runningTask, setRunningTask] = useState<TabTask | null>(null)
  const [agentResults, setAgentResults] = useState<Record<TabTask, AgentResult | null>>({
    overview: null,
    competitors: null,
    ad_spend: null,
    seo: null,
    benchmarks: null,
    opportunities: null,
  })
  const [agentError, setAgentError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as string[]
        if (Array.isArray(parsed)) setCompetitors(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (competitors.length === 0 && localStorage.getItem(STORAGE_KEY) === null) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(competitors))
  }, [competitors])

  const addCompetitor = () => {
    const trimmed = newEntry.trim()
    if (!trimmed) return
    if (competitors.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setNewEntry("")
      return
    }
    setCompetitors((prev) => [...prev, trimmed])
    setNewEntry("")
  }

  const removeCompetitor = (index: number) => {
    setCompetitors((prev) => prev.filter((_, i) => i !== index))
  }

  async function runAgent(task: TabTask) {
    setRunningTask(task)
    setAgentError(null)
    try {
      const res = await fetch("/api/market-intelligence/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          params: { competitors },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAgentError(data.error ?? "Failed to run agent")
        return
      }
      if (data.ok && data.result) {
        setAgentResults((prev) => ({ ...prev, [task]: data.result }))
      }
    } catch (e) {
      setAgentError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setRunningTask(null)
    }
  }

  function AgentRunCard({ task, title }: { task: TabTask; title: string }) {
    const result = agentResults[task]
    const loading = runningTask === task
    return (
      <Card className="border-dashed border-2 border-primary/20 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Run agent
            </span>
            <Button
              size="sm"
              onClick={() => runAgent(task)}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {result ? "Run again" : `Run ${title}`}
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Execute the {title} agent to generate a data-driven report from your context and market signals.
          </CardDescription>
        </CardHeader>
        {agentError && runningTask === task && (
          <CardContent className="pt-0 text-sm text-destructive">
            {agentError}
          </CardContent>
        )}
        {result && (
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Report generated
            </div>
            <p className="text-sm">{result.summary}</p>
            {result.bullets.length > 0 && (
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {result.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {result.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Recommendations</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="page-transition">
      <div className="container py-8">
        <div className="mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/30 gap-1">
            <Globe className="h-3 w-3" />
            External Intelligence
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Market Intelligence</h1>
          <p className="text-muted-foreground max-w-2xl">
            Combine your internal financials with external signals: competitor moves, ad spend trends, SEO visibility,
            industry benchmarks, and market opportunities. Data-driven scaling starts here.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger value="overview" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2">
              <Target className="h-4 w-4" />
              Competitors
            </TabsTrigger>
            <TabsTrigger value="ad-spend" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Ad Spend
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="h-4 w-4" />
              SEO & Visibility
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Benchmarks
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Opportunities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AgentRunCard task="overview" title="Overview" />

            {/* Trends & graphs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Trends & visuals
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-primary/20 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue vs market trend</CardTitle>
                    <CardDescription>Your revenue vs segment average (last 6 months)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={revenueTrendData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} labelFormatter={(l) => l} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorRevenue)" name="You" />
                        <Area type="monotone" dataKey="marketAvg" stroke="hsl(var(--muted-foreground))" strokeWidth={2} fill="url(#colorMarket)" name="Segment avg" />
                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="border-2 border-accent/20 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">You vs industry benchmarks</CardTitle>
                    <CardDescription>Key metrics compared to segment (higher is better where applicable)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={benchmarkComparisonData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="metric" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number, _n: string, props: { payload: { unit: string } }) => [`${v}${props.payload?.unit ?? ""}`, ""]} />
                        <Bar dataKey="you" fill="hsl(var(--primary))" name="You" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="industry" fill="hsl(var(--muted-foreground))" name="Industry" radius={[0, 4, 4, 0]} />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Internal + External
                  </CardTitle>
                  <CardDescription>
                    Aura connects your P&amp;L, runway, and capital allocation with market signals so you can scale
                    with full context.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Revenue positioning vs. market segments</li>
                    <li>• Competitor public signals and estimated spend</li>
                    <li>• SEO and growth pattern tracking</li>
                    <li>• Industry benchmarks and inefficiency detection</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Ask Aura
                  </CardTitle>
                  <CardDescription>
                    Use the AI Assistant or Voice to ask: &quot;How do we compare to competitors?&quot;,
                    &quot;What are industry benchmarks for our segment?&quot;, &quot;Where are market gaps?&quot;
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Link href="/ai-assistant">
                    <Button variant="default" size="sm" className="gap-2">
                      AI Assistant
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/voice-assistant">
                    <Button variant="outline" size="sm" className="gap-2">
                      Voice
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            <AgentRunCard task="competitors" title="Competitor research" />
            <Card>
              <CardHeader>
                <CardTitle>Competitor Public Signals</CardTitle>
                <CardDescription>
                  Research competitors&apos; public signals: job postings, funding, product launches, and estimated
                  marketing presence. (Data sources and integrations can be connected here.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Competitor research</p>
                  <p className="text-sm mt-1">
                    Add competitor domains or names to track. Run the agent above to get an intelligence report.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Dialog open={configureOpen} onOpenChange={setConfigureOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Configure
                          {competitors.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {competitors.length}
                            </Badge>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Track competitors</DialogTitle>
                          <DialogDescription>
                            Add competitor domains (e.g. competitor.com) or company names. Aura can use these to
                            summarize public signals in the AI Assistant.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 mt-4">
                          <Input
                            placeholder="Domain or company name"
                            value={newEntry}
                            onChange={(e) => setNewEntry(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                          />
                          <Button type="button" size="icon" onClick={addCompetitor} className="shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {competitors.length > 0 ? (
                          <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto rounded-md border p-3">
                            {competitors.map((name, i) => (
                              <li
                                key={i}
                                className="flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded hover:bg-muted/50"
                              >
                                <span className="truncate">{name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeCompetitor(i)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-4">No competitors added yet.</p>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ad-spend" className="space-y-6">
            <AgentRunCard task="ad_spend" title="Ad spend" />
            <Card className="border-2 border-primary/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Estimated ad spend trend
                </CardTitle>
                <CardDescription>
                  Simulated channel mix over 6 months ($k). Run the agent for your segment benchmarks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={adSpendTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}k`} />
                    <Tooltip formatter={(v: number) => [`$${v}k`, ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="spend" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="meta" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Meta" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="google" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Google" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="linkedin" stroke="hsl(var(--chart-3))" strokeWidth={2} name="LinkedIn" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ad spend intelligence</CardTitle>
                <CardDescription>
                  Run the agent above for segment benchmarks, or ask Aura in the AI Assistant: &quot;What are typical ad spend levels
                  in our segment?&quot;
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <AgentRunCard task="seo" title="SEO & visibility" />
            <Card>
              <CardHeader>
                <CardTitle>SEO Visibility & Growth Patterns</CardTitle>
                <CardDescription>
                  Track SEO visibility and growth patterns for your site and competitors to spot opportunities and
                  content gaps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">SEO & visibility</p>
                  <p className="text-sm mt-1">
                    Run the agent for a visibility and growth-pattern report. Integrate SEO tools later to compare trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-6">
            <AgentRunCard task="benchmarks" title="Benchmarks" />
            <Card className="border-2 border-primary/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  You vs industry benchmarks
                </CardTitle>
                <CardDescription>
                  Compare key metrics to segment. Run the agent for your actual benchmarks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={benchmarkComparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number, _n: string, props: { payload: { unit: string } }) => [`${v} ${props.payload?.unit ?? ""}`, ""]} />
                    <Legend />
                    <Bar dataKey="you" fill="hsl(var(--primary))" name="You" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="industry" fill="hsl(var(--muted-foreground))" name="Industry" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Industry Benchmarks</CardTitle>
                <CardDescription>
                  Run the agent to get benchmark comparisons, or ask in the AI Assistant: &quot;How does our margin compare to the industry?&quot;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/ai-assistant" className="inline-block">
                  <Button variant="outline" size="sm" className="gap-2">
                    Ask in AI Assistant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <AgentRunCard task="opportunities" title="Opportunities" />
            <Card>
              <CardHeader>
                <CardTitle>Market Opportunities & Inefficiencies</CardTitle>
                <CardDescription>
                  Detect market opportunities and inefficiencies by combining your unit economics with competitive
                  and benchmark data. Smarter capital allocation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Opportunity detection</p>
                  <p className="text-sm mt-1">
                    Run the agent for data-driven opportunity and reallocation suggestions, or use Voice / AI Assistant: &quot;Where should we focus next?&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
