import { createClient } from "@/lib/supabase/client"

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
 * Creates them if they don't exist
 */
export async function ensureUserProfile(): Promise<{
  profile: UserProfile | null
  company: UserCompany | null
  error: string | null
}> {
  const supabase = createClient()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { profile: null, company: null, error: 'Not authenticated' }
    }
    
    // Check if profile exists
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
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
      .single()
    
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
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('[Profile] Database error:', profileError.message)
      // Check if it's because table doesn't exist
      if (profileError.message.includes('relation') || profileError.message.includes('does not exist')) {
        console.error('[Profile] ⚠️ CRITICAL: profiles table does not exist! Run database setup SQL.')
      }
      return null
    }
    
    return profile
  } catch (error) {
    console.error('[Profile] Unexpected error:', error)
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
    
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    return company
  } catch (error) {
    console.error('Error getting user company:', error)
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

