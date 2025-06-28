import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/use-toast'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this page.',
        variant: 'destructive',
      })
      navigate('/login')
      return
    }

    if (user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page.',
        variant: 'destructive',
      })
      navigate('/dashboard')
      return
    }
  }, [user, isAuthenticated, navigate, toast])

  // Show loading or nothing while checking authentication
  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return <>{children}</>
} 