
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tokenService } from '@/lib/services/tokenService'
import { useAuthStore } from '@/stores/authStore'
import type { Database } from '@/integrations/supabase/types'

type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']

export interface TokenPurchaseRequest {
  packageType: keyof typeof import('@/lib/constants').TOKEN_PRICING
  paymentMethod: 'payfast' | 'paystack'
  reference?: string
}

// Get user's token balance
export const useTokenBalance = () => {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['token-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0
      return await tokenService.getUserTokenBalance(user.id)
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get user's token transactions
export const useTokenTransactions = () => {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['token-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      return await tokenService.getUserTokenTransactions(user.id)
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get token pricing
export const useTokenPricing = () => {
  return useQuery({
    queryKey: ['token-pricing'],
    queryFn: () => tokenService.getAllTokenPackages(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

// Create token purchase
export const useCreateTokenPurchase = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (request: TokenPurchaseRequest) => {
      return await tokenService.createTokenPurchase(request)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate token balance and transactions
        queryClient.invalidateQueries({ queryKey: ['token-balance', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['token-transactions', user?.id] })
        
        // Update user's token balance in auth store
        if (user) {
          // This would need to be implemented in the auth store
          // For now, we'll just invalidate the queries
        }
      }
    },
  })
}

// Credit tokens (admin function)
export const useCreditTokens = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, amount, reason, relatedId }: {
      userId: string
      amount: number
      reason: string
      relatedId?: string
    }) => {
      return await tokenService.creditTokens(userId, amount, reason, relatedId)
    },
    onSuccess: (result, { userId }) => {
      if (result.success) {
        // Invalidate token balance and transactions for the user
        queryClient.invalidateQueries({ queryKey: ['token-balance', userId] })
        queryClient.invalidateQueries({ queryKey: ['token-transactions', userId] })
      }
    },
  })
}

// Debit tokens
export const useDebitTokens = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ amount, reason, relatedId }: {
      amount: number
      reason: string
      relatedId?: string
    }) => {
      if (!user?.id) throw new Error('User not authenticated')
      return await tokenService.debitTokens(user.id, amount, reason, relatedId)
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate token balance and transactions
        queryClient.invalidateQueries({ queryKey: ['token-balance', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['token-transactions', user?.id] })
      }
    },
  })
}

// Calculate total cost for a package
export const useTokenCost = (packageType: keyof typeof import('@/lib/constants').TOKEN_PRICING | null) => {
  return useQuery({
    queryKey: ['token-cost', packageType],
    queryFn: () => {
      if (!packageType) return 0
      return tokenService.calculateTotalCost(packageType)
    },
    enabled: !!packageType,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

// Get token pricing for a specific package
export const useTokenPackagePricing = (packageType: keyof typeof import('@/lib/constants').TOKEN_PRICING | null) => {
  return useQuery({
    queryKey: ['token-package-pricing', packageType],
    queryFn: () => {
      if (!packageType) return null
      return tokenService.getTokenPricing(packageType)
    },
    enabled: !!packageType,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
} 
