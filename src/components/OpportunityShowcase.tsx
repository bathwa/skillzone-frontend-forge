
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { opportunityService } from '@/lib/services/opportunityService'
import { COUNTRY_CONFIGS } from '@/lib/constants'
import { MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Opportunity {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  type: 'standard' | 'premium'
  client_country: string
  required_skills: string[]
  created_at: string
  client_name: string
}

export const OpportunityShowcase = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLatestOpportunities()
  }, [])

  const loadLatestOpportunities = async () => {
    try {
      const response = await opportunityService.getOpportunities({ limit: 6 })
      setOpportunities(response.opportunities)
    } catch (error) {
      console.error('Failed to load opportunities:', error)
    } finally {
      setIsLoading(false)
    }
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
      day: 'numeric'
    })
  }

  const getCategoryLabel = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getCountryName = (countryCode: string) => {
    return COUNTRY_CONFIGS[countryCode as keyof typeof COUNTRY_CONFIGS]?.name || countryCode
  }

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest Opportunities</h2>
            <p className="text-muted-foreground">
              Discover new projects and grow your freelance career
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16" />
                      <div className="h-6 bg-gray-200 rounded w-20" />
                    </div>
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
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest Opportunities</h2>
          <p className="text-muted-foreground">
            Discover new projects and grow your freelance career
          </p>
        </div>

        {opportunities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No opportunities available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold line-clamp-2">{opportunity.title}</h3>
                        {opportunity.type === 'premium' && (
                          <Badge variant="secondary" className="ml-2">Premium</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {opportunity.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3" />
                          {formatCurrency(opportunity.budget_min)} - {formatCurrency(opportunity.budget_max)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDate(opportunity.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {getCountryName(opportunity.client_country)}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {getCategoryLabel(opportunity.category)}
                        </Badge>
                      </div>

                      {opportunity.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {opportunity.required_skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {opportunity.required_skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{opportunity.required_skills.length - 3} more
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
                <Link to="/opportunities">
                  View All Opportunities
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
