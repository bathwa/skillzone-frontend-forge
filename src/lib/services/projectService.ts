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

  // Get project milestones
  async getProjectMilestones(projectId: string): Promise<{ data: ProjectMilestone[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching project milestones:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch milestones'
      }
    }
  }

  // Create project milestone
  async createMilestone(milestoneData: {
    project_id: string
    title: string
    description: string
    due_date: string
    amount: number
  }): Promise<{ data: ProjectMilestone | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert([{
          ...milestoneData,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error creating milestone:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create milestone'
      }
    }
  }

  // Update milestone status
  async updateMilestoneStatus(milestoneId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({ status })
        .eq('id', milestoneId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error updating milestone status:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to update milestone status'
      }
    }
  }

  // Get project updates
  async getProjectUpdates(projectId: string): Promise<{ data: ProjectUpdate[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('project_updates')
        .select(`
          *,
          user:profiles!project_updates_user_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const updates: ProjectUpdate[] = data?.map((update: any) => ({
        id: update.id,
        project_id: update.project_id,
        user_id: update.user_id,
        title: update.title,
        content: update.content,
        attachments: update.attachments,
        created_at: update.created_at,
        user: update.user ? {
          name: `${update.user.first_name || ''} ${update.user.last_name || ''}`.trim() || 'Unknown',
          avatar_url: update.user.avatar_url
        } : undefined
      })) || []

      return { data: updates, error: null }
    } catch (error) {
      console.error('Error fetching project updates:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch project updates'
      }
    }
  }

  // Create project update
  async createProjectUpdate(updateData: {
    project_id: string
    user_id: string
    title: string
    content: string
    attachments?: string[]
  }): Promise<{ data: ProjectUpdate | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('project_updates')
        .insert([updateData])
        .select(`
          *,
          user:profiles!project_updates_user_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .single()

      if (error) throw error

      const update: ProjectUpdate = {
        id: data.id,
        project_id: data.project_id,
        user_id: data.user_id,
        title: data.title,
        content: data.content,
        attachments: data.attachments,
        created_at: data.created_at,
        user: data.user ? {
          name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim() || 'Unknown',
          avatar_url: data.user.avatar_url
        } : undefined
      }

      return { data: update, error: null }
    } catch (error) {
      console.error('Error creating project update:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create project update'
      }
    }
  }

  // Subscribe to project updates
  subscribeToProjectUpdates(projectId: string, callback: (update: any) => void) {
    const subscription = supabase
      .channel(`project_updates:${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_updates',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        callback(payload.new)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }
}

export const projectService = new ProjectService() 