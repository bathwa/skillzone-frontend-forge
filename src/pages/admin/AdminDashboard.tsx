import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Settings,
  Activity
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalOpportunities: number
  totalRevenue: number
  activeProjects: number
}

interface User {
  id: string
  name: string
  email: string
  role: 'client' | 'freelancer' | 'admin'
  country: string
  created_at: string
  is_verified: boolean
}

interface Opportunity {
  id: string
  title: string
  budget_min: number
  budget_max: number
  status: string
  created_at: string
  client_name?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOpportunities: 0,
    totalRevenue: 0,
    activeProjects: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      // Load users from API
      const usersResponse = await apiService.getProfiles({ limit: 100 })
      let users: User[] = []
      if (usersResponse.success && usersResponse.data) {
        users = usersResponse.data.map((profile: any) => ({
          id: profile.id,
          name: profile.name || `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          role: profile.role,
          country: profile.country,
          created_at: profile.created_at,
          is_verified: profile.verified,
        }))
      }

      // Load opportunities from API
      const opportunitiesResponse = await apiService.getOpportunities({ limit: 10 })
      let mappedOpportunities: Opportunity[] = []
      if (opportunitiesResponse.success && opportunitiesResponse.data) {
        mappedOpportunities = opportunitiesResponse.data.map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          budget_min: opp.budget_min,
          budget_max: opp.budget_max,
          status: opp.status,
          created_at: opp.created_at,
          client_name: opp.client_name || 'Client',
        }))
      }

      setUsers(users)
      setOpportunities(mappedOpportunities)
      setStats({
        totalUsers: users.length,
        totalOpportunities: mappedOpportunities.length,
        totalRevenue: 0, // TODO: Replace with real revenue if available
        activeProjects: 0 // TODO: Replace with real active projects if available
      })
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, opportunities, and platform operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage platform users and their verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading users...</div>
              ) : users.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No users found</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge variant="outline">{user.role}</Badge>
                          {user.is_verified && (
                            <Badge className="bg-green-100 text-green-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email} • {user.country} • Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        {!user.is_verified && (
                          <Button size="sm">
                            Verify User
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Management</CardTitle>
              <CardDescription>
                Monitor and manage platform opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading opportunities...</div>
              ) : opportunities.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No opportunities found</p>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{opportunity.title}</h3>
                          <Badge className={getStatusColor(opportunity.status)}>
                            {opportunity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(opportunity.budget_min)} - {formatCurrency(opportunity.budget_max)} • 
                          Posted {formatDate(opportunity.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>
                View platform performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure platform-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Settings Panel</h3>
                <p className="text-muted-foreground">
                  Platform configuration options will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
