import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  company_name: string | null
  role: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface UserCompany {
  id: string
  user_id: string
  name: string
  industry: string | null
  founded_date: string | null
  team_size: number | null
  funding_stage: string | null
  monthly_burn: number | null
  current_cash: number | null
  created_at: string
  updated_at: string
}

/**
 * Ensures the current user has a profile and company
 * Creates them if they don't exist.
 * Pass the same Supabase client used for sign-up so the new session is available.
 */
export async function ensureUserProfile(supabaseClient?: SupabaseClient): Promise<{
  profile: UserProfile | null
  company: UserCompany | null
  error: string | null
}> {
  const supabase = supabaseClient ?? createClient()

  try {
    // Get current user (use provided client so sign-up session is available)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { profile: null, company: null, error: "Not authenticated" }
    }
    
    // Check if profile exists
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    
    // Create profile if it doesn't exist
    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          company_name: user.user_metadata?.company_name || 'My Company',
        })
        .select()
        .single()
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
        return { profile: null, company: null, error: profileError.message }
      }
      
      profile = newProfile
    }
    
    // Check if company exists
    let { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    // Create company if it doesn't exist
    if (!company) {
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          name: user.user_metadata?.company_name || 'My Company',
          industry: 'Technology',
          founded_date: new Date().toISOString().split('T')[0],
          team_size: 1,
          funding_stage: 'pre-seed',
        })
        .select()
        .single()
      
      if (companyError) {
        console.error('Error creating company:', companyError)
        return { profile, company: null, error: companyError.message }
      }
      
      company = newCompany
    }
    
    return { profile, company, error: null }
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return {
      profile: null,
      company: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Gets the current user's profile
 * Fast-fail with 2 second timeout to prevent blocking sign-in
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('[Profile] User error:', userError)
      return null
    }
    
    if (!user) {
      console.log('[Profile] No user logged in')
      return null
    }
    
    // Add 2-second timeout to fail fast if table doesn't exist
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => {
        console.log('[Profile] Query timeout - table may not exist')
        resolve(null)
      }, 2000)
    )
    
    const queryPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .limit(1)
      .maybeSingle()
    
    // Race between query and timeout
    const result = await Promise.race([queryPromise, timeoutPromise])
    
    if (!result) {
      return null
    }
    
    const { data, error } = result as any
    
    if (error) {
      console.log('[Profile] Database error (table may not exist):', error.message)
      return null
    }
    
    // If no profile found, return null (not an error)
    if (!data) {
      console.log('[Profile] No profile found for user:', user.id)
      return null
    }
    
    return data
  } catch (error) {
    console.log('[Profile] Error loading profile:', error)
    return null
  }
}

/**
 * Gets the current user's company
 */
export async function getCurrentUserCompany(): Promise<UserCompany | null> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    // Use limit(1).maybeSingle() to handle duplicates gracefully
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    
    if (error) {
      console.error('[Company] Database error:', error.message)
      return null
    }
    
    // If no company found, return null (not an error)
    if (!data) {
      console.log('[Company] No company found for user:', user.id)
      return null
    }
    
    return data
  } catch (error) {
    console.error('[Company] Unexpected error:', error)
    return null
  }
}

/**
 * Updates the user's profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{
  profile: UserProfile | null
  error: string | null
}> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { profile: null, error: 'Not authenticated' }
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      return { profile: null, error: error.message }
    }
    
    return { profile, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      profile: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update the current user's company
 */
export async function updateCompany(updates: Partial<Record<keyof UserCompany, unknown>>): Promise<{
  company: UserCompany | null
  error: string | null
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { company: null, error: 'Not authenticated' }
  const { data: company } = await supabase.from('companies').select('*').eq('user_id', user.id).limit(1).maybeSingle()
  if (!company) return { company: null, error: 'No company found' }
  const row: Record<string, unknown> = {}
  if (updates.name != null) row.name = updates.name
  if (updates.industry != null) row.industry = updates.industry
  if (updates.founded_date != null) row.founded_date = updates.founded_date
  if (updates.team_size != null) row.team_size = updates.team_size
  if (updates.funding_stage != null) row.funding_stage = updates.funding_stage
  if (updates.monthly_burn != null) row.monthly_burn = updates.monthly_burn
  if (updates.current_cash != null) row.current_cash = updates.current_cash
  row.updated_at = new Date().toISOString()
  const { data: updated, error } = await supabase.from('companies').update(row).eq('id', company.id).select().single()
  if (error) return { company: null, error: error.message }
  return { company: updated, error: null }
}

/**
 * Create an AI insight for the current user's company
 */
export async function createAIInsight(params: {
  companyId?: string
  type: string
  title: string
  description: string
  severity?: 'info' | 'warning' | 'critical'
  data?: Record<string, unknown>
  isRead?: boolean
}): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient()
  let companyId = params.companyId
  if (!companyId) {
    const company = await getCurrentUserCompany()
    if (!company) return { id: null, error: 'No company found' }
    companyId = company.id
  }
  const { data, error } = await supabase
    .from('ai_insights')
    .insert({
      company_id: companyId,
      type: params.type,
      title: params.title,
      description: params.description,
      severity: params.severity ?? 'info',
      data: params.data ?? null,
      is_read: params.isRead ?? false,
    })
    .select('id')
    .single()
  if (error) return { id: null, error: error.message }
  return { id: data?.id ?? null, error: null }
}
