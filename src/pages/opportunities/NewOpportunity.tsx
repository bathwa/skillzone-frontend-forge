import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import { ArrowLeft, Save, DollarSign, Calendar, Tag } from 'lucide-react'
import { OPPORTUNITY_CATEGORIES } from '@/lib/constants'

const opportunitySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Please select a category'),
  budget_min: z.number().min(1, 'Minimum budget must be at least $1'),
  budget_max: z.number().min(1, 'Maximum budget must be at least $1'),
  type: z.enum(['standard', 'premium']),
  deadline: z.string().min(1, 'Please select a deadline'),
  required_skills: z.string().optional(),
})

type OpportunityFormData = z.infer<typeof opportunitySchema>

export const NewOpportunity = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      type: 'standard',
    },
  })

  const onSubmit = async (data: OpportunityFormData) => {
    if (!user?.id) {
      toast.error('Please log in to post an opportunity')
      return
    }

    setIsLoading(true)
    try {
      const opportunityData = {
        ...data,
        client_id: user.id,
        client_country: user.country || 'zimbabwe',
        required_skills: data.required_skills ? data.required_skills.split(',').map(s => s.trim()) : [],
        deadline: new Date(data.deadline).toISOString(),
      }

      const response = await apiService.createOpportunity(opportunityData)

      if (response.success && response.data) {
        toast.success('Opportunity posted successfully!')
        navigate('/client/opportunities')
      } else {
        toast.error(response.error || 'Failed to post opportunity')
      }
    } catch (error) {
      toast.error('Failed to post opportunity')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to post an opportunity</h1>
        </div>
      </div>
    )
  }

  if (user.role !== 'client') {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only clients can post opportunities.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Post New Opportunity</h1>
            <p className="text-muted-foreground">
              Create a new opportunity to find talented professionals for your project
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
            <CardDescription>
              Provide detailed information about your project to attract the right professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Build a modern e-commerce website"
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your project requirements, goals, and any specific details..."
                  rows={6}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPPORTUNITY_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Opportunity Type</Label>
                  <Select
                    value={watch('type')}
                    onValueChange={(value) => setValue('type', value as 'standard' | 'premium')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium (Featured)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Premium opportunities are featured and get more visibility
                  </p>
                </div>
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <Label>Budget Range (USD) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      {...register('budget_min', { valueAsNumber: true })}
                      placeholder="Minimum budget"
                      className={errors.budget_min ? 'border-destructive' : ''}
                    />
                    {errors.budget_min && (
                      <p className="text-sm text-destructive">{errors.budget_min.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="number"
                      {...register('budget_max', { valueAsNumber: true })}
                      placeholder="Maximum budget"
                      className={errors.budget_max ? 'border-destructive' : ''}
                    />
                    {errors.budget_max && (
                      <p className="text-sm text-destructive">{errors.budget_max.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">Project Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register('deadline')}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.deadline ? 'border-destructive' : ''}
                />
                {errors.deadline && (
                  <p className="text-sm text-destructive">{errors.deadline.message}</p>
                )}
              </div>

              {/* Required Skills */}
              <div className="space-y-2">
                <Label htmlFor="required_skills">Required Skills (Optional)</Label>
                <Input
                  id="required_skills"
                  {...register('required_skills')}
                  placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                />
                <p className="text-xs text-muted-foreground">
                  List the key skills or technologies required for this project
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/client/opportunities')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Post Opportunity
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 