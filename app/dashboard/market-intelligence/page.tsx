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

const STORAGE_KEY = "aura_competitor_domains"

type AgentResult = { summary: string; bullets: string[]; recommendations: string[] }
type TabTask = "overview" | "competitors" | "ad_spend" | "seo" | "benchmarks" | "opportunities"

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
            <Card>
              <CardHeader>
                <CardTitle>Estimated Ad Spend Trends</CardTitle>
                <CardDescription>
                  Analyze estimated ad spending trends for your category and competitors to inform budget allocation
                  and ROI expectations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Ad spend estimates</p>
                  <p className="text-sm mt-1">
                    Run the agent above for segment benchmarks, or ask Aura in the AI Assistant: &quot;What are typical ad spend levels
                    in our segment?&quot;
                  </p>
                </div>
              </CardContent>
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
            <Card>
              <CardHeader>
                <CardTitle>Industry Benchmarks</CardTitle>
                <CardDescription>
                  Compare your revenue, margins, burn efficiency, and growth against industry benchmarks for your
                  segment. Reduce blind spots with data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Benchmarks</p>
                  <p className="text-sm mt-1">
                    Run the agent to get benchmark comparisons, or ask in the AI Assistant: &quot;How does our margin compare to the industry?&quot;
                  </p>
                  <Link href="/ai-assistant" className="inline-block mt-4">
                    <Button variant="outline" size="sm" className="gap-2">
                      Ask in AI Assistant
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
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
