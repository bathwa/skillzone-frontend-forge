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
const ADMIN_EMAILS = ['abathwabiz@gmail.com', 'admin@abathwa.com']
const ADMIN_KEY = 'vvv.ndev'

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if admin email and key is required
      if (ADMIN_EMAILS.includes(data.email.toLowerCase())) {
        setShowAdminKey(true)
        setAdminEmail(data.email)
        setIsLoading(false)
        return
      }
      
      // Create mock user based on email (for demo purposes)
      const mockUser = {
        id: crypto.randomUUID(),
        email: data.email,
        first_name: data.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        last_name: '',
        name: data.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: data.email.includes('client') ? 'client' as const : 'freelancer' as const,
        country: 'south_africa' as const,
        tokens_balance: 12,
        subscription_tier: 'pro' as const,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      }
      
      login(mockUser)
      toast.success('Welcome back to SkillZone!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onAdminKeySubmit = async (data: AdminKeyFormData) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validate admin key
      if (data.adminKey !== ADMIN_KEY) {
        toast.error('Invalid admin key. Please try again.')
        setIsLoading(false)
        return
      }
      
      // Create admin user
      const adminUser = {
        id: crypto.randomUUID(),
        email: adminEmail,
        first_name: 'Admin',
        last_name: 'User',
        name: 'Admin User',
        role: 'admin' as const,
        country: 'zimbabwe' as const,
        tokens_balance: 999,
        subscription_tier: 'enterprise' as const,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminEmail}`,
      }
      
      login(adminUser)
      toast.success('Welcome to Admin Dashboard!')
      navigate('/admin/dashboard')
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
