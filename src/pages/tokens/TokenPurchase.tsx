
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { tokenService } from '@/lib/services/tokenService'
import { toast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  Zap, 
  Star, 
  Crown,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface TokenPackage {
  id: string
  name: string
  tokens: number
  price_usd: number
  description: string
  popular?: boolean
  bonus?: number
}

const tokenPackages: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 10,
    price_usd: 9.99,
    description: 'Perfect for trying out the platform'
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    tokens: 50,
    price_usd: 39.99,
    description: 'Great for regular users',
    popular: true,
    bonus: 5
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    tokens: 100,
    price_usd: 69.99,
    description: 'Best value for power users',
    bonus: 15
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    tokens: 250,
    price_usd: 149.99,
    description: 'For businesses and agencies',
    bonus: 50
  }
]

export const TokenPurchase = () => {
  const { user } = useAuthStore()
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async (tokenPackage: TokenPackage) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to purchase tokens",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setSelectedPackage(tokenPackage)

    try {
      const response = await tokenService.purchaseTokens({
        userId: user.id,
        packageId: tokenPackage.id,
        tokens: tokenPackage.tokens,
        amount: tokenPackage.price_usd
      })

      if (response.success) {
        toast({
          title: "Success",
          description: `Successfully purchased ${tokenPackage.tokens} tokens!`,
        })
      } else {
        toast({
          title: "Error",
          description: response.error || 'Failed to purchase tokens',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: 'An error occurred during purchase',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setSelectedPackage(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to purchase tokens</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Purchase Tokens</h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect token package for your needs
          </p>
          <div className="flex items-center justify-center space-x-2 text-lg">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Current Balance: <strong>{user.tokens || 0} tokens</strong></span>
          </div>
        </div>

        {/* Token Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tokenPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative hover:shadow-lg transition-shadow ${
                pkg.popular ? 'border-primary shadow-lg' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mb-4">
                  {pkg.id === 'enterprise' ? (
                    <Crown className="h-12 w-12 mx-auto text-yellow-500" />
                  ) : (
                    <Zap className="h-12 w-12 mx-auto text-blue-500" />
                  )}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(pkg.price_usd)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{pkg.tokens} Tokens</div>
                  {pkg.bonus && (
                    <div className="text-sm text-green-600 font-medium">
                      + {pkg.bonus} bonus tokens!
                    </div>
                  )}
                </div>

                <CardDescription className="text-center">
                  {pkg.description}
                </CardDescription>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Submit proposals to opportunities</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Access premium features</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handlePurchase(pkg)}
                  disabled={isProcessing && selectedPackage?.id === pkg.id}
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  {isProcessing && selectedPackage?.id === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">What You Get With Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Briefcase className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-semibold">Submit Proposals</h3>
                <p className="text-sm text-muted-foreground">
                  Use tokens to submit proposals to client opportunities
                </p>
              </div>
              <div className="text-center space-y-2">
                <Star className="h-8 w-8 mx-auto text-yellow-500" />
                <h3 className="font-semibold">Premium Features</h3>
                <p className="text-sm text-muted-foreground">
                  Access advanced search, priority listing, and more
                </p>
              </div>
              <div className="text-center space-y-2">
                <Crown className="h-8 w-8 mx-auto text-purple-500" />
                <h3 className="font-semibold">Priority Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get faster response times and dedicated assistance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How do tokens work?</h4>
              <p className="text-sm text-muted-foreground">
                Tokens are used to perform actions on the platform like submitting proposals, 
                accessing premium features, and more. Each action costs a certain number of tokens.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do tokens expire?</h4>
              <p className="text-sm text-muted-foreground">
                No, tokens never expire. Once purchased, they remain in your account until used.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I get a refund?</h4>
              <p className="text-sm text-muted-foreground">
                Token purchases are generally non-refundable, but we'll consider refunds on a 
                case-by-case basis for unused tokens within 30 days of purchase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TokenPurchase
