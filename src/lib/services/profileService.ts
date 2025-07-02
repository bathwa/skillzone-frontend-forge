
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserSkill = Database['public']['Tables']['user_skills']['Row'] & {
  skills: Database['public']['Tables']['skills']['Row']
}
type Portfolio = Database['public']['Tables']['portfolios']['Row']

export interface ProfileWithDetails extends Profile {
  user_skills: UserSkill[]
  portfolios: Portfolio[]
  name: string
  skills: string[]
}

export class ProfileService {
  private static instance: ProfileService

  private constructor() {}

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService()
    }
    return ProfileService.instance
  }

  async getFreelancerProfiles(filters?: {
    experience_level?: string
    country?: string
    skills?: string[]
    limit?: number
  }): Promise<ProfileWithDetails[]> {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_skills (
            id,
            level,
            years_experience,
            skills (
              id,
              name,
              category
            )
          ),
          portfolios (*)
        `)
        .eq('role', 'freelancer')

      if (filters?.experience_level && filters.experience_level !== 'all') {
        query = query.eq('experience_level', filters.experience_level)
      }

      if (filters?.country && filters.country !== 'all') {
        query = query.eq('country', filters.country)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching freelancer profiles:', error)
        return []
      }

      return (data || []).map(profile => ({
        ...profile,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User',
        skills: profile.user_skills?.map(us => us.skills?.name || '').filter(Boolean) || []
      }))
    } catch (error) {
      console.error('Error in getFreelancerProfiles:', error)
      return []
    }
  }

  async getProfile(id: string): Promise<ProfileWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_skills (
            id,
            level,
            years_experience,
            skills (
              id,
              name,
              category
            )
          ),
          portfolios (*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return {
        ...data,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Anonymous User',
        skills: data.user_skills?.map(us => us.skills?.name || '').filter(Boolean) || []
      }
    } catch (error) {
      console.error('Error in getProfile:', error)
      return null
    }
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export const profileService = ProfileService.getInstance()
