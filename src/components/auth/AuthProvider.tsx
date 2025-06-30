
import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/integrations/supabase/client'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // Check auth immediately on mount
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        // Use setTimeout to avoid potential recursion issues
        setTimeout(() => {
          checkAuth()
        }, 0)
      }
    )

    return () => subscription.unsubscribe()
  }, [checkAuth])

  return <>{children}</>
}
