
import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/AuthProvider'
import { 
  Briefcase, 
  FileText, 
  CreditCard, 
  Users, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  
  const userName = user?.user_metadata?.first_name || 'User'
  const userRole = user?.user_metadata?.role || 'freelancer'

  // Mock data - would be fetched from API
  const stats = {
    activeProposals: 12,
    completedProjects: 8,
    currentTokens: 25,
    totalEarnings: 2450.00
  }

  return (
    <div className="container py-8 max-w-6xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your {userRole === 'client' ? 'projects' : 'freelance work'} today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === 'client' ? 'Active Projects' : 'Active Proposals'}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProposals}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tokens</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentTokens}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/my-tokens" className="text-primary hover:underline">
                Buy more tokens
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === 'client' ? 'Total Spent' : 'Total Earned'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRole === 'client' ? (
              <>
                <Button asChild className="w-full justify-start">
                  <Link to="/opportunities/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Post New Opportunity
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/client/opportunities">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Manage My Opportunities
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full justify-start">
                  <Link to="/opportunities">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Browse Opportunities
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/sp/proposals">
                    <FileText className="mr-2 h-4 w-4" />
                    My Proposals
                  </Link>
                </Button>
              </>
            )}
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/my-profile">
                <Users className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New proposal received</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Project completed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Profile updated</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
                <Badge variant="outline">Update</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userRole === 'client' ? 'Recommended Service Providers' : 'Recommended Opportunities'}
          </CardTitle>
          <CardDescription>
            {userRole === 'client' 
              ? 'Top-rated professionals for your projects'
              : 'Opportunities matching your skills'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Complete your profile to get personalized recommendations
            </p>
            <Button asChild>
              <Link to="/my-profile">Complete Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
