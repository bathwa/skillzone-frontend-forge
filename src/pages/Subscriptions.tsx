
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Star, Zap, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const subscriptionTiers = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '5 proposals per month',
      'Basic profile visibility',
      'Standard support',
      'Access to standard opportunities'
    ],
    limitations: [
      'Limited chat features',
      'No premium opportunity access'
    ],
    current: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    description: 'Best for active professionals',
    features: [
      '25 proposals per month',
      'Enhanced profile visibility',
      'Priority support',
      'Access to premium opportunities',
      'Advanced chat features',
      'Portfolio showcase',
      'Skills verification badge'
    ],
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 79,
    description: 'For top-tier professionals',
    features: [
      'Unlimited proposals',
      'Maximum profile visibility',
      'Dedicated account manager',
      'Exclusive elite opportunities',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'White-label solutions'
    ]
  }
]

export const Subscriptions = () => {
  const [selectedTier, setSelectedTier] = useState('basic')

  const handleUpgrade = (tierId: string) => {
    console.log('Upgrading to:', tierId)
    // In real implementation, this would handle the subscription upgrade
  }

  const handleDowngrade = (tierId: string) => {
    console.log('Downgrading to:', tierId)
    // In real implementation, this would handle the subscription downgrade
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock more opportunities and features with our subscription plans. 
          Upgrade or downgrade anytime to match your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {subscriptionTiers.map((tier) => (
          <Card 
            key={tier.id}
            className={`relative transition-all duration-200 hover:shadow-lg ${
              tier.popular ? 'border-primary shadow-lg scale-105' : ''
            } ${tier.current ? 'ring-2 ring-green-500' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            {tier.current && (
              <div className="absolute -top-3 right-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {tier.id === 'basic' && <Star className="h-8 w-8 text-muted-foreground" />}
                {tier.id === 'pro' && <Zap className="h-8 w-8 text-primary" />}
                {tier.id === 'elite' && <Crown className="h-8 w-8 text-yellow-500" />}
              </div>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${tier.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {tier.limitations?.map((limitation, index) => (
                  <li key={index} className="flex items-start gap-3 opacity-60">
                    <span className="text-sm line-through">{limitation}</span>
                  </li>
                ))}
              </ul>

              {tier.current ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : tier.price === 0 ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleDowngrade(tier.id)}
                >
                  Downgrade to Basic
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => handleUpgrade(tier.id)}
                >
                  Upgrade to {tier.name}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            Manage your current subscription settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">Current Plan: Basic</h3>
              <p className="text-sm text-muted-foreground">
                Next billing date: N/A (Free plan)
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                View Usage
              </Button>
              <Button variant="outline" size="sm">
                Billing History
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Auto-Renewal</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically renew your subscription each month
              </p>
              <Button variant="outline" size="sm">
                Enable Auto-Renewal
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Payment Method</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Update your payment information
              </p>
              <Button variant="outline" size="sm">
                Update Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
