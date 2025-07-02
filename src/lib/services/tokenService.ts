
import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { TOKEN_PRICING, PLATFORM_FEES } from '@/lib/constants'
import type { Database } from '@/integrations/supabase/types'

type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']

export interface TokenPurchaseRequest {
  packageType: keyof typeof TOKEN_PRICING
  paymentMethod: 'payfast' | 'paystack'
  reference?: string
}

export class TokenService {
  private static instance: TokenService

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService()
    }
    return TokenService.instance
  }

  // Get token pricing for a package
  getTokenPricing(packageType: keyof typeof TOKEN_PRICING) {
    return TOKEN_PRICING[packageType]
  }

  // Get all token packages
  getAllTokenPackages() {
    return Object.entries(TOKEN_PRICING).map(([key, value]) => ({
      id: key,
      ...value,
    }))
  }

  // Calculate total cost including fees
  calculateTotalCost(packageType: keyof typeof TOKEN_PRICING): number {
    const pricing = this.getTokenPricing(packageType)
    const fee = pricing.price_usd * PLATFORM_FEES.token_purchase
    return pricing.price_usd + fee
  }

  // Create token purchase request
  async createTokenPurchase(request: TokenPurchaseRequest): Promise<{
    success: boolean
    transactionId?: string
    error?: string
  }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const pricing = this.getTokenPricing(request.packageType)

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: pricing.tokens,
          transaction_type: 'purchase',
          description: `Token purchase: ${pricing.description}`,
          related_id: null,
        })
        .select()
        .single()

      if (transactionError) {
        throw transactionError
      }

      // TODO: Implement payment gateways
      return {
        success: false,
        error: 'Payment method not implemented yet',
      }
    } catch (error) {
      console.error('Token purchase error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Credit tokens to user (admin function)
  async creditTokens(
    userId: string,
    amount: number,
    reason: string,
    relatedId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount,
          transaction_type: 'credit',
          description: reason,
          related_id: relatedId,
        })

      if (transactionError) {
        throw transactionError
      }

      // Update user's token balance manually
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', userId)
        .single()

      if (profileFetchError) {
        throw profileFetchError
      }

      const newBalance = (profile.tokens || 0) + amount

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tokens: newBalance })
        .eq('id', userId)

      if (profileError) {
        throw profileError
      }

      return { success: true }
    } catch (error) {
      console.error('Credit tokens error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Debit tokens from user
  async debitTokens(
    userId: string,
    amount: number,
    reason: string,
    relatedId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user has enough tokens
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', userId)
        .single()

      if (profileError) {
        throw profileError
      }

      if ((profile.tokens || 0) < amount) {
        throw new Error('Insufficient tokens')
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: -amount,
          transaction_type: 'debit',
          description: reason,
          related_id: relatedId,
        })

      if (transactionError) {
        throw transactionError
      }

      // Update user's token balance manually
      const newBalance = (profile.tokens || 0) - amount

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tokens: newBalance })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      return { success: true }
    } catch (error) {
      console.error('Debit tokens error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Get user's token transactions
  async getUserTokenTransactions(userId: string): Promise<TokenTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Get token transactions error:', error)
      return []
    }
  }

  // Get user's current token balance
  async getUserTokenBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return data.tokens || 0
    } catch (error) {
      console.error('Get token balance error:', error)
      return 0
    }
  }
}

// Export singleton instance
export const tokenService = TokenService.getInstance()
