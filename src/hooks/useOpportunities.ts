
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { opportunityService } from '@/lib/services/opportunityService'
import { cacheService } from '@/lib/services/cacheService'
import { countryService } from '@/lib/services/countryService'
import type { Database } from '@/integrations/supabase/types'

type Opportunity = Database['public']['Tables']['opportunities']['Row']
type Proposal = Database['public']['Tables']['proposals']['Row']

export interface OpportunityWithClient extends Opportunity {
  profiles: Database['public']['Tables']['profiles']['Row']
  client_name: string
}

export interface CreateOpportunityRequest {
  title: string
  description: string
  category: string
  budget_min?: number
  budget_max?: number
  type: 'standard' | 'premium'
  deadline?: string
  required_skills: string[]
}

export interface CreateProposalRequest {
  opportunity_id: string
  cover_letter: string
  proposed_budget: number
  estimated_duration?: number
}

// Enhanced opportunities hook with caching and country filtering
export const useOpportunities = (filters?: {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
  category?: string
  budget_min?: number
  budget_max?: number
  type?: 'standard' | 'premium'
}) => {
  const userCountry = countryService.getUserCountry()
  const cacheKey = `opportunities-${userCountry}-${JSON.stringify(filters || {})}`

  return useQuery({
    queryKey: ['opportunities', userCountry, filters],
    queryFn: async () => {
      // Try cache first
      const cachedData = cacheService.get<{ opportunities: OpportunityWithClient[]; total: number }>('opportunities', cacheKey)
      if (cachedData) {
        return cachedData
      }

      // Fetch from service
      const result = await opportunityService.getOpportunities(filters)
      
      // Cache the result
      cacheService.set('opportunities', cacheKey, result)
      
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Single opportunity hook
export const useOpportunity = (id: string) => {
  const userCountry = countryService.getUserCountry()
  const cacheKey = `opportunity-${id}-${userCountry}`

  return useQuery({
    queryKey: ['opportunity', id, userCountry],
    queryFn: async () => {
      // Try cache first
      const cachedData = cacheService.get<OpportunityWithClient>('opportunities', cacheKey)
      if (cachedData) {
        return cachedData
      }

      // Fetch from service
      const opportunity = await opportunityService.getOpportunity(id)
      
      if (opportunity) {
        // Cache the result
        cacheService.set('opportunities', cacheKey, opportunity)
      }
      
      return opportunity
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create opportunity mutation
export const useCreateOpportunity = () => {
  const queryClient = useQueryClient()
  const userCountry = countryService.getUserCountry()

  return useMutation({
    mutationFn: async (request: CreateOpportunityRequest) => {
      return await opportunityService.createOpportunity(request)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch opportunities
        queryClient.invalidateQueries({ queryKey: ['opportunities', userCountry] })
        
        // Clear related caches
        cacheService.clear('opportunities')
      }
    },
  })
}

// Update opportunity mutation
export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient()
  const userCountry = countryService.getUserCountry()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateOpportunityRequest> }) => {
      return await opportunityService.updateOpportunity(id, updates)
    },
    onSuccess: (result, { id }) => {
      if (result.success) {
        // Invalidate specific opportunity and list
        queryClient.invalidateQueries({ queryKey: ['opportunity', id, userCountry] })
        queryClient.invalidateQueries({ queryKey: ['opportunities', userCountry] })
        
        // Clear related caches
        cacheService.delete('opportunities', `opportunity-${id}-${userCountry}`)
      }
    },
  })
}

// Delete opportunity mutation
export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient()
  const userCountry = countryService.getUserCountry()

  return useMutation({
    mutationFn: async (id: string) => {
      return await opportunityService.deleteOpportunity(id)
    },
    onSuccess: (result, id) => {
      if (result.success) {
        // Invalidate opportunities list
        queryClient.invalidateQueries({ queryKey: ['opportunities', userCountry] })
        
        // Remove from cache
        queryClient.removeQueries({ queryKey: ['opportunity', id, userCountry] })
        cacheService.delete('opportunities', `opportunity-${id}-${userCountry}`)
      }
    },
  })
}

// Get proposals for an opportunity
export const useProposals = (opportunityId: string) => {
  return useQuery({
    queryKey: ['proposals', opportunityId],
    queryFn: async () => {
      return await opportunityService.getProposals(opportunityId)
    },
    enabled: !!opportunityId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Create proposal mutation
export const useCreateProposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateProposalRequest) => {
      return await opportunityService.createProposal(request)
    },
    onSuccess: (result, request) => {
      if (result.success) {
        // Invalidate proposals for this opportunity
        queryClient.invalidateQueries({ queryKey: ['proposals', request.opportunity_id] })
        
        // Also invalidate the opportunity to update proposal count
        queryClient.invalidateQueries({ queryKey: ['opportunity', request.opportunity_id] })
      }
    },
  })
}

// Accept proposal mutation
export const useAcceptProposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      return await opportunityService.acceptProposal(proposalId)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: ['proposals'] })
        queryClient.invalidateQueries({ queryKey: ['opportunities'] })
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      }
    },
  })
}

// Reject proposal mutation
export const useRejectProposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      return await opportunityService.rejectProposal(proposalId)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate proposals
        queryClient.invalidateQueries({ queryKey: ['proposals'] })
      }
    },
  })
}

// Legacy hook for backward compatibility
export const useOpportunitiesLegacy = () => {
  return useQuery({
    queryKey: ['opportunities-legacy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_client_id_fkey (*)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      return (data || []).map(opp => ({
        ...opp,
        client_name: `${opp.profiles?.first_name || ''} ${opp.profiles?.last_name || ''}`.trim() || 'Anonymous Client'
      })) as OpportunityWithClient[]
    },
  })
}
