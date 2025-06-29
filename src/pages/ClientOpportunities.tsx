import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import { 
  Plus, 
  Briefcase, 
  Users, 
  DollarSign, 
  Clock, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
  TrendingUp
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  type: 'standard' | 'premium'
  status: 'active' | 'closed' | 'in_progress'
  proposals_count: number
  posted_at: string
  created_at: string
  updated_at: string
}

interface Proposal {
  id: string
  opportunity_id: string
  freelancer_id: string
  client_id: string
  budget: number
  delivery_time: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  submitted_at: string
  created_at: string
  updated_at: string
  freelancer?: {
    id: string
    name: string
    avatar_url?: string
    rating: number
    country: string
  }
}

export const ClientOpportunities = () => {
  const { user } = useAuthStore()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadOpportunities()
      loadProposals()
    }
  }, [user])

  const loadOpportunities = async () => {
    if (!user?.id) return

    try {
      const response = await apiService.getOpportunities({ 
        client_id: user.id,
        status: 'open'
      })
      
      if (Array.isArray(response)) {
        const mappedOpportunities = response.map(opp => ({
          id: opp.id,
          title: opp.title,
          description: opp.description,
          budget_min: opp.budget_min,
          budget_max: opp.budget_max,
          category: opp.category,
          type: opp.type,
          status: opp.status === 'open' ? 'active' as const : 
                 opp.status === 'in_progress' ? 'in_progress' as const : 'closed' as const,
          proposals_count: opp.proposals_count,
          posted_at: opp.created_at,
          created_at: opp.created_at,
          updated_at: opp.updated_at
        }))
        setOpportunities(mappedOpportunities)
      } else {
        setOpportunities([])
        if (response.error) {
          toast.error(response.error)
        }
      }
    } catch (error) {
      toast.error('Failed to load opportunities')
      setOpportunities([])
    }
  }

  const loadProposals = async () => {
    if (!user?.id) return

    try {
      const response = await apiService.getUserProposals(user.id)
      
      if (response.success && response.data) {
        const mappedProposals: Proposal[] = response.data.map(proposal => ({
          id: proposal.id,
          opportunity_id: proposal.opportunity_id,
          freelancer_id: proposal.freelancer_id,
          client_id: user.id,
          budget: proposal.proposed_budget || proposal.budget || 0,
          delivery_time: proposal.estimated_duration || 0,
          message: proposal.cover_letter,
          status: proposal.status === 'pending' || proposal.status === 'accepted' || proposal.status === 'rejected' 
                 ? proposal.status as 'pending' | 'accepted' | 'rejected'
                 : 'pending' as const,
          submitted_at: proposal.created_at,
          created_at: proposal.created_at,
          updated_at: proposal.updated_at,
          freelancer: {
            id: proposal.freelancer_id,
            name: 'Freelancer', // Would need to fetch from profiles
            avatar_url: undefined,
            rating: 0,
            country: 'south_africa'
          }
        }))
        setProposals(mappedProposals)
      } else {
        setProposals([])
        if (response.error) {
          toast.error(response.error)
        }
      }
    } catch (error) {
      toast.error('Failed to load proposals')
      setProposals([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      // Update proposal status
      setProposals(prev => 
        prev.map(proposal => 
          proposal.id === proposalId 
            ? { ...proposal, status: 'accepted' as const }
            : proposal
        )
      )
      toast.success('Proposal accepted successfully!')
    } catch (error) {
      toast.error('Failed to accept proposal')
    }
  }

  const handleRejectProposal = async (proposalId: string) => {
    try {
      // Update proposal status
      setProposals(prev => 
        prev.map(proposal => 
          proposal.id === proposalId 
            ? { ...proposal, status: 'rejected' as const }
            : proposal
        )
      )
      toast.success('Proposal rejected')
    } catch (error) {
      toast.error('Failed to reject proposal')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getOpportunityProposals = (opportunityId: string) => {
    return proposals.filter(proposal => proposal.opportunity_id === opportunityId)
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your opportunities</h1>
        </div>
      </div>
    )
  }

  if (user.role !== 'client') {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This page is only available for clients.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Opportunities</h1>
            <p className="text-muted-foreground">
              Manage your posted opportunities and review proposals
            </p>
          </div>
          <Button asChild>
            <Link to="/opportunities/new">
              <Plus className="mr-2 h-4 w-4" />
              Post New Opportunity
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList>
            <TabsTrigger value="opportunities">My Opportunities</TabsTrigger>
            <TabsTrigger value="proposals">All Proposals</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by posting your first opportunity to find talented professionals
                    </p>
                    <Button asChild>
                      <Link to="/opportunities/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Post Your First Opportunity
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {opportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                            <Badge className={getStatusColor(opportunity.status)}>
                              {opportunity.status.replace('_', ' ')}
                            </Badge>
                            {opportunity.type === 'premium' && (
                              <Badge variant="secondary">Premium</Badge>
                            )}
                          </div>
                          <CardDescription className="text-base">
                            {opportunity.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/opportunities/${opportunity.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            ${opportunity.budget_min} - ${opportunity.budget_max}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {opportunity.proposals_count} proposals
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Posted {formatDate(opportunity.posted_at)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">
                            {opportunity.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Proposals Preview */}
                      {opportunity.status === 'active' && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Recent Proposals</h4>
                          <div className="space-y-2">
                            {getOpportunityProposals(opportunity.id).slice(0, 2).map((proposal) => (
                              <div key={proposal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="text-sm font-medium">{proposal.freelancer?.name || 'Freelancer'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ${proposal.budget} • {proposal.delivery_time} days
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getProposalStatusColor(proposal.status)}>
                                    {proposal.status}
                                  </Badge>
                                  <Button variant="outline" size="sm">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {getOpportunityProposals(opportunity.id).length > 2 && (
                              <Button variant="ghost" size="sm" className="w-full">
                                View all {getOpportunityProposals(opportunity.id).length} proposals
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Proposals</CardTitle>
                <CardDescription>
                  Review and manage all proposals for your opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No proposals yet</h3>
                    <p className="text-muted-foreground">
                      Proposals will appear here once freelancers apply to your opportunities
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {proposal.freelancer?.name?.[0] || 'F'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">{proposal.freelancer?.name || 'Freelancer'}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${proposal.budget} • {proposal.delivery_time} days • {proposal.freelancer?.country || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {proposal.message.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getProposalStatusColor(proposal.status)}>
                            {proposal.status}
                          </Badge>
                          {proposal.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptProposal(proposal.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectProposal(proposal.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
