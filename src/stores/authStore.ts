import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

// Extended user type that matches our frontend expectations
interface User extends Profile {
  name: string // Computed from first_name + last_name
  tokens_balance: number // Maps to tokens field
  subscription_tier: 'basic' | 'pro' | 'premium' // Default subscription handling
}

interface AuthState {
  user: User | null
  session: any
  isAuthenticated: boolean
  login: (userData: Partial<User>) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  checkAuth: () => Promise<void>
}

// Helper function to transform profile to user
const transformProfileToUser = (profile: Profile): User => {
  return {
    ...profile,
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User',
    tokens_balance: profile.tokens || 0,
    subscription_tier: 'basic' as const, // Default subscription tier
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,

      login: (userData: Partial<User>) => {
        const user = {
          id: userData.id || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Anonymous User',
          role: userData.role || 'freelancer',
          country: userData.country || null,
          tokens: typeof userData.tokens === 'number' ? userData.tokens : (userData.tokens_balance || 5),
          tokens_balance: typeof userData.tokens === 'number' ? userData.tokens : (userData.tokens_balance || 5),
          subscription_tier: userData.subscription_tier || 'basic',
          avatar_url: userData.avatar_url || null,
          bio: userData.bio || null,
          city: userData.city || null,
          phone: userData.phone || null,
          website: userData.website || null,
          hourly_rate: typeof userData.hourly_rate === 'number' ? userData.hourly_rate : null,
          total_earnings: typeof userData.total_earnings === 'number' ? userData.total_earnings : 0,
          total_jobs_completed: typeof userData.total_jobs_completed === 'number' ? userData.total_jobs_completed : 0,
          rating: typeof userData.rating === 'number' ? userData.rating : 0,
          rating_count: typeof userData.rating_count === 'number' ? userData.rating_count : 0,
          is_verified: typeof userData.is_verified === 'boolean' ? userData.is_verified : false,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
        } as User

        set({
          user,
          isAuthenticated: true,
        })
      },

      logout: () => {
        supabase.auth.signOut()
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Fetch user profile from database
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!error && profile) {
              const user = transformProfileToUser(profile)
              set({
                user,
                session,
                isAuthenticated: true,
              })
            } else {
              // Profile doesn't exist yet, create basic user from auth data
              const user = {
                id: session.user.id,
                email: session.user.email || '',
                first_name: session.user.user_metadata?.first_name || '',
                last_name: session.user.user_metadata?.last_name || '',
                name: session.user.user_metadata?.name || 'Anonymous User',
                role: 'freelancer' as const,
                country: null,
                tokens: 5,
                tokens_balance: 5,
                subscription_tier: 'basic' as const,
                avatar_url: null,
                bio: null,
                city: null,
                phone: null,
                website: null,
                hourly_rate: null,
                total_earnings: 0,
                total_jobs_completed: 0,
                rating: 0,
                rating_count: 0,
                is_verified: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as User

              set({
                user,
                session,
                isAuthenticated: true,
              })
            }
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
            })
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
