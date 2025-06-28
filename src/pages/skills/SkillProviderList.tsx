import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { SKILL_CATEGORIES, COUNTRY_CONFIGS } from '@/lib/constants'
import { toast } from 'sonner'
import { Search, Filter, MapPin, Star, Award, MessageSquare, Users } from 'lucide-react'

interface Profile {
  id: string
  user_id: string
  role: 'freelancer' | 'client'
  bio?: string
  hourly_rate?: number
  experience_level: 'junior' | 'mid' | 'senior' | 'expert'
  rating: number
  reviews_count: number
  completed_projects: number
  verified: boolean
  online_status: 'online' | 'offline'
  country: string
  created_at: string
  updated_at: string
  user: {
    name: string
    avatar_url?: string
  }
}

const countries = [
  { value: 'all', label: 'All Countries' },
  ...Object.entries(COUNTRY_CONFIGS).map(([code, config]) => ({
    value: code,
    label: config.name
  }))
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
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedExperience, setSelectedExperience] = useState('all')
  const [ratingFilter, setRatingFilter] = useState([0])
  const [hourlyRateRange, setHourlyRateRange] = useState([0, 100])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadProfiles()
  }, [currentPage, selectedCountry, selectedExperience])

  const loadProfiles = async () => {
    setIsLoading(true)
    try {
      const filters: any = {
        role: 'freelancer',
        page: currentPage,
        limit: 10
      }

      if (selectedCountry !== 'all') {
        filters.country = selectedCountry
      }
      if (selectedExperience !== 'all') {
        filters.experience_level = selectedExperience
      }

      const response = await apiService.getProfiles(filters)
      
      if (response.success && response.data) {
        setProfiles(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        // Show empty state instead of mock data
        setProfiles([])
        setTotalPages(1)
        if (response.error) {
          toast.error(response.error)
        }
      }
    } catch (error) {
      toast.error('Failed to load profiles')
      // Show empty state instead of mock data
      setProfiles([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         false // Would need skills array in profile
    
    const matchesRating = profile.rating >= ratingFilter[0]
    const matchesRate = profile.hourly_rate && profile.hourly_rate >= hourlyRateRange[0] && profile.hourly_rate <= hourlyRateRange[1]

    return matchesSearch && matchesRating && matchesRate
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedCountry('all')
    setSelectedExperience('all')
    setRatingFilter([0])
    setHourlyRateRange([0, 100])
    setCurrentPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCountryName = (countryCode: string) => {
    return COUNTRY_CONFIGS[countryCode as keyof typeof COUNTRY_CONFIGS]?.name || countryCode
  }

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case 'junior': return 'Junior (0-2 years)'
      case 'mid': return 'Mid-level (3-5 years)'
      case 'senior': return 'Senior (5+ years)'
      case 'expert': return 'Expert (10+ years)'
      default: return level
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Find Talent</h1>
            <p className="text-muted-foreground">
              Connect with skilled professionals across the SADC region
            </p>
          </div>
          {isAuthenticated && (
            <Button asChild>
              <Link to="/my-profile">
                <Users className="mr-2 h-4 w-4" />
                Update Profile
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
                  placeholder="Search by name, skills, or expertise..."
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
                    <label className="text-sm font-medium">Experience Level</label>
                    <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Minimum Rating: {ratingFilter[0]}+
                    </label>
                    <Slider
                      value={ratingFilter}
                      onValueChange={setRatingFilter}
                      max={5}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Hourly Rate: ${hourlyRateRange[0]} - ${hourlyRateRange[1]}
                    </label>
                    <Slider
                      value={hourlyRateRange}
                      onValueChange={setHourlyRateRange}
                      max={200}
                      min={0}
                      step={5}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32" />
                          <div className="h-3 bg-gray-200 rounded w-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No professionals found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or check back later for new profiles.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProfiles.length} professionals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                  <Card key={profile.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={profile.user.avatar_url || undefined} alt={profile.user.name} />
                              <AvatarFallback>
                                {profile.user.name[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{profile.user.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{getCountryName(profile.country)}</span>
                                <div className={`w-2 h-2 rounded-full ${profile.online_status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <span className="text-xs">{profile.online_status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {profile.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {profile.bio}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold">{profile.rating}</div>
                            <div className="text-xs text-muted-foreground flex items-center justify-center">
                              <Star className="h-3 w-3 mr-1" />
                              {profile.reviews_count} reviews
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{profile.completed_projects}</div>
                            <div className="text-xs text-muted-foreground">Projects</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{formatCurrency(profile.hourly_rate || 0)}</div>
                            <div className="text-xs text-muted-foreground">Hourly</div>
                          </div>
                        </div>

                        {/* Experience Level */}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {getExperienceLevelLabel(profile.experience_level)}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/profile/${profile.id}`}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Link>
                          </Button>
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
