"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const orgSchema = z.object({
    name: z.string().min(2, "Name is required"),
    slug: z.string().optional(), // Readonly usually
})

export type OrgFormData = z.infer<typeof orgSchema>

export async function updateOrganization(data: OrgFormData) {
    const session = await auth()
    if (!session?.user?.organizationId) return { error: "Unauthorized" }

    // Check if admin
    // We need to fetch user role? Or trust session role?
    // Session role is usually reliable if using JWT strategy and updated.
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "PROPERTY_MANAGER") {
        return { error: "Insufficient permissions" }
    }

    try {
        await prisma.organization.update({
            where: { id: session.user.organizationId },
            data: {
                name: data.name
            }
        })
        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update organization:", error)
        return { error: "Failed to update organization" }
    }
}
