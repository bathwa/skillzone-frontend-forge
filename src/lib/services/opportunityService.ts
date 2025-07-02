
import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { countryService } from './countryService'
import { tokenService } from './tokenService'
import type { Database } from '@/integrations/supabase/types'

type Opportunity = Database['public']['Tables']['opportunities']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Proposal = Database['public']['Tables']['proposals']['Row']

export interface OpportunityWithClient extends Opportunity {
  profiles: Profile
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

export class OpportunityService {
  private static instance: OpportunityService

  private constructor() {}

  static getInstance(): OpportunityService {
    if (!OpportunityService.instance) {
      OpportunityService.instance = new OpportunityService()
    }
    return OpportunityService.instance
  }

  async getOpportunities(filters?: {
    status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
    category?: string
    budget_min?: number
    budget_max?: number
    type?: 'standard' | 'premium'
    country?: string
    limit?: number
    page?: number
  }): Promise<{ opportunities: OpportunityWithClient[]; total: number }> {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_client_id_fkey (*)
        `, { count: 'exact' })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      } else {
        // Default to open opportunities for public viewing
        query = query.eq('status', 'open')
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters?.country && filters.country !== 'all') {
        const countryCode = filters.country as Database['public']['Enums']['country_code']
        query = query.eq('client_country', countryCode)
      }

      if (filters?.budget_min) {
        query = query.gte('budget_min', filters.budget_min)
      }

      if (filters?.budget_max) {
        query = query.lte('budget_max', filters.budget_max)
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      // Pagination
      const limit = filters?.limit || 10
      const page = filters?.page || 1
      const offset = (page - 1) * limit

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching opportunities:', error)
        return { opportunities: [], total: 0 }
      }

      const opportunities = (data || []).map(opp => ({
        ...opp,
        client_name: `${opp.profiles?.first_name || ''} ${opp.profiles?.last_name || ''}`.trim() || 'Anonymous Client'
      }))

      return { opportunities, total: count || 0 }
    } catch (error) {
      console.error('Error in getOpportunities:', error)
      return { opportunities: [], total: 0 }
    }
  }

  async getOpportunity(id: string): Promise<OpportunityWithClient | null> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_client_id_fkey (*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching opportunity:', error)
        return null
      }

      return {
        ...data,
        client_name: `${data.profiles?.first_name || ''} ${data.profiles?.last_name || ''}`.trim() || 'Anonymous Client'
      }
    } catch (error) {
      console.error('Error in getOpportunity:', error)
      return null
    }
  }

  async createOpportunity(request: CreateOpportunityRequest): Promise<{
    success: boolean
    opportunityId?: string
    error?: string
  }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (user.role !== 'client') {
        throw new Error('Only clients can create opportunities')
      }

      // Check if user has enough tokens
      const tokenCost = request.type === 'premium' ? 2 : 1
      const userBalance = await tokenService.getUserTokenBalance(user.id)
      
      if (userBalance < tokenCost) {
        throw new Error(`Insufficient tokens. Required: ${tokenCost}, Available: ${userBalance}`)
      }

      // Create opportunity
      const { data: opportunity, error: opportunityError } = await supabase
        .from('opportunities')
        .insert({
          client_id: user.id,
          title: request.title,
          description: request.description,
          category: request.category,
          budget_min: request.budget_min,
          budget_max: request.budget_max,
          type: request.type,
          status: 'open',
          client_country: (user.country || 'south_africa') as Database['public']['Enums']['country_code'],
          deadline: request.deadline,
          required_skills: request.required_skills,
        })
        .select()
        .single()

      if (opportunityError) {
        throw opportunityError
      }

      // Debit tokens
      const debitResult = await tokenService.debitTokens(
        user.id,
        tokenCost,
        `Opportunity creation: ${request.title}`,
        opportunity.id
      )

      if (!debitResult.success) {
        // Rollback opportunity creation
        await supabase
          .from('opportunities')
          .delete()
          .eq('id', opportunity.id)
        
        throw new Error(debitResult.error)
      }

      return {
        success: true,
        opportunityId: opportunity.id,
      }
    } catch (error) {
      console.error('Create opportunity error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async updateOpportunity(id: string, updates: Partial<CreateOpportunityRequest>): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('opportunities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('client_id', user.id) // Ensure user owns the opportunity

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Update opportunity error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async deleteOpportunity(id: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)
        .eq('client_id', user.id) // Ensure user owns the opportunity

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Delete opportunity error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getProposals(opportunityId: string): Promise<Proposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          profiles!proposals_freelancer_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            rating
          )
        `)
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching proposals:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProposals:', error)
      return []
    }
  }

  async createProposal(request: CreateProposalRequest): Promise<{
    success: boolean
    proposalId?: string
    error?: string
  }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (user.role !== 'freelancer') {
        throw new Error('Only freelancers can create proposals')
      }

      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert({
          freelancer_id: user.id,
          opportunity_id: request.opportunity_id,
          cover_letter: request.cover_letter,
          proposed_budget: request.proposed_budget,
          estimated_duration: request.estimated_duration,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        proposalId: proposal.id,
      }
    } catch (error) {
      console.error('Create proposal error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async acceptProposal(proposalId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Update proposal status
      const { error: proposalError } = await supabase
        .from('proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId)

      if (proposalError) {
        throw proposalError
      }

      return { success: true }
    } catch (error) {
      console.error('Accept proposal error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async rejectProposal(proposalId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Update proposal status
      const { error: proposalError } = await supabase
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('id', proposalId)

      if (proposalError) {
        throw proposalError
      }

      return { success: true }
    } catch (error) {
      console.error('Reject proposal error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const opportunityService = OpportunityService.getInstance()
