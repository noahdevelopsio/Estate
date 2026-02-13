"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"

const VendorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    serviceType: z.string().min(1, "Service type is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
})

export type VendorFormValues = z.infer<typeof VendorSchema>

export async function getVendors() {
    try {
        const session = await auth()

        if (!session?.user?.organizationId) {
            return []
        }

        const vendors = await db.vendor.findMany({
            where: {
                organizationId: session.user.organizationId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                _count: {
                    select: { workOrders: true }
                }
            }
        })

        return vendors
    } catch (error) {
        console.error("Failed to fetch vendors:", error)
        return []
    }
}

export async function createVendor(data: VendorFormValues) {
    try {
        const session = await auth()

        if (!session?.user?.organizationId) {
            return { error: "Unauthorized" }
        }

        const validatedFields = VendorSchema.safeParse(data)

        if (!validatedFields.success) {
            return { error: "Invalid fields" }
        }

        const { name, serviceType, email, phone } = validatedFields.data

        await db.vendor.create({
            data: {
                name,
                serviceType,
                email: email || null,
                phone: phone || null,
                organizationId: session.user.organizationId,
            },
        })

        revalidatePath("/dashboard/vendors")
        return { success: "Vendor created successfully" }
    } catch (error) {
        console.error("Failed to create vendor:", error)
        return { error: "Failed to create vendor" }
    }
}

export async function updateVendor(id: string, data: VendorFormValues) {
    try {
        const session = await auth()

        if (!session?.user?.organizationId) {
            return { error: "Unauthorized" }
        }

        const validatedFields = VendorSchema.safeParse(data)

        if (!validatedFields.success) {
            return { error: "Invalid fields" }
        }

        const { name, serviceType, email, phone } = validatedFields.data

        await db.vendor.update({
            where: {
                id,
                organizationId: session.user.organizationId,
            },
            data: {
                name,
                serviceType,
                email: email || null,
                phone: phone || null,
            },
        })

        revalidatePath("/dashboard/vendors")
        return { success: "Vendor updated successfully" }
    } catch (error) {
        console.error("Failed to update vendor:", error)
        return { error: "Failed to update vendor" }
    }
}

export async function deleteVendor(id: string) {
    try {
        const session = await auth()

        if (!session?.user?.organizationId) {
            return { error: "Unauthorized" }
        }

        await db.vendor.delete({
            where: {
                id,
                organizationId: session.user.organizationId,
            },
        })

        revalidatePath("/dashboard/vendors")
        return { success: "Vendor deleted successfully" }
    } catch (error) {
        console.error("Failed to delete vendor:", error)
        return { error: "Failed to delete vendor" }
    }
}
