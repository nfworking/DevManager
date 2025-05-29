"use client"

export interface Notification {
  id: string
  title: string
  description: string
  type: "success" | "error" | "warning" | "info"
  timestamp: string
  read: boolean
  action?: {
    label: string
    href: string
  }
  icon?: string
}

const NOTIFICATIONS_STORAGE_KEY = "dev-manager-notifications"
const MAX_NOTIFICATIONS = 100

class NotificationManager {
  private listeners: Array<(notifications: Notification[]) => void> = []

  getNotifications(): Notification[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading notifications:", error)
      return []
    }
  }

  saveNotifications(notifications: Notification[]): void {
    if (typeof window === "undefined") return

    try {
      // Keep only the most recent notifications
      const trimmed = notifications.slice(0, MAX_NOTIFICATIONS)
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmed))
      this.notifyListeners(trimmed)
    } catch (error) {
      console.error("Error saving notifications:", error)
    }
  }

  addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    }

    const notifications = this.getNotifications()
    notifications.unshift(newNotification)
    this.saveNotifications(notifications)
  }

  markAsRead(id: string): void {
    const notifications = this.getNotifications()
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    this.saveNotifications(updated)
  }

  markAllAsRead(): void {
    const notifications = this.getNotifications()
    const updated = notifications.map((n) => ({ ...n, read: true }))
    this.saveNotifications(updated)
  }

  deleteNotification(id: string): void {
    const notifications = this.getNotifications()
    const filtered = notifications.filter((n) => n.id !== id)
    this.saveNotifications(filtered)
  }

  clearAll(): void {
    this.saveNotifications([])
  }

  getUnreadCount(): number {
    return this.getNotifications().filter((n) => !n.read).length
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(notifications: Notification[]): void {
    this.listeners.forEach((listener) => listener(notifications))
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const notificationManager = new NotificationManager()

// Helper functions for common notification types
export const showSuccessNotification = (
  title: string,
  description: string,
  action?: { label: string; href: string },
) => {
  notificationManager.addNotification({
    title,
    description,
    type: "success",
    action,
  })
}

export const showErrorNotification = (title: string, description: string) => {
  notificationManager.addNotification({
    title,
    description,
    type: "error",
  })
}

export const showWarningNotification = (title: string, description: string) => {
  notificationManager.addNotification({
    title,
    description,
    type: "warning",
  })
}

export const showInfoNotification = (title: string, description: string) => {
  notificationManager.addNotification({
    title,
    description,
    type: "info",
  })
}
