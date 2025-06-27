
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Skill = Database['public']['Tables']['skills']['Row']

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data as Skill[]
    },
  })
}

export const useSkillsByCategory = () => {
  return useQuery({
    queryKey: ['skills-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      
      // Group skills by category
      const skillsByCategory = (data as Skill[]).reduce((acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = []
        }
        acc[skill.category].push(skill)
        return acc
      }, {} as Record<string, Skill[]>)
      
      return skillsByCategory
    },
  })
}
