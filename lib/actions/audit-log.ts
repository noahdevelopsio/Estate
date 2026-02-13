"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getAuditLogs(limit = 50) {
    try {
        const session = await auth()

        if (!session?.user?.organizationId) {
            return []
        }

        // Check if user is admin (optional, depending on requirements)
        // if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "PROPERTY_MANAGER") {
        //   return []
        // }

        const logs = await db.auditLog.findMany({
            where: {
                organizationId: session.user.organizationId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        image: true,
                    }
                }
            }
        })

        return logs
    } catch (error) {
        console.error("Failed to fetch audit logs:", error)
        return []
    }
}

export async function logActivity(
    action: string,
    entity: string,
    entityId: string,
    details?: string
) {
    try {
        const session = await auth()

        if (!session?.user?.id || !session?.user?.organizationId) {
            console.warn("Audit log attempt without user session")
            return
        }

        await db.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details,
                userId: session.user.id,
                organizationId: session.user.organizationId,
            },
        })
    } catch (error) {
        console.error("Failed to create audit log:", error)
        // Don't throw, we don't want to break the main action
    }
}
