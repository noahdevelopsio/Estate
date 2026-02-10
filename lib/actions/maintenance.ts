"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Priority, WorkOrderStatus } from "@prisma/client"

const maintenanceSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, "Description must be detailed"),
    priority: z.nativeEnum(Priority),
    unitId: z.string().min(1, "Unit is required"),
})

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>

export async function createMaintenanceRequest(data: MaintenanceFormData) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Identify tenant
    const tenant = await prisma.tenant.findUnique({
        where: { email: session.user.email || "" }
    })

    // If no tenant record found (e.g. admin creating on behalf, or email mismatch), fallback or error?
    // For MVP, if logged in user is a Tenant, we use their ID.
    // If Admin, they must specify? For now, let's assume Tenant Submit flow.

    /*
       NOTE: The current Auth system links Users to Organizations.
       Tenants might be Users ONLY if invited.
       If the 'submitter' is a tenant, we need to link the created request to the Tenant record.
       The schema has tenantId.
       
       We need a way to look up the Tenant ID from the User ID or Email.
       Constraint: Tenant email is unique. User email is unique.
    */

    const tenantRecord = await prisma.tenant.findUnique({
        where: { email: session.user.email! }
    })

    if (!tenantRecord && session.user.role === "TENANT") {
        return { error: "Tenant profile not found." }
    }

    // Check if unit belongs to tenant's active lease?
    // Or just trust the input unitId if we are admin.

    // Let's implement basics:
    // 1. Get Property ID from Unit
    const unit = await prisma.unit.findUnique({
        where: { id: data.unitId },
        include: { property: true }
    })

    if (!unit) return { error: "Unit not found" }

    try {
        await prisma.maintenanceRequest.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: "SUBMITTED",
                unitId: data.unitId,
                propertyId: unit.propertyId,
                tenantId: tenantRecord?.id // Optional if admin submits
            }
        })

        revalidatePath("/dashboard/maintenance")
        return { success: true }
    } catch (error) {
        console.error("Failed to create maintenance request:", error)
        return { error: "Failed to submit request" }
    }
}

export async function getMaintenanceRequests() {
    const session = await auth()
    if (!session?.user?.organizationId) return []

    // If Tenant, only show own?
    // Implementation: Users have roles.

    const where: any = {
        property: {
            organizationId: session.user.organizationId
        }
    }

    if (session.user.role === "TENANT") {
        const tenantRecord = await prisma.tenant.findUnique({
            where: { email: session.user.email! }
        })
        if (tenantRecord) {
            where.tenantId = tenantRecord.id
        }
    }

    try {
        const requests = await prisma.maintenanceRequest.findMany({
            where,
            include: {
                unit: {
                    include: {
                        property: true
                    }
                },
                tenant: true,
                property: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return requests
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function updateMaintenanceStatus(id: string, status: WorkOrderStatus) {
    const session = await auth()
    // Check perm: Only Admin/Manager/Staff
    const allowedRoles = ["SUPER_ADMIN", "PROPERTY_MANAGER", "MAINTENANCE_STAFF"]

    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
        return { error: "Unauthorized" }
    }

    try {
        const request = await prisma.maintenanceRequest.update({
            where: { id },
            data: { status },
            include: { tenant: true }
        })

        // Notify Tenant
        if (request.tenant?.email) {
            const tenantUser = await prisma.user.findUnique({
                where: { email: request.tenant.email }
            })
            if (tenantUser) {
                const { createNotification } = await import("@/lib/actions/notification")
                await createNotification(
                    tenantUser.id,
                    "Maintenance Update",
                    `Your maintenance request "${request.title}" is now ${status}.`,
                    "INFO"
                )

                // Send Email Update
                try {
                    const { emailService } = await import("@/lib/email")
                    const { emailTemplates } = await import("@/lib/email/templates")
                    await emailService.send(
                        tenantUser.email,
                        `Update on "${request.title}"`,
                        emailTemplates.maintenanceUpdate(request.title, status)
                    )
                } catch (emailError) {
                    console.error("Failed to send maintenance email:", emailError)
                }
            }
        }

        revalidatePath("/dashboard/maintenance")
        return { success: true }
    } catch (error) {
        return { error: "Failed to update status" }
    }
}
