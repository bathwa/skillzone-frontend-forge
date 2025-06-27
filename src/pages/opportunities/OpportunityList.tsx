
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAuthStore } from '@/stores/authStore'
import { Search, Filter, MapPin, DollarSign, Clock, Star, Users } from 'lucide-react'

// Mock data for opportunities
const mockOpportunities = [
  {
    id: '1',
    title: 'E-commerce Website Development',
    description: 'Looking for a skilled developer to build a modern e-commerce platform with React and Node.js. Must have experience with payment gateways and responsive design.',
    budget_min: 2000,
    budget_max: 5000,
    category: 'web_development',
    type: 'premium',
    client_country: 'south_africa',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    posted_at: '2024-01-15',
    proposals_count: 12,
  },
  {
    id: '2', 
    title: 'Mobile App UI/UX Design',
    description: 'Need a creative designer to create user interface designs for a fintech mobile application. Looking for modern, clean designs.',
    budget_min: 800,
    budget_max: 1500,
    category: 'design',
    type: 'standard',
    client_country: 'botswana',
    skills: ['Figma', 'UI/UX Design', 'Mobile Design', 'Prototyping'],
    posted_at: '2024-01-14',
    proposals_count: 8,
  },
  {
    id: '3',
    title: 'Content Writing for Tech Blog',
    description: 'Seeking experienced technical writers to create engaging blog posts about emerging technologies, AI, and software development.',
    budget_min: 500,
    budget_max: 1000,
    category: 'writing',
    type: 'standard',
    client_country: 'zimbabwe',
    skills: ['Technical Writing', 'SEO', 'Research', 'AI/ML'],
    posted_at: '2024-01-13',
    proposals_count: 15,
  },
  {
    id: '4',
    title: 'Data Analysis Dashboard',
    description: 'Build an interactive dashboard for sales data visualization using Python and modern charting libraries. Experience with big data preferred.',
    budget_min: 1500,
    budget_max: 3000,
    category: 'data_science',
    type: 'premium',
    client_country: 'namibia',
    skills: ['Python', 'Data Analysis', 'Tableau', 'SQL'],
    posted_at: '2024-01-12',
    proposals_count: 6,
  },
]

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'marketing', label: 'Marketing' },
]

const countries = [
  { value: 'all', label: 'All Countries' },
  { value: 'south_africa', label: 'South Africa' },
  { value: 'botswana', label: 'Botswana' },
  { value: 'zimbabwe', label: 'Zimbabwe' },
  { value: 'namibia', label: 'Namibia' },
  { value: 'zambia', label: 'Zambia' },
]

export const OpportunityList = () => {
  const { isAuthenticated } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [budgetRange, setBudgetRange] = useState([0, 10000])
  const [showFilters, setShowFilters] = useState(false)

  const filteredOpportunities = mockOpportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || opportunity.category === selectedCategory
    const matchesCountry = selectedCountry === 'all' || opportunity.client_country === selectedCountry
    const matchesType = selectedType === 'all' || opportunity.type === selectedType
    const matchesBudget = opportunity.budget_min >= budgetRange[0] && opportunity.budget_max <= budgetRange[1]

    return matchesSearch && matchesCategory && matchesCountry && matchesType && matchesBudget
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedCountry('all')
    setSelectedType('all')
    setBudgetRange([0, 10000])
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

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Opportunities</h1>
        <p className="text-muted-foreground">
          Discover amazing projects from clients across the SADC region
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search opportunities, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filters Toggle */}
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="lg:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Country Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue />
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

              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Opportunity Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="standard">Standard (1 Token)</SelectItem>
                    <SelectItem value="premium">Premium (3 Tokens)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Budget Range: {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
                </label>
                <Slider
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                  max={10000}
                  min={0}
                  step={100}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Showing {filteredOpportunities.length} of {mockOpportunities.length} opportunities
        </p>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow duration-300 relative">
            {/* Premium Badge */}
            {opportunity.type === 'premium' && (
              <Badge className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600">
                Premium
              </Badge>
            )}

            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">
                {opportunity.title}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {opportunity.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Budget */}
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="mr-1 h-4 w-4" />
                {formatCurrency(opportunity.budget_min)} - {formatCurrency(opportunity.budget_max)}
              </div>

              {/* Location */}
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {countries.find(c => c.value === opportunity.client_country)?.label}
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {opportunity.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {opportunity.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{opportunity.skills.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDate(opportunity.posted_at)}
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-3 w-3" />
                  {opportunity.proposals_count} proposals
                </div>
              </div>

              {/* Action Button */}
              {isAuthenticated ? (
                <Button className="w-full" asChild>
                  <Link to={`/opportunity/${opportunity.id}`}>
                    View Details
                  </Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                    Sign up to apply for this opportunity
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find more opportunities.
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        </div>
      )}

      {/* Pagination Placeholder */}
      {filteredOpportunities.length > 0 && (
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button>1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
