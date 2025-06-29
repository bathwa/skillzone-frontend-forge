
import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { countryService } from './countryService'
import { TOKEN_PRICING, PLATFORM_FEES } from '@/lib/constants'
import type { Database } from '@/integrations/supabase/types'

type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export interface TokenPurchaseRequest {
  packageType: keyof typeof TOKEN_PRICING
  paymentMethod: 'escrow' | 'payfast' | 'paystack'
  escrowAccountId?: string
  reference?: string
}

export interface EscrowPaymentDetails {
  accountName: string
  accountNumber: string
  accountType: string
  provider?: string
  phoneNumber?: string
  amount: number
  reference: string
  instructions: string
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
    escrowDetails?: EscrowPaymentDetails
    error?: string
  }> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const pricing = this.getTokenPricing(request.packageType)
      const totalCost = this.calculateTotalCost(request.packageType)
      const userCountry = countryService.getUserCountry()

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

      // Handle different payment methods
      if (request.paymentMethod === 'escrow') {
        const escrowDetails = await this.createEscrowPayment(
          totalCost,
          transaction.id,
          userCountry
        )
        return {
          success: true,
          transactionId: transaction.id,
          escrowDetails,
        }
      }

      // TODO: Implement other payment gateways
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

  // Create escrow payment details
  private async createEscrowPayment(
    amount: number,
    transactionId: string,
    country: string
  ): Promise<EscrowPaymentDetails> {
    // Since escrow_accounts table doesn't exist, return mock data
    const reference = `TXN-${transactionId.slice(0, 8).toUpperCase()}`

    return {
      accountName: 'FreelanceHub Escrow',
      accountNumber: '1234567890',
      accountType: 'bank_account',
      provider: 'Standard Bank',
      amount,
      reference,
      instructions: `1. Transfer R${amount.toFixed(2)} to:
   Account Name: FreelanceHub Escrow
   Account Number: 1234567890
   Bank: Standard Bank
2. Use reference: ${reference}
3. Send proof of payment to support
4. Tokens will be credited within 24 hours after payment verification`,
    }
  }

  // Verify escrow payment
  async verifyEscrowPayment(
    transactionId: string,
    proofOfPayment: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('token_transactions')
        .update({
          description: `Payment verification pending. Proof: ${proofOfPayment}`,
        })
        .eq('id', transactionId)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Payment verification error:', error)
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
