"use client"

import { useState, useEffect } from "react"
import { AuthNavbar } from "@/components/auth-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Sparkles } from "lucide-react"
import { notificationService, sendDemoNotifications, type NotificationPreferences } from "@/lib/notification-service"
import { pushNotificationService, sendLowRunwayAlert, sendPaymentReceivedAlert } from "@/lib/push-notification-service"

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  )
  const [hasPermission, setHasPermission] = useState(false)
  const [mobilePermission, setMobilePermission] = useState(false)
  const [isEnablingPush, setIsEnablingPush] = useState(false)

  useEffect(() => {
    setHasPermission(typeof window !== 'undefined' && Notification.permission === 'granted')
    
    // Debug: Check environment variables
    console.log('[Settings] OneSignal App ID:', process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID)
    console.log('[Settings] Has App ID:', !!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID)
    
    // Initialize mobile push
    pushNotificationService.initialize()
    
    // Check mobile permission
    pushNotificationService.isPermissionGranted().then(setMobilePermission)
  }, [])

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission()
    setHasPermission(granted)
  }

  const handleUpdatePreference = (key: keyof NotificationPreferences, value: any) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    notificationService.updatePreferences({ [key]: value })
  }

  const handleSendDemo = async () => {
    await sendDemoNotifications()
  }

  const handleEnableMobilePush = async () => {
    console.log('[Settings] Enable Mobile Push clicked')
    setIsEnablingPush(true)
    try {
      const granted = await pushNotificationService.requestPermission()
      console.log('[Settings] Permission granted:', granted)
      setMobilePermission(granted)
      
      if (granted) {
        alert('✅ Push notifications enabled! You can now receive financial alerts.')
      } else {
        alert('❌ Permission denied. Please allow notifications in your browser settings.')
      }
    } catch (error) {
      console.error('[Settings] Error enabling push:', error)
      alert('⚠️ Error: ' + (error instanceof Error ? error.message : 'Failed to enable push notifications'))
    } finally {
      setIsEnablingPush(false)
    }
  }

  const handleSendMobilePushDemo = async () => {
    await sendLowRunwayAlert(5.2, 45000)
    await new Promise(resolve => setTimeout(resolve, 2000))
    await sendPaymentReceivedAlert(25000, 'Acme Corp')
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Configure how you want to be notified about financial events
          </p>
        </div>

        <div className="space-y-6">
          {/* Mobile Push Notifications */}
          <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>📱 Mobile Push Notifications</CardTitle>
              </div>
              <CardDescription>
                Get alerts on your phone even when browser is closed (powered by OneSignal)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mobilePermission ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="font-medium">Mobile push notifications enabled!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You'll receive financial alerts on your mobile device.
                  </p>
                  <Button onClick={handleSendMobilePushDemo} variant="outline">
                    Send Test Push to Phone
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enable mobile push to get instant financial alerts on your phone:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Low runway alerts</li>
                    <li>Payment received notifications</li>
                    <li>Large expense warnings</li>
                    <li>Invoice overdue reminders</li>
                  </ul>
                  <Button 
                    onClick={handleEnableMobilePush} 
                    disabled={isEnablingPush}
                    className="gap-2 bg-gradient-to-r from-primary to-secondary"
                  >
                    <Bell className="h-4 w-4" />
                    {isEnablingPush ? 'Requesting Permission...' : 'Enable Mobile Push'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Works on iOS, Android, and Desktop. Free forever with OneSignal.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Browser Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Browser Notifications</CardTitle>
              </div>
              <CardDescription>
                Enable push notifications to receive real-time alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasPermission ? (
                <div className="flex items-center gap-2 text-success">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="font-medium">Notifications enabled</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click below to enable browser notifications. You'll receive alerts for important
                    financial events.
                  </p>
                  <Button onClick={handleRequestPermission} className="gap-2">
                    <Bell className="h-4 w-4" />
                    Enable Notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>
                Set custom thresholds for financial alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="runway">Runway Alert Threshold (months)</Label>
                <Input
                  id="runway"
                  type="number"
                  value={preferences.runwayThreshold}
                  onChange={(e) => handleUpdatePreference('runwayThreshold', Number(e.target.value))}
                  min={1}
                  max={24}
                />
                <p className="text-xs text-muted-foreground">
                  Get alerted when runway drops below this many months
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cash">Cash Balance Alert Threshold ($)</Label>
                <Input
                  id="cash"
                  type="number"
                  value={preferences.cashBalanceThreshold}
                  onChange={(e) =>
                    handleUpdatePreference('cashBalanceThreshold', Number(e.target.value))
                  }
                  min={0}
                  step={1000}
                />
                <p className="text-xs text-muted-foreground">
                  Get alerted when cash balance drops below this amount
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction">Large Transaction Alert ($)</Label>
                <Input
                  id="transaction"
                  type="number"
                  value={preferences.largeTransactionThreshold}
                  onChange={(e) =>
                    handleUpdatePreference('largeTransactionThreshold', Number(e.target.value))
                  }
                  min={0}
                  step={500}
                />
                <p className="text-xs text-muted-foreground">
                  Get alerted for transactions above this amount
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>
                Choose which types of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-summary">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily digest of financial activities
                  </p>
                </div>
                <Switch
                  id="daily-summary"
                  checked={preferences.dailySummary}
                  onCheckedChange={(checked) => handleUpdatePreference('dailySummary', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="invoice-reminders">Invoice Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about overdue invoices
                  </p>
                </div>
                <Switch
                  id="invoice-reminders"
                  checked={preferences.invoiceReminders}
                  onCheckedChange={(checked) => handleUpdatePreference('invoiceReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="burn-alerts">Burn Rate Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerted about significant burn rate changes
                  </p>
                </div>
                <Switch
                  id="burn-alerts"
                  checked={preferences.burnRateAlerts}
                  onCheckedChange={(checked) => handleUpdatePreference('burnRateAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Demo Notifications */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Test Notifications</CardTitle>
              </div>
              <CardDescription>
                Send demo notifications to see how they work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSendDemo} className="gap-2 bg-gradient-to-r from-primary to-secondary">
                <Bell className="h-4 w-4" />
                Send Demo Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

