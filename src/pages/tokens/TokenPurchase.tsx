import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTokenCost, useCreateTokenPurchase } from '@/hooks/useTokens'
import { TOKEN_PRICING } from '@/lib/constants'
import { CreditCard, DollarSign, Shield, Clock } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/auth'
import { tokenService } from '@/services/token'
import { EscrowPaymentDetails } from '@/types/token'
import { Label } from '@/components/ui/label'

type PackageType = keyof typeof TOKEN_PRICING

export default function TokenPurchase() {
  const { user } = useAuthStore()
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'escrow' | 'payfast' | 'paystack'>('escrow')
  const [isLoading, setIsLoading] = useState(false)
  const [escrowDetails, setEscrowDetails] = useState<EscrowPaymentDetails | null>(null)

  const tokenPackages = tokenService.getAllTokenPackages()

  const handlePurchase = async () => {
    if (!selectedPackage || !user) return

    setIsLoading(true)
    try {
      const result = await tokenService.createTokenPurchase({
        packageType: selectedPackage as keyof typeof TOKEN_PRICING,
        paymentMethod,
      })

      if (result.success) {
        if (result.escrowDetails) {
          setEscrowDetails(result.escrowDetails)
        }
        toast({
          title: "Purchase Initiated",
          description: "Your token purchase has been initiated successfully.",
        })
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Failed to initiate token purchase",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Token purchase error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to purchase tokens</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Purchase Tokens</h1>
          <p className="text-muted-foreground">
            Choose a token package to enhance your FreelanceHub experience
          </p>
        </div>

        {/* Token Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {tokenPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`cursor-pointer transition-all ${
                selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.description}</CardTitle>
                <div className="text-2xl font-bold text-primary">
                  {pkg.tokens} Tokens
                </div>
                <div className="text-sm text-muted-foreground">
                  ${pkg.price_usd.toFixed(2)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    ${(pkg.price_usd / pkg.tokens).toFixed(3)} per token
                  </div>
                  {selectedPackage === pkg.id && (
                    <Badge className="w-full">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Method Selection */}
        {selectedPackage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="escrow"
                    name="paymentMethod"
                    value="escrow"
                    checked={paymentMethod === 'escrow'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  />
                  <Label htmlFor="escrow">Bank Transfer (Escrow)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="payfast"
                    name="paymentMethod"
                    value="payfast"
                    checked={paymentMethod === 'payfast'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    disabled
                  />
                  <Label htmlFor="payfast" className="text-muted-foreground">
                    PayFast (Coming Soon)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="paystack"
                    name="paymentMethod"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    disabled
                  />
                  <Label htmlFor="paystack" className="text-muted-foreground">
                    Paystack (Coming Soon)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Summary */}
        {selectedPackage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const pkg = tokenPackages.find(p => p.id === selectedPackage)
                const totalCost = pkg ? tokenService.calculateTotalCost(selectedPackage as keyof typeof TOKEN_PRICING) : 0
                const fee = pkg ? totalCost - pkg.price_usd : 0
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span>{pkg?.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tokens:</span>
                      <span>{pkg?.tokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>${pkg?.price_usd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee:</span>
                      <span>${fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Purchase Button */}
        {selectedPackage && (
          <div className="text-center">
            <Button 
              onClick={handlePurchase} 
              disabled={isLoading}
              size="lg"
              className="w-full md:w-auto"
            >
              {isLoading ? 'Processing...' : 'Purchase Tokens'}
            </Button>
          </div>
        )}

        {/* Escrow Payment Details */}
        {escrowDetails && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Payment Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {escrowDetails.instructions}
                  </pre>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Reference: <strong>{escrowDetails.reference}</strong></p>
                  <p>Amount: <strong>R{escrowDetails.amount.toFixed(2)}</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
