"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MarketIntelligenceRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/market-intelligence")
  }, [router])
  return null
}
