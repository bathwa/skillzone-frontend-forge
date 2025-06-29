
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import {
  Search,
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Briefcase,
  Star,
  MessageSquare
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  budget_min: number
  budget_max: number
  status: string
  created_at: string
  category: string
}

interface Proposal {
  id: string
  opportunity_title: string
  status: 'pending' | 'accepted' | 'rejected'
  submitted_at: string
  proposed_budget: number
}

interface FreelancerStats {
  totalProposals: number
  acceptedProposals: number
  completedProjects: number
  totalEarnings: number
}

export default function FreelancerDashboard() {
  const { user } = useAuthStore()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [stats, setStats] = useState<FreelancerStats>({
    totalProposals: 0,
    acceptedProposals: 0,
    completedProjects: 0,
    totalEarnings: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFreelancerData()
  }, [user])

  const loadFreelancerData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Load recent opportunities
      const opportunitiesResponse = await apiService.getOpportunities({
        limit: 5,
        status: 'open'
      })

      if (Array.isArray(opportunitiesResponse)) {
        const recentOpportunities = opportunitiesResponse.slice(0, 5).map(opp => ({
          id: opp.id,
          title: opp.title,
          budget_min: opp.budget_min,
          budget_max: opp.budget_max,
          status: opp.status,
          created_at: opp.created_at,
          category: opp.category
        }))
        setOpportunities(recentOpportunities)
      }

      // Load user proposals
      const proposalsResponse = await apiService.getUserProposals(user.id)
      if (proposalsResponse.success && proposalsResponse.data) {
        const userProposals = proposalsResponse.data.slice(0, 5).map(proposal => ({
          id: proposal.id,
          opportunity_title: `Opportunity ${proposal.opportunity_id.slice(0, 8)}`,
          status: proposal.status as 'pending' | 'accepted' | 'rejected',
          submitted_at: proposal.created_at,
          proposed_budget: proposal.proposed_budget
        }))
        setProposals(userProposals)

        // Calculate stats
        setStats({
          totalProposals: proposalsResponse.data.length,
          acceptedProposals: proposalsResponse.data.filter(p => p.status === 'accepted').length,
          completedProjects: user.total_jobs_completed || 0,
          totalEarnings: user.total_earnings || 0
        })
      }
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
          Welcome back, {user.name}! Find opportunities and grow your career.
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
          <Link to="/sp/proposals">
            <FileText className="mr-2 h-5 w-5" />
            My Proposals
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
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
            <p className="text-xs text-muted-foreground">
              Proposals submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Proposals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedProposals}</div>
            <p className="text-xs text-muted-foreground">
              Proposals accepted
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Career earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Opportunities */}
        <div>
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
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No opportunities available</h3>
                <p className="text-muted-foreground">
                  Check back later for new opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <CardDescription>
                      {opportunity.category} • {formatCurrency(opportunity.budget_min)} - {formatCurrency(opportunity.budget_max)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Posted {formatDate(opportunity.created_at)}
                      </span>
                      <Button size="sm" asChild>
                        <Link to={`/opportunities/${opportunity.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Proposals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Proposals</h2>
            <Link to="/sp/proposals">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div>Loading proposals...</div>
          ) : proposals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No proposals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start browsing opportunities and submit your first proposal.
                </p>
                <Button asChild>
                  <Link to="/opportunities">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Opportunities
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{proposal.opportunity_title}</CardTitle>
                    <CardDescription>
                      Proposed: {formatCurrency(proposal.proposed_budget)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(proposal.submitted_at)}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
