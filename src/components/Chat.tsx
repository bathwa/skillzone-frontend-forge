
import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { chatService, type Message, type ChatRoom } from '@/lib/services/chatService'
import { formatDate } from '@/lib/utils'
import { 
  Send, 
  MessageSquare, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile
} from 'lucide-react'

interface ChatProps {
  projectId?: string
  otherUserId?: string
  onClose?: () => void
}

export const Chat: React.FC<ChatProps> = ({ projectId, otherUserId, onClose }) => {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine room ID
  const roomId = projectId ? `project_${projectId}` : otherUserId ? `direct_${[user?.id, otherUserId].sort().join('_')}` : null

  // Fetch chat rooms
  const { data: chatRooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['chatRooms', user?.id],
    queryFn: () => chatService.getChatRooms(user?.id || ''),
    enabled: !!user?.id,
  })

  // Fetch messages for selected room
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedRoom, user?.id],
    queryFn: () => chatService.getMessages(selectedRoom || '', user?.id || ''),
    enabled: !!selectedRoom && !!user?.id,
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      chatService.sendMessage({
        project_id: projectId,
        sender_id: user?.id || '',
        receiver_id: otherUserId || '',
        content
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedRoom] })
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] })
      setMessage('')
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    },
  })

  // Filter chat rooms based on search
  const filteredRooms = chatRooms?.data?.filter((room: ChatRoom) => {
    if (!searchTerm) return true
    const lastMessage = room.last_message
    return lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastMessage?.sender?.name.toLowerCase().includes(searchTerm.toLowerCase())
  }) || []

  // Auto-select room if projectId or otherUserId is provided
  useEffect(() => {
    if (roomId && !selectedRoom) {
      setSelectedRoom(roomId)
    }
  }, [roomId, selectedRoom])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.data])

  // Real-time subscription
  useEffect(() => {
    if (!selectedRoom) return

    const unsubscribe = chatService.subscribeToMessages(selectedRoom, (newMessage) => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedRoom] })
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] })
    })

    return unsubscribe
  }, [selectedRoom, queryClient])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedRoom) return

    sendMessageMutation.mutate(message.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const getRoomTitle = (room: ChatRoom) => {
    if (room.project_id) {
      return `Project Chat`
    }
    // For direct messages, show the other person's name
    const otherParticipant = room.participants.find(id => id !== user?.id)
    return room.last_message?.sender?.name || 'Unknown User'
  }

  const getRoomSubtitle = (room: ChatRoom) => {
    if (room.last_message) {
      return room.last_message.content.length > 50 
        ? `${room.last_message.content.substring(0, 50)}...`
        : room.last_message.content
    }
    return 'No messages yet'
  }

  if (!user) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Please log in to use chat</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Chat Rooms Sidebar */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(600px-80px)]">
          {roomsLoading ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredRooms.map((room: ChatRoom) => (
                <div
                  key={room.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedRoom === room.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={room.last_message?.sender?.avatar_url} />
                      <AvatarFallback>
                        {room.last_message?.sender?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">
                          {getRoomTitle(room)}
                        </h3>
                        {room.unread_count > 0 && (
                          <Badge variant="default" className="h-5 w-5 rounded-full p-0 text-xs">
                            {room.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {getRoomSubtitle(room)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(room.last_message?.created_at || room.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={messages?.data?.[0]?.sender?.avatar_url} />
                    <AvatarFallback>
                      {messages?.data?.[0]?.sender?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {(() => {
                        const room = chatRooms?.data?.find((r: ChatRoom) => r.id === selectedRoom)
                        return room ? getRoomTitle(room) : 'Chat'
                      })()}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {projectId ? 'Project conversation' : 'Direct message'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              ) : messages?.data && messages.data.length > 0 ? (
                <div className="space-y-4">
                  {messages.data.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[70%] ${msg.sender_id === user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={msg.sender?.avatar_url} />
                          <AvatarFallback>
                            {msg.sender?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg px-3 py-2 ${
                          msg.sender_id === user.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_id === user.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {formatDate(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Start the conversation!</p>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button variant="ghost" size="sm" type="button">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" type="button">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
