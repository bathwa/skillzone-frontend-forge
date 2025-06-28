import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { apiService } from '@/lib/services/apiService'
import { supabase } from '@/integrations/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const adminKeySchema = z.object({
  adminKey: z.string().min(1, 'Admin key is required'),
})

type LoginFormData = z.infer<typeof loginSchema>
type AdminKeyFormData = z.infer<typeof adminKeySchema>

// Admin email detection
const ADMIN_EMAILS = [
  import.meta.env.VITE_ADMIN_EMAIL_1 || 'abathwabiz@gmail.com', 
  import.meta.env.VITE_ADMIN_EMAIL_2 || 'admin@abathwa.com'
]
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'vvv.ndev'

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showAdminKey, setShowAdminKey] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerAdminKey,
    handleSubmit: handleAdminKeySubmit,
    formState: { errors: adminKeyErrors },
  } = useForm<AdminKeyFormData>({
    resolver: zodResolver(adminKeySchema),
  })

  const watchedEmail = watch('email')

  // Check if email is admin email
  React.useEffect(() => {
    if (watchedEmail && ADMIN_EMAILS.includes(watchedEmail.toLowerCase())) {
      setShowAdminKey(true)
      setAdminEmail(watchedEmail)
    } else {
      setShowAdminKey(false)
      setAdminEmail('')
    }
  }, [watchedEmail])

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
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 10000) // 10 second timeout
      })
      
      // Real API call to authenticate user
      console.log('Attempting regular user login...')
      const loginPromise = apiService.login(data.email, data.password)
      
      const response = await Promise.race([loginPromise, timeoutPromise]) as any
      
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
      if (error instanceof Error && error.message === 'Login timeout') {
        toast.error('Login timed out. Please try again.')
      } else {
        toast.error('Authentication failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Test function to check Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...')
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      console.log('Supabase test result:', { data, error })
      if (error) {
        toast.error(`Supabase connection failed: ${error.message}`)
      } else {
        toast.success('Supabase connection successful!')
      }
    } catch (error) {
      console.error('Supabase test error:', error)
      toast.error('Supabase connection test failed')
    }
  }

  // Test function to check profiles table
  const testProfilesTable = async () => {
    try {
      console.log('Testing profiles table...')
      const { data, error } = await supabase.from('profiles').select('*').limit(5)
      console.log('Profiles table result:', { data, error })
      if (error) {
        toast.error(`Profiles table error: ${error.message}`)
      } else {
        toast.success(`Found ${data?.length || 0} profiles in database`)
        console.log('Profiles found:', data)
      }
    } catch (error) {
      console.error('Profiles table test error:', error)
      toast.error('Profiles table test failed')
    }
  }

  // Test function for simple login without profile fetch
  const testSimpleLogin = async () => {
    try {
      console.log('Testing simple login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })
      console.log('Simple login result:', { data, error })
      if (error) {
        toast.error(`Simple login failed: ${error.message}`)
      } else {
        toast.success('Simple login successful!')
      }
    } catch (error) {
      console.error('Simple login error:', error)
      toast.error('Simple login test failed')
    }
  }

  // Test function to fix existing profiles without roles
  const testFixProfiles = async () => {
    try {
      console.log('Testing profile fix...')
      
      // First, let's see what profiles exist
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(10)
      
      console.log('Existing profiles:', profiles)
      
      if (profilesError) {
        toast.error(`Failed to fetch profiles: ${profilesError.message}`)
        return
      }
      
      // Find profiles without roles
      const profilesWithoutRoles = profiles?.filter(p => !p.role) || []
      console.log('Profiles without roles:', profilesWithoutRoles)
      
      if (profilesWithoutRoles.length === 0) {
        toast.success('All profiles have roles!')
        return
      }
      
      // Update profiles without roles
      for (const profile of profilesWithoutRoles) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'freelancer',
            tokens: profile.tokens || 5,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
        
        if (updateError) {
          console.error(`Failed to update profile ${profile.id}:`, updateError)
        } else {
          console.log(`Updated profile ${profile.id} with role freelancer`)
        }
      }
      
      toast.success(`Fixed ${profilesWithoutRoles.length} profiles without roles`)
    } catch (error) {
      console.error('Profile fix test error:', error)
      toast.error('Profile fix test failed')
    }
  }

  // Test function to create a test user
  const testCreateUser = async () => {
    try {
      console.log('Testing user creation...')
      
      const testEmail = `test${Date.now()}@example.com`
      const testPassword = 'password123'
      
      console.log('Creating test user with email:', testEmail)
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            role: 'client'
          }
        }
      })
      
      console.log('User creation result:', { data, error })
      
      if (error) {
        toast.error(`User creation failed: ${error.message}`)
      } else {
        toast.success('Test user created! Check console for details.')
        
        // Wait a moment then check if profile was created
        setTimeout(async () => {
          if (data.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            console.log('Profile check result:', { profile, profileError })
            
            if (profile) {
              toast.success(`Profile created with role: ${profile.role || 'NO ROLE'}`)
            } else {
              toast.error('No profile found after user creation')
            }
          }
        }, 2000)
      }
    } catch (error) {
      console.error('User creation test error:', error)
      toast.error('User creation test failed')
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

  if (showAdminKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold">Admin Authentication</CardTitle>
            </div>
            <CardDescription>
              Please enter your admin key to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminKeySubmit(onAdminKeySubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminKey">Admin Key</Label>
                <Input
                  id="adminKey"
                  type="password"
                  {...registerAdminKey('adminKey')}
                  placeholder="Enter admin key"
                  className={adminKeyErrors.adminKey ? 'border-destructive' : ''}
                />
                {adminKeyErrors.adminKey && (
                  <p className="text-sm text-destructive">{adminKeyErrors.adminKey.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Access Admin Dashboard'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAdminKey(false)}
                className="w-full"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...registerLogin('email')}
                placeholder="Enter your email"
                className={loginErrors.email ? 'border-destructive' : ''}
              />
              {loginErrors.email && (
                <p className="text-sm text-destructive">{loginErrors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...registerLogin('password')}
                placeholder="Enter your password"
                className={loginErrors.password ? 'border-destructive' : ''}
              />
              {loginErrors.password && (
                <p className="text-sm text-destructive">{loginErrors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Test button for debugging */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={testSupabaseConnection}
            >
              Test Database Connection
            </Button>

            {/* Profiles table test button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={testProfilesTable}
            >
              Test Profiles Table
            </Button>

            {/* Simple login test button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={testSimpleLogin}
            >
              Test Simple Login
            </Button>

            {/* Profile fix test button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={testFixProfiles}
            >
              Test Profile Fix
            </Button>

            {/* User creation test button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={testCreateUser}
            >
              Test User Creation
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
