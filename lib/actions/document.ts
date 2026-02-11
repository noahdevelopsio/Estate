"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadFileToMega } from "@/lib/storage"

export async function uploadDocument(formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const file = formData.get("file") as File
    const propertyId = formData.get("propertyId") as string
    const tenantId = formData.get("tenantId") as string

    if (!file) return { error: "No file provided" }

    try {
        // Upload to Cloud (Mega)
        const { url, name, size } = await uploadFileToMega(file)

        // Save to DB
        await prisma.document.create({
            data: {
                name,
                url, // Only storing the link
                type: file.type,
                size,
                propertyId: propertyId || null,
                tenantId: tenantId || null,
            }
        })

        if (propertyId) revalidatePath(`/dashboard/properties/${propertyId}`)
        if (tenantId) revalidatePath(`/dashboard/tenants/${tenantId}`)

        return { success: true }
    } catch (error: any) {
        console.error("Upload failed:", error)
        return { error: error.message || "Failed to upload document" }
    }
}

export async function getDocuments(propertyId?: string, tenantId?: string) {
    const session = await auth()
    if (!session?.user) return []

    try {
        return await prisma.document.findMany({
            where: {
                propertyId: propertyId || undefined,
                tenantId: tenantId || undefined,
                // Ensure belonging to org (only if propertyId is set, or we need more complex check)
                // If propertyId not set, we might get all docs? 
                // Creating specific functions below is safer.
                property: propertyId ? { organizationId: session.user.organizationId } : undefined
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error("Failed to fetch documents:", error)
        return []
    }
}

export async function getAllDocuments() {
    const session = await auth()
    if (!session?.user?.organizationId) return []

    try {
        return await prisma.document.findMany({
            where: {
                property: {
                    organizationId: session.user.organizationId
                }
            },
            include: {
                property: true,
                tenant: true
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error("Failed to fetch all documents:", error)
        return []
    }
}

export async function getTenantDocuments() {
    const session = await auth()
    if (!session?.user?.email) return []

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { email: session.user.email },
            include: {
                leases: {
                    where: { isActive: true },
                    include: {
                        unit: true
                    }
                }
            }
        })

        if (!tenant) return []

        const propertyId = tenant.leases[0]?.unit?.propertyId

        return await prisma.document.findMany({
            where: {
                OR: [
                    { tenantId: tenant.id },
                    { propertyId: propertyId }
                ]
            },
            include: {
                property: true
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error("Failed to fetch tenant documents:", error)
        return []
    }
}

export async function deleteDocument(id: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        // Find doc first to get URL (for future Mega deletion)
        const doc = await prisma.document.findUnique({
            where: { id },
            include: { property: true }
        })

        if (!doc) return { error: "Document not found" }
        // if (doc.property?.organizationId !== session.user.organizationId) return { error: "Unauthorized" }

        // TODO: Delete from Mega (lib/storage.ts)

        await prisma.document.delete({ where: { id } })

        if (doc.propertyId) revalidatePath(`/dashboard/properties/${doc.propertyId}`)

        return { success: true }
    } catch (error) {
        console.error("Delete failed:", error)
        return { error: "Failed to delete document" }
    }
}
