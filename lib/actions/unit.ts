"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UnitStatus } from "@prisma/client"

const unitSchema = z.object({
    unitNumber: z.string().min(1, "Unit number is required"),
    bedrooms: z.number().min(0),
    bathrooms: z.number().min(0),
    sqFt: z.number().optional(),
    marketRent: z.number().min(0),
    status: z.nativeEnum(UnitStatus).default(UnitStatus.VACANT),
})

export type UnitFormData = z.infer<typeof unitSchema>

export async function createUnit(propertyId: string, data: UnitFormData) {
    const session = await auth()

    if (!session?.user?.organizationId) {
        throw new Error("Unauthorized")
    }

    const validatedFields = unitSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields" }
    }

    try {
        // Verify property ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId, organizationId: session.user.organizationId }
        })

        if (!property) {
            return { error: "Property not found" }
        }

        await prisma.unit.create({
            data: {
                ...validatedFields.data,
                propertyId,
            },
        })

        revalidatePath(`/dashboard/properties/${propertyId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to create unit:", error)
        return { error: "Failed to create unit" }
    }
}
