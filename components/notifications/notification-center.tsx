"use client"

import { useState, useEffect } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notification"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
// import { useRouter } from "next/navigation"

type Notification = {
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: Date
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = async () => {
        const data = await getUserNotifications()
        setNotifications(data as Notification[])
        setUnreadCount((data as Notification[]).filter((n) => !n.read).length)
    }

    useEffect(() => {
        fetchNotifications()
        // Simple polling every 30s
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id)
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead()
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto text-xs px-2 py-1">
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start p-3 focus:bg-accent cursor-pointer",
                                    !notification.read && "bg-muted/50"
                                )}
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                <div className="flex w-full justify-between items-start gap-2">
                                    <span className={cn("font-medium text-sm", !notification.read && "font-semibold")}>
                                        {notification.title}
                                    </span>
                                    {notification.type === 'SUCCESS' && <Check className="h-3 w-3 text-green-500 mt-1" />}
                                    {/* Add other icons based on type if needed */}
                                </div>
                                <span className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {notification.message}
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-2 self-end">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
