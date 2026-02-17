import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface Notification {
  id: string
  type: 'wellness' | 'goal' | 'alert' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'system',
    title: 'Welcome to DigiHealth',
    message: 'Start tracking your wellness metrics today!',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: false
  },
  {
    id: '2',
    type: 'wellness',
    title: 'Daily Check-in',
    message: 'Time to log your daily metrics',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    read: false
  },
  {
    id: '3',
    type: 'goal',
    title: 'Goal Achievement!',
    message: 'You achieved your sleep goal yesterday!',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    read: true
  }
]

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('digihealth_notifications')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Convert timestamp strings back to Date objects
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
      } catch (e) {
        console.error('Failed to parse saved notifications:', e)
        return INITIAL_NOTIFICATIONS
      }
    }
    return INITIAL_NOTIFICATIONS
  })

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('digihealth_notifications', JSON.stringify(notifications))
  }, [notifications])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
