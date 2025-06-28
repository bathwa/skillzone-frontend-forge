import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

export interface Message {
  id: string
  project_id?: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: {
    name: string
    avatar_url?: string
  }
  receiver?: {
    name: string
    avatar_url?: string
  }
}

export interface ChatRoom {
  id: string
  project_id?: string
  participants: string[]
  last_message?: Message
  unread_count: number
  created_at: string
}

class ChatService {
  // Get chat rooms for a user
  async getChatRooms(userId: string): Promise<{ data: ChatRoom[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages by chat room (project_id or direct conversation)
      const chatRooms = new Map<string, ChatRoom>()
      
      data?.forEach((message: any) => {
        const roomId = message.project_id || `direct_${[message.sender_id, message.receiver_id].sort().join('_')}`
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
        
        if (!chatRooms.has(roomId)) {
          chatRooms.set(roomId, {
            id: roomId,
            project_id: message.project_id,
            participants: [userId, otherUserId],
            last_message: {
              id: message.id,
              project_id: message.project_id,
              sender_id: message.sender_id,
              receiver_id: message.receiver_id,
              content: message.content,
              is_read: message.is_read,
              created_at: message.created_at,
              sender: {
                name: `${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`.trim() || 'Unknown',
                avatar_url: message.sender?.avatar_url
              },
              receiver: {
                name: `${message.receiver?.first_name || ''} ${message.receiver?.last_name || ''}`.trim() || 'Unknown',
                avatar_url: message.receiver?.avatar_url
              }
            },
            unread_count: message.receiver_id === userId && !message.is_read ? 1 : 0,
            created_at: message.created_at
          })
        } else {
          const room = chatRooms.get(roomId)!
          if (!message.is_read && message.receiver_id === userId) {
            room.unread_count += 1
          }
        }
      })

      return {
        data: Array.from(chatRooms.values()),
        error: null
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch chat rooms'
      }
    }
  }

  // Get messages for a specific chat room
  async getMessages(roomId: string, userId: string): Promise<{ data: Message[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, first_name, last_name, avatar_url)
        `)

      // If roomId contains project_id, filter by project_id
      if (roomId.startsWith('project_')) {
        const projectId = roomId.replace('project_', '')
        query = query.eq('project_id', projectId)
      } else if (roomId.startsWith('direct_')) {
        // For direct messages, filter by sender and receiver
        const [user1, user2] = roomId.replace('direct_', '').split('_')
        query = query.or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
      }

      const { data, error } = await query.order('created_at', { ascending: true })

      if (error) throw error

      // Mark messages as read
      await this.markMessagesAsRead(roomId, userId)

      const messages: Message[] = data?.map((msg: any) => ({
        id: msg.id,
        project_id: msg.project_id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        is_read: msg.is_read,
        created_at: msg.created_at,
        sender: {
          name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim() || 'Unknown',
          avatar_url: msg.sender?.avatar_url
        },
        receiver: {
          name: `${msg.receiver?.first_name || ''} ${msg.receiver?.last_name || ''}`.trim() || 'Unknown',
          avatar_url: msg.receiver?.avatar_url
        }
      })) || []

      return { data: messages, error: null }
    } catch (error) {
      console.error('Error fetching messages:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch messages'
      }
    }
  }

  // Send a new message
  async sendMessage(messageData: {
    project_id?: string
    sender_id: string
    receiver_id: string
    content: string
  }): Promise<{ data: Message | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          project_id: messageData.project_id,
          sender_id: messageData.sender_id,
          receiver_id: messageData.receiver_id,
          content: messageData.content,
          is_read: false
        }])
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .single()

      if (error) throw error

      const message: Message = {
        id: data.id,
        project_id: data.project_id,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        content: data.content,
        is_read: data.is_read,
        created_at: data.created_at,
        sender: {
          name: `${data.sender?.first_name || ''} ${data.sender?.last_name || ''}`.trim() || 'Unknown',
          avatar_url: data.sender?.avatar_url
        },
        receiver: {
          name: `${data.receiver?.first_name || ''} ${data.receiver?.last_name || ''}`.trim() || 'Unknown',
          avatar_url: data.receiver?.avatar_url
        }
      }

      return { data: message, error: null }
    } catch (error) {
      console.error('Error sending message:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }
    }
  }

  // Mark messages as read
  async markMessagesAsRead(roomId: string, userId: string): Promise<{ error: string | null }> {
    try {
      let query = supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', userId)
        .eq('is_read', false)

      if (roomId.startsWith('project_')) {
        const projectId = roomId.replace('project_', '')
        query = query.eq('project_id', projectId)
      } else if (roomId.startsWith('direct_')) {
        const [user1, user2] = roomId.replace('direct_', '').split('_')
        query = query.or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
      }

      const { error } = await query

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to mark messages as read'
      }
    }
  }

  // Subscribe to real-time messages
  subscribeToMessages(roomId: string, callback: (message: Message) => void) {
    let query = supabase
      .channel(`messages:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const message = payload.new as any
        if (message) {
          callback({
            id: message.id,
            project_id: message.project_id,
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            content: message.content,
            is_read: message.is_read,
            created_at: message.created_at
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(query)
    }
  }
}

export const chatService = new ChatService() 