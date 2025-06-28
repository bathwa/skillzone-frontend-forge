import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { apiService } from '@/lib/services/apiService'

// Admin email detection (same as Login.tsx)
const ADMIN_EMAILS = ['abathwabiz@gmail.com', 'admin@abathwa.com']

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  ),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['client', 'freelancer']),
  country: z.string().min(1, 'Please select your country'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => !ADMIN_EMAILS.includes(data.email.toLowerCase()), {
  message: "Admin emails cannot sign up through this form. Please use the login page.",
  path: ["email"],
})

type SignUpFormData = z.infer<typeof signUpSchema>

const sadcCountries = [
  { value: 'south_africa', label: 'South Africa' },
  { value: 'botswana', label: 'Botswana' },
  { value: 'zimbabwe', label: 'Zimbabwe' },
  { value: 'zambia', label: 'Zambia' },
  { value: 'namibia', label: 'Namibia' },
  { value: 'lesotho', label: 'Lesotho' },
  { value: 'eswatini', label: 'Eswatini' },
  { value: 'malawi', label: 'Malawi' },
  { value: 'mozambique', label: 'Mozambique' },
  { value: 'angola', label: 'Angola' },
  { value: 'comoros', label: 'Comoros' },
  { value: 'madagascar', label: 'Madagascar' },
  { value: 'mauritius', label: 'Mauritius' },
  { value: 'seychelles', label: 'Seychelles' },
  { value: 'tanzania', label: 'Tanzania' },
]

export const SignUp = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const preselectedRole = searchParams.get('role') as 'client' | 'freelancer' | 'service_provider' | null

  // Map service_provider to freelancer for consistency
  const getValidRole = (role: string | null): 'client' | 'freelancer' => {
    if (role === 'service_provider' || role === 'freelancer') return 'freelancer'
    if (role === 'client') return 'client'
    return 'freelancer' // default
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: getValidRole(preselectedRole),
    }
  })

  const selectedRole = watch('role')
  const password = watch('password')

  useEffect(() => {
    if (preselectedRole) {
      setValue('role', getValidRole(preselectedRole))
    }
  }, [preselectedRole, setValue])

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/\d/.test(password)) strength += 1
    if (/[^a-zA-Z\d]/.test(password)) strength += 1

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

    return {
      strength,
      label: strengthLabels[strength - 1] || '',
      color: strengthColors[strength - 1] || '',
    }
  }

  const passwordStrength = getPasswordStrength(password || '')

  const onSignUpSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    
    try {
      console.log('Signup attempt with data:', { ...data, password: '[HIDDEN]' })
      
      // Real API call to create user account
      const response = await apiService.signup({
        email: data.email,
        password: data.password,
        first_name: data.name.split(' ')[0],
        last_name: data.name.split(' ').slice(1).join(' '),
        role: data.role,
        country: data.country as any, // Type assertion for country code
      })
      
      console.log('Signup response:', response)
      
      if (response.success && response.data) {
        console.log('Signup successful, user data:', response.data)
        login(response.data)
        toast.success('Account created successfully! Welcome to SkillZone!')
        navigate('/dashboard')
      } else {
        console.error('Signup failed:', response.error)
        toast.error(response.error || 'Failed to create account. Please try again.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Account creation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            Join SkillZone and start building your career
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSignUpSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter your full name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter your email"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <input
                    type="radio"
                    id="freelancer"
                    value="freelancer"
                    {...register('role')}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="freelancer"
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === 'freelancer'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/20 hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium">Offer Services</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Sell your skills and build your career
                    </span>
                  </Label>
                </div>
                <div className="space-y-2">
                  <input
                    type="radio"
                    id="client"
                    value="client"
                    {...register('role')}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="client"
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === 'client'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/20 hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium">Hire Talent</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Find professionals for your projects
                    </span>
                  </Label>
                </div>
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                onValueChange={(value) => {
                  setValue('country', value)
                  clearErrors('country')
                }}
              >
                <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {sadcCountries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Create a strong password"
                className={errors.password ? 'border-destructive' : ''}
              />
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                {...register('acceptTerms')}
                className={errors.acceptTerms ? 'border-destructive' : ''}
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
