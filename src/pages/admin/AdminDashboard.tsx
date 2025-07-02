
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  AlertTriangle, 
  Settings, 
  TrendingUp,
  Search,
  Filter,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock data for demonstration - will be replaced with real queries
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalOpportunities: 456,
    totalRevenue: 15420.50,
    pendingFeedback: 23,
    activeDisputes: 5
  }

  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'freelancer',
      country: 'south_africa',
      is_suspended: false,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'client',
      country: 'zimbabwe',
      is_suspended: false,
      created_at: '2024-01-20'
    }
  ]

  const mockOpportunities = [
    {
      id: '1',
      title: 'Website Development',
      status: 'open',
      type: 'premium',
      client_name: 'Tech Corp',
      budget_min: 1000,
      budget_max: 5000,
      created_at: '2024-01-25'
    }
  ]

  const mockFeedback = [
    {
      id: '1',
      user_name: 'John Doe',
      feedback_type: 'bug',
      title: 'Login Issue',
      status: 'pending',
      priority: 'high',
      created_at: '2024-01-30'
    }
  ]

  const mockDisputes = [
    {
      id: '1',
      title: 'Payment Delay',
      dispute_type: 'payment',
      status: 'open',
      amount_disputed: 500,
      client_name: 'Tech Corp',
      provider_name: 'John Doe',
      created_at: '2024-01-28'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your SkillsPortal platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingFeedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDisputes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all registered users</CardDescription>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="freelancer">Freelancers</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge variant="secondary">{user.country}</Badge>
                          {user.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opportunities Management */}
          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Management</CardTitle>
                <CardDescription>Manage all posted opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOpportunities.map((opp) => (
                    <div key={opp.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-medium">{opp.title}</h3>
                        <p className="text-sm text-muted-foreground">by {opp.client_name}</p>
                        <div className="flex gap-2">
                          <Badge variant={opp.status === 'open' ? 'default' : 'secondary'}>
                            {opp.status}
                          </Badge>
                          <Badge variant={opp.type === 'premium' ? 'destructive' : 'outline'}>
                            {opp.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${opp.budget_min} - ${opp.budget_max}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Status
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Management */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Management</CardTitle>
                <CardDescription>Review and respond to user feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{feedback.title}</h3>
                        <div className="flex gap-2">
                          <Badge variant={feedback.priority === 'high' ? 'destructive' : 'default'}>
                            {feedback.priority}
                          </Badge>
                          <Badge variant="outline">{feedback.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {feedback.user_name} • {feedback.feedback_type}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm">Respond</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Management */}
          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
                <CardDescription>Manage and resolve user disputes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDisputes.map((dispute) => (
                    <div key={dispute.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{dispute.title}</h3>
                        <div className="flex gap-2">
                          <Badge variant="destructive">${dispute.amount_disputed}</Badge>
                          <Badge variant="outline">{dispute.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {dispute.client_name} vs {dispute.provider_name} • {dispute.dispute_type}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Evidence
                        </Button>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Purchase Management */}
          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle>Token Purchase Management</CardTitle>
                <CardDescription>Review and approve token purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending token purchases</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Configure platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Token Rates</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">Standard:</span>
                        <Input type="number" defaultValue="1" className="w-20" />
                        <span className="text-sm">tokens</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">Premium:</span>
                        <Input type="number" defaultValue="3" className="w-20" />
                        <span className="text-sm">tokens</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bonus Tokens</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">Signup:</span>
                        <Input type="number" defaultValue="5" className="w-20" />
                        <span className="text-sm">tokens</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">Referral:</span>
                        <Input type="number" defaultValue="10" className="w-20" />
                        <span className="text-sm">tokens</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Escrow Details (Zimbabwe)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mobile Wallets Number</label>
                      <Input defaultValue="0788420479" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mobile Wallets Name</label>
                      <Input defaultValue="Vusa Ncube" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Innbucks Account Name</label>
                      <Input defaultValue="Abathwa Incubator PBC" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Innbucks Account Number</label>
                      <Input defaultValue="013113351190001" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Support Contacts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input defaultValue="+263 78 998 9619" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue="admin@abathwa.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">WhatsApp</label>
                      <Input defaultValue="wa.me/789989619" />
                    </div>
                  </div>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
