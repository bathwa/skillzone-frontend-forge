
import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { countryService } from './countryService'
import { tokenService } from './tokenService'
import type { Database } from '@/integrations/supabase/types'

type Opportunity = Database['public']['Tables']['opportunities']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

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
          profiles!opportunities_client_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            country,
            rating,
            rating_count
          )
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
        query = query.eq('client_country', filters.country)
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
          client_country: user.country || 'south_africa',
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
}

export const opportunityService = OpportunityService.getInstance()
