import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

// Extended user type that combines Supabase user with profile data
interface ExtendedUser extends Profile {
  name: string // Computed from first_name + last_name
  tokens_balance: number // Maps to tokens field
  subscription_tier: 'basic' | 'pro' | 'premium' // Default subscription handling
}

interface AuthState {
  user: ExtendedUser | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, userData: { first_name: string; last_name: string; role: 'client' | 'freelancer'; country: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUser: (userData: Partial<ExtendedUser>) => void
  checkAuth: () => Promise<void>
}

// Helper function to transform profile to extended user
const transformProfileToUser = (profile: Profile): ExtendedUser => {
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
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          console.log('Attempting login with email:', email)
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            console.error('Login error:', error)
            return { success: false, error: error.message }
          }

          if (data.user && data.session) {
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profileError) {
              console.error('Profile fetch error:', profileError)
              return { success: false, error: 'Failed to load user profile' }
            }

            const extendedUser = transformProfileToUser(profile)
            set({
              user: extendedUser,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            })

            console.log('Login successful:', extendedUser)
            return { success: true }
          }

          return { success: false, error: 'Login failed' }
        } catch (error) {
          console.error('Login exception:', error)
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      signup: async (email: string, password: string, userData) => {
        try {
          console.log('Attempting signup with email:', email)
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role,
                country: userData.country,
              },
              emailRedirectTo: `${window.location.origin}/dashboard`
            }
          })

          if (error) {
            console.error('Signup error:', error)
            return { success: false, error: error.message }
          }

          if (data.user) {
            console.log('Signup successful, user created:', data.user.id)
            // Wait for the DB trigger to create the profile
            await new Promise(res => setTimeout(res, 1200))
            // Fetch the profile to ensure role is set
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()
            if (profileError) {
              console.error('Profile fetch after signup error:', profileError)
              return { success: true, error: 'Account created, but profile not found. Please contact support.' }
            }
            const extendedUser = transformProfileToUser(profile)
            set({
              user: extendedUser,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            })
            return { success: true }
          }

          return { success: false, error: 'Signup failed' }
        } catch (error) {
          console.error('Signup exception:', error)
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error) {
          console.error('Logout error:', error)
        }
      },

      updateUser: (userData: Partial<ExtendedUser>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true })
          
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Fetch user profile from database
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!error && profile) {
              const extendedUser = transformProfileToUser(profile)
              set({
                user: extendedUser,
                session,
                isAuthenticated: true,
                isLoading: false,
              })
            } else {
              console.error('Profile fetch error:', error)
              set({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false,
              })
            }
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist session as it should come from Supabase
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
