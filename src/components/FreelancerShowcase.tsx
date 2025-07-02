
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { profileService } from '@/lib/services/profileService'
import { COUNTRY_CONFIGS } from '@/lib/constants'
import { Star, MapPin, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Profile {
  id: string
  name: string
  avatar_url?: string
  bio?: string
  city?: string
  country: string
  experience_level: string
  rating?: number
  rating_count?: number
  skills: string[]
}

export const FreelancerShowcase = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTopFreelancers()
  }, [])

  const loadTopFreelancers = async () => {
    try {
      const response = await profileService.getFreelancerProfiles({ limit: 6 })
      setProfiles(response)
    } catch (error) {
      console.error('Failed to load freelancers:', error)
    } finally {
      setIsLoading(false)
    }
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

  const getCountryName = (countryCode: string) => {
    return COUNTRY_CONFIGS[countryCode as keyof typeof COUNTRY_CONFIGS]?.name || countryCode
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Top Skilled Professionals</h2>
            <p className="text-muted-foreground">
              Connect with talented professionals across Southern Africa
            </p>
          </div>
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
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Top Skilled Professionals</h2>
          <p className="text-muted-foreground">
            Connect with talented professionals across Southern Africa
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No skilled professionals available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {profiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url} alt={profile.name} />
                        <AvatarFallback>
                          {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{profile.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {profile.city ? `${profile.city}, ${getCountryName(profile.country)}` : getCountryName(profile.country)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.bio || 'Professional freelancer ready to help with your projects.'}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {getExperienceLabel(profile.experience_level)}
                        </Badge>
                        {profile.rating && (
                          <div className="flex items-center text-sm">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {profile.rating.toFixed(1)} ({profile.rating_count || 0})
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
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/skills">
                  View All Professionals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
