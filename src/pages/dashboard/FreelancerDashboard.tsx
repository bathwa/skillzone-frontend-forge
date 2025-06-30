
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { TestimonialForm } from '@/components/TestimonialForm'
import {
  Search,
  Briefcase,
  DollarSign,
  Clock,
  Star,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  type: 'standard' | 'premium'
  status: string
  client_country: string
  created_at: string
  proposals_count: number
}

interface FreelancerStats {
  appliedJobs: number
  activeProposals: number
  completedProjects: number
  totalEarnings: number
}

export default function FreelancerDashboard() {
  const { user } = useAuthStore()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState<FreelancerStats>({
    appliedJobs: 0,
    activeProposals: 0,
    completedProjects: 0,
    totalEarnings: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadFreelancerData()
    }
  }, [user])

  const loadFreelancerData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Load recent opportunities from Supabase
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5)

      if (opportunitiesError) throw opportunitiesError

      const mappedOpportunities = opportunitiesData?.map(opp => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        budget_min: opp.budget_min || 0,
        budget_max: opp.budget_max || 0,
        category: opp.category,
        type: opp.type as 'standard' | 'premium',
        status: opp.status,
        client_country: opp.client_country,
        created_at: opp.created_at,
        proposals_count: opp.proposals_count || 0
      })) || []
      
      setOpportunities(mappedOpportunities)
      
      // Get user's proposal stats
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('id, status')
        .eq('freelancer_id', user.id)

      if (proposalsError) throw proposalsError

      const appliedJobs = proposalsData?.length || 0
      const activeProposals = proposalsData?.filter(p => p.status === 'pending').length || 0

      // Get completed projects
      const { data: completedProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, budget')
        .eq('freelancer_id', user.id)
        .eq('status', 'completed')

      if (projectsError) throw projectsError

      const completedCount = completedProjects?.length || 0
      const totalEarnings = completedProjects?.reduce((sum, project) => sum + (project.budget || 0), 0) || 0
      
      setStats({
        appliedJobs,
        activeProposals,
        completedProjects: completedCount,
        totalEarnings
      })
      
    } catch (error) {
      console.error('Error loading freelancer data:', error)
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
        <h1 className="text-3xl font-bold mb-2">Freelancer Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.first_name || user.email}! Find your next opportunity and grow your career.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button asChild className="h-16">
          <Link to="/opportunities">
            <Search className="mr-2 h-5 w-5" />
            Browse Opportunities
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-16">
          <Link to="/freelancer/proposals">
            <Briefcase className="mr-2 h-5 w-5" />
            My Proposals
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-16">
          <Link to="/profile">
            <Users className="mr-2 h-5 w-5" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appliedJobs}</div>
            <p className="text-xs text-muted-foreground">
              Total applications sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProposals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting client response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Opportunities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Opportunities</h2>
          <Link to="/opportunities">
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
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No opportunities available</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for new opportunities that match your skills.
              </p>
              <Button asChild>
                <Link to="/opportunities">
                  <Search className="mr-2 h-4 w-4" />
                  Browse All Opportunities
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <CardDescription>
                        {opportunity.description.substring(0, 100)}...
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={opportunity.type === 'premium' ? 'default' : 'secondary'}>
                        {opportunity.type}
                      </Badge>
                      {opportunity.status === 'open' && (
                        <Badge variant="outline" className="text-green-600">
                          Open
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatCurrency(opportunity.budget_min)} - {formatCurrency(opportunity.budget_max)}
                      </span>
                      <span className="text-muted-foreground">
                        {opportunity.proposals_count} proposals
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="capitalize">{opportunity.category.replace('_', ' ')}</span>
                      <span>Posted {formatDate(opportunity.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" asChild>
                      <Link to={`/opportunities/${opportunity.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/opportunities/${opportunity.id}/apply`}>
                        Apply Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Testimonial Form */}
      <div className="mb-8">
        <TestimonialForm />
      </div>

      {/* Profile Completion */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500" />
            Boost Your Profile
          </CardTitle>
          <CardDescription>
            Complete your profile to attract more clients and increase your chances of getting hired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Profile Strength: Good</p>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/profile">
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
