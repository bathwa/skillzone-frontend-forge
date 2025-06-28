import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/authStore'
import { apiService } from '@/lib/services/apiService'
import { toast } from 'sonner'
import { 
  Bell, 
  Check, 
  Trash2, 
  MessageSquare, 
  Briefcase, 
  CreditCard, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Notification {
  id: string
  user_id: string
  type: 'proposal_received' | 'proposal_accepted' | 'proposal_rejected' | 'message_received' | 'project_completed' | 'token_purchase' | 'system'
  title: string
  message: string
  read_at?: string
  created_at: string
}

export const Notifications = () => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user?.id) return

    try {
      const response = await apiService.getNotifications(user.id)
      if (response.success && response.data) {
        setNotifications(response.data)
      } else {
        // Fallback to mock data for demo
        setNotifications(getMockNotifications())
      }
    } catch (error) {
      // Fallback to mock data for demo
      setNotifications(getMockNotifications())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockNotifications = (): Notification[] => [
    {
      id: '1',
      user_id: user?.id || '',
      type: 'proposal_received',
      title: 'New proposal on "E-commerce Website Development"',
      message: 'Sarah J. submitted a proposal for your project. Review it now to find the perfect match.',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: '2',
      user_id: user?.id || '',
      type: 'project_completed',
      title: 'Project completed successfully',
      message: 'Mobile App UI/UX Design project has been completed. Please review and release payment.',
      read_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      user_id: user?.id || '',
      type: 'message_received',
      title: 'New message from client',
      message: 'David K. sent you a message about the project requirements and timeline.',
      read_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      user_id: user?.id || '',
      type: 'token_purchase',
      title: 'Token purchase successful',
      message: 'Your purchase of 15 tokens has been completed. Your balance has been updated.',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: '5',
      user_id: user?.id || '',
      type: 'proposal_accepted',
      title: 'Proposal accepted!',
      message: 'Congratulations! Your proposal for "Brand Identity Design" has been accepted by the client.',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    },
    {
      id: '6',
      user_id: user?.id || '',
      type: 'system',
      title: 'Welcome to SkillZone!',
      message: 'Thank you for joining SkillZone. Complete your profile to start finding opportunities.',
      read_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId)
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        )
        toast.success('Notification marked as read')
      }
    } catch (error) {
      // Update locally for demo
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      )
      toast.success('Notification marked as read')
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read_at)
    
    try {
      await Promise.all(unreadNotifications.map(n => apiService.markNotificationAsRead(n.id)))
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: notif.read_at || new Date().toISOString() }))
      )
      toast.success('All notifications marked as read')
    } catch (error) {
      // Update locally for demo
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: notif.read_at || new Date().toISOString() }))
      )
      toast.success('All notifications marked as read')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'proposal_received':
        return <Briefcase className="h-5 w-5 text-blue-500" />
      case 'proposal_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'proposal_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'message_received':
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case 'project_completed':
        return <Star className="h-5 w-5 text-yellow-500" />
      case 'token_purchase':
        return <CreditCard className="h-5 w-5 text-emerald-500" />
      case 'system':
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'proposal_received':
        return 'bg-blue-50 border-blue-200'
      case 'proposal_accepted':
        return 'bg-green-50 border-green-200'
      case 'proposal_rejected':
        return 'bg-red-50 border-red-200'
      case 'message_received':
        return 'bg-purple-50 border-purple-200'
      case 'project_completed':
        return 'bg-yellow-50 border-yellow-200'
      case 'token_purchase':
        return 'bg-emerald-50 border-emerald-200'
      case 'system':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read_at
    if (filter === 'read') return notification.read_at
    return true
  })

  const unreadCount = notifications.filter(n => !n.read_at).length

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view notifications</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activities and messages
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            onClick={() => setFilter('read')}
          >
            Read ({notifications.length - unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? "You're all caught up! Check back later for new updates."
                    : filter === 'unread'
                    ? "No unread notifications at the moment."
                    : "No read notifications to show."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.read_at ? 'ring-2 ring-primary/20' : ''
                } ${getNotificationColor(notification.type)}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            {!notification.read_at && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.read_at && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 