import { findInvestorsFromCrust } from "@/lib/crust-data"
import { NextRequest } from "next/server"

/**
 * GET/POST /api/fundraising/investors
 * Find investors using Crust Data (company screening → investor names).
 * Optional query/body: minFundingUsd, minHeadcount, maxHeadcount, country, limit.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const minFundingUsd = url.searchParams.get("minFundingUsd")
  const minHeadcount = url.searchParams.get("minHeadcount")
  const maxHeadcount = url.searchParams.get("maxHeadcount")
  const country = url.searchParams.get("country")
  const limit = url.searchParams.get("limit")

  const result = await findInvestorsFromCrust({
    minFundingUsd: minFundingUsd ? Number(minFundingUsd) : undefined,
    minHeadcount: minHeadcount ? Number(minHeadcount) : undefined,
    maxHeadcount: maxHeadcount ? Number(maxHeadcount) : undefined,
    country: country ?? undefined,
    limit: limit ? Number(limit) : undefined,
  })

  return Response.json(result)
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    // empty body ok
  }

  const result = await findInvestorsFromCrust({
    minFundingUsd: typeof body.minFundingUsd === "number" ? body.minFundingUsd : undefined,
    minHeadcount: typeof body.minHeadcount === "number" ? body.minHeadcount : undefined,
    maxHeadcount: typeof body.maxHeadcount === "number" ? body.maxHeadcount : undefined,
    country: typeof body.country === "string" ? body.country : undefined,
    limit: typeof body.limit === "number" ? body.limit : undefined,
  })

  return Response.json(result)
}
