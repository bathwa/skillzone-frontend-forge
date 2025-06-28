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
  Plus,
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
            proposals_count: opp.proposals_count,
            budget: `$${opp.budget_min}-$${opp.budget_max}`,
            posted_at: opp.posted_at
          })))
        }
      }

      // Load proposals for freelancers
      if (user.role === 'freelancer') {
        const proposalsResponse = await apiService.getUserProposals(user.id)
        if (proposalsResponse.success && proposalsResponse.data) {
          setProposals(proposalsResponse.data.slice(0, 5).map(prop => ({
            id: prop.id,
            opportunity_title: 'Opportunity Title', // Would need to fetch opportunity details
            status: prop.status,
            submitted_at: prop.submitted_at,
            client_name: 'Client Name', // Would need to fetch client details
            budget: `$${prop.budget}`
          })))
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
          read: !!notif.read_at
        })))
      }

      // Calculate stats based on loaded data
      const calculatedStats: DashboardStats = {
        client: {
          active_opportunities: opportunities.length,
          total_proposals: opportunities.reduce((sum, opp) => sum + opp.proposals_count, 0),
          total_spent: 0, // Would need to calculate from completed projects
          active_projects: opportunities.filter(opp => opp.status === 'in_progress').length,
        },
        freelancer: {
          active_proposals: proposals.filter(prop => prop.status === 'pending').length,
          won_projects: proposals.filter(prop => prop.status === 'accepted').length,
          total_earned: 0, // Would need to calculate from completed projects
          client_rating: 4.8, // Would need to fetch from user profile
        }
      }
      setStats(calculatedStats)

    } catch (error) {
      toast.error('Failed to load dashboard data')
      // Fallback to mock data for demo
      setFallbackData()
    } finally {
      setIsLoading(false)
    }
  }

  const setFallbackData = () => {
    setStats({
      client: {
        active_opportunities: 3,
        total_proposals: 24,
        total_spent: 5670,
        active_projects: 2,
      },
      freelancer: {
        active_proposals: 5,
        won_projects: 12,
        total_earned: 8930,
        client_rating: 4.8,
      }
    })

    setRecentActivity([
      {
        id: '1',
        type: 'proposal_received',
        title: 'New proposal on "E-commerce Website Development"',
        description: 'Sarah J. submitted a proposal',
        timestamp: '2 hours ago',
        read: false,
      },
      {
        id: '2',
        type: 'project_completed',
        title: 'Project completed successfully',
        description: 'Mobile App UI/UX Design project finished',
        timestamp: '1 day ago',
        read: true,
      },
      {
        id: '3',
        type: 'message_received',
        title: 'New message from client',
        description: 'David K. sent you a message about the project',
        timestamp: '2 days ago',
        read: true,
      },
    ])

    setOpportunities([
      {
        id: '1',
        title: 'React Dashboard Development',
        status: 'active',
        proposals_count: 8,
        budget: '$2000-$4000',
        posted_at: '2024-01-15',
      },
      {
        id: '2',
        title: 'Brand Identity Design',
        status: 'closed',
        proposals_count: 15,
        budget: '$800-$1500',
        posted_at: '2024-01-10',
      },
    ])

    setProposals([
      {
        id: '1',
        opportunity_title: 'E-commerce Platform',
        status: 'pending',
        submitted_at: '2024-01-16',
        client_name: 'Tech Solutions Ltd',
        budget: '$3000',
      },
      {
        id: '2',
        opportunity_title: 'Mobile App Development',
        status: 'accepted',
        submitted_at: '2024-01-12',
        client_name: 'StartupCo',
        budget: '$5000',
      },
    ])
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
                      +2 from last week
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
                      +12 from last week
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
                      +$1,200 from last month
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
                      +1 from last week
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
                      +3 from last week
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
                      +2 from last month
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
                      +$2,400 from last month
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
                      +0.2 from last month
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
                      <Plus className="mr-2 h-4 w-4" />
                      Post New
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isClient ? (
                  opportunities.map((opportunity) => (
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
                  ))
                ) : (
                  proposals.map((proposal) => (
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
                  ))
                )}
              </div>
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
                    <Link to="/opportunities/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Post Opportunity
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/client/opportunities">
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Opportunities
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
