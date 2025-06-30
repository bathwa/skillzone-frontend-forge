import type { Database } from '@/integrations/supabase/types'

// Database types
type DbProfile = Database['public']['Tables']['profiles']['Row']
type DbOpportunity = Database['public']['Tables']['opportunities']['Row']
type DbProposal = Database['public']['Tables']['proposals']['Row']
type DbNotification = Database['public']['Tables']['notifications']['Row']
type DbTokenTransaction = Database['public']['Tables']['token_transactions']['Row']

// Frontend types (from existing interfaces)
export interface UserProfile {
  id: string
  user_id: string
  name: string
  first_name: string
  last_name: string
  email: string
  role: 'client' | 'freelancer' | 'admin'
  country: Database['public']['Enums']['country_code']
  tokens_balance: number
  subscription_tier: 'basic' | 'pro' | 'premium'
  avatar_url?: string
  bio?: string
  city?: string
  website?: string
  hourly_rate?: number
  rating?: number
  reviews_count?: number
  completed_projects?: number
  verified?: boolean
  online_status?: 'online' | 'offline'
  experience_level?: 'junior' | 'mid' | 'senior' | 'expert'
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  type: 'standard' | 'premium'
  status: 'active' | 'closed' | 'in_progress'
  client_country: Database['public']['Enums']['country_code']
  skills: string[]
  posted_at: string
  proposals_count: number
  created_at: string
  updated_at: string
  client_name?: string
  client_id?: string
}

export interface Proposal {
  id: string
  opportunity_id: string
  freelancer_id: string
  client_id: string
  budget: number
  proposed_budget?: number
  delivery_time: number
  estimated_duration?: number
  message: string
  cover_letter?: string
  status: 'pending' | 'accepted' | 'rejected'
  submitted_at: string
  created_at: string
  updated_at: string
  freelancer?: {
    name: string
    avatar_url?: string
    rating: number
    country: Database['public']['Enums']['country_code']
  }
}

export interface Notification {
  id: string
  user_id: string
  type: 'proposal_received' | 'proposal_accepted' | 'proposal_rejected' | 'message_received' | 'project_completed' | 'token_purchase' | 'system'
  title: string
  message: string
  read_at?: string
  is_read?: boolean
  created_at: string
}

export interface TokenTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'spend' | 'bonus' | 'refund'
  amount: number
  balance_after?: number
  description: string
  reference?: string
  created_at: string
}

// Type mappers
export const mapDbProfileToUserProfile = (dbProfile: DbProfile): UserProfile => {
  return {
    id: dbProfile.id,
    user_id: dbProfile.id, // In our schema, id is the user_id
    name: `${dbProfile.first_name || ''} ${dbProfile.last_name || ''}`.trim() || 'Unknown User',
    first_name: dbProfile.first_name || '',
    last_name: dbProfile.last_name || '',
    email: dbProfile.email,
    role: dbProfile.role,
    country: dbProfile.country || 'south_africa',
    tokens_balance: dbProfile.tokens || 0,
    subscription_tier: 'basic', // Default value, would need to be calculated based on tokens
    avatar_url: dbProfile.avatar_url || undefined,
    bio: dbProfile.bio || undefined,
    city: dbProfile.city || undefined,
    website: dbProfile.website || undefined,
    hourly_rate: dbProfile.hourly_rate || undefined,
    rating: dbProfile.rating || undefined,
    reviews_count: dbProfile.rating_count || undefined,
    completed_projects: dbProfile.total_jobs_completed || undefined,
    verified: dbProfile.is_verified || undefined,
    online_status: 'offline', // Default value, would need real-time status
    experience_level: 'mid', // Default value
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
  }
}

export const mapDbOpportunityToOpportunity = (dbOpportunity: DbOpportunity): Opportunity => {
  return {
    id: dbOpportunity.id,
    title: dbOpportunity.title,
    description: dbOpportunity.description,
    budget_min: dbOpportunity.budget_min || 0,
    budget_max: dbOpportunity.budget_max || 0,
    category: dbOpportunity.category,
    type: dbOpportunity.type,
    status: mapOpportunityStatus(dbOpportunity.status),
    client_country: dbOpportunity.client_country,
    skills: dbOpportunity.required_skills || [],
    posted_at: dbOpportunity.created_at,
    proposals_count: dbOpportunity.proposals_count || 0,
    created_at: dbOpportunity.created_at,
    updated_at: dbOpportunity.updated_at,
    client_id: dbOpportunity.client_id,
  }
}

