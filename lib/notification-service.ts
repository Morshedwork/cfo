/**
 * Push Notification Service
 * Handles browser push notifications and in-app alerts
 */

export type NotificationType = 'critical' | 'warning' | 'info' | 'success'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  data?: any
}

export interface NotificationPreferences {
  enabled: boolean
  runwayThreshold: number // months
  cashBalanceThreshold: number // dollars
  largeTransactionThreshold: number // dollars
  dailySummary: boolean
  invoiceReminders: boolean
  burnRateAlerts: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  runwayThreshold: 6,
  cashBalanceThreshold: 10000,
  largeTransactionThreshold: 5000,
  dailySummary: true,
  invoiceReminders: true,
  burnRateAlerts: true,
}

class NotificationService {
  private static instance: NotificationService
  private notifications: Notification[] = []
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES
  private listeners: Set<(notifications: Notification[]) => void> = new Set()

  private constructor() {
    // Load preferences from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notification-preferences')
      if (saved) {
        this.preferences = JSON.parse(saved)
      }

      // Load notification history
      const savedNotifications = localStorage.getItem('notifications')
      if (savedNotifications) {
        this.notifications = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }))
      }
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  /**
   * Send a push notification
   */
  async sendNotification(
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    data?: any
  ): Promise<void> {
    if (!this.preferences.enabled) return

    // Create notification object
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actionUrl,
      data,
    }

    // Add to history
    this.notifications.unshift(notification)
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Save to localStorage
    this.saveNotifications()

    // Notify listeners
    this.notifyListeners()

    // Show browser notification
    if (Notification.permission === 'granted') {
      const icon = this.getIconForType(type)
      new Notification(title, {
        body: message,
        icon,
        badge: '/icon-192.png',
        tag: notification.id,
        requireInteraction: type === 'critical',
      })
    }
  }

  /**
   * Financial alert helpers
   */
  async alertLowRunway(months: number, currentCash: number, monthlyBurn: number) {
    if (months <= this.preferences.runwayThreshold) {
      await this.sendNotification(
        'critical',
        '🚨 Low Runway Alert',
        `Your runway is now ${months.toFixed(1)} months. Current cash: $${currentCash.toLocaleString()}, Monthly burn: $${monthlyBurn.toLocaleString()}`,
        '/runway',
        { months, currentCash, monthlyBurn }
      )
    }
  }

  async alertLowCashBalance(balance: number) {
    if (balance <= this.preferences.cashBalanceThreshold) {
      await this.sendNotification(
        'critical',
        '💰 Low Cash Balance',
        `Cash balance is $${balance.toLocaleString()}, below your threshold of $${this.preferences.cashBalanceThreshold.toLocaleString()}`,
        '/dashboard',
        { balance }
      )
    }
  }

  async alertLargeTransaction(amount: number, description: string, vendor?: string) {
    if (Math.abs(amount) >= this.preferences.largeTransactionThreshold) {
      const type = amount > 0 ? 'success' : 'warning'
      const emoji = amount > 0 ? '💵' : '💸'
      const action = amount > 0 ? 'received' : 'charged'
      
      await this.sendNotification(
        type,
        `${emoji} Large Transaction`,
        `${action.charAt(0).toUpperCase() + action.slice(1)}: $${Math.abs(amount).toLocaleString()} - ${description}${vendor ? ` (${vendor})` : ''}`,
        '/bookkeeping',
        { amount, description, vendor }
      )
    }
  }

  async alertInvoiceOverdue(invoiceNumber: string, amount: number, daysOverdue: number) {
    if (this.preferences.invoiceReminders) {
      await this.sendNotification(
        'warning',
        '📄 Invoice Overdue',
        `Invoice #${invoiceNumber} ($${amount.toLocaleString()}) is ${daysOverdue} days overdue`,
        '/sales',
        { invoiceNumber, amount, daysOverdue }
      )
    }
  }

  async alertPaymentReceived(amount: number, customer: string) {
    await this.sendNotification(
      'success',
      '🎉 Payment Received',
      `$${amount.toLocaleString()} received from ${customer}`,
      '/sales',
      { amount, customer }
    )
  }

  async alertBurnRateChange(oldBurn: number, newBurn: number, percentChange: number) {
    if (this.preferences.burnRateAlerts && Math.abs(percentChange) >= 15) {
      const type = percentChange > 0 ? 'warning' : 'success'
      const emoji = percentChange > 0 ? '📈' : '📉'
      
      await this.sendNotification(
        type,
        `${emoji} Burn Rate Changed`,
        `Monthly burn ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% (was $${oldBurn.toLocaleString()}, now $${newBurn.toLocaleString()})`,
        '/runway',
        { oldBurn, newBurn, percentChange }
      )
    }
  }

  async alertAnomalyDetected(description: string, reason: string) {
    await this.sendNotification(
      'warning',
      '⚠️ Unusual Activity',
      `${description} - ${reason}`,
      '/bookkeeping',
      { description, reason }
    )
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return this.notifications
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.saveNotifications()
      this.notifyListeners()
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.saveNotifications()
    this.notifyListeners()
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = []
    this.saveNotifications()
    this.notifyListeners()
  }

  /**
   * Get preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...preferences }
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification-preferences', JSON.stringify(this.preferences))
    }
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  private saveNotifications() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(this.notifications))
    }
  }

  private getIconForType(type: NotificationType): string {
    switch (type) {
      case 'critical':
        return '🚨'
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      case 'info':
      default:
        return 'ℹ️'
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Demo/Test function
export async function sendDemoNotifications() {
  await notificationService.requestPermission()
  
  await notificationService.alertLowRunway(5.2, 45000, 8500)
  
  setTimeout(() => {
    notificationService.alertLargeTransaction(15000, 'AWS Cloud Services', 'Amazon Web Services')
  }, 2000)
  
  setTimeout(() => {
    notificationService.alertPaymentReceived(25000, 'Acme Corp')
  }, 4000)
}
