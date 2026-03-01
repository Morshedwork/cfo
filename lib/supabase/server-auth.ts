import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

/**
 * Get the current authenticated user from Supabase session (for API routes).
 * Uses cookie-based session from the request.
 */
export async function getAuthUser(request: Request): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}
