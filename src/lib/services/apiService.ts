import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import {
  mapDbProfileToUserProfile,
  mapDbOpportunityToOpportunity,
  mapDbProposalToProposal,
  mapDbNotificationToNotification,
  mapDbTokenTransactionToTokenTransaction,
  mapUserProfileToDbProfile,
  mapOpportunityToDbOpportunity,
  type UserProfile,
  type Opportunity,
  type Proposal,
  type Notification,
  type TokenTransaction,
} from './typeMappers'

// Generic API response type
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Paginated response type
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'client' | 'freelancer'
  country: Database['public']['Enums']['country_code']
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  name: string
  role: 'client' | 'freelancer' | 'admin'
  country: Database['public']['Enums']['country_code'] | null
  tokens_balance: number
  subscription_tier: 'basic' | 'pro' | 'premium'
  avatar_url?: string | null
  bio?: string | null
  city?: string | null
  phone?: string | null
  website?: string | null
  hourly_rate?: number | null
  total_earnings?: number
  total_jobs_completed?: number
  rating?: number
  rating_count?: number
  is_verified?: boolean
  created_at?: string
  updated_at?: string
}

class ApiService {
  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      console.log('API Service: Attempting login for email:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Supabase auth response:', { data, error })

      if (error) {
        console.error('Supabase auth error:', error)
        return {
          data: null,
          error: error.message,
          success: false,
        }
      }

      if (!data.user) {
        console.error('No user data returned from Supabase')
        return {
          data: null,
          error: 'No user data returned',
          success: false,
        }
      }

