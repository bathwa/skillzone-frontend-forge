
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Opportunity = Database['public']['Tables']['opportunities']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export const useOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_client_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            country,
            rating
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Opportunity[]
    },
  })
}

export const useOpportunity = (id: string) => {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_client_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            country,
            rating
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Opportunity
    },
    enabled: !!id,
  })
}
