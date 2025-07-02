
import { create } from 'zustand'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read_at?: string
  created_at: string
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  getUnreadCount: () => number
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'Welcome to SkillsPortal',
      message: 'Your account has been successfully created. Start exploring opportunities!',
      type: 'success',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'New Opportunity Match',
      message: 'We found 3 new opportunities that match your skills.',
      type: 'info',
      created_at: new Date().toISOString()
    }
  ],
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString()
        },
        ...state.notifications
      ]
    })),
  
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id
          ? { ...notif, read_at: new Date().toISOString() }
          : notif
      )
    })),
  
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({
        ...notif,
        read_at: notif.read_at || new Date().toISOString()
      }))
    })),
  
  getUnreadCount: () => {
    const { notifications } = get()
    return notifications.filter((notif) => !notif.read_at).length
  },
  
  clearNotifications: () => set({ notifications: [] })
}))
