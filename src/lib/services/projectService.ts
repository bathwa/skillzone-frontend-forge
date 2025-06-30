
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

export interface Project {
  id: string
  opportunity_id: string
  proposal_id: string
  client_id: string
  freelancer_id: string
  title: string
  description: string
  budget: number
  status: 'active' | 'completed' | 'cancelled' | 'disputed'
  started_at?: string
  deadline?: string
  completed_at?: string
  created_at: string
  updated_at: string
  client?: {
    name: string
    avatar_url?: string
    country: string
  }
  freelancer?: {
    name: string
    avatar_url?: string
    country: string
  }
  opportunity?: {
    title: string
    category: string
  }
}

export interface ProjectMilestone {
  id: string
  project_id: string
  title: string
  description: string
  due_date: string
  status: 'pending' | 'in_progress' | 'completed'
  amount: number
  created_at: string
}

export interface ProjectUpdate {
  id: string
  project_id: string
  user_id: string
  title: string
  content: string
  attachments?: string[]
  created_at: string
  user?: {
    name: string
    avatar_url?: string
  }
}

class ProjectService {
  // Get projects for a user
  async getUserProjects(userId: string): Promise<{ data: Project[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching user projects:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch projects'
      }
    }
  }

  // Get a specific project
  async getProject(projectId: string): Promise<{ data: Project | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching project:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch project'
      }
    }
  }

  // Update project status
  async updateProjectStatus(projectId: string, status: 'active' | 'completed' | 'cancelled' | 'disputed'): Promise<{ error: string | null }> {
    try {
      const updateData: any = { status }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error updating project status:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to update project status'
      }
    }
  }

  // Placeholder methods for milestones - these will need database tables to be created
  async getProjectMilestones(projectId: string): Promise<{ data: ProjectMilestone[] | null; error: string | null }> {
    console.log('Project milestones table not implemented yet')
    return { data: [], error: null }
  }

  async createMilestone(milestoneData: {
    project_id: string
    title: string
    description: string
    due_date: string
    amount: number
  }): Promise<{ data: ProjectMilestone | null; error: string | null }> {
    console.log('Project milestones table not implemented yet')
    return { data: null, error: 'Feature not implemented' }
  }

  async updateMilestoneStatus(milestoneId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<{ error: string | null }> {
    console.log('Project milestones table not implemented yet')
    return { error: 'Feature not implemented' }
  }

  // Placeholder methods for project updates - these will need database tables to be created
  async getProjectUpdates(projectId: string): Promise<{ data: ProjectUpdate[] | null; error: string | null }> {
    console.log('Project updates table not implemented yet')
    return { data: [], error: null }
  }

  async createProjectUpdate(updateData: {
    project_id: string
    user_id: string
    title: string
    content: string
    attachments?: string[]
  }): Promise<{ data: ProjectUpdate | null; error: string | null }> {
    console.log('Project updates table not implemented yet')
    return { data: null, error: 'Feature not implemented' }
  }

  // Subscribe to project updates (placeholder)
  subscribeToProjectUpdates(projectId: string, callback: (update: any) => void) {
    console.log('Project updates subscriptions not implemented yet')
    return () => {
      // Unsubscribe placeholder
    }
  }
}

export const projectService = new ProjectService()
