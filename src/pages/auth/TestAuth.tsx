import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export const TestAuth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [testResults, setTestResults] = useState<string[]>([])
  const { user, isAuthenticated } = useAuthStore()

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testSupabaseConnection = async () => {
    try {
      addResult('Testing Supabase connection...')
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (error) {
        addResult(`❌ Supabase connection failed: ${error.message}`)
        toast.error(`Supabase connection failed: ${error.message}`)
      } else {
        addResult('✅ Supabase connection successful!')
        toast.success('Supabase connection successful!')
      }
    } catch (error) {
      addResult(`❌ Supabase test error: ${error}`)
      toast.error('Supabase connection test failed')
    }
  }

  const testSignup = async () => {
    try {
      addResult(`Testing signup for ${email}...`)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            role: 'client',
          }
        }
      })
      
      if (error) {
        addResult(`❌ Signup failed: ${error.message}`)
        toast.error(`Signup failed: ${error.message}`)
      } else if (data.user && !data.session) {
        addResult('✅ Signup successful, email confirmation required')
        toast.success('Signup successful, please check your email')
      } else if (data.user && data.session) {
        addResult('✅ Signup successful, user logged in')
        toast.success('Signup successful and user logged in')
      } else {
        addResult('❌ Signup failed: No user data returned')
        toast.error('Signup failed: No user data returned')
      }
    } catch (error) {
      addResult(`❌ Signup error: ${error}`)
      toast.error('Signup test failed')
    }
  }

  const testLogin = async () => {
    try {
      addResult(`Testing login for ${email}...`)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        addResult(`❌ Login failed: ${error.message}`)
        toast.error(`Login failed: ${error.message}`)
      } else if (data.user) {
        addResult('✅ Login successful')
        toast.success('Login successful')
        
        // Test profile fetch
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          addResult(`❌ Profile fetch failed: ${profileError.message}`)
        } else {
          addResult(`✅ Profile found: ${profile.role} role`)
        }
      } else {
        addResult('❌ Login failed: No user data returned')
        toast.error('Login failed: No user data returned')
      }
    } catch (error) {
      addResult(`❌ Login error: ${error}`)
      toast.error('Login test failed')
    }
  }

  const testCurrentUser = () => {
    addResult(`Current user: ${user ? `${user.name} (${user.role})` : 'None'}`)
    addResult(`Authenticated: ${isAuthenticated}`)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test Page</CardTitle>
          <CardDescription>
            Test various authentication functions to debug issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testSupabaseConnection} variant="outline">
              Test Database Connection
            </Button>
            <Button onClick={testSignup} disabled={!email || !password}>
              Test Signup
            </Button>
            <Button onClick={testLogin} disabled={!email || !password}>
              Test Login
            </Button>
            <Button onClick={testCurrentUser} variant="outline">
              Check Current User
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-2">
            <Label>Test Results:</Label>
            <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground">No tests run yet</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 