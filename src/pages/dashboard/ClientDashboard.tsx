
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  budget_min: number
  budget_max: number
  status: string
  created_at: string
  proposals_count: number
}

interface ClientStats {
  totalOpportunities: number
  activeOpportunities: number
  totalProposals: number
  completedProjects: number
}

export default function ClientDashboard() {
  const { user } = useAuthStore()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState<ClientStats>({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalProposals: 0,
    completedProjects: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadClientData()
    }
  }, [user])

  const loadClientData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Load client's opportunities from Supabase
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (opportunitiesError) throw opportunitiesError

      const mappedOpportunities = opportunitiesData?.map(opp => ({
        id: opp.id,
        title: opp.title,
        budget_min: opp.budget_min || 0,
        budget_max: opp.budget_max || 0,
        status: opp.status,
        created_at: opp.created_at,
        proposals_count: opp.proposals_count || 0
      })) || []
      
      setOpportunities(mappedOpportunities)
      
      // Calculate real stats
      const totalOpportunities = mappedOpportunities.length
      const activeOpportunities = mappedOpportunities.filter(opp => opp.status === 'open').length
      const totalProposals = mappedOpportunities.reduce((sum, opp) => sum + opp.proposals_count, 0)
      
      // Get completed projects count
      const { data: completedProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user.id)
        .eq('status', 'completed')

      if (projectsError) throw projectsError

      setStats({
        totalOpportunities,
        activeOpportunities,
        totalProposals,
        completedProjects: completedProjects?.length || 0
      })
      
    } catch (error) {
      console.error('Error loading client data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.first_name || user.email}! Manage your opportunities and find the perfect talent.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button asChild className="h-16">
          <Link to="/opportunities/new">
            <Plus className="mr-2 h-5 w-5" />
            Post New Opportunity
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-16">
          <Link to="/client/opportunities">
            <Eye className="mr-2 h-5 w-5" />
            View All Opportunities
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-16">
          <Link to="/chat">
            <MessageSquare className="mr-2 h-5 w-5" />
            Messages
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              Opportunities posted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              Currently accepting proposals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
            <p className="text-xs text-muted-foreground">
              Proposals received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Opportunities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Opportunities</h2>
          <Link to="/client/opportunities">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div>Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by posting your first opportunity to find talented freelancers.
              </p>
              <Button asChild>
                <Link to="/opportunities/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Opportunity
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <CardDescription>
                        Budget: {formatCurrency(opportunity.budget_min)} - {formatCurrency(opportunity.budget_max)}
                      </CardDescription>
                    </div>
                    <Badge variant={opportunity.status === 'open' ? 'default' : 'secondary'}>
                      {opportunity.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Posted {formatDate(opportunity.created_at)}</span>
                    <span>{opportunity.proposals_count} proposals</span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/client/opportunities/${opportunity.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {opportunity.proposals_count} Proposals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
