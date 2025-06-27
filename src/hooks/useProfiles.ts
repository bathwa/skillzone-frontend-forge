
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  user_skills: Array<{
    id: string
    level: string
    years_experience: number | null
    skills: {
      id: string
      name: string
      category: string
    }
  }>
  portfolios: Database['public']['Tables']['portfolios']['Row'][]
}

export const useProfiles = (role?: 'freelancer' | 'client') => {
  return useQuery({
    queryKey: ['profiles', role],
    queryFn: async () => {
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

      if (role) {
        query = query.eq('role', role)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data as Profile[]
    },
  })
}

export const useProfile = (id: string) => {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
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

      if (error) throw error
      return data as Profile
    },
    enabled: !!id,
  })
}
