import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { TOKEN_PRICING, COUNTRY_CONFIGS } from '@/lib/constants'
import { toast } from 'sonner'
import { 
  CreditCard, 
  TrendingUp, 
  History, 
  ShoppingCart, 
  CheckCircle,
  DollarSign,
  Package,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react'

interface TokenTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'spend' | 'refund' | 'bonus'
  amount: number
  balance_after: number
  description: string
  reference?: string
  created_at: string
}

export const MyTokens = () => {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [tokenBalance, setTokenBalance] = useState<number>(0)

  useEffect(() => {
    if (user?.id) {
      loadTokenData()
    }
  }, [user])

  const loadTokenData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Load token balance
      const balanceResponse = await apiService.getUserTokenBalance(user.id)
      if (balanceResponse.success && balanceResponse.data !== null) {
        setTokenBalance(balanceResponse.data)
      }

      // Load transaction history
      const transactionsResponse = await apiService.getTokenTransactions(user.id)
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data)
      } else {
        setTransactions([])
        if (transactionsResponse.error) {
          toast.error(transactionsResponse.error)
        }
      }
    } catch (error) {
      toast.error('Failed to load token data')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async (packageType: string) => {
    if (!user?.id) return

    setIsPurchasing(true)
    try {
      const packageData = TOKEN_PRICING[packageType as keyof typeof TOKEN_PRICING]
      if (!packageData) {
        toast.error('Invalid package selected')
        return
      }

      const response = await apiService.purchaseTokens(user.id, packageData.tokens, packageType)
      if (response.success) {
        toast.success(`Successfully purchased ${packageData.tokens} tokens!`)
        setSelectedPackage(null)
        // Refresh user data to update token balance
        // This would typically update the user store
      } else {
        toast.error(response.error || 'Failed to purchase tokens')
      }
    } catch (error) {
      toast.error('Failed to purchase tokens')
    } finally {
      setIsPurchasing(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="h-5 w-5 text-green-500" />
      case 'spend':
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case 'refund':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'bonus':
        return <Star className="h-5 w-5 text-yellow-500" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600'
      case 'spend':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
      case 'bonus':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCountryConfig = () => {
    return COUNTRY_CONFIGS[user?.country || 'zimbabwe']
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your tokens</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Tokens</h1>
          <p className="text-muted-foreground">
            Manage your token balance and purchase new tokens
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="purchase">Purchase Tokens</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Token Balance Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">Token Balance</h2>
                    <div className="text-4xl font-bold mt-2">{tokenBalance}</div>
                    <p className="text-muted-foreground mt-1">Available tokens</p>
                  </div>
                  <div className="text-right">
                    <CreditCard className="h-16 w-16 text-primary/60 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {getCountryConfig()?.currency_symbol || '$'}0.00 USD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Purchased</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactions
                      .filter(t => t.type === 'purchase')
                      .reduce((sum, t) => sum + t.amount, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Lifetime tokens</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.abs(transactions
                      .filter(t => t.type === 'spend')
                      .reduce((sum, t) => sum + t.amount, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Used tokens</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bonus Earned</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactions
                      .filter(t => t.type === 'bonus')
                      .reduce((sum, t) => sum + t.amount, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Free tokens</p>
                </CardContent>
              </Card>
            </div>

            {/* How Tokens Work */}
            <Card>
              <CardHeader>
                <CardTitle>How Tokens Work</CardTitle>
                <CardDescription>
                  Understanding the token system and how to use them effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      What you can do with tokens:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Apply to premium opportunities</li>
                      <li>• Access detailed client information</li>
                      <li>• Boost your proposal visibility</li>
                      <li>• Unlock advanced features</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-blue-500" />
                      Token costs:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Standard opportunity: 1 token</li>
                      <li>• Premium opportunity: 2 tokens</li>
                      <li>• Client contact info: 1 token</li>
                      <li>• Proposal boost: 1 token</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchase" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Tokens</CardTitle>
                <CardDescription>
                  Choose a package that fits your needs. All packages include bonus tokens.
                </CardDescription>
              </CardHeader>
              <CardContent>
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

                {/* Payment Instructions */}
                <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-4">Payment Instructions</h3>
                  <div className="space-y-3 text-sm">
                    <p>
                      <strong>Country:</strong> {getCountryConfig()?.name}
                    </p>
                    <p>
                      <strong>Currency:</strong> {getCountryConfig()?.currency} ({getCountryConfig()?.currency_symbol})
                    </p>
                    <p>
                      <strong>Payment Method:</strong> Escrow payment system
                    </p>
                    <p className="text-muted-foreground">
                      After selecting a package, you'll receive payment instructions via email. 
                      Tokens will be credited to your account once payment is confirmed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all your token transactions and balance changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="h-10 w-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">
                      Start by purchasing your first token package
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{transaction.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                            {transaction.reference && (
                              <p className="text-xs text-muted-foreground">
                                Ref: {transaction.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} tokens
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Balance: {transaction.balance_after}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 