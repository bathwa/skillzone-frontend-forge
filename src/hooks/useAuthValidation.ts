
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/integrations/supabase/client'

export const useAuthValidation = () => {
  const { user, session, isAuthenticated } = useAuthStore()
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    validateAuthState()
  }, [user, session, isAuthenticated])

  const validateAuthState = async () => {
    setIsValidating(true)
    setValidationError(null)

    try {
      // Check if we have a session but no user, or vice versa
      if (session && !user) {
        setValidationError('Authentication state mismatch: session exists but no user data')
        return
      }

      if (user && !session) {
        setValidationError('Authentication state mismatch: user exists but no session')
        return
      }

      // If we think we're authenticated, verify with Supabase
      if (isAuthenticated && user) {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          setValidationError(`Session validation error: ${error.message}`)
          return
        }

        if (!currentSession) {
          setValidationError('Session expired or invalid')
          return
        }

        // Verify user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (profileError) {
          setValidationError(`Profile validation error: ${profileError.message}`)
          return
        }

        if (!profile) {
          setValidationError('User profile not found')
          return
        }
      }

    } catch (error: any) {
      setValidationError(`Validation error: ${error.message}`)
    } finally {
      setIsValidating(false)
    }
  }

  return {
    isValidating,
    validationError,
    validateAuthState
  }
}
