
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import { CheckCircle, User, Briefcase, Settings } from 'lucide-react'

const profileSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be less than 500 characters'),
  hourly_rate: z.number().min(5, 'Hourly rate must be at least $5').max(500, 'Hourly rate must be less than $500'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  experience_level: z.enum(['junior', 'mid', 'senior', 'expert']),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileSetupWizardProps {
  onComplete: () => void
}

export const ProfileSetupWizard = ({ onComplete }: ProfileSetupWizardProps) => {
  const { user, updateUser } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user?.bio || '',
      hourly_rate: user?.hourly_rate || 25,
      city: user?.city || '',
      website: user?.website || '',
      experience_level: 'mid',
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await apiService.updateProfile(user.id, {
        bio: data.bio,
        hourly_rate: data.hourly_rate,
        city: data.city,
        website: data.website || undefined,
        // Map experience level to match the expected type
        experience_level: data.experience_level as 'junior' | 'mid' | 'senior' | 'expert'
      })

      if (response.success) {
        updateUser({
          ...user,
          bio: data.bio,
          hourly_rate: data.hourly_rate,
          city: data.city,
          website: data.website || undefined,
        })
        toast.success('Profile updated successfully!')
        onComplete()
      } else {
        toast.error(response.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Tell us about yourself',
      icon: User
    },
    {
      id: 2,
      title: 'Professional Details',
      description: 'Your skills and experience',
      icon: Briefcase
    },
    {
      id: 3,
      title: 'Final Setup',
      description: 'Complete your profile',
      icon: Settings
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'border-primary text-primary' 
                        : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted-foreground'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold">{steps[currentStep - 1].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              {user?.role === 'freelancer' 
                ? 'Help clients understand your skills and expertise'
                : 'Set up your profile to start posting opportunities'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register('bio')}
                      placeholder="Tell us about yourself, your skills, and experience..."
                      rows={4}
                      className={errors.bio ? 'border-destructive' : ''}
                    />
                    {errors.bio && (
                      <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="Your city"
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && user?.role === 'freelancer' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      {...register('hourly_rate', { valueAsNumber: true })}
                      placeholder="25"
                      className={errors.hourly_rate ? 'border-destructive' : ''}
                    />
                    {errors.hourly_rate && (
                      <p className="text-sm text-destructive mt-1">{errors.hourly_rate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="experience_level">Experience Level</Label>
                    <Select
                      onValueChange={(value) => {
                        setValue('experience_level', value as 'junior' | 'mid' | 'senior' | 'expert')
                        clearErrors('experience_level')
                      }}
                    >
                      <SelectTrigger className={errors.experience_level ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.experience_level && (
                      <p className="text-sm text-destructive mt-1">{errors.experience_level.message}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      {...register('website')}
                      placeholder="https://your-website.com"
                      className={errors.website ? 'border-destructive' : ''}
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive mt-1">{errors.website.message}</p>
                    )}
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Profile Summary</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Bio:</strong> {watch('bio')?.slice(0, 100)}...</p>
                      <p><strong>City:</strong> {watch('city')}</p>
                      {user?.role === 'freelancer' && (
                        <>
                          <p><strong>Hourly Rate:</strong> ${watch('hourly_rate')}/hour</p>
                          <p><strong>Experience:</strong> {watch('experience_level')}</p>
                        </>
                      )}
                      {watch('website') && (
                        <p><strong>Website:</strong> {watch('website')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Completing...' : 'Complete Profile'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
