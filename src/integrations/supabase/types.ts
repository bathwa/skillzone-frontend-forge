export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          bio: string | null
          country: Database['public']['Enums']['country_code'] | null
          city: string | null
          phone: string | null
          website: string | null
          role: Database['public']['Enums']['user_role']
          hourly_rate: number | null
          total_earnings: number
          total_jobs_completed: number
          rating: number
          rating_count: number
          is_verified: boolean
          tokens: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: Database['public']['Enums']['country_code'] | null
          city?: string | null
          phone?: string | null
          website?: string | null
          role?: Database['public']['Enums']['user_role']
          hourly_rate?: number | null
          total_earnings?: number
          total_jobs_completed?: number
          rating?: number
          rating_count?: number
          is_verified?: boolean
          tokens?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: Database['public']['Enums']['country_code'] | null
          city?: string | null
          phone?: string | null
          website?: string | null
          role?: Database['public']['Enums']['user_role']
          hourly_rate?: number | null
          total_earnings?: number
          total_jobs_completed?: number
          rating?: number
          rating_count?: number
          is_verified?: boolean
          tokens?: number
          created_at?: string
          updated_at?: string
        }
      }
      escrow_accounts: {
        Row: {
          id: string
          country: Database['public']['Enums']['country_code']
          account_name: string
          account_number: string
          account_type: Database['public']['Enums']['account_type']
          provider: string | null
          phone_number: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country: Database['public']['Enums']['country_code']
          account_name: string
          account_number: string
          account_type: Database['public']['Enums']['account_type']
          provider?: string | null
          phone_number?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country?: Database['public']['Enums']['country_code']
          account_name?: string
          account_number?: string
          account_type?: Database['public']['Enums']['account_type']
          provider?: string | null
          phone_number?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      support_contacts: {
        Row: {
          id: string
          country: Database['public']['Enums']['country_code']
          phone: string
          email: string
          whatsapp: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country: Database['public']['Enums']['country_code']
          phone: string
          email: string
          whatsapp: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country?: Database['public']['Enums']['country_code']
          phone?: string
          email?: string
          whatsapp?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          created_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          level: Database['public']['Enums']['skill_level']
          years_experience: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          level?: Database['public']['Enums']['skill_level']
          years_experience?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          level?: Database['public']['Enums']['skill_level']
          years_experience?: number
          created_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string
          category: string
          budget_min: number | null
          budget_max: number | null
          type: Database['public']['Enums']['opportunity_type']
          status: Database['public']['Enums']['opportunity_status']
          client_country: Database['public']['Enums']['country_code']
          deadline: string | null
          required_skills: string[]
          proposals_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description: string
          category: string
          budget_min?: number | null
          budget_max?: number | null
          type?: Database['public']['Enums']['opportunity_type']
          status?: Database['public']['Enums']['opportunity_status']
          client_country: Database['public']['Enums']['country_code']
          deadline?: string | null
          required_skills?: string[]
          proposals_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string
          category?: string
          budget_min?: number | null
          budget_max?: number | null
          type?: Database['public']['Enums']['opportunity_type']
          status?: Database['public']['Enums']['opportunity_status']
          client_country?: Database['public']['Enums']['country_code']
          deadline?: string | null
          required_skills?: string[]
          proposals_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          opportunity_id: string
          freelancer_id: string
          cover_letter: string
          proposed_budget: number
          estimated_duration: number | null
          status: Database['public']['Enums']['proposal_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          freelancer_id: string
          cover_letter: string
          proposed_budget: number
          estimated_duration?: number | null
          status?: Database['public']['Enums']['proposal_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          freelancer_id?: string
          cover_letter?: string
          proposed_budget?: number
          estimated_duration?: number | null
          status?: Database['public']['Enums']['proposal_status']
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          opportunity_id: string
          proposal_id: string
          client_id: string
          freelancer_id: string
          title: string
          description: string
          budget: number
          status: Database['public']['Enums']['project_status']
          started_at: string | null
          deadline: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          proposal_id: string
          client_id: string
          freelancer_id: string
          title: string
          description: string
          budget: number
          status?: Database['public']['Enums']['project_status']
          started_at?: string | null
          deadline?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          proposal_id?: string
          client_id?: string
          freelancer_id?: string
          title?: string
          description?: string
          budget?: number
          status?: Database['public']['Enums']['project_status']
          started_at?: string | null
          deadline?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          project_id: string
          client_id: string
          freelancer_id: string
          amount: number
          platform_fee: number
          freelancer_amount: number
          status: Database['public']['Enums']['payment_status']
          stripe_payment_intent_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          client_id: string
          freelancer_id: string
          amount: number
          platform_fee: number
          freelancer_amount: number
          status?: Database['public']['Enums']['payment_status']
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          client_id?: string
          freelancer_id?: string
          amount?: number
          platform_fee?: number
          freelancer_amount?: number
          status?: Database['public']['Enums']['payment_status']
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          project_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          project_id: string | null
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          related_id?: string | null
          created_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          project_url: string | null
          technologies: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          image_url?: string | null
          project_url?: string | null
          technologies?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          project_url?: string | null
          technologies?: string[]
          created_at?: string
        }
      }
      token_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          description: string | null
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: string
          description?: string | null
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: string
          description?: string | null
          related_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'freelancer' | 'client' | 'admin'
      opportunity_type: 'standard' | 'premium'
      opportunity_status: 'open' | 'in_progress' | 'completed' | 'cancelled'
      proposal_status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
      project_status: 'active' | 'completed' | 'cancelled' | 'disputed'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
      skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      country_code:
        | 'south_africa'
        | 'botswana'
        | 'zimbabwe'
        | 'namibia'
        | 'zambia'
        | 'lesotho'
        | 'eswatini'
        | 'malawi'
        | 'mozambique'
        | 'tanzania'
        | 'angola'
        | 'madagascar'
        | 'mauritius'
        | 'seychelles'
        | 'comoros'
      account_type: 'mobile_wallet' | 'bank_account' | 'digital_wallet'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}