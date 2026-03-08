import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseUrl = (rawUrl ?? "").trim() || "https://placeholder.supabase.co"
  const supabaseKey = (rawKey ?? "").trim() || "placeholder-key"
  const isConfigured =
    supabaseUrl !== "https://placeholder.supabase.co" && supabaseKey !== "placeholder-key"

  if (!isConfigured && typeof window !== "undefined") {
    console.warn(
      "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Auth will fail."
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
