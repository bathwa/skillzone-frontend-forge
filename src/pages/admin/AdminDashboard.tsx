
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { 
  Users, 
  Briefcase, 
  CreditCard, 
  Settings,
  UserPlus,
  DollarSign,
  BarChart3,
  Shield,
  Phone,
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalOpportunities: number
  totalTransactions: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOpportunities: 0,
    totalTransactions: 0,
    totalRevenue: 0
  })
  const [users, setUsers] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Placeholder data for features not yet implemented
  const [escrowAccounts] = useState([
    {
      id: '1',
      country: 'south_africa',
      account_name: 'FreelanceHub Escrow SA',
      account_number: '1234567890',
      account_type: 'bank_account',
      provider: 'Standard Bank',
      is_active: true
    }
  ])

  const [supportContacts] = useState([
    {
      id: '1',
      country: 'south_africa',
      contact_type: 'email',
      contact_value: 'support@freelancehub.co.za',
      description: 'General Support',
      is_active: true
    }
  ])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData()
    }
  }, [user])

  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      // Load all users
      const allUsers = await apiService.getAllUsers()
      if (allUsers) {
        setUsers(allUsers)
      }

      // Load all opportunities
      const allOpportunities = await apiService.getAllOpportunities()
      if (allOpportunities) {
        setOpportunities(allOpportunities)
      }

      // Calculate stats
      setStats({
        totalUsers: allUsers?.length || 0,
        totalOpportunities: allOpportunities?.length || 0,
        totalTransactions: 0, // Would need transaction data
        totalRevenue: 0 // Would need payment data
      })

    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEscrowAccount = async (accountData: any) => {
    // Placeholder - would implement when database table exists
    console.log('Escrow account save not implemented:', accountData)
  }

  const handleSaveSupportContact = async (contactData: any) => {
    // Placeholder - would implement when database table exists
    console.log('Support contact save not implemented:', contactData)
  }

  const handleUpdateEscrowAccount = async (id: string, data: any) => {
    // Placeholder - would implement when database table exists
    console.log('Escrow account update not implemented:', id, data)
  }

  const handleUpdateSupportContact = async (id: string, data: any) => {
    // Placeholder - would implement when database table exists
    console.log('Support contact update not implemented:', id, data)
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, opportunities, and system settings
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
              Active platform users
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
              Posted opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Payment transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Platform earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="escrow">Escrow Accounts</TabsTrigger>
          <TabsTrigger value="support">Support Contacts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading users...</div>
              ) : users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{user.name || `${user.first_name} ${user.last_name}`}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge variant="secondary">{user.tokens || 0} tokens</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">
                          {user.is_verified ? 'Verified' : 'Verify'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No users found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Opportunity Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading opportunities...</div>
              ) : opportunities.length > 0 ? (
                <div className="space-y-4">
                  {opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{opportunity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${opportunity.budget_min} - ${opportunity.budget_max}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{opportunity.category}</Badge>
                          <Badge variant="secondary">{opportunity.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No opportunities found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escrow Accounts Tab */}
        <TabsContent value="escrow">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Escrow Accounts
              </CardTitle>
              <Button onClick={() => handleSaveEscrowAccount({})}>
                Add Account
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escrowAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{account.account_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {account.account_number} • {account.provider}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{account.country}</Badge>
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateEscrowAccount(account.id, {})}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        {account.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Contacts Tab */}
        <TabsContent value="support">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Support Contacts
              </CardTitle>
              <Button onClick={() => handleSaveSupportContact({})}>
                Add Contact
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{contact.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {contact.contact_type}: {contact.contact_value}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{contact.country}</Badge>
                        <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                          {contact.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateSupportContact(contact.id, {})}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        {contact.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Platform Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Platform Fee (%)</label>
                      <Input type="number" defaultValue="5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Min Token Purchase</label>
                      <Input type="number" defaultValue="10" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Email Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Support Email</label>
                      <Input defaultValue="support@freelancehub.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">No-Reply Email</label>
                      <Input defaultValue="noreply@freelancehub.com" />
                    </div>
                  </div>
                </div>

                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
