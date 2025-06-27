
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAuthStore } from '@/stores/authStore'
import { Search, Filter, MapPin, Star, Award, MessageSquare } from 'lucide-react'

// Mock data for service providers
const mockProviders = [
  {
    id: '1',
    name: 'Sarah Johnson',
    bio: 'Full-stack developer with 5+ years experience building scalable web applications using React, Node.js, and cloud technologies.',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
    country: 'south_africa',
    rating: 4.9,
    reviews_count: 47,
    hourly_rate: 45,
    experience_level: 'senior',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    verified: true,
    online_status: 'online',
    completed_projects: 89,
  },
  {
    id: '2',
    name: 'Michael Ndlovu',
    bio: 'Creative UI/UX designer specializing in mobile apps and SaaS platforms. I create user-centered designs that drive engagement.',
    skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    country: 'zimbabwe',
    rating: 4.8,
    reviews_count: 32,
    hourly_rate: 35,
    experience_level: 'mid',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    verified: true,
    online_status: 'offline',
    completed_projects: 56,
  },
  {
    id: '3',
    name: 'Amina Hassan',
    bio: 'Data scientist and ML engineer with expertise in predictive analytics, NLP, and computer vision. PhD in Statistics.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Visualization'],
    country: 'botswana',
    rating: 5.0,
    reviews_count: 28,
    hourly_rate: 65,
    experience_level: 'expert',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amina',
    verified: true,
    online_status: 'online',
    completed_projects: 34,
  },
  {
    id: '4',
    name: 'David Kgomo',
    bio: 'Digital marketing specialist helping businesses grow their online presence through SEO, content marketing, and social media.',
    skills: ['SEO', 'Content Marketing', 'Google Ads', 'Social Media', 'Analytics'],
    country: 'south_africa',
    rating: 4.7,
    reviews_count: 65,
    hourly_rate: 30,
    experience_level: 'mid',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    verified: false,
    online_status: 'online',
    completed_projects: 78,
  },
]

const skillCategories = [
  { value: 'all', label: 'All Skills' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'writing', label: 'Writing' },
]

const countries = [
  { value: 'all', label: 'All Countries' },
  { value: 'south_africa', label: 'South Africa' },
  { value: 'botswana', label: 'Botswana' },
  { value: 'zimbabwe', label: 'Zimbabwe' },
  { value: 'namibia', label: 'Namibia' },
  { value: 'zambia', label: 'Zambia' },
]

const experienceLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-level (3-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
  { value: 'expert', label: 'Expert (10+ years)' },
]

export const SkillProviderList = () => {
  const { isAuthenticated } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedExperience, setSelectedExperience] = useState('all')
  const [ratingFilter, setRatingFilter] = useState([0])
  const [hourlyRateRange, setHourlyRateRange] = useState([0, 100])
  const [showFilters, setShowFilters] = useState(false)

  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCountry = selectedCountry === 'all' || provider.country === selectedCountry
    const matchesExperience = selectedExperience === 'all' || provider.experience_level === selectedExperience
    const matchesRating = provider.rating >= ratingFilter[0]
    const matchesRate = provider.hourly_rate >= hourlyRateRange[0] && provider.hourly_rate <= hourlyRateRange[1]

    return matchesSearch && matchesCountry && matchesExperience && matchesRating && matchesRate
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedCountry('all')
    setSelectedExperience('all')
    setRatingFilter([0])
    setHourlyRateRange([0, 100])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-yellow-500'
    }
  }

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'junior':
        return 'bg-blue-100 text-blue-800'
      case 'mid':
        return 'bg-green-100 text-green-800'
      case 'senior':
        return 'bg-purple-100 text-purple-800'
      case 'expert':
        return 'bg-gold-100 text-gold-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Talent</h1>
        <p className="text-muted-foreground">
          Find skilled professionals across the SADC region
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, skills, or expertise..."
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
              {skillCategories.map((category) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Experience Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Experience</label>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Minimum Rating: {ratingFilter[0]}/5
                </label>
                <Slider
                  value={ratingFilter}
                  onValueChange={setRatingFilter}
                  max={5}
                  min={0}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              {/* Hourly Rate Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Hourly Rate: {formatCurrency(hourlyRateRange[0])} - {formatCurrency(hourlyRateRange[1])}
                </label>
                <Slider
                  value={hourlyRateRange}
                  onValueChange={setHourlyRateRange}
                  max={100}
                  min={0}
                  step={5}
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
          Showing {filteredProviders.length} of {mockProviders.length} professionals
        </p>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.avatar_url} alt={provider.name} />
                      <AvatarFallback>{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(provider.online_status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg truncate">{provider.name}</CardTitle>
                      {provider.verified && (
                        <Award className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{provider.rating}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({provider.reviews_count})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className={getExperienceBadgeColor(provider.experience_level)}>
                  {provider.experience_level}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Bio */}
              <CardDescription className="line-clamp-3">
                {provider.bio}
              </CardDescription>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {provider.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {provider.skills.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{provider.skills.length - 4} more
                  </Badge>
                )}
              </div>

              {/* Location and Rate */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  {countries.find(c => c.value === provider.country)?.label}
                </div>
                <div className="font-medium text-foreground">
                  {formatCurrency(provider.hourly_rate)}/hr
                </div>
              </div>

              {/* Projects Completed */}
              <div className="text-sm text-muted-foreground">
                {provider.completed_projects} projects completed
              </div>

              {/* Action Buttons */}
              {isAuthenticated ? (
                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link to={`/profile/${provider.id}`}>
                      View Profile
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                    Sign up to connect with talent
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
      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No professionals found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find more talent.
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        </div>
      )}

      {/* Pagination Placeholder */}
      {filteredProviders.length > 0 && (
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
