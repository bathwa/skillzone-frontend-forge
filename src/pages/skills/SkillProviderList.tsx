import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import { Search, MapPin, Star, DollarSign, Filter } from 'lucide-react'

interface Profile {
  id: string
  user: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  hourly_rate?: number
  rating?: number
  reviews_count?: number
  bio?: string
  city?: string
  country: string
  experience_level: 'junior' | 'mid' | 'senior' | 'expert'
  verified?: boolean
  skills: string[]
}

export const SkillProviderList = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [experienceFilter, setExperienceFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    filterProfiles()
  }, [profiles, searchTerm, selectedSkill, experienceFilter])

  const loadProfiles = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getProfiles({ role: 'freelancer', limit: 50 })
      if (response.success && response.data) {
        // Map API response to Profile shape
        const mappedProfiles = response.data.map((profile: any) => ({
          id: profile.id,
          user: {
            id: profile.id,
            name: profile.name || `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            avatar_url: profile.avatar_url,
          },
          hourly_rate: profile.hourly_rate,
          rating: profile.rating,
          reviews_count: profile.reviews_count,
          bio: profile.bio,
          city: profile.city,
          country: profile.country,
          experience_level: profile.experience_level || 'mid',
          verified: profile.verified,
          skills: profile.skills || [],
        }))
        setProfiles(mappedProfiles)
      } else {
        setProfiles([])
      }
    } catch (error) {
      toast.error('Failed to load skill providers')
      setProfiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterProfiles = () => {
    let filtered = profiles

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by experience level
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(profile => {
        if (experienceFilter === 'junior' && profile.experience_level === 'junior') return true
        if (experienceFilter === 'mid' && profile.experience_level === 'mid') return true
        if (experienceFilter === 'senior' && profile.experience_level === 'senior') return true
        if (experienceFilter === 'expert' && profile.experience_level === 'expert') return true
        return false
      })
    }

    setFilteredProfiles(filtered)
  }

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case 'junior': return 'Junior'
      case 'mid': return 'Mid-level'
      case 'senior': return 'Senior'
      case 'expert': return 'Expert'
      default: return level
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Skill Providers</h1>
          <p className="text-muted-foreground">
            Find talented professionals for your projects
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, skills, or bio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Level</label>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Skill Category</label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="All skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="web_development">Web Development</SelectItem>
                    <SelectItem value="mobile_development">Mobile Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Loading...' : `${filteredProfiles.length} providers found`}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No providers found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.user.avatar_url} alt={profile.user.name} />
                        <AvatarFallback>
                          {profile.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{profile.user.name}</h3>
                          {profile.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {profile.city || 'Location not set'}
                          </div>
                          {profile.rating && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {profile.rating.toFixed(1)} ({profile.reviews_count || 0})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {profile.bio || 'No bio available'}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {getExperienceLabel(profile.experience_level)}
                        </Badge>
                        {profile.hourly_rate && (
                          <div className="flex items-center text-sm font-medium">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatCurrency(profile.hourly_rate)}/hr
                          </div>
                        )}
                      </div>

                      {profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {profile.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {profile.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
