
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { opportunityService } from '@/lib/services/opportunityService'
import { apiService } from '@/lib/services/apiService'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  Calendar,
  MessageSquare,
  Star,
  Clock
} from 'lucide-react'
import TokenBalance from '@/components/TokenBalance'

interface DashboardStats {
  totalOpportunities: number
  activeProposals: number
  totalEarnings: number
  completedProjects: number
}

interface DashboardOpportunity {
  id: string
  title: string
  budget_min: number
  budget_max: number
  proposals_count: number
  created_at: string
}

interface DashboardProposal {
  id: string
  opportunity_title: string
  status: 'pending' | 'accepted' | 'rejected'
  submitted_at: string
  client_name: string
  budget: string
}

interface DashboardNotification {
  id: string
  title: string
  message: string
  created_at: string
  read: boolean
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalOpportunities: 0,
    activeProposals: 0,
    totalEarnings: 0,
    completedProjects: 0
  })
  const [recentOpportunities, setRecentOpportunities] = useState<DashboardOpportunity[]>([])
  const [recentProposals, setRecentProposals] = useState<DashboardProposal[]>([])
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Load opportunities
      const opportunitiesResponse = await opportunityService.getOpportunities({
        category: '',
        search: '',
        type: 'standard',
        sort: 'newest',
        limit: 5
      })

      if (opportunitiesResponse.success && opportunitiesResponse.data) {
        setRecentOpportunities(opportunitiesResponse.data.slice(0, 5).map(opp => ({
          id: opp.id,
          title: opp.title,
          budget_min: opp.budget_min,
          budget_max: opp.budget_max,
          proposals_count: opp.proposals_count,
          created_at: opp.created_at
        })))
      }

      // Load user's proposals and related data
      const proposalsResponse = await apiService.getUserProposals(user.id)
      if (proposalsResponse.success && proposalsResponse.data) {
        const proposals = proposalsResponse.data
        const mappedProposals = proposals.map(proposal => ({
          id: proposal.id,
          opportunity_title: 'Project', // Would need to fetch from opportunity
          status: proposal.status === 'withdrawn' ? 'rejected' as const : 
                 proposal.status as 'pending' | 'accepted' | 'rejected',
          submitted_at: proposal.created_at,
          client_name: 'Client', // Would need to fetch from opportunity
          budget: `$${proposal.proposed_budget || proposal.budget || 0}`
        }))
        setRecentProposals(mappedProposals)
        
        setStats(prev => ({
          ...prev,
          activeProposals: proposals.filter(p => p.status === 'pending').length
        }))
      }

      // Load notifications
      const notificationsResponse = await apiService.getNotifications(user.id)
      if (notificationsResponse.success && notificationsResponse.data) {
        const mappedNotifications = notificationsResponse.data.slice(0, 5).map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          created_at: notification.created_at,
          read: notification.read_at ? true : false
        }))
        setNotifications(mappedNotifications)
      }

      // Set other stats (would come from user profile or calculated)
      setStats(prev => ({
        ...prev,
        totalOpportunities: opportunitiesResponse.data?.length || 0,
        completedProjects: user.total_jobs_completed || 0,
        totalEarnings: user.total_earnings || 0
      }))
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!user) {
    return <div>Please log in to view your dashboard.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.first_name || user.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your {user.role} account
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'client' ? 'Posted Opportunities' : 'Available Opportunities'}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'client' ? 'Received Proposals' : 'Active Proposals'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProposals}</div>
            <p className="text-xs text-muted-foreground">
              {user.role === 'client' ? 'Awaiting review' : 'Pending responses'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'client' ? 'Total Spent' : 'Total Earnings'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
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
              {user.rating ? `${user.rating}⭐ average rating` : 'No ratings yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Opportunities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {user.role === 'client' ? 'Your Recent Opportunities' : 'Latest Opportunities'}
              </CardTitle>
              <Link to={user.role === 'client' ? '/client/opportunities' : '/opportunities'}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading...</div>
              ) : recentOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {recentOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{opportunity.title}</h3>
                        <Badge variant="secondary">{opportunity.proposals_count} proposals</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{formatCurrency(opportunity.budget_min)} - {formatCurrency(opportunity.budget_max)}</span>
                        <span>{formatDate(opportunity.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {user.role === 'client' 
                    ? 'No opportunities posted yet. Create your first opportunity!' 
                    : 'No opportunities available at the moment.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Proposals */}
          {user.role === 'freelancer' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Your Recent Proposals
                </CardTitle>
                <Link to="/sp/proposals">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentProposals.length > 0 ? (
                  <div className="space-y-4">
                    {recentProposals.slice(0, 3).map((proposal) => (
                      <div key={proposal.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{proposal.opportunity_title}</h3>
                          <Badge 
                            variant={
                              proposal.status === 'accepted' ? 'default' :
                              proposal.status === 'rejected' ? 'destructive' : 'secondary'
                            }
                          >
                            {proposal.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{proposal.budget}</span>
                          <span>{formatDate(proposal.submitted_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No proposals submitted yet. Start browsing opportunities!
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Token Balance */}
          <TokenBalance />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.role === 'client' ? (
                <>
                  <Link to="/opportunities/new">
                    <Button className="w-full">Post New Opportunity</Button>
                  </Link>
                  <Link to="/client/opportunities">
                    <Button variant="outline" className="w-full">Manage Opportunities</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/opportunities">
                    <Button className="w-full">Browse Opportunities</Button>  
                  </Link>
                  <Link to="/sp/proposals">
                    <Button variant="outline" className="w-full">View My Proposals</Button>
                  </Link>
                </>
              )}
              <Link to="/my-tokens">
                <Button variant="outline" className="w-full">Buy Tokens</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <Link to="/notifications">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="text-sm">
                      <div className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                        {notification.title}
                      </div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No recent notifications</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
