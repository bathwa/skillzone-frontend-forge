
import { supabase } from '@/integrations/supabase/client'
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
    limit?: number
    offset?: number
  }): Promise<{ opportunities: OpportunityWithClient[]; total: number }> {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_client_id_fkey (*)
        `, { count: 'exact' })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      } else {
        query = query.eq('status', 'open')
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      if (filters?.budget_min) {
        query = query.gte('budget_min', filters.budget_min)
      }

      if (filters?.budget_max) {
        query = query.lte('budget_max', filters.budget_max)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching opportunities:', error)
        return { opportunities: [], total: 0 }
      }

      const opportunities = (data || []).map(opp => ({
        ...opp,
        client_name: `${opp.profiles?.first_name || ''} ${opp.profiles?.last_name || ''}`.trim() || 'Anonymous Client'
      })) as OpportunityWithClient[]

      return {
        opportunities,
        total: count || 0
      }
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
      } as OpportunityWithClient
    } catch (error) {
      console.error('Error in getOpportunity:', error)
      return null
    }
  }

  async createOpportunity(request: CreateOpportunityRequest): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          title: request.title,
          description: request.description,
          category: request.category,
          budget_min: request.budget_min,
          budget_max: request.budget_max,
          type: request.type,
          deadline: request.deadline,
          required_skills: request.required_skills,
          client_id: '', // This should be set by the caller
          client_country: 'zimbabwe' // Default, should be set by the caller
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating opportunity:', error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    } catch (error) {
      console.error('Error in createOpportunity:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateOpportunity(id: string, updates: Partial<CreateOpportunityRequest>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating opportunity:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateOpportunity:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteOpportunity(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting opportunity:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in deleteOpportunity:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getProposals(opportunityId: string): Promise<Proposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
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

  async createProposal(request: CreateProposalRequest): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert({
          opportunity_id: request.opportunity_id,
          cover_letter: request.cover_letter,
          proposed_budget: request.proposed_budget,
          estimated_duration: request.estimated_duration,
          freelancer_id: '' // This should be set by the caller
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating proposal:', error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    } catch (error) {
      console.error('Error in createProposal:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async acceptProposal(proposalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId)

      if (error) {
        console.error('Error accepting proposal:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in acceptProposal:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async rejectProposal(proposalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'rejected' })
        .eq('id', proposalId)

      if (error) {
        console.error('Error rejecting proposal:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in rejectProposal:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export const opportunityService = OpportunityService.getInstance()
