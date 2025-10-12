/**
 * Mobile Push Notification Service using OneSignal
 * Sends real push notifications to iOS and Android devices
 * 
 * Setup:
 * 1. Sign up at https://onesignal.com (FREE)
 * 2. Create a new app
 * 3. Add NEXT_PUBLIC_ONESIGNAL_APP_ID to .env.local
 * 4. Users will see prompt to enable notifications
 */

// OneSignal App ID (add to .env.local)
const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || ''
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || ''

export interface PushNotificationOptions {
  title: string
  message: string
  url?: string
  icon?: string
  data?: any
}

class PushNotificationService {
  private initialized = false

  /**
   * Initialize OneSignal SDK (call on app load)
   */
  async initialize() {
    if (this.initialized || !ONESIGNAL_APP_ID) {
      console.warn('[OneSignal] No App ID configured. Add NEXT_PUBLIC_ONESIGNAL_APP_ID to .env.local')
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    try {
      // Load OneSignal SDK dynamically
      if (!(window as any).OneSignal) {
        const script = document.createElement('script')
        script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js'
        script.async = true
        document.head.appendChild(script)
        
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      const OneSignal = (window as any).OneSignal || []
      OneSignal.push(function() {
        OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
        })
      })

      console.log('[OneSignal] Initialized')
      this.initialized = true
    } catch (error) {
      console.error('[OneSignal] Initialization error:', error)
    }
  }

  /**
   * Request push notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const OneSignal = (window as any).OneSignal || []
      return new Promise((resolve) => {
        OneSignal.push(async function() {
          try {
            await OneSignal.showNativePrompt()
            const permission = await OneSignal.getNotificationPermission()
            console.log('[OneSignal] Permission:', permission)
            resolve(permission === 'granted')
          } catch (error) {
            console.error('[OneSignal] Permission error:', error)
            resolve(false)
          }
        })
      })
    } catch (error) {
      console.error('[OneSignal] Permission request error:', error)
      return false
    }
  }

  /**
   * Send push notification to specific user
   */
  async sendToUser(userId: string, options: PushNotificationOptions): Promise<boolean> {
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_external_user_ids: [userId],
          headings: { en: options.title },
          contents: { en: options.message },
          url: options.url,
          data: options.data,
          ios_badgeType: 'Increase',
          ios_badgeCount: 1,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('[OneSignal] Send notification error:', error)
      return false
    }
  }

  /**
   * Send push notification to all users
   */
  async sendToAll(options: PushNotificationOptions): Promise<boolean> {
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          included_segments: ['All'],
          headings: { en: options.title },
          contents: { en: options.message },
          url: options.url,
          data: options.data,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('[OneSignal] Send notification error:', error)
      return false
    }
  }

  /**
   * Set user ID for targeted notifications
   */
  async setUserId(userId: string) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const OneSignal = (window as any).OneSignal || []
      OneSignal.push(function() {
        OneSignal.setExternalUserId(userId)
        console.log('[OneSignal] User ID set:', userId)
      })
    } catch (error) {
      console.error('[OneSignal] Set user ID error:', error)
    }
  }

  /**
   * Get notification permission status
   */
  async isPermissionGranted(): Promise<boolean> {
    try {
      if (!this.initialized) {
        return false
      }
      const OneSignal = (window as any).OneSignal || []
      return new Promise((resolve) => {
        OneSignal.push(async function() {
          try {
            const permission = await OneSignal.getNotificationPermission()
            resolve(permission === 'granted')
          } catch {
            resolve(false)
          }
        })
      })
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService()

// Notification helpers for financial events
export async function sendLowRunwayAlert(months: number, cash: number) {
  await pushNotificationService.sendToAll({
    title: '🚨 Low Runway Alert',
    message: `Your runway is ${months.toFixed(1)} months. Cash: $${cash.toLocaleString()}`,
    url: '/runway',
    data: { type: 'runway_alert', months, cash },
  })
}

export async function sendPaymentReceivedAlert(amount: number, customer: string) {
  await pushNotificationService.sendToAll({
    title: '💰 Payment Received',
    message: `$${amount.toLocaleString()} from ${customer}`,
    url: '/sales',
    data: { type: 'payment_received', amount, customer },
  })
}

export async function sendLargeExpenseAlert(amount: number, description: string) {
  await pushNotificationService.sendToAll({
    title: '💸 Large Expense',
    message: `$${amount.toLocaleString()} - ${description}`,
    url: '/bookkeeping',
    data: { type: 'large_expense', amount, description },
  })
}

