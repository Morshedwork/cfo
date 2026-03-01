import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"

export async function signInWithGoogle() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw error
  if (data?.url) window.location.href = data.url
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/**
 * Sign up with email. Returns { data, error }.
 * When email confirmation is required, data.session may be null — redirect user to check email.
 * Pass the same supabase client to ensureUserProfile() so the session is available when confirmation is disabled.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
  supabaseInstance?: SupabaseClient
) {
  const supabase = supabaseInstance ?? createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/onboarding`,
    },
  })
  if (error) throw error
  return { data, supabase }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function updateAuthProfile(updates: { full_name?: string; avatar_url?: string }) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
    },
  })
  if (error) throw error
}
