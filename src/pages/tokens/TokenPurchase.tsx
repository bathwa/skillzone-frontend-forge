
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTokenPricing, useCreateTokenPurchase } from '@/hooks/useTokens'
import { toast } from 'sonner'
import { 
  CreditCard, 
  Package,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

export const TokenPurchase = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { data: packages, isLoading } = useTokenPricing()
  const createPurchase = useCreateTokenPurchase()

  const handlePurchase = async (packageId: string) => {
    if (!packageId) return

    setIsProcessing(true)
    try {
      const result = await createPurchase.mutateAsync({
        packageType: packageId as keyof typeof import('@/lib/constants').TOKEN_PRICING,
        paymentMethod: 'paystack',
        reference: `purchase_${Date.now()}`
      })

      if (result.success) {
        toast.success('Token purchase initiated successfully!')
        // Handle successful purchase
      } else {
        toast.error(result.error || 'Purchase failed')
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Purchase Tokens</h1>
            <p className="text-muted-foreground">Loading token packages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Purchase Tokens</h1>
          <p className="text-muted-foreground">
            Choose a token package that fits your needs and start applying to opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages?.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
              } ${pkg.id === 'premium' ? 'border-primary' : ''}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  <Package className="h-8 w-8 text-primary" />
                  {pkg.id === 'premium' && (
                    <Star className="h-4 w-4 text-yellow-500 ml-1" />
                  )}
                </div>
                <CardTitle className="text-lg capitalize">{pkg.id}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                {pkg.id === 'premium' && (
                  <Badge variant="secondary" className="w-fit mx-auto">
                    Most Popular
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {pkg.tokens}
                  </div>
                  <div className="text-sm text-muted-foreground">tokens</div>
                </div>
                <div className="text-2xl font-bold">
                  ${pkg.price_usd}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${(pkg.price_usd / pkg.tokens).toFixed(2)} per token
                </div>
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePurchase(pkg.id)
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      Purchase Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                What you get with tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>• Apply to premium opportunities (2 tokens)</p>
                <p>• Apply to standard opportunities (1 token)</p>
                <p>• Access detailed client information (1 token)</p>
                <p>• Boost your proposal visibility (1 token)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
                Secure Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>• Secure payment processing</p>
                <p>• Multiple payment methods supported</p>
                <p>• Instant token delivery</p>
                <p>• 24/7 customer support</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
