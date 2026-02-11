"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const profileSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email().optional(), // Email change might require verification, keeping optional for now or readonly in UI
    phone: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export async function updateProfile(data: ProfileFormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const validatedFields = profileSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields" }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                // email: data.email, // TODO: Email change logic 
            }
        })

        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update profile:", error)
        return { error: "Failed to update profile" }
    }
}
