import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTokenBalance } from '@/hooks/useTokens'
import { useAuthStore } from '@/stores/authStore'
import { DollarSign, Plus, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TokenBalance() {
  const { user } = useAuthStore()
  const { data: balance, isLoading, error } = useTokenBalance()

  if (!user) return null

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {isLoading ? '...' : error ? 'Error' : balance || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available tokens
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Active
            </Badge>
            <Link to="/tokens/purchase">
              <Button size="sm" className="h-8">
                <Plus className="h-3 w-3 mr-1" />
                Buy Tokens
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 