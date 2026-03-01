"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ScenariosRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/scenarios")
  }, [router])
  return null
}
