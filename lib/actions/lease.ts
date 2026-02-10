"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UnitStatus } from "@prisma/client"

const leaseSchema = z.object({
    unitId: z.string().min(1, "Unit is required"),
    startDate: z.date(),
    endDate: z.date(),
    rentAmount: z.number().min(0),
    depositAmount: z.number().min(0),
})

export type LeaseFormData = z.infer<typeof leaseSchema>

export async function createLease(tenantId: string, data: LeaseFormData) {
    const session = await auth()

    if (!session?.user?.organizationId) {
        throw new Error("Unauthorized")
    }

    const validatedFields = leaseSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields" }
    }

    const { unitId, startDate, endDate, rentAmount, depositAmount } = validatedFields.data

    try {
        // 1. Verify Unit belongs to Org
        const unit = await prisma.unit.findUnique({
            where: { id: unitId },
            include: { property: true }
        })

        if (!unit || unit.property.organizationId !== session.user.organizationId) {
            return { error: "Unit not found or access denied" }
        }

        if (unit.status !== "VACANT") {
            return { error: "Unit is not vacant" }
        }

        // 2. Transact: Create Lease + Update Unit Status
        await prisma.$transaction([
            prisma.lease.create({
                data: {
                    tenantId,
                    unitId,
                    startDate,
                    endDate,
                    rentAmount,
                    depositAmount,
                    isActive: true
                }
            }),
            prisma.unit.update({
                where: { id: unitId },
                data: { status: "OCCUPIED" }
            })
        ])

        revalidatePath("/dashboard/tenants")
        revalidatePath(`/dashboard/properties/${unit.propertyId}`)

        return { success: true }

    } catch (error) {
        console.error("Failed to create lease:", error)
        return { error: "Failed to create lease" }
    }
}
