"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { notificationService, type Notification, sendDemoNotifications } from "@/lib/notification-service"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function DashboardNotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load initial notifications
    const allNotifications = notificationService.getNotifications()
    setNotifications(allNotifications.slice(0, 5)) // Show only 5 most recent
    setUnreadCount(notificationService.getUnreadCount())

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications.slice(0, 5))
      setUnreadCount(notificationService.getUnreadCount())
    })

    return unsubscribe
  }, [])

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id)
  }

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    notificationService.markAsRead(id)
  }

  const handleSendDemo = async () => {
    await notificationService.requestPermission()
    await sendDemoNotifications()
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return 'border-destructive bg-destructive/5'
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/5'
      case 'success':
        return 'border-success bg-success/5'
      case 'info':
      default:
        return 'border-primary bg-primary/5'
    }
  }

  const getTypeIcon = (type: Notification['type']) => {
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

  if (notifications.length === 0) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Alerts & Notifications</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleSendDemo}>
              Test Alerts
            </Button>
          </div>
          <CardDescription>Important financial alerts appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No alerts at the moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll be notified about runway, expenses, and payments
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Recent Alerts</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => notificationService.markAllAsRead()}>
            Mark all read
          </Button>
        </div>
        <CardDescription>Important financial updates and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.actionUrl || '/dashboard'}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <Card
                className={cn(
                  'border-l-4 transition-all hover:shadow-md cursor-pointer relative group',
                  getTypeColor(notification.type),
                  !notification.read && 'shadow-sm'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDismiss(notification.id, e)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {notifications.length >= 5 && (
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link href="/settings/notifications">View All Notifications</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'Just now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

