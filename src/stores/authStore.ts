
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'service_provider' | 'admin' | 'super_admin'
  country: string
  avatar_url?: string
  bio?: string
  skills?: string[]
  contact_number?: string
  tokens_balance?: number
  subscription_tier?: 'basic' | 'pro' | 'elite'
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (user: User) => 
        set(() => ({ 
          isAuthenticated: true, 
          user 
        })),
      logout: () => 
        set(() => ({ 
          isAuthenticated: false, 
          user: null 
        })),
      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
    }),
    {
      name: 'skillzone-auth',
    }
  )
)
