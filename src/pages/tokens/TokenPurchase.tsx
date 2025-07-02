
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useCreateTokenPurchase, useTokenPricing } from '@/hooks/useTokens'
import { toast } from 'sonner'

export default function TokenPurchase() {
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'paystack'>('payfast')
  
  const { data: packages, isLoading: packagesLoading } = useTokenPricing()
  const createPurchase = useCreateTokenPurchase()

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error('Please select a token package')
      return
    }

    try {
      const result = await createPurchase.mutateAsync({
        packageType: selectedPackage as any,
        paymentMethod: paymentMethod,
      })

      if (result.success) {
        toast.success('Token purchase initiated successfully!')
      } else {
        toast.error(result.error || 'Failed to initiate purchase')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Failed to process purchase')
    }
  }

  if (packagesLoading) {
    return <div>Loading packages...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Purchase Tokens</h1>
          <p className="text-muted-foreground">
            Choose a token package to get started with our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages?.map((pkg) => (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all ${
                selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {pkg.name}
                  {pkg.popular && <Badge variant="secondary">Popular</Badge>}
                </CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">${pkg.price_usd}</div>
                <div className="text-sm text-muted-foreground mb-4">
                  {pkg.tokens} tokens
                </div>
                <div className="text-xs text-muted-foreground">
                  ${(pkg.price_usd / pkg.tokens).toFixed(3)} per token
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedPackage && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Complete your token purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Payment Method
                </label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as 'payfast' | 'paystack')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payfast">PayFast</SelectItem>
                    <SelectItem value="paystack">PayStack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={createPurchase.isPending}
                className="w-full"
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
