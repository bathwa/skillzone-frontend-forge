import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { countryService } from '@/lib/services/countryService'
import { COUNTRY_CONFIGS, type CountryCode } from '@/lib/constants'
import { 
  Settings, 
  CreditCard, 
  Phone, 
  Globe, 
  Users, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'
import { apiService } from '@/lib/services/apiService'

interface EscrowAccount {
  id: string
  country: CountryCode
  account_name: string
  account_number: string
  account_type: 'mobile_wallet' | 'bank_account' | 'digital_wallet'
  provider?: string
  phone_number?: string
  is_active: boolean
}

interface SupportContact {
  id: string
  country: CountryCode
  phone: string
  email: string
  whatsapp: string
  is_active: boolean
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('zimbabwe')
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([])
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([])
  const [editingEscrow, setEditingEscrow] = useState<string | null>(null)
  const [editingContact, setEditingContact] = useState<string | null>(null)
  const [newEscrow, setNewEscrow] = useState<Partial<EscrowAccount>>({})
  const [newContact, setNewContact] = useState<Partial<SupportContact>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showEscrowForm, setShowEscrowForm] = useState(false)
  const [showSupportForm, setShowSupportForm] = useState(false)
  const [showAddEscrowForm, setShowAddEscrowForm] = useState(false)
  const [showAddSupportForm, setShowAddSupportForm] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page.',
        variant: 'destructive',
      })
      // Redirect to dashboard
      window.location.href = '/dashboard'
    }
  }, [user, toast])

  // Load country data
  useEffect(() => {
    loadCountryData()
  }, [selectedCountry])

  const loadCountryData = () => {
    const config = COUNTRY_CONFIGS[selectedCountry]
    setEscrowAccounts(config.escrow_accounts)
    setSupportContacts(config.support_contacts)
  }

  const handleSaveEscrowAccount = async (data: EscrowAccountFormData) => {
    setIsLoading(true)
    try {
      const response = await apiService.saveEscrowAccount({
        country: data.country,
        account_name: data.account_name,
        account_number: data.account_number,
        account_type: data.account_type,
        provider: data.provider,
        phone_number: data.phone_number,
      })
      
      if (response.success) {
        toast.success('Escrow account saved successfully')
        setShowEscrowForm(false)
        // Refresh escrow accounts list
        loadEscrowAccounts()
      } else {
        toast.error(response.error || 'Failed to save escrow account')
      }
    } catch (error) {
      toast.error('Failed to save escrow account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSupportContact = async (data: SupportContactFormData) => {
    setIsLoading(true)
    try {
      const response = await apiService.saveSupportContact({
        country: data.country,
        phone: data.phone,
        email: data.email,
        whatsapp: data.whatsapp,
      })
      
      if (response.success) {
        toast.success('Support contact saved successfully')
        setShowSupportForm(false)
        // Refresh support contacts list
        loadSupportContacts()
      } else {
        toast.error(response.error || 'Failed to save support contact')
      }
    } catch (error) {
      toast.error('Failed to save support contact')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEscrowAccount = async (data: EscrowAccountFormData) => {
    setIsLoading(true)
    try {
      const response = await apiService.saveEscrowAccount({
        country: data.country,
        account_name: data.account_name,
        account_number: data.account_number,
        account_type: data.account_type,
        provider: data.provider,
        phone_number: data.phone_number,
      })
      
      if (response.success) {
        toast.success('Escrow account added successfully')
        setShowAddEscrowForm(false)
        // Refresh escrow accounts list
        loadEscrowAccounts()
      } else {
        toast.error(response.error || 'Failed to add escrow account')
      }
    } catch (error) {
      toast.error('Failed to add escrow account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSupportContact = async (data: SupportContactFormData) => {
    setIsLoading(true)
    try {
      const response = await apiService.saveSupportContact({
        country: data.country,
        phone: data.phone,
        email: data.email,
        whatsapp: data.whatsapp,
      })
      
      if (response.success) {
        toast.success('Support contact added successfully')
        setShowAddSupportForm(false)
        // Refresh support contacts list
        loadSupportContacts()
      } else {
        toast.error(response.error || 'Failed to add support contact')
      }
    } catch (error) {
      toast.error('Failed to add support contact')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateOpportunityStatus = async (opportunityId: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      const response = await apiService.updateOpportunityStatus(opportunityId, status)
      
      if (response.success) {
        toast.success('Opportunity status updated successfully')
        // Refresh opportunities list
        loadOpportunities()
      } else {
        toast.error(response.error || 'Failed to update opportunity status')
      }
    } catch (error) {
      toast.error('Failed to update opportunity status')
    }
  }

  const toggleEscrowStatus = async (escrowId: string) => {
    const updatedAccounts = escrowAccounts.map(acc => 
      acc.id === escrowId ? { ...acc, is_active: !acc.is_active } : acc
    )
    setEscrowAccounts(updatedAccounts)
    
    // Real API call to update escrow account status
    try {
      const account = escrowAccounts.find(acc => acc.id === escrowId)
      if (account) {
        const response = await apiService.saveEscrowAccount({
          country: account.country,
          account_name: account.account_name,
          account_number: account.account_number,
          account_type: account.account_type,
          provider: account.provider,
          phone_number: account.phone_number,
        })
        
        if (!response.success) {
          toast.error('Failed to update escrow account status')
          // Revert the change
          setEscrowAccounts(escrowAccounts)
        }
      }
    } catch (error) {
      toast.error('Failed to update escrow account status')
      // Revert the change
      setEscrowAccounts(escrowAccounts)
    }
  }

  const toggleContactStatus = async (contactId: string) => {
    const updatedContacts = supportContacts.map(cont => 
      cont.id === contactId ? { ...cont, is_active: !cont.is_active } : cont
    )
    setSupportContacts(updatedContacts)
    
    // Real API call to update support contact status
    try {
      const contact = supportContacts.find(cont => cont.id === contactId)
      if (contact) {
        const response = await apiService.saveSupportContact({
          country: contact.country,
          phone: contact.phone,
          email: contact.email,
          whatsapp: contact.whatsapp,
        })
        
        if (!response.success) {
          toast.error('Failed to update support contact status')
          // Revert the change
          setSupportContacts(supportContacts)
        }
      }
    } catch (error) {
      toast.error('Failed to update support contact status')
      // Revert the change
      setSupportContacts(supportContacts)
    }
  }

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform settings and country configurations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <Select value={selectedCountry} onValueChange={(value: CountryCode) => setSelectedCountry(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COUNTRY_CONFIGS).map(([code, config]) => (
                <SelectItem key={code} value={code}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="escrow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="escrow" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Escrow Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Support Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Platform Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="escrow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Escrow Accounts - {COUNTRY_CONFIGS[selectedCountry].name}</span>
                <Button onClick={() => setNewEscrow({})} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </CardTitle>
              <CardDescription>
                Manage escrow accounts for token purchases and payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Escrow Form */}
              {Object.keys(newEscrow).length > 0 && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="account-name">Account Name</Label>
                        <Input
                          id="account-name"
                          value={newEscrow.account_name || ''}
                          onChange={(e) => setNewEscrow({ ...newEscrow, account_name: e.target.value })}
                          placeholder="Account holder name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input
                          id="account-number"
                          value={newEscrow.account_number || ''}
                          onChange={(e) => setNewEscrow({ ...newEscrow, account_number: e.target.value })}
                          placeholder="Account number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-type">Account Type</Label>
                        <Select
                          value={newEscrow.account_type || ''}
                          onValueChange={(value) => setNewEscrow({ ...newEscrow, account_type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                            <SelectItem value="bank_account">Bank Account</SelectItem>
                            <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="provider">Provider</Label>
                        <Input
                          id="provider"
                          value={newEscrow.provider || ''}
                          onChange={(e) => setNewEscrow({ ...newEscrow, provider: e.target.value })}
                          placeholder="e.g., Ecocash, Standard Bank"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={newEscrow.phone_number || ''}
                          onChange={(e) => setNewEscrow({ ...newEscrow, phone_number: e.target.value })}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setNewEscrow({})}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleAddEscrowAccount}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Escrow Accounts */}
              <div className="space-y-4">
                {escrowAccounts.map((escrow) => (
                  <Card key={escrow.id}>
                    <CardContent className="pt-6">
                      {editingEscrow === escrow.id ? (
                        <EscrowEditForm
                          escrow={escrow}
                          onSave={handleSaveEscrowAccount}
                          onCancel={() => setEditingEscrow(null)}
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{escrow.account_name}</h3>
                              <Badge variant={escrow.is_active ? 'default' : 'secondary'}>
                                {escrow.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {escrow.account_number} • {escrow.account_type}
                            </p>
                            {escrow.provider && (
                              <p className="text-sm text-muted-foreground">
                                Provider: {escrow.provider}
                              </p>
                            )}
                            {escrow.phone_number && (
                              <p className="text-sm text-muted-foreground">
                                Phone: {escrow.phone_number}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEscrowStatus(escrow.id)}
                            >
                              {escrow.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEscrow(escrow.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Support Contacts - {COUNTRY_CONFIGS[selectedCountry].name}</span>
                <Button onClick={() => setNewContact({})} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </CardTitle>
              <CardDescription>
                Manage support contact information for each country
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Contact Form */}
              {Object.keys(newContact).length > 0 && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="support-phone">Phone</Label>
                        <Input
                          id="support-phone"
                          value={newContact.phone || ''}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="support-email">Email</Label>
                        <Input
                          id="support-email"
                          type="email"
                          value={newContact.email || ''}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          placeholder="Email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="support-whatsapp">WhatsApp</Label>
                        <Input
                          id="support-whatsapp"
                          value={newContact.whatsapp || ''}
                          onChange={(e) => setNewContact({ ...newContact, whatsapp: e.target.value })}
                          placeholder="WhatsApp number"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setNewContact({})}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleAddSupportContact}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Support Contacts */}
              <div className="space-y-4">
                {supportContacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="pt-6">
                      {editingContact === contact.id ? (
                        <ContactEditForm
                          contact={contact}
                          onSave={handleSaveSupportContact}
                          onCancel={() => setEditingContact(null)}
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">Support Contact</h3>
                              <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                                {contact.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>📞 {contact.phone}</p>
                              <p>📧 {contact.email}</p>
                              <p>💬 {contact.whatsapp}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleContactStatus(contact.id)}
                            >
                              {contact.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingContact(contact.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Users</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Freelancers</span>
                    <span className="font-semibold">856</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Clients</span>
                    <span className="font-semibold">378</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New This Month</span>
                    <span className="font-semibold">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Financial Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Transactions</span>
                    <span className="font-semibold">$45,678</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fees</span>
                    <span className="font-semibold">$4,567</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Escrow</span>
                    <span className="font-semibold">$12,345</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-semibold">$8,901</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Edit Form Components
function EscrowEditForm({ 
  escrow, 
  onSave, 
  onCancel 
}: { 
  escrow: EscrowAccount
  onSave: (escrow: EscrowAccount) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(escrow)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edit-account-name">Account Name</Label>
          <Input
            id="edit-account-name"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-account-number">Account Number</Label>
          <Input
            id="edit-account-number"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-account-type">Account Type</Label>
          <Select
            value={formData.account_type}
            onValueChange={(value) => setFormData({ ...formData, account_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
              <SelectItem value="bank_account">Bank Account</SelectItem>
              <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-provider">Provider</Label>
          <Input
            id="edit-provider"
            value={formData.provider || ''}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-phone">Phone Number</Label>
          <Input
            id="edit-phone"
            value={formData.phone_number || ''}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

function ContactEditForm({ 
  contact, 
  onSave, 
  onCancel 
}: { 
  contact: SupportContact
  onSave: (contact: SupportContact) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(contact)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edit-support-phone">Phone</Label>
          <Input
            id="edit-support-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-support-email">Email</Label>
          <Input
            id="edit-support-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-support-whatsapp">WhatsApp</Label>
          <Input
            id="edit-support-whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
} 