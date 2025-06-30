
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useAuthValidation } from '@/hooks/useAuthValidation'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'

interface AuthDebugPanelProps {
  isVisible: boolean
  onToggle: () => void
}

export const AuthDebugPanel = ({ isVisible, onToggle }: AuthDebugPanelProps) => {
  const { user, session, isAuthenticated, isLoading } = useAuthStore()
  const { isValidating, validationError, validateAuthState } = useAuthValidation()

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="bg-blue-100 hover:bg-blue-200"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Auth Debug Panel</CardTitle>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={validateAuthState}
                disabled={isValidating}
              >
                <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span>Authenticated:</span>
            <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
              {isAuthenticated ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Loading:</span>
            <Badge variant={isLoading ? 'destructive' : 'secondary'}>
              {isLoading ? 'Yes' : 'No'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>User ID:</span>
            <span className="font-mono text-xs truncate max-w-32">
              {user?.id || 'None'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>User Role:</span>
            <Badge variant="outline">
              {user?.role || 'None'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>Session:</span>
            <Badge variant={session ? 'default' : 'secondary'}>
              {session ? 'Active' : 'None'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>User Name:</span>
            <span className="text-xs truncate max-w-32">
              {user?.first_name || user?.email || 'None'}
            </span>
          </div>

          {validationError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <div className="text-red-800 font-medium">Validation Error:</div>
              <div className="text-red-600 text-xs mt-1">{validationError}</div>
            </div>
          )}

          {isValidating && (
            <div className="text-center">
              <Badge variant="outline">Validating...</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
