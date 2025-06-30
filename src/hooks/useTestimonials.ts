
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface Testimonial {
  id: string
  title: string
  content: string
  rating: number
  is_approved: boolean
  created_at: string
  user: {
    first_name: string
    last_name: string
    role: string
    country: string
  }
}

export interface CreateTestimonialData {
  title: string
  content: string
  rating: number
}

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          id,
          title,
          content,
          rating,
          is_approved,
          created_at,
          profiles!inner (
            first_name,
            last_name,
            role,
            country
          )
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(testimonial => ({
        id: testimonial.id,
        title: testimonial.title,
        content: testimonial.content,
        rating: testimonial.rating,
        is_approved: testimonial.is_approved,
        created_at: testimonial.created_at,
        user: {
          first_name: testimonial.profiles.first_name || 'Anonymous',
          last_name: testimonial.profiles.last_name || 'User',
          role: testimonial.profiles.role || 'User',
          country: testimonial.profiles.country || 'Unknown'
        }
      })) || []
    },
  })
}

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ title, content, rating }: CreateTestimonialData) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          user_id: userData.user.id,
          title,
          content,
          rating,
          is_approved: false
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Testimonial submitted successfully! It will be reviewed before being published.')
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
    onError: (error) => {
      console.error('Error creating testimonial:', error)
      toast.error('Failed to submit testimonial. Please try again.')
    },
  })
}
