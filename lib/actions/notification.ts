"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function createNotification(userId: string, title: string, message: string, type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO") {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
            }
        })
        // We don't verify session here as system events trigger this
    } catch (error) {
        console.error("Failed to create notification:", error)
    }
}

export async function getUserNotifications() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        return await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
    } catch (error) {
        return []
    }
}

export async function markNotificationAsRead(id: string) {
    const session = await auth()
    if (!session?.user?.id) return

    try {
        await prisma.notification.update({
            where: { id, userId: session.user.id },
            data: { read: true }
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.error("Failed to mark notification as read", error)
    }
}

export async function markAllNotificationsAsRead() {
    const session = await auth()
    if (!session?.user?.id) return

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, read: false },
            data: { read: true }
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.error("Failed to mark all notifications as read", error)
    }
}
