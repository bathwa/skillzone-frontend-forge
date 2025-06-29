import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiService } from '@/lib/services/apiService'
import { opportunityService } from '@/lib/services/opportunityService'
import { toast } from '@/components/ui/use-toast'
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'client' | 'freelancer' | 'admin'
  created_at: string
  tokens: number
  is_verified: boolean
}

interface Opportunity {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  status: 'active' | 'closed' | 'in_progress'
  created_at: string
  client_name?: string
}

interface EscrowAccount {
  id: string
  account_name: string
  account_number: string
  bank_name: string
  account_type: string
  country: string
  is_active: boolean
  created_at: string
}

interface SupportContact {
  id: string
  name: string
  email: string
  phone: string
  department: string
  is_active: boolean
  created_at: string
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([])
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load users - using getProfiles as a fallback
      const usersResponse = await apiService.getProfiles()
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at,
          tokens: profile.tokens_balance,
          is_verified: profile.verified || false
        })))
      }

      // Load opportunities
      const opportunitiesResponse = await opportunityService.getOpportunities({
        category: '',
        country: 'south_africa',
        search: '',
        type: 'standard',
        sort: 'newest',
        limit: 100
      })
      
      if (opportunitiesResponse.success && opportunitiesResponse.data) {
        setOpportunities(opportunitiesResponse.data)
      }

      // Mock data for escrow accounts and support contacts since they don't exist
      setEscrowAccounts([])
      setSupportContacts([])
      
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEscrowAccount = async (account: Omit<EscrowAccount, 'id' | 'created_at'>) => {
    try {
      // Mock implementation
      const newAccount: EscrowAccount = {
        id: Date.now().toString(),
        ...account,
        created_at: new Date().toISOString()
      }
      setEscrowAccounts(prev => [...prev, newAccount])
      toast({
        title: "Success",
        description: "Escrow account added successfully",
      })
    } catch (error) {
      console.error('Error adding escrow account:', error)
      toast({
        title: "Error",
        description: "Failed to add escrow account",
        variant: "destructive",
      })
    }
  }

  const handleAddSupportContact = async (contact: Omit<SupportContact, 'id' | 'created_at'>) => {
    try {
      // Mock implementation
      const newContact: SupportContact = {
        id: Date.now().toString(),
        ...contact,
        created_at: new Date().toISOString()
      }
      setSupportContacts(prev => [...prev, newContact])
      toast({
        title: "Success",
        description: "Support contact added successfully",
      })
    } catch (error) {
      console.error('Error adding support contact:', error)
      toast({
        title: "Error",
        description: "Failed to add support contact",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEscrowAccount = async (id: string, updates: Partial<EscrowAccount>) => {
    try {
      // Mock implementation
      setEscrowAccounts(prev => prev.map(account => 
        account.id === id ? { ...account, ...updates } : account
      ))
      toast({
        title: "Success",
        description: "Escrow account updated successfully",
      })
    } catch (error) {
      console.error('Error updating escrow account:', error)
      toast({
        title: "Error",
        description: "Failed to update escrow account",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSupportContact = async (id: string, updates: Partial<SupportContact>) => {
    try {
      // Mock implementation
      setSupportContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...updates } : contact
      ))
      toast({
        title: "Success",
        description: "Support contact updated successfully",
      })
    } catch (error) {
      console.error('Error updating support contact:', error)
      toast({
        title: "Error",
        description: "Failed to update support contact",
        variant: "destructive",
      })
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.role === 'freelancer').length} freelancers, {users.filter(u => u.role === 'client').length} clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.filter(o => o.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {opportunities.length} total opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Token Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.reduce((sum, user) => sum + user.tokens, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Tokens in circulation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.slice(0, 5).map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{opportunity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${opportunity.budget_min} - ${opportunity.budget_max}
                    </p>
                  </div>
                  <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
                    {opportunity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{user.name}</h3>
                  {user.is_verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {user.tokens} tokens
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderOpportunities = () => (
    <Card>
      <CardHeader>
        <CardTitle>Opportunity Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{opportunity.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {opportunity.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
                    {opportunity.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ${opportunity.budget_min} - ${opportunity.budget_max}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {opportunity.category}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Posted {new Date(opportunity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderEscrowAccounts = () => {
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
      account_name: '',
      account_number: '',
      bank_name: '',
      account_type: 'checking',
      country: 'south_africa',
      is_active: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      await handleAddEscrowAccount(formData)
      setFormData({
        account_name: '',
        account_number: '',
        bank_name: '',
        account_type: 'checking',
        country: 'south_africa',
        is_active: true
      })
      setShowAddForm(false)
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Escrow Accounts</CardTitle>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </CardHeader>
          <CardContent>
            {showAddForm && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account_name">Account Name</Label>
                    <Input
                      id="account_name"
                      value={formData.account_name}
                      onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select value={formData.account_type} onValueChange={(value) => setFormData({...formData, account_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Account</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {escrowAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{account.account_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {account.bank_name} - {account.account_number}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={account.is_active ? 'default' : 'secondary'}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{account.country}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateEscrowAccount(account.id, { is_active: !account.is_active })}
                    >
                      {account.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
              {escrowAccounts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No escrow accounts configured yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSupportContacts = () => {
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      department: 'general',
      is_active: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      await handleAddSupportContact(formData)
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'general',
        is_active: true
      })
      setShowAddForm(false)
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Support Contacts</CardTitle>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </CardHeader>
          <CardContent>
            {showAddForm && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Support</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Support</SelectItem>
                        <SelectItem value="disputes">Dispute Resolution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Contact</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {supportContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                        {contact.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{contact.department}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateSupportContact(contact.id, { is_active: !contact.is_active })}
                    >
                      {contact.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
              {supportContacts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No support contacts configured yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading admin dashboard...</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="escrow">Escrow Accounts</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          {renderUsers()}
        </TabsContent>

        <TabsContent value="opportunities" className="mt-6">
          {renderOpportunities()}
        </TabsContent>

        <TabsContent value="escrow" className="mt-6">
          {renderEscrowAccounts()}
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          {renderSupportContacts()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