      console.log('User authenticated, fetching profile for ID:', data.user.id)

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      console.log('Profile fetch result:', { profile, profileError })

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        return {
          data: null,
          error: 'Failed to load user profile',
          success: false,
        }
      }

      if (!profile) {
        console.error('No profile data returned')
        return {
          data: null,
          error: 'Failed to load user profile',
          success: false,
        }
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User',
        role: profile.role as 'client' | 'freelancer' | 'admin',
        country: profile.country,
        tokens_balance: profile.tokens || 0,
        subscription_tier: 'basic',
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        city: profile.city,
        phone: profile.phone,
        website: profile.website,
        hourly_rate: profile.hourly_rate,
        total_earnings: profile.total_earnings || 0,
        total_jobs_completed: profile.total_jobs_completed || 0,
        rating: profile.rating || 0,
        rating_count: profile.rating_count || 0,
        is_verified: profile.is_verified || false,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }

      console.log('Login successful, returning user:', user)
      
      return {
        data: user,
        error: null,
        success: true,
      }
    } catch (error) {
      console.error('Login method error:', error)
      return {
        data: null,
        error: 'Authentication failed',
        success: false,
      }
    }
  }

  async signup(userData: SignUpData): Promise<ApiResponse<User>> {
    try {
      console.log('API Service: Attempting signup for email:', userData.email)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      console.log('Supabase auth signup response:', { authData, authError })

      if (authError) {
        console.error('Auth signup error:', authError)
        return {
          data: null,
          error: authError.message || 'Failed to create user account',
          success: false,
        }
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        console.log('Email confirmation required')
        return {
          data: null,
          error: 'Please check your email and confirm your account before signing in.',
          success: false,
        }
      }

      if (!authData.user) {
        console.error('No user data returned from signup')
        return {
          data: null,
          error: 'Failed to create user account',
          success: false,
        }
      }

      console.log('Auth user created, waiting for profile creation for ID:', authData.user.id)

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the profile with additional data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          country: userData.country,
          tokens: 5, // Welcome bonus
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        // Continue with signup even if update fails, as basic profile should exist
      } else {
        console.log('Profile updated with additional fields')
      }

      const user: User = {
        id: authData.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        name: `${userData.first_name} ${userData.last_name}`,
        role: userData.role,
        country: userData.country,
        tokens_balance: 5,
        subscription_tier: 'basic',
      }

      console.log('Signup successful, returning user:', user)

      return {
        data: user,
        error: null,
        success: true,
      }
    } catch (error) {
      console.error('Signup method error:', error)
      return {
        data: null,
        error: 'Failed to create account',
        success: false,
      }
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: null,
      error: null,
      success: true,
    }
  }

  // Profile methods
  async getProfiles(filters?: {
    role?: 'freelancer' | 'client'
    country?: Database['public']['Enums']['country_code']
    experience_level?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<UserProfile>> {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const offset = (page - 1) * limit

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    if (filters?.country) {
      query = query.eq('country', filters.country)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      }
    }

    const profiles = data?.map(mapDbProfileToUserProfile) || []

    return {
      data: profiles,
      error: null,
      success: true,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: mapDbProfileToUserProfile(data),
      error: null,
      success: true,
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const dbUpdates = mapUserProfileToDbProfile(updates)
    
    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: mapDbProfileToUserProfile(data),
      error: null,
      success: true,
    }
  }

  // Opportunity methods
  async getOpportunities(filters?: {
    category?: string
    country?: Database['public']['Enums']['country_code']
    type?: 'standard' | 'premium'
    status?: 'active' | 'closed'
    client_id?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Opportunity>> {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const offset = (page - 1) * limit

    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.country) {
      query = query.eq('client_country', filters.country)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.status) {
      const dbStatus = filters.status === 'active' ? 'open' : 
                      filters.status === 'closed' ? 'completed' : 'in_progress'
      query = query.eq('status', dbStatus)
    }
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      }
    }

    const opportunities = data?.map(mapDbOpportunityToOpportunity) || []

    return {
      data: opportunities,
      error: null,
      success: true,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async createOpportunity(opportunityData: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Opportunity>> {
    const dbData = {
      title: opportunityData.title,
      description: opportunityData.description,
      budget_min: opportunityData.budget_min,
      budget_max: opportunityData.budget_max,
      category: opportunityData.category,
      type: opportunityData.type,
      status: 'open' as const,
      client_country: opportunityData.client_country,
      required_skills: opportunityData.skills,
      client_id: '',
    }
    
    const { data, error } = await supabase
      .from('opportunities')
      .insert([dbData])
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: mapDbOpportunityToOpportunity(data),
      error: null,
      success: true,
    }
  }

  async updateOpportunity(opportunityId: string, updates: Partial<Opportunity>): Promise<ApiResponse<Opportunity>> {
    const dbUpdates = mapOpportunityToDbOpportunity(updates)
    
    const { data, error } = await supabase
      .from('opportunities')
      .update(dbUpdates)
      .eq('id', opportunityId)
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: mapDbOpportunityToOpportunity(data),
      error: null,
      success: true,
    }
  }

  async deleteOpportunity(opportunityId: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', opportunityId)

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: null,
      error: null,
      success: true,
    }
  }

  // Proposal methods
  async getUserProposals(userId: string): Promise<ApiResponse<Proposal[]>> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('freelancer_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    const proposals = data?.map(mapDbProposalToProposal) || []

    return {
      data: proposals,
      error: null,
      success: true,
    }
  }

  async createProposal(proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Proposal>> {
    const dbData = {
      opportunity_id: proposalData.opportunity_id,
      freelancer_id: proposalData.freelancer_id,
      proposed_budget: proposalData.budget,
      estimated_duration: proposalData.delivery_time,
      cover_letter: proposalData.message,
      status: 'pending' as const,
    }
    
    const { data, error } = await supabase
      .from('proposals')
      .insert([dbData])
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: mapDbProposalToProposal(data),
      error: null,
      success: true,
    }
  }

  async updateProposalStatus(proposalId: string, status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'): Promise<ApiResponse<Proposal>> {
    const { data, error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', proposalId)
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: mapDbProposalToProposal(data),
      error: null,
      success: true,
    }
  }

  async getOpportunityProposals(opportunityId: string): Promise<ApiResponse<Proposal[]>> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    const proposals = data?.map(mapDbProposalToProposal) || []

    return {
      data: proposals,
      error: null,
      success: true,
    }
  }

  // Notification methods
  async getNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    const notifications = data?.map(mapDbNotificationToNotification) || []

    return {
      data: notifications,
      error: null,
      success: true,
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: null,
      error: null,
      success: true,
    }
  }

  // Token methods
  async getUserTokenBalance(userId: string): Promise<ApiResponse<number>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', userId)
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: data.tokens || 0,
      error: null,
      success: true,
    }
  }

  async getTokenTransactions(userId: string): Promise<ApiResponse<TokenTransaction[]>> {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    const transactions = data?.map(mapDbTokenTransactionToTokenTransaction) || []

    return {
      data: transactions,
      error: null,
      success: true,
    }
  }

  async purchaseTokens(userId: string, amount: number, packageType: string): Promise<ApiResponse<TokenTransaction>> {
    try {
      const { data: transaction, error: transactionError } = await supabase
        .from('token_transactions')
        .insert([{
          user_id: userId,
          transaction_type: 'purchase',
          amount,
          description: `Token purchase - ${packageType} package`,
        }])
        .select()
        .single()

      if (transactionError) {
        return {
          data: null,
          error: transactionError.message,
          success: false,
        }
      }

      await this.updateUserTokenBalance(userId, amount)

      return {
        data: mapDbTokenTransactionToTokenTransaction(transaction),
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: 'Failed to process token purchase',
        success: false,
      }
    }
  }

  private async updateUserTokenBalance(userId: string, amount: number): Promise<void> {
    const { data: currentBalance } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', userId)
      .single()

    const newBalance = (currentBalance?.tokens || 0) + amount

    await supabase
      .from('profiles')
      .update({ tokens: newBalance })
      .eq('id', userId)
  }

  // Admin methods
  async getAdminStats(): Promise<ApiResponse<{
    totalUsers: number
    activeFreelancers: number
    activeClients: number
    totalTransactions: number
    platformFees: number
    pendingEscrow: number
  }>> {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: activeFreelancers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'freelancer')

      const { count: activeClients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client')

      const { count: totalTransactions } = await supabase
        .from('token_transactions')
        .select('*', { count: 'exact', head: true })

      const platformFees = (totalTransactions || 0) * 0.1
      const { count: pendingEscrow } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')

      return {
        data: {
          totalUsers: totalUsers || 0,
          activeFreelancers: activeFreelancers || 0,
          activeClients: activeClients || 0,
          totalTransactions: totalTransactions || 0,
          platformFees,
          pendingEscrow: pendingEscrow || 0,
        },
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: 'Failed to load admin statistics',
        success: false,
      }
    }
  }

  async updateOpportunityStatus(opportunityId: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled'): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status })
        .eq('id', opportunityId)

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        }
      }

      return {
        data: null,
        error: null,
        success: true,
      }
    } catch (error) {
      return {
        data: null,
        error: 'Failed to update opportunity status',
        success: false,
      }
    }
  }

  // Error handling utility
  handleError(error: any): string {
    if (error?.message) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unexpected error occurred'
  }
}

// Export singleton instance
export const apiService = new ApiService()
