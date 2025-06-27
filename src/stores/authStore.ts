
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  isAuthenticated: boolean
  user: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, userData: { first_name?: string; last_name?: string; role?: 'freelancer' | 'client' }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: true,
      
      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
            
          set({
            isAuthenticated: true,
            user: profile,
            loading: false,
          })
        }
      },
      
      signup: async (email: string, password: string, userData) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: userData.first_name,
              last_name: userData.last_name,
              role: userData.role || 'freelancer',
            },
          },
        })
        
        if (error) throw error
        
        if (data.user) {
          // The profile will be created automatically by the trigger
          // Wait a moment and then fetch it
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user!.id)
              .single()
              
            set({
              isAuthenticated: true,
              user: profile,
              loading: false,
            })
          }, 1000)
        }
      },
      
      logout: async () => {
        await supabase.auth.signOut()
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
        })
      },
      
      updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get()
        if (!user) throw new Error('No user logged in')
        
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single()
          
        if (error) throw error
        
        set({
          user: data,
        })
      },
      
      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
              
            set({
              isAuthenticated: true,
              user: profile,
              loading: false,
            })
          } else {
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
            })
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
          })
        }
      },
    }),
    {
      name: 'skillzone-auth',
    }
  )
)

// Initialize auth check
useAuthStore.getState().checkAuth()
