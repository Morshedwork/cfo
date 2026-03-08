/**
 * Crust Data API client for fundraising / investor discovery.
 * Uses Company Screening and Enrichment APIs.
 * @see https://crustdata.com/docs/discover/company-data-api/
 */

const CRUST_API_BASE = "https://api.crustdata.com"

export interface CrustInvestorMatch {
  name: string
  companies: string[]
  lastFundingRound?: string
  totalInvestmentUsd?: number
}

export interface CrustCompanySummary {
  company_id?: number
  company_name?: string
  company_website_domain?: string
  company_website?: string
  last_funding_round_type?: string
  total_investment_usd?: number
  investors?: string[] | string
  headcount?: number
  industries?: string[]
}

export interface FindInvestorsResult {
  investors: CrustInvestorMatch[]
  companies: CrustCompanySummary[]
  source: "crustdata"
  message?: string
}

function getApiKey(): string | undefined {
  return process.env.CRUSTDATA_API_KEY ?? process.env.NEXT_PUBLIC_CRUSTDATA_API_KEY
}

/**
 * Normalize investors field from API (can be string or array of strings).
 */
function normalizeInvestors(investors: unknown): string[] {
  if (!investors) return []
  if (Array.isArray(investors)) return investors.filter((x): x is string => typeof x === "string")
  if (typeof investors === "string") {
    try {
      const parsed = JSON.parse(investors) as unknown
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [investors]
    } catch {
      return investors.includes(",") ? investors.split(",").map((s) => s.trim()) : [investors]
    }
  }
  return []
}

/**
 * Screen companies via Crust Data (e.g. funded, similar stage) and collect investor names.
 */
export async function findInvestorsFromCrust(options?: {
  minFundingUsd?: number
  minHeadcount?: number
  maxHeadcount?: number
  country?: string
  limit?: number
}): Promise<FindInvestorsResult> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return {
      investors: [],
      companies: [],
      source: "crustdata",
      message: "Crust Data API key is not configured. Add CRUSTDATA_API_KEY to .env.local to enable investor discovery.",
    }
  }

  const limit = Math.min(options?.limit ?? 20, 50)
  const minFunding = options?.minFundingUsd ?? 1_000_000
  const minHead = options?.minHeadcount ?? 5

  const conditions: Array<{ column: string; type: string; value: unknown; allow_null: boolean }> = [
    { column: "total_investment_usd", type: "=>", value: minFunding, allow_null: false },
    { column: "headcount", type: "=>", value: minHead, allow_null: false },
  ]
  if (options?.country) {
    conditions.push({
      column: "largest_headcount_country",
      type: "(.)",
      value: options.country,
      allow_null: false,
    })
  }
  if (options?.maxHeadcount != null) {
    conditions.push({
      column: "headcount",
      type: "<=",
      value: options.maxHeadcount,
      allow_null: false,
    })
  }

  try {
    const screenRes = await fetch(`${CRUST_API_BASE}/screener/screen/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({
        filters: { op: "and", conditions },
        hidden_columns: [],
        offset: 0,
        count: limit,
        sorts: [{ column: "total_investment_usd", order: "desc" }],
      }),
    })

    if (!screenRes.ok) {
      const errText = await screenRes.text()
      console.error("[Crust Data] Screen error:", screenRes.status, errText)
      return {
        investors: [],
        companies: [],
        source: "crustdata",
        message: `Crust Data screening failed (${screenRes.status}). Check API key and filters.`,
      }
    }

    const screenData = (await screenRes.json()) as {
      data?: Array<Record<string, unknown>>
      results?: Array<Record<string, unknown>>
    }
    const rows = screenData?.data ?? screenData?.results ?? []
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        investors: [],
        companies: [],
        source: "crustdata",
        message: "No companies matched the criteria. Try broadening filters (e.g. lower funding threshold).",
      }
    }

    const companies: CrustCompanySummary[] = rows.map((r) => ({
      company_id: typeof r.company_id === "number" ? r.company_id : undefined,
      company_name: typeof r.company_name === "string" ? r.company_name : undefined,
      company_website_domain: typeof r.company_website_domain === "string" ? r.company_website_domain : undefined,
      company_website: typeof r.company_website === "string" ? r.company_website : undefined,
      last_funding_round_type: typeof r.last_funding_round_type === "string" ? r.last_funding_round_type : undefined,
      total_investment_usd: typeof r.total_investment_usd === "number" ? r.total_investment_usd : undefined,
      headcount: typeof r.headcount === "number" ? r.headcount : undefined,
      investors: r.investors,
      industries: Array.isArray(r.industries) ? (r.industries as string[]) : undefined,
    }))

    const investorToCompanies = new Map<string, string[]>()
    for (const c of companies) {
      const names = normalizeInvestors(c.investors)
      const companyName = c.company_name ?? c.company_website_domain ?? "Unknown"
      for (const name of names) {
        const key = name.trim()
        if (!key) continue
        if (!investorToCompanies.has(key)) investorToCompanies.set(key, [])
        const arr = investorToCompanies.get(key)!
        if (!arr.includes(companyName)) arr.push(companyName)
      }
    }

    const investors: CrustInvestorMatch[] = Array.from(investorToCompanies.entries()).map(([name, companiesList]) => {
      const company = companies.find(
        (c) => c.company_name === companiesList[0] || c.company_website_domain === companiesList[0]
      )
      return {
        name,
        companies: companiesList.slice(0, 5),
        lastFundingRound: company?.last_funding_round_type,
        totalInvestmentUsd: company?.total_investment_usd,
      }
    })

    return {
      investors: investors.slice(0, 30),
      companies,
      source: "crustdata",
    }
  } catch (err) {
    console.error("[Crust Data] Error:", err)
    return {
      investors: [],
      companies: [],
      source: "crustdata",
      message: err instanceof Error ? err.message : "Failed to fetch from Crust Data.",
    }
  }
}
