
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageSquare, Bug, Lightbulb, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

interface FeedbackItem {
  id: string
  type: 'bug' | 'feature' | 'improvement' | 'general'
  title: string
  description: string
  status: 'pending' | 'in-review' | 'resolved' | 'closed'
  admin_response?: string
  created_at: string
}

export const Feedback = () => {
  const { toast } = useToast()
  const [feedbackType, setFeedbackType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Mock feedback history - in real app this would come from API
  const [feedbackHistory] = useState<FeedbackItem[]>([
    {
      id: '1',
      type: 'feature',
      title: 'Add dark mode toggle',
      description: 'It would be great to have a dark mode option for better night usage.',
      status: 'resolved',
      admin_response: 'Thanks for the suggestion! Dark mode has been implemented and is available in the header.',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'bug',
      title: 'Profile image not uploading',
      description: 'When I try to upload a profile image, it shows an error message.',
      status: 'in-review',
      created_at: '2024-01-20T14:22:00Z'
    }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback! We\'ll review it and get back to you soon.',
      })
      
      // Reset form
      setFeedbackType('')
      setTitle('')
      setDescription('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4" />
      case 'feature': return <Lightbulb className="h-4 w-4" />
      case 'improvement': return <Star className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in-review': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Help us improve SkillsPortal by sharing your thoughts, reporting bugs, or suggesting new features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Feedback Type
                </label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">🐛 Bug Report</SelectItem>
                    <SelectItem value="feature">💡 Feature Request</SelectItem>
                    <SelectItem value="improvement">⭐ Improvement</SelectItem>
                    <SelectItem value="general">💬 General Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of your feedback"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide detailed information about your feedback..."
                  rows={5}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !feedbackType || !title || !description}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feedback History */}
        <Card>
          <CardHeader>
            <CardTitle>My Feedback</CardTitle>
            <CardDescription>
              View your previously submitted feedback and admin responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No feedback submitted yet.</p>
                  <p className="text-sm">Your feedback history will appear here.</p>
                </div>
              ) : (
                feedbackHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <h4 className="font-medium">{item.title}</h4>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    
                    {item.admin_response && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">Admin Response:</p>
                        <p className="text-sm">{item.admin_response}</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Submitted on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
