import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { COUNTRY_CONFIGS } from '@/lib/constants'
import { toast } from 'sonner'
import { 
  User, 
  Mail, 
  MapPin, 
  CreditCard, 
  Star, 
  Briefcase, 
  Settings,
  Save,
  Edit,
  Camera,
  Globe,
  Calendar,
  Award
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().optional(),
  hourly_rate: z.number().min(0, 'Hourly rate must be positive').optional(),
  experience_level: z.enum(['junior', 'mid', 'senior', 'expert']).optional(),
  country: z.enum(['zimbabwe', 'south_africa', 'botswana', 'namibia', 'zambia', 'lesotho', 'eswatini', 'malawi', 'mozambique', 'tanzania', 'angola', 'madagascar', 'mauritius', 'seychelles', 'comoros']),
})

type ProfileFormData = z.infer<typeof profileSchema>

export const MyProfile = () => {
  const { user, updateUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user?.id) return

    try {
      const response = await apiService.getUserProfile(user.id)
      if (response.success && response.data) {
        setProfileData(response.data)
        reset({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          bio: response.data.bio || '',
          hourly_rate: response.data.hourly_rate || 0,
          experience_level: response.data.experience_level || 'mid',
          country: response.data.country,
        })
      }
    } catch (error) {
      toast.error('Failed to load profile data')
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await apiService.updateUserProfile(user.id, {
        ...data,
        name: `${data.first_name} ${data.last_name}`,
        avatar_url: avatarUrl || user.avatar_url,
      })

      if (response.success && response.data) {
        updateUser(response.data)
        setProfileData(response.data)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(response.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case 'junior': return 'Junior (0-2 years)'
      case 'mid': return 'Mid-level (3-5 years)'
      case 'senior': return 'Senior (5+ years)'
      case 'expert': return 'Expert (10+ years)'
      default: return level
    }
  }

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })
      if (error) throw error
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setAvatarUrl(publicUrlData.publicUrl)
      toast.success('Profile photo uploaded! Save changes to update your profile.')
    } catch (err) {
      toast.error('Failed to upload profile photo')
    }
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your professional profile and settings</p>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="professional">Professional Info</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24" onClick={handleAvatarClick} style={{ cursor: isEditing ? 'pointer' : 'default' }}>
                      <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                      <AvatarFallback className="text-2xl">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                          onClick={handleAvatarClick}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleAvatarChange}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="mr-1 h-4 w-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {COUNTRY_CONFIGS[user.country]?.name || user.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </Badge>
                      <Badge variant="secondary">
                        {user.subscription_tier?.charAt(0).toUpperCase() + user.subscription_tier?.slice(1)} Plan
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.tokens_balance}</div>
                  <p className="text-xs text-muted-foreground">Available tokens</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date().getFullYear()}
                  </div>
                  <p className="text-xs text-muted-foreground">Active member</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experience Level</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {profileData?.experience_level ? getExperienceLevelLabel(profileData.experience_level) : 'Not set'}
                  </div>
                  <p className="text-xs text-muted-foreground">Professional level</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Update your professional details and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        {...register('first_name')}
                        disabled={!isEditing}
                        className={errors.first_name ? 'border-destructive' : ''}
                      />
                      {errors.first_name && (
                        <p className="text-sm text-destructive">{errors.first_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        {...register('last_name')}
                        disabled={!isEditing}
                        className={errors.last_name ? 'border-destructive' : ''}
                      />
                      {errors.last_name && (
                        <p className="text-sm text-destructive">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register('bio')}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself and your professional background..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={watch('country')}
                        onValueChange={(value) => setValue('country', value as any)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COUNTRY_CONFIGS).map(([code, config]) => (
                            <SelectItem key={code} value={code}>
                              {config.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Experience Level</Label>
                      <Controller
                        name="experience_level"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                              <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                              <SelectItem value="senior">Senior (5+ years)</SelectItem>
                              <SelectItem value="expert">Expert (10+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  {user.role === 'freelancer' && (
                    <div className="space-y-2">
                      <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        {...register('hourly_rate', { valueAsNumber: true })}
                        disabled={!isEditing}
                        placeholder="Enter your hourly rate"
                        className={errors.hourly_rate ? 'border-destructive' : ''}
                      />
                      {errors.hourly_rate && (
                        <p className="text-sm text-destructive">{errors.hourly_rate.message}</p>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Save className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Address</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Email
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
