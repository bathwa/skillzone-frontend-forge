import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Eye, MessageSquare, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'
import type { Proposal } from '@/lib/services/typeMappers'

interface ProposalWithDetails extends Proposal {
  opportunity_title?: string
  client_name?: string
  client_country?: string
}

export const MyProposals = () => {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProposal, setSelectedProposal] = useState<ProposalWithDetails | null>(null)

  const { data: proposals, isLoading, error } = useQuery({
    queryKey: ['userProposals', user?.id],
    queryFn: () => apiService.getUserProposals(user?.id || ''),
    enabled: !!user?.id,
  })

  const withdrawMutation = useMutation({
    mutationFn: (proposalId: string) => 
      apiService.updateProposalStatus(proposalId, 'withdrawn'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProposals'] })
      toast({
        title: 'Proposal Withdrawn',
        description: 'Your proposal has been successfully withdrawn.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to withdraw proposal. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const filteredProposals = proposals?.data?.filter((proposal: any) => {
    const matchesSearch = (proposal.opportunity_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (proposal.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'accepted':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'withdrawn':
        return <Badge variant="outline">Withdrawn</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleWithdraw = (proposalId: string) => {
    if (confirm('Are you sure you want to withdraw this proposal? This action cannot be undone.')) {
      withdrawMutation.mutate(proposalId)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">Failed to load proposals. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const proposalsData = proposals?.data || []
  const pendingCount = proposalsData.filter((p: any) => p.status === 'pending').length
  const acceptedCount = proposalsData.filter((p: any) => p.status === 'accepted').length
  const totalValue = proposalsData.reduce((sum: number, p: any) => sum + (p.budget || 0), 0)

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Proposals</h1>
            <p className="text-muted-foreground">
              Track and manage your submitted proposals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Proposals</p>
                    <p className="text-2xl font-bold">{proposalsData.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                    <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
                  <p className="text-muted-foreground">
                    {proposalsData.length === 0 
                      ? "You haven't submitted any proposals yet. Start by browsing opportunities!"
                      : "No proposals match your current filters."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal: any) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{proposal.opportunity_title || 'Untitled Opportunity'}</h3>
                          <p className="text-muted-foreground">
                            Client: {proposal.client_name || 'Unknown Client'} • {proposal.client_country || 'Unknown Country'}
                          </p>
                        </div>
                        {getStatusBadge(proposal.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">{formatCurrency(proposal.budget || 0)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">{proposal.delivery_time || 0} days</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Submitted <span className="font-medium">{formatDate(proposal.created_at)}</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {proposal.message || 'No cover letter provided'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 lg:flex-shrink-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedProposal(proposal)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{proposal.opportunity_title || 'Untitled Opportunity'}</DialogTitle>
                            <DialogDescription>
                              Proposal details and client information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Client</p>
                                <p>{proposal.client_name || 'Unknown Client'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Country</p>
                                <p>{proposal.client_country || 'Unknown Country'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Proposed Budget</p>
                                <p className="font-semibold">{formatCurrency(proposal.budget || 0)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                <p>{proposal.delivery_time || 0} days</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Cover Letter</p>
                              <Textarea
                                value={proposal.message || 'No cover letter provided'}
                                readOnly
                                className="min-h-[120px]"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">
                                Submitted on {formatDate(proposal.created_at)}
                              </p>
                              {getStatusBadge(proposal.status)}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {proposal.status === 'pending' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleWithdraw(proposal.id)}
                          disabled={withdrawMutation.isPending}
                        >
                          {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 