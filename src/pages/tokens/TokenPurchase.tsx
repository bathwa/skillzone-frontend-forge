
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTokenCost, useCreateTokenPurchase } from '@/hooks/useTokens'
import { TOKEN_PRICING } from '@/lib/constants'
import { CreditCard, DollarSign, Shield, Clock } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type PackageType = keyof typeof TOKEN_PRICING

export default function TokenPurchase() {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'escrow' | 'payfast' | 'paystack'>('escrow')
  
  const { data: totalCost, isLoading: costLoading } = useTokenCost(selectedPackage)
  const createPurchase = useCreateTokenPurchase()

  const packages = Object.entries(TOKEN_PRICING) as [PackageType, typeof TOKEN_PRICING[PackageType]][]

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast({
        title: "Error",
        description: "Please select a token package",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await createPurchase.mutateAsync({
        packageType: selectedPackage,
        paymentMethod,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Token purchase initiated successfully",
        })
      } else {
        toast({
          title: "Error", 
          description: result.error || "Purchase failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Purchase Tokens</h1>
          <p className="text-muted-foreground">
            Choose a token package to unlock premium features and opportunities
          </p>
        </div>

        {/* Token Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {packages.map(([key, pkg]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all ${
                selectedPackage === key 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedPackage(key)}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{pkg.name}</CardTitle>
                <p className="text-2xl font-bold text-primary">${pkg.price_usd}</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {pkg.tokens} Tokens
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pkg.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        {selectedPackage && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'escrow' 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setPaymentMethod('escrow')}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Escrow Payment</h3>
                      <p className="text-sm text-muted-foreground">
                        Secure bank transfer with manual verification
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium text-muted-foreground">Other Payment Methods</h3>
                      <p className="text-sm text-muted-foreground">
                        Coming soon...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Summary */}
        {selectedPackage && (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-medium">{TOKEN_PRICING[selectedPackage].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens:</span>
                  <span className="font-medium">{TOKEN_PRICING[selectedPackage].tokens}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>${TOKEN_PRICING[selectedPackage].price_usd}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${costLoading ? '...' : totalCost?.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={handlePurchase}
                disabled={createPurchase.isPending || costLoading}
                className="w-full mt-6"
                size="lg"
              >
                {createPurchase.isPending ? 'Processing...' : 'Purchase Tokens'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
