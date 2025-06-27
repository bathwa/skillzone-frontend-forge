
import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
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

// Mock data for dashboard
const mockStats = {
  client: {
    active_opportunities: 3,
    total_proposals: 24,
    total_spent: 5670,
    active_projects: 2,
  },
  service_provider: {
    active_proposals: 5,
    won_projects: 12,
    total_earned: 8930,
    client_rating: 4.8,
  }
}

const mockRecentActivity = [
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
]

const mockOpportunities = [
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
]

const mockProposals = [
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
]

export const Dashboard = () => {
  const { user } = useAuthStore()
  const { notifications } = useNotificationStore()
  
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
  const stats = isClient ? mockStats.client : mockStats.service_provider
  const unreadNotifications = notifications.filter(n => !n.read_at).length

  return (
    <div className="container py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">
              {isClient 
                ? "Manage your projects and find talented professionals" 
                : "Track your proposals and grow your freelance business"
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              {user.subscription_tier?.charAt(0).toUpperCase() + user.subscription_tier?.slice(1)} Plan
            </Badge>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isClient ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_opportunities}</div>
                <p className="text-xs text-muted-foreground">Projects seeking talent</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_proposals}</div>
                <p className="text-xs text-muted-foreground">Proposals received</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.total_spent}</div>
                <p className="text-xs text-muted-foreground">Investment in projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_projects}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_proposals}</div>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Won Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.won_projects}</div>
                <p className="text-xs text-muted-foreground">Successful proposals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.total_earned}</div>
                <p className="text-xs text-muted-foreground">Career earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.client_rating}</div>
                <p className="text-xs text-muted-foreground">Average rating</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to help you get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isClient ? (
                  <>
                    <Button className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                      <Link to="/client/opportunities/new">
                        <Plus className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Post New Opportunity</div>
                          <div className="text-xs opacity-70">Find the perfect talent for your project</div>
                        </div>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                      <Link to="/client/opportunities">
                        <Eye className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Manage Opportunities</div>
                          <div className="text-xs opacity-70">View and edit your posted projects</div>
                        </div>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                      <Link to="/my-tokens">
                        <CreditCard className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Buy Tokens</div>
                          <div className="text-xs opacity-70">Current balance: {user.tokens_balance} tokens</div>
                        </div>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                      <Link to="/skills">
                        <Users className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Browse Talent</div>
                          <div className="text-xs opacity-70">Find skilled professionals</div>
                        </div>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                      <Link to="/opportunities">
                        <Briefcase className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Browse Opportunities</div>
                          <div className="text-xs opacity-70">Find new projects to work on</div>
                        </div>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                      <Link to="/sp/proposals">
                        <Eye className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">My Proposals</div>
                          <div className="text-xs opacity-70">Track your submitted proposals</div>
                        </div>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                      <Link to="/my-profile">
                        <Star className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Update Profile</div>
                          <div className="text-xs opacity-70">Enhance your professional presence</div>
                        </div>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                      <Link to="/my-tokens">
                        <CreditCard className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Buy Tokens</div>
                          <div className="text-xs opacity-70">Current balance: {user.tokens_balance} tokens</div>
                        </div>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Opportunities/Proposals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {isClient ? 'My Recent Opportunities' : 'My Recent Proposals'}
                  </CardTitle>
                  <CardDescription>
                    {isClient 
                      ? 'Overview of your posted opportunities' 
                      : 'Status of your submitted proposals'
                    }
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={isClient ? '/client/opportunities' : '/sp/proposals'}>
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isClient ? (
                  mockOpportunities.map((opportunity) => (
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
                        <Link to={`/opportunity/${opportunity.id}`}>View</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  mockProposals.map((proposal) => (
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
                        <Link to={`/proposal/${proposal.id}`}>View</Link>
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
          {/* Token Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Token Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {user.tokens_balance}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Available tokens</p>
                <Button className="w-full" asChild>
                  <Link to="/my-tokens">Buy More Tokens</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className={`p-3 rounded-lg border ${!activity.read ? 'bg-muted/50' : ''}`}>
                    <h5 className="font-medium text-sm">{activity.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{activity.timestamp}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/notifications">View All Notifications</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge className="mb-2" variant="outline">
                  {user.subscription_tier?.charAt(0).toUpperCase() + user.subscription_tier?.slice(1)} Plan
                </Badge>
                <p className="text-sm text-muted-foreground mb-4">
                  {user.subscription_tier === 'basic' 
                    ? 'Upgrade for more features'
                    : 'Enjoying premium benefits'
                  }
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/subscriptions">Manage Subscription</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
