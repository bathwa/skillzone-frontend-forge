import React from 'react'
import { Chat as ChatComponent } from '@/components/Chat'

export const Chat = () => {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with clients and freelancers
        </p>
      </div>
      
      <ChatComponent />
    </div>
  )
} 