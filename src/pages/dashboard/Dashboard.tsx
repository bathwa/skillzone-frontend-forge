import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import { 
  Briefcase, 
  Star, 
  CreditCard, 
  TrendingUp, 
  MessageSquare, 
  Bell,
  Eye,
  Clock,
  DollarSign,
  Users
} from 'lucide-react'

interface DashboardStats {
  client: {
    active_opportunities: number
    total_proposals: number
    total_spent: number
    active_projects: number
  }
  freelancer: {
    active_proposals: number
    won_projects: number
    total_earned: number
    client_rating: number
  }
}

interface RecentActivity {
  id: string
  type: 'proposal_received' | 'project_completed' | 'message_received'
  title: string
  description: string
  timestamp: string
  read: boolean
}

interface DashboardOpportunity {
  id: string
  title: string
  status: 'active' | 'closed' | 'in_progress'
  proposals_count: number
  budget: string
  posted_at: string
}

interface DashboardProposal {
  id: string
  opportunity_title: string
  status: 'pending' | 'accepted' | 'rejected'
  submitted_at: string
  client_name: string
  budget: string
}

export const Dashboard = () => {
  const { user } = useAuthStore()
  const { notifications } = useNotificationStore()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [opportunities, setOpportunities] = useState<DashboardOpportunity[]>([])
  const [proposals, setProposals] = useState<DashboardProposal[]>([])
  
  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Load opportunities for clients
      if (user.role === 'client') {
        const opportunitiesResponse = await apiService.getOpportunities({ 
          client_id: user.id,
          status: 'active',
          limit: 5 
        })
        if (opportunitiesResponse.success && opportunitiesResponse.data) {
          setOpportunities(opportunitiesResponse.data.map(opp => ({
            id: opp.id,
            title: opp.title,
            status: opp.status,
            proposals_count: opp.proposals_count || 0,
            budget: `$${opp.budget_min}-$${opp.budget_max}`,
            posted_at: opp.created_at
          })))
        }
      }

      // Load proposals for freelancers
      if (user.role === 'freelancer') {
        const proposalsResponse = await apiService.getUserProposals(user.id)
        if (proposalsResponse.success && proposalsResponse.data) {
          // For each proposal, we need to get the opportunity details
          const proposalsWithDetails = await Promise.all(
            proposalsResponse.data.slice(0, 5).map(async (prop) => {
              // Get opportunity details
              const opportunityResponse = await apiService.getOpportunities({ 
                id: prop.opportunity_id,
                limit: 1 
              })
              const opportunity = opportunityResponse.success && opportunityResponse.data?.[0]
              
              return {
                id: prop.id,
                opportunity_title: opportunity?.title || 'Opportunity',
                status: prop.status,
                submitted_at: prop.created_at,
                client_name: opportunity?.client_name || 'Client',
                budget: `$${prop.proposed_budget}`
              }
            })
          )
          setProposals(proposalsWithDetails)
        }
      }

      // Load notifications for recent activity
      const notificationsResponse = await apiService.getNotifications(user.id)
      if (notificationsResponse.success && notificationsResponse.data) {
        setRecentActivity(notificationsResponse.data.slice(0, 3).map(notif => ({
          id: notif.id,
          type: notif.type as any,
          title: notif.title,
          description: notif.message,
          timestamp: new Date(notif.created_at).toLocaleDateString(),
          read: !!notif.is_read
        })))
      }

      // Calculate stats based on loaded data
      const calculatedStats: DashboardStats = {
        client: {
          active_opportunities: opportunities.length,
          total_proposals: opportunities.reduce((sum, opp) => sum + opp.proposals_count, 0),
          total_spent: 0, // This would need to be calculated from completed projects
          active_projects: opportunities.filter(opp => opp.status === 'in_progress').length,
        },
        freelancer: {
          active_proposals: proposals.filter(prop => prop.status === 'pending').length,
          won_projects: proposals.filter(prop => prop.status === 'accepted').length,
          total_earned: 0, // This would need to be calculated from completed projects
          client_rating: user.rating || 0,
        }
      }
      setStats(calculatedStats)

    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isClient = user.role === 'client'
  const clientStats = stats?.client
  const freelancerStats = stats?.freelancer
  const unreadNotifications = notifications.filter(n => !n.read_at).length

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">Welcome back, {user.first_name}!</h1>
                  <p className="text-muted-foreground">
                    Here's what's happening with your {isClient ? 'opportunities' : 'proposals'} today.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Token Balance</div>
                  <div className="text-2xl font-bold text-primary">{user.tokens_balance}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isClient ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats?.active_opportunities || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Opportunities posted
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats?.total_proposals || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Proposals received
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${clientStats?.total_spent?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Project investments
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats?.active_projects || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Projects in progress
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{freelancerStats?.active_proposals || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Pending proposals
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Won Projects</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{freelancerStats?.won_projects || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Successful projects
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${freelancerStats?.total_earned?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Total earnings
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Client Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{freelancerStats?.client_rating || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Average rating
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest notifications and updates
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    View All ({unreadNotifications})
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === 'proposal_received' && (
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {activity.type === 'project_completed' && (
                          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Star className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        {activity.type === 'message_received' && (
                          <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                          {!activity.read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No recent activity yet</p>
                  <p className="text-sm">Start {isClient ? 'posting opportunities' : 'applying to opportunities'} to see updates here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opportunities/Proposals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {isClient ? 'Recent Opportunities' : 'Recent Proposals'}
                  </CardTitle>
                  <CardDescription>
                    {isClient 
                      ? 'Your posted opportunities and their status'
                      : 'Your submitted proposals and their status'
                    }
                  </CardDescription>
                </div>
                {isClient && (
                  <Button asChild>
                    <Link to="/client/opportunities">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Manage Opportunities
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isClient ? (
                opportunities.length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.map((opportunity) => (
                      <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{opportunity.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{opportunity.proposals_count} proposals</span>
                            <span>Budget: {opportunity.budget}</span>
                            <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
                              {opportunity.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/opportunity/${opportunity.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No opportunities posted yet</p>
                    <p className="text-sm mb-4">Post your first opportunity to find skilled professionals</p>
                    <Button asChild>
                      <Link to="/client/opportunities">Post Opportunity</Link>
                    </Button>
                  </div>
                )
              ) : (
                proposals.length > 0 ? (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{proposal.opportunity_title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>Client: {proposal.client_name}</span>
                            <span>Budget: {proposal.budget}</span>
                            <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'}>
                              {proposal.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/proposal/${proposal.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No proposals submitted yet</p>
                    <p className="text-sm mb-4">Browse opportunities and submit your first proposal</p>
                    <Button asChild>
                      <Link to="/opportunities">Browse Opportunities</Link>
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isClient ? (
                <>
                  <Button className="w-full" asChild>
                    <Link to="/client/opportunities">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Manage Opportunities
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/opportunities">
                      <Eye className="mr-2 h-4 w-4" />
                      Browse All Opportunities
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full" asChild>
                    <Link to="/opportunities">
                      <Eye className="mr-2 h-4 w-4" />
                      Browse Opportunities
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/sp/proposals">
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Proposals
                    </Link>
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/my-profile">
                  <Users className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/my-tokens">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Buy Tokens
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Token Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Token Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{user.tokens_balance}</div>
                <p className="text-sm text-muted-foreground mb-4">Available tokens</p>
                <Button className="w-full" asChild>
                  <Link to="/my-tokens">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Purchase Tokens
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
