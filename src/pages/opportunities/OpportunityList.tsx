import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { OPPORTUNITY_CATEGORIES, COUNTRY_CONFIGS } from '@/lib/constants'
import { toast } from 'sonner'
import { Search, Filter, MapPin, DollarSign, Clock, Star, Users, Briefcase } from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  type: 'standard' | 'premium'
  client_country: string
  skills: string[]
  posted_at: string
  proposals_count: number
  status: 'active' | 'closed' | 'in_progress'
}

const countries = [
  { value: 'all', label: 'All Countries' },
  ...Object.entries(COUNTRY_CONFIGS).map(([code, config]) => ({
    value: code,
    label: config.name
  }))
]

const opportunityTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
]

export const OpportunityList = () => {
  const { isAuthenticated, user } = useAuthStore()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [budgetRange, setBudgetRange] = useState([0, 10000])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadOpportunities()
  }, [currentPage, selectedCategory, selectedCountry, selectedType])

  const loadOpportunities = async () => {
    setIsLoading(true)
    try {
      const filters: any = {
        page: currentPage,
        limit: 10,
        status: 'active'
      }

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory
      }
      if (selectedCountry !== 'all') {
        filters.country = selectedCountry
      }
      if (selectedType !== 'all') {
        filters.type = selectedType
      }

      const response = await apiService.getOpportunities(filters)
      
      if (response.success && response.data) {
        setOpportunities(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        // Show empty state instead of mock data
        setOpportunities([])
        setTotalPages(1)
        if (response.error) {
          toast.error(response.error)
        }
      }
    } catch (error) {
      toast.error('Failed to load opportunities')
      // Show empty state instead of mock data
      setOpportunities([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesBudget = opportunity.budget_min >= budgetRange[0] && opportunity.budget_max <= budgetRange[1]

    return matchesSearch && matchesBudget
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedCountry('all')
    setSelectedType('all')
    setBudgetRange([0, 10000])
    setCurrentPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryLabel = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getCountryName = (countryCode: string) => {
    return COUNTRY_CONFIGS[countryCode as keyof typeof COUNTRY_CONFIGS]?.name || countryCode
  }

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Find Opportunities</h1>
            <p className="text-muted-foreground">
              Discover projects that match your skills and expertise
            </p>
          </div>
          {isAuthenticated && user?.role === 'client' && (
            <Button asChild>
              <Link to="/opportunities/new">
                <Briefcase className="mr-2 h-4 w-4" />
                Post Opportunity
              </Link>
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search opportunities, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                <Button variant="ghost" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {OPPORTUNITY_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase().replace(' ', '_')}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {opportunityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Budget Range: ${budgetRange[0]} - ${budgetRange[1]}
                    </label>
                    <Slider
                      value={budgetRange}
                      onValueChange={setBudgetRange}
                      max={10000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="flex space-x-2">
                        <div className="h-6 bg-gray-200 rounded w-16" />
                        <div className="h-6 bg-gray-200 rounded w-20" />
                        <div className="h-6 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or check back later for new opportunities.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredOpportunities.length} opportunities
                </p>
              </div>

              <div className="space-y-4">
                {filteredOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                <Link 
                                  to={`/opportunity/${opportunity.id}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {opportunity.title}
                                </Link>
                              </h3>
                              <p className="text-muted-foreground line-clamp-2">
                                {opportunity.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {opportunity.type === 'premium' && (
                                <Badge variant="secondary">Premium</Badge>
                              )}
                              <Badge variant="outline">
                                {getCategoryLabel(opportunity.category)}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-4 w-4" />
                              {formatCurrency(opportunity.budget_min)} - {formatCurrency(opportunity.budget_max)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              {getCountryName(opportunity.client_country)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              Posted {formatDate(opportunity.posted_at)}
                            </div>
                            <div className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              {opportunity.proposals_count} proposals
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {opportunity.skills.slice(0, 4).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {opportunity.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{opportunity.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
