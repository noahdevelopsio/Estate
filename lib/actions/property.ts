"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PropertyType } from "@prisma/client"

const propertySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
    country: z.string().min(2, "Country is required"),
    zipCode: z.string().optional(),
    type: z.nativeEnum(PropertyType),
    description: z.string().optional(),
    // photo: z.string().optional(), // Handled separately or as URL
})

export type PropertyFormData = z.infer<typeof propertySchema>

export async function createProperty(data: PropertyFormData) {
    const session = await auth()

    if (!session?.user?.organizationId) {
        throw new Error("Unauthorized")
    }

    const validatedFields = propertySchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten() }
    }

    try {
        const property = await prisma.property.create({
            data: {
                ...validatedFields.data,
                organizationId: session.user.organizationId,
            },
        })

        revalidatePath("/dashboard/properties")
        return { success: true, propertyId: property.id }
    } catch (error) {
        console.error("Failed to create property:", error)
        return { error: "Failed to create property" }
    }
}

export async function getProperties() {
    const session = await auth()

    if (!session?.user?.organizationId) {
        return []
    }

    try {
        const properties = await prisma.property.findMany({
            where: {
                organizationId: session.user.organizationId,
            },
            include: {
                units: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return properties
    } catch (error) {
        console.error("Failed to fetch properties:", error)
        return []
    }
}

export async function getPropertyById(id: string) {
    const session = await auth()

    if (!session?.user?.organizationId) {
        return null
    }

    try {
        const property = await prisma.property.findUnique({
            where: {
                id,
                organizationId: session.user.organizationId,
            },
            include: {
                units: {
                    include: {
                        leases: {
                            where: { isActive: true }
                        }
                    }
                },
            },
        })

        return property
    } catch (error) {
        console.error("Failed to fetch property:", error)
        return null
    }
}

export async function deleteProperty(id: string) {
    const session = await auth()

    if (!session?.user?.organizationId) {
        throw new Error("Unauthorized")
    }

    try {
        // First verify ownership
        const property = await prisma.property.findUnique({
            where: { id, organizationId: session.user.organizationId },
        })

        if (!property) {
            throw new Error("Property not found")
        }

        await prisma.property.delete({
            where: { id },
        })

        revalidatePath("/dashboard/properties")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete property:", error)
        return { error: "Failed to delete property" }
    }
}
