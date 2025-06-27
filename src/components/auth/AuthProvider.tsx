
import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/integrations/supabase/client'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        await checkAuth()
      }
    )

    return () => subscription.unsubscribe()
  }, [checkAuth])

  return <>{children}</>
}
