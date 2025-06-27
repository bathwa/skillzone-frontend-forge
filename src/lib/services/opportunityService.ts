import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { countryService } from './countryService'
import { tokenService } from './tokenService'
import { PLATFORM_FEES } from '@/lib/constants'
import type { Database } from '@/integrations/supabase/types'

type Opportunity = Database['public']['Tables']['opportunities']['Row']
type Proposal = Database['public']['Tables']['proposals']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export interface OpportunityWithClient extends Opportunity {
  profiles: Profile
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

  // Get opportunities filtered by user's country
  async getOpportunities(filters?: {
    status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
    category?: string
    budget_min?: number
    budget_max?: number
    type?: 'standard' | 'premium'
  }): Promise<OpportunityWithClient[]> {
    try {
      const userCountry = countryService.getUserCountry()
      
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_client_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            country,
            rating,
            rating_count
          )
        `)
        .eq('client_country', userCountry)

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.budget_min) {
        query = query.gte('budget_min', filters.budget_min)
      }
      if (filters?.budget_max) {
        query = query.lte('budget_max', filters.budget_max)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as OpportunityWithClient[]
    } catch (error) {
      console.error('Get opportunities error:', error)
      return []
    }
  }

  // Get single opportunity by ID
  async getOpportunity(id: string): Promise<OpportunityWithClient | null> {
    try {
      const userCountry = countryService.getUserCountry()
      
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
            rating,
            rating_count
          )
        `)
        .eq('id', id)
        .eq('client_country', userCountry)
        .single()

      if (error) {
        throw error
      }

      return data as OpportunityWithClient
    } catch (error) {
      console.error('Get opportunity error:', error)
      return null
    }
  }

  // Create new opportunity
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

      // Check if user is a client
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
          client_country: user.country,
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

  // Update opportunity
  async updateOpportunity(
    id: string,
    updates: Partial<CreateOpportunityRequest>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Check if user owns the opportunity
      const opportunity = await this.getOpportunity(id)
      if (!opportunity || opportunity.client_id !== user.id) {
        throw new Error('You can only update your own opportunities')
      }

      const { error } = await supabase
        .from('opportunities')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

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

  // Delete opportunity
  async deleteOpportunity(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Check if user owns the opportunity
      const opportunity = await this.getOpportunity(id)
      if (!opportunity || opportunity.client_id !== user.id) {
        throw new Error('You can only delete your own opportunities')
      }

      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)

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

  // Get proposals for an opportunity
  async getProposals(opportunityId: string): Promise<Proposal[]> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Check if user owns the opportunity or is the freelancer
      const opportunity = await this.getOpportunity(opportunityId)
      if (!opportunity) {
        throw new Error('Opportunity not found')
      }

      if (opportunity.client_id !== user.id) {
        // If not the client, only show user's own proposals
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('opportunity_id', opportunityId)
          .eq('freelancer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        return data || []
      }

      // If user is the client, show all proposals
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          profiles!proposals_freelancer_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            country,
            rating,
            rating_count,
            hourly_rate
          )
        `)
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Get proposals error:', error)
      return []
    }
  }

  // Create proposal
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

      // Check if user is a freelancer
      if (user.role !== 'freelancer') {
        throw new Error('Only freelancers can submit proposals')
      }

      // Check if user has enough tokens
      const tokenCost = 1
      const userBalance = await tokenService.getUserTokenBalance(user.id)
      
      if (userBalance < tokenCost) {
        throw new Error(`Insufficient tokens. Required: ${tokenCost}, Available: ${userBalance}`)
      }

      // Check if opportunity exists and is open
      const opportunity = await this.getOpportunity(request.opportunity_id)
      if (!opportunity) {
        throw new Error('Opportunity not found')
      }

      if (opportunity.status !== 'open') {
        throw new Error('Opportunity is not open for proposals')
      }

      // Check if user already submitted a proposal
      const existingProposal = await supabase
        .from('proposals')
        .select('id')
        .eq('opportunity_id', request.opportunity_id)
        .eq('freelancer_id', user.id)
        .single()

      if (existingProposal.data) {
        throw new Error('You have already submitted a proposal for this opportunity')
      }

      // Create proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          opportunity_id: request.opportunity_id,
          freelancer_id: user.id,
          cover_letter: request.cover_letter,
          proposed_budget: request.proposed_budget,
          estimated_duration: request.estimated_duration,
          status: 'pending',
        })
        .select()
        .single()

      if (proposalError) {
        throw proposalError
      }

      // Debit tokens
      const debitResult = await tokenService.debitTokens(
        user.id,
        tokenCost,
        `Proposal submission: ${opportunity.title}`,
        proposal.id
      )

      if (!debitResult.success) {
        // Rollback proposal creation
        await supabase
          .from('proposals')
          .delete()
          .eq('id', proposal.id)
        
        throw new Error(debitResult.error)
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

  // Accept proposal
  async acceptProposal(proposalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get proposal with opportunity details
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select(`
          *,
          opportunities!proposals_opportunity_id_fkey (
            id,
            client_id,
            title,
            status
          )
        `)
        .eq('id', proposalId)
        .single()

      if (proposalError || !proposal) {
        throw new Error('Proposal not found')
      }

      // Check if user owns the opportunity
      if (proposal.opportunities.client_id !== user.id) {
        throw new Error('You can only accept proposals for your own opportunities')
      }

      // Check if opportunity is still open
      if (proposal.opportunities.status !== 'open') {
        throw new Error('Opportunity is not open for proposals')
      }

      // Update proposal status
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId)

      if (updateError) {
        throw updateError
      }

      // Update opportunity status
      const { error: opportunityError } = await supabase
        .from('opportunities')
        .update({ status: 'in_progress' })
        .eq('id', proposal.opportunity_id)

      if (opportunityError) {
        throw opportunityError
      }

      // Create project
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          opportunity_id: proposal.opportunity_id,
          proposal_id: proposalId,
          client_id: user.id,
          freelancer_id: proposal.freelancer_id,
          title: proposal.opportunities.title,
          description: proposal.opportunities.title, // You might want to store the full description
          budget: proposal.proposed_budget,
          status: 'active',
        })

      if (projectError) {
        throw projectError
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

  // Reject proposal
  async rejectProposal(proposalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get proposal with opportunity details
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select(`
          *,
          opportunities!proposals_opportunity_id_fkey (
            client_id
          )
        `)
        .eq('id', proposalId)
        .single()

      if (proposalError || !proposal) {
        throw new Error('Proposal not found')
      }

      // Check if user owns the opportunity
      if (proposal.opportunities.client_id !== user.id) {
        throw new Error('You can only reject proposals for your own opportunities')
      }

      // Update proposal status
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('id', proposalId)

      if (error) {
        throw error
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

// Export singleton instance
export const opportunityService = OpportunityService.getInstance() 