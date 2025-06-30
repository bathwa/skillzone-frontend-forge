import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { tokenService } from '@/lib/services/tokenService'
import { TOKEN_PRICING, COUNTRY_CONFIGS } from '@/lib/constants'
import { toast } from 'sonner'
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Package,
  DollarSign,
  ArrowRight,
  Star,
  Shield,
  Clock
} from 'lucide-react'

export const TokenPurchase = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [escrowDetails, setEscrowDetails] = useState<any>(null)

  const handlePurchase = async (packageType: string) => {
    if (!user?.id) {
      toast.error('Please log in to purchase tokens')
      return
    }

    const packageData = TOKEN_PRICING[packageType as keyof typeof TOKEN_PRICING]
    if (!packageData) {
      toast.error('Invalid package selected')
      return
    }

    setIsPurchasing(true)
    try {
      // Use the token service to handle purchase
      const response = await tokenService.createTokenPurchase({
        packageType: packageType as any,
        paymentMethod: 'escrow',
      })

      if (response.success) {
        toast.success(`Successfully purchased ${packageData.tokens} tokens!`)
        if (response.escrowDetails) {
          setEscrowDetails(response.escrowDetails)
        }
        // navigate('/my-tokens') // Comment out auto-navigation so user can see escrow details
      } else {
        toast.error(response.error || 'Failed to purchase tokens')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Failed to purchase tokens')
    } finally {
      setIsPurchasing(false)
    }
  }

  const getCountryConfig = () => {
    return COUNTRY_CONFIGS[user?.country || 'zimbabwe']
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to purchase tokens</h1>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/my-tokens')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Tokens
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Purchase Tokens</h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect package for your needs
          </p>
        </div>

        {/* Token Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(TOKEN_PRICING).map(([key, packageData]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPackage === key ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPackage(key)}
            >
              <CardHeader className="text-center pb-4">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg capitalize">{key}</CardTitle>
                <CardDescription>{packageData.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {packageData.tokens}
                  </div>
                  <div className="text-sm text-muted-foreground">tokens</div>
                </div>
                <div className="text-2xl font-bold">
                  ${packageData.price_usd}
                </div>
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePurchase(key)
                  }}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    'Processing...'
                  ) : (
                    <>
                      Purchase
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Why Purchase Tokens?</CardTitle>
            <CardDescription>
              Unlock premium features and maximize your opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Star className="h-8 w-8 mx-auto text-yellow-500" />
                <h3 className="font-semibold">Access Premium Jobs</h3>
                <p className="text-sm text-muted-foreground">
                  Apply to high-value opportunities before others
                </p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 mx-auto text-green-500" />
                <h3 className="font-semibold">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">
                  All transactions are protected by our escrow system
                </p>
              </div>
              <div className="text-center space-y-2">
                <Clock className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-semibold">Instant Activation</h3>
                <p className="text-sm text-muted-foreground">
                  Tokens are added to your account immediately
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Your Location</h3>
                <p className="text-sm text-muted-foreground">
                  Country: {getCountryConfig()?.name}<br />
                  Currency: {getCountryConfig()?.currency} ({getCountryConfig()?.currency_symbol})
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <p className="text-sm text-muted-foreground">
                  Secure escrow payment system<br />
                  Multiple payment options available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escrow Details */}
        {escrowDetails && (
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-4">Escrow Payment Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Account Name:</strong> {escrowDetails.accountName}</p>
              <p><strong>Account Number:</strong> {escrowDetails.accountNumber}</p>
              <p><strong>Account Type:</strong> {escrowDetails.accountType}</p>
              {escrowDetails.provider && <p><strong>Provider:</strong> {escrowDetails.provider}</p>}
              {escrowDetails.phoneNumber && <p><strong>Phone Number:</strong> {escrowDetails.phoneNumber}</p>}
              <p><strong>Amount:</strong> ${escrowDetails.amount}</p>
              <p className="flex items-center"><strong>Reference:</strong> <span className="ml-2 select-all bg-gray-100 px-2 py-1 rounded cursor-pointer" onClick={() => {navigator.clipboard.writeText(escrowDetails.reference); toast.success('Reference copied!')}}>{escrowDetails.reference}</span></p>
              {escrowDetails.instructions && <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">{escrowDetails.instructions}</pre>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