export const mapDbProposalToProposal = (dbProposal: DbProposal): Proposal => {
  return {
    id: dbProposal.id,
    opportunity_id: dbProposal.opportunity_id,
    freelancer_id: dbProposal.freelancer_id,
    client_id: '', // Would need to be fetched from opportunity
    budget: dbProposal.proposed_budget,
    proposed_budget: dbProposal.proposed_budget,
    delivery_time: dbProposal.estimated_duration || 0,
    estimated_duration: dbProposal.estimated_duration || 0,
    message: dbProposal.cover_letter,
    cover_letter: dbProposal.cover_letter,
    status: mapProposalStatus(dbProposal.status),
    submitted_at: dbProposal.created_at,
    created_at: dbProposal.created_at,
    updated_at: dbProposal.updated_at,
    freelancer: undefined, // Optional field
  }
}

export const mapDbNotificationToNotification = (dbNotification: DbNotification): Notification => {
  return {
    id: dbNotification.id,
    user_id: dbNotification.user_id,
    type: mapNotificationType(dbNotification.type),
    title: dbNotification.title,
    message: dbNotification.message,
    read_at: dbNotification.is_read ? dbNotification.created_at : undefined,
    is_read: dbNotification.is_read || false,
    created_at: dbNotification.created_at,
  }
}

export const mapDbTokenTransactionToTokenTransaction = (dbTransaction: DbTokenTransaction): TokenTransaction => {
  return {
    id: dbTransaction.id,
    user_id: dbTransaction.user_id,
    type: mapTransactionType(dbTransaction.transaction_type),
    amount: dbTransaction.amount,
    balance_after: 0, // Default value since it's optional in DB but required in interface
    description: dbTransaction.description || '',
    created_at: dbTransaction.created_at,
  }
}

// Helper functions for status mapping
const mapOpportunityStatus = (status: Database['public']['Enums']['opportunity_status']): 'active' | 'closed' | 'in_progress' => {
  switch (status) {
    case 'open':
      return 'active'
    case 'in_progress':
      return 'in_progress'
    case 'completed':
    case 'cancelled':
      return 'closed'
    default:
      return 'active'
  }
}

const mapProposalStatus = (status: Database['public']['Enums']['proposal_status']): 'pending' | 'accepted' | 'rejected' => {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'accepted':
      return 'accepted'
    case 'rejected':
    case 'withdrawn':
      return 'rejected'
    default:
      return 'pending'
  }
}

const mapNotificationType = (type: string): Notification['type'] => {
  switch (type) {
    case 'proposal_received':
    case 'proposal_accepted':
    case 'proposal_rejected':
    case 'message_received':
    case 'project_completed':
    case 'token_purchase':
    case 'system':
      return type as Notification['type']
    default:
      return 'system'
  }
}

const mapTransactionType = (type: string): TokenTransaction['type'] => {
  switch (type) {
    case 'purchase':
    case 'spend':
    case 'bonus':
    case 'refund':
      return type as TokenTransaction['type']
    default:
      return 'spend'
  }
}

// Reverse mappers (frontend to database)
export const mapUserProfileToDbProfile = (profile: Partial<UserProfile>): Partial<DbProfile> => {
  return {
    id: profile.user_id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    role: profile.role,
    country: profile.country,
    tokens: profile.tokens_balance,
    avatar_url: profile.avatar_url || null,
    bio: profile.bio || null,
    city: profile.city || null,
    website: profile.website || null,
    hourly_rate: profile.hourly_rate || null,
    rating: profile.rating || null,
    rating_count: profile.reviews_count || null,
    total_jobs_completed: profile.completed_projects || null,
    is_verified: profile.verified || null,
    experience_level: profile.experience_level || null,
  }
}

export const mapOpportunityToDbOpportunity = (opportunity: Partial<Opportunity>): Partial<DbOpportunity> => {
  const result: Partial<DbOpportunity> = {}
  
  if (opportunity.title !== undefined) result.title = opportunity.title
  if (opportunity.description !== undefined) result.description = opportunity.description
  if (opportunity.budget_min !== undefined) result.budget_min = opportunity.budget_min
  if (opportunity.budget_max !== undefined) result.budget_max = opportunity.budget_max
  if (opportunity.category !== undefined) result.category = opportunity.category
  if (opportunity.type !== undefined) result.type = opportunity.type
  if (opportunity.status !== undefined) result.status = mapOpportunityStatusToDb(opportunity.status)
  if (opportunity.client_country !== undefined) result.client_country = opportunity.client_country
  if (opportunity.skills !== undefined) result.required_skills = opportunity.skills
  
  return result
}

const mapOpportunityStatusToDb = (status?: 'active' | 'closed' | 'in_progress'): Database['public']['Enums']['opportunity_status'] => {
  switch (status) {
    case 'active':
      return 'open'
    case 'in_progress':
      return 'in_progress'
    case 'closed':
      return 'completed'
    default:
      return 'open'
  }
}
