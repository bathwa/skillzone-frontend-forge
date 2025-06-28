import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

// Types for API responses
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// User types
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  name: string
  role: 'admin' | 'client' | 'freelancer'
  country: Database['public']['Enums']['country_code']
  tokens_balance: number
  subscription_tier: 'basic' | 'pro' | 'enterprise'
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Opportunity types
export interface Opportunity {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  type: 'standard' | 'premium'
  client_id: string
  client_country: Database['public']['Enums']['country_code']
  skills: string[]
  status: 'active' | 'closed' | 'in_progress'
  proposals_count: number
  posted_at: string
  created_at: string
  updated_at: string
}

// Profile types
export interface Profile {
  id: string
  user_id: string
  role: 'freelancer' | 'client'
  bio?: string
  hourly_rate?: number
  experience_level: 'junior' | 'mid' | 'senior' | 'expert'
  rating: number
  reviews_count: number
  completed_projects: number
  verified: boolean
  online_status: 'online' | 'offline'
  country: Database['public']['Enums']['country_code']
  created_at: string
  updated_at: string
}

// Proposal types
export interface Proposal {
  id: string
  opportunity_id: string
  freelancer_id: string
  client_id: string
  budget: number
  delivery_time: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  submitted_at: string
  created_at: string
  updated_at: string
}

// Token transaction types
export interface TokenTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'spend' | 'refund' | 'bonus'
  amount: number
  balance_after: number
  description: string
  reference?: string
  created_at: string
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  type: 'proposal_received' | 'proposal_accepted' | 'proposal_rejected' | 'message_received' | 'project_completed' | 'token_purchase' | 'system'
  title: string
  message: string
  read_at?: string
  created_at: string
}

// API Service Class
export class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:54321'
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          }),
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        data: result.data || result,
        error: null,
        success: true,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      }
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<UserProfile>> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    // Get user profile
    const profileResponse = await this.getUserProfile(data.user.id)
    return profileResponse
  }

  async signup(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    role: 'client' | 'freelancer'
    country: Database['public']['Enums']['country_code']
  }): Promise<ApiResponse<UserProfile>> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          country: userData.country,
        }
      }
    })

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    // Create user profile
    const profileResponse = await this.createUserProfile({
      user_id: data.user!.id,
      ...userData,
    })

    return profileResponse
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

  // User profile methods
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: data as UserProfile,
      error: null,
      success: true,
    }
  }

  async createUserProfile(profileData: {
    user_id: string
    first_name: string
    last_name: string
    role: 'client' | 'freelancer'
    country: Database['public']['Enums']['country_code']
  }): Promise<ApiResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        user_id: profileData.user_id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        name: `${profileData.first_name} ${profileData.last_name}`,
        role: profileData.role,
        country: profileData.country,
        tokens_balance: 5, // Welcome bonus
        subscription_tier: 'basic',
      }])
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
      data: data as UserProfile,
      error: null,
      success: true,
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
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
      data: data as UserProfile,
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
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Opportunity>> {
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
      query = query.eq('status', filters.status)
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
        pagination: { page, limit, total: 0, totalPages: 0 }
      }
    }

    return {
      data: data as Opportunity[],
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
    const { data, error } = await supabase
      .from('opportunities')
      .insert([opportunityData])
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
      data: data as Opportunity,
      error: null,
      success: true,
    }
  }

  async getOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: data as Opportunity,
      error: null,
      success: true,
    }
  }

  // Profile/Skill provider methods
  async getProfiles(filters?: {
    role?: 'freelancer' | 'client'
    country?: Database['public']['Enums']['country_code']
    experience_level?: 'junior' | 'mid' | 'senior' | 'expert'
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Profile>> {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    if (filters?.country) {
      query = query.eq('country', filters.country)
    }
    if (filters?.experience_level) {
      query = query.eq('experience_level', filters.experience_level)
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
        pagination: { page, limit, total: 0, totalPages: 0 }
      }
    }

    return {
      data: data as Profile[],
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

  // Proposal methods
  async createProposal(proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Proposal>> {
    const { data, error } = await supabase
      .from('proposals')
      .insert([proposalData])
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
      data: data as Proposal,
      error: null,
      success: true,
    }
  }

  async getUserProposals(userId: string): Promise<ApiResponse<Proposal[]>> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .or(`freelancer_id.eq.${userId},client_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: data as Proposal[],
      error: null,
      success: true,
    }
  }

  // Token methods
  async purchaseTokens(userId: string, amount: number, packageType: string): Promise<ApiResponse<TokenTransaction>> {
    const { data, error } = await supabase
      .from('token_transactions')
      .insert([{
        user_id: userId,
        type: 'purchase',
        amount,
        description: `Token purchase - ${packageType} package`,
        reference: `PURCHASE_${Date.now()}`,
      }])
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    // Update user token balance
    await this.updateUserTokenBalance(userId, amount)

    return {
      data: data as TokenTransaction,
      error: null,
      success: true,
    }
  }

  async getUserTokenBalance(userId: string): Promise<ApiResponse<number>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('tokens_balance')
      .eq('user_id', userId)
      .single()

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      }
    }

    return {
      data: data.tokens_balance,
      error: null,
      success: true,
    }
  }

  private async updateUserTokenBalance(userId: string, amount: number): Promise<void> {
    await supabase
      .from('profiles')
      .update({ tokens_balance: supabase.rpc('increment', { amount }) })
      .eq('user_id', userId)
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

    return {
      data: data as Notification[],
      error: null,
      success: true,
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
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

  // Admin methods
  async getAdminStats(): Promise<ApiResponse<{
    totalUsers: number
    activeFreelancers: number
    activeClients: number
    totalTransactions: number
    platformFees: number
    pendingEscrow: number
  }>> {
    // This would typically call admin-specific endpoints
    // For now, return mock data structure
    return {
      data: {
        totalUsers: 1234,
        activeFreelancers: 856,
        activeClients: 378,
        totalTransactions: 45678,
        platformFees: 4567,
        pendingEscrow: 12345,
      },
      error: null,
      success: true,
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