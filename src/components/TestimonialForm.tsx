
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

const testimonialSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  content: z.string().min(50, 'Review must be at least 50 characters'),
  rating: z.number().min(1).max(5)
})

type TestimonialFormData = z.infer<typeof testimonialSchema>

export const TestimonialForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema)
  })

  const onSubmit = async (data: TestimonialFormData) => {
    if (!user) {
      toast.error('Please log in to submit a testimonial')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          rating: data.rating,
          is_approved: false // Requires admin approval
        })

      if (error) throw error

      toast.success('Testimonial submitted successfully! It will be reviewed before being published.')
      reset()
      setSelectedRating(0)
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      toast.error('Failed to submit testimonial. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating)
    setValue('rating', rating)
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Share Your Experience</CardTitle>
          <CardDescription>
            Please log in to submit a testimonial about your SkillZone experience.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Tell others about your experience with SkillZone. Your testimonial will be reviewed before being published.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Brief title for your review"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= selectedRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">Please select a rating</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Review</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Share your detailed experience with SkillZone..."
              rows={5}
              className={errors.content ? 'border-destructive' : ''}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Testimonial'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
