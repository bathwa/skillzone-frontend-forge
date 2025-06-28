import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import { ADMIN_EMAILS, ADMIN_KEY } from '@/lib/constants'

// Form schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const adminKeySchema = z.object({
  adminKey: z.string().min(1, 'Admin key is required'),
})

type LoginFormData = z.infer<typeof loginSchema>
type AdminKeyFormData = z.infer<typeof adminKeySchema>

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showAdminKey, setShowAdminKey] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const adminKeyForm = useForm<AdminKeyFormData>({
    resolver: zodResolver(adminKeySchema),
    defaultValues: {
      adminKey: '',
    },
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      console.log('Login attempt for email:', data.email)
      
      // Check if admin email and key is required
      if (ADMIN_EMAILS.includes(data.email.toLowerCase())) {
        console.log('Admin email detected, showing admin key form')
        setShowAdminKey(true)
        setAdminEmail(data.email)
        setIsLoading(false)
        return
      }
      
      // Real API call to authenticate user
      console.log('Attempting regular user login...')
      const response = await apiService.login(data.email, data.password)
      
      console.log('Login response:', response)
      
      if (response.success && response.data) {
        console.log('Login successful, user data:', response.data)
        login(response.data)
        toast.success('Welcome back to SkillZone!')
        navigate('/dashboard')
      } else {
        console.error('Login failed:', response.error)
        toast.error(response.error || 'Invalid email or password. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onAdminKeySubmit = async (data: AdminKeyFormData) => {
    setIsLoading(true)
    
    try {
      // Validate admin key
      if (data.adminKey !== ADMIN_KEY) {
        toast.error('Invalid admin key. Please try again.')
        setIsLoading(false)
        return
      }
      
      // Real API call for admin authentication
      const response = await apiService.login(adminEmail, data.adminKey)
      
      if (response.success && response.data) {
        // Ensure admin role
        const adminUser = { ...response.data, role: 'admin' as const }
        login(adminUser)
        toast.success('Welcome to Admin Dashboard!')
        navigate('/admin/dashboard')
      } else {
        toast.error('Admin authentication failed. Please try again.')
      }
    } catch (error) {
      toast.error('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowAdminKey(false)
    setAdminEmail('')
    adminKeyForm.reset()
  }

  if (showAdminKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>
              Please enter the admin key to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={adminKeyForm.handleSubmit(onAdminKeySubmit)} className="space-y-4">
              <div>
                <Label htmlFor="adminKey">Admin Key</Label>
                <Input
                  id="adminKey"
                  type="password"
                  {...adminKeyForm.register('adminKey')}
                  placeholder="Enter admin key"
                  disabled={isLoading}
                />
                {adminKeyForm.formState.errors.adminKey && (
                  <p className="text-sm text-red-600 mt-1">
                    {adminKeyForm.formState.errors.adminKey.message}
                  </p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Continue'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleBackToLogin}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your SkillZone account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...loginForm.register('email')}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...loginForm.register('password')}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
