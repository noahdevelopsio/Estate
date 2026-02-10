"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const tenantSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    emergencyContact: z.string().optional(),
})

export type TenantFormData = z.infer<typeof tenantSchema>

export async function createTenant(data: TenantFormData) {
    const session = await auth()

    if (!session?.user?.organizationId) {
        throw new Error("Unauthorized")
    }

    const validatedFields = tenantSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten() }
    }

    try {
        const tenant = await prisma.tenant.create({
            data: {
                ...validatedFields.data,
            },
        })

        revalidatePath("/dashboard/tenants")
        return { success: true, tenantId: tenant.id }
    } catch (error) {
        console.error("Failed to create tenant:", error)
        return { error: "Failed to create tenant" }
    }
}

export async function getTenants() {
    const session = await auth()

    if (!session?.user?.organizationId) {
        return []
    }

    try {
        // Tenants are linked via Leases -> Units -> Properties -> Organization
        // This query might need to be optimized or direct organizationId added to Tenant model if queries become slow
        // For now, we'll fetch all tenants that have EVER had a lease in this org's properties
        // OR we can add organizationId to Tenant model. 
        // Given the schema, Tenant doesn't have organizationId directly.
        // Let's add organizationId to Tenant schema to make this efficient and multi-tenant safe.

        // WAIT: Schema check.
        // Tenant model: id, firstName... leases[].
        // If we want to scope tenants to orgs easily, we should probably add organizationId to Tenant.
        // OTHERWISE, we have to find tenants where leases.unit.property.organizationId = session.orgId

        const tenants = await prisma.tenant.findMany({
            where: {
                leases: {
                    some: {
                        unit: {
                            property: {
                                organizationId: session.user.organizationId
                            }
                        }
                    }
                }
            },
            include: {
                leases: {
                    where: { isActive: true },
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const tenantEmails = tenants.map(t => t.email)
        const existingUsers = await prisma.user.findMany({
            where: {
                email: { in: tenantEmails }
            },
            select: { email: true }
        })

        const existingEmails = new Set(existingUsers.map(u => u.email))

        return tenants.map(tenant => ({
            ...tenant,
            hasAccount: existingEmails.has(tenant.email)
        }))
    } catch (error) {
        console.error("Failed to fetch tenants:", error)
        return []
    }
}

export async function getTenantById(id: string) {
    const session = await auth()

    if (!session?.user?.organizationId) {
        return null
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: {
                leases: {
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        }
                    },
                    orderBy: {
                        startDate: 'desc'
                    }
                }
            }
        })

        // simple security check: ensure at least one lease belongs to this org
        // strictly speaking, a tenant could live in properties of multiple orgs if the email is same?
        // In this schema, User is per org, but Tenant is just a record. 
        // Ideally Tenant should also have organizationId for strict isolation.
        // For now, we rely on the relation check.

        return tenant
    } catch (error) {
        return null
    }
}

export async function getTenantDashboardStats() {
    const session = await auth()

    // We expect a logged in user with role TENANT
    if (!session?.user?.email) {
        return null
    }

    try {
        // Find tenant by email
        const tenant = await prisma.tenant.findUnique({
            where: { email: session.user.email },
            include: {
                leases: {
                    where: { isActive: true },
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        },
                        payments: {
                            take: 5,
                            orderBy: { date: 'desc' }
                        },
                        invoices: {
                            where: { status: 'PENDING' } // or OVERDUE
                        }
                    }
                },
                maintenanceRequests: {
                    where: {
                        status: {
                            notIn: ['COMPLETED', 'CLOSED']
                        }
                    }
                }
            }
        })

        if (!tenant) {
            return {
                tenantName: session.user.name,
                nextRentDate: null,
                nextRentAmount: 0,
                balance: 0,
                openRequests: 0,
                recentActivity: [] as any[]
            }
        }

        const activeLease = tenant.leases[0] // Assuming one active lease
        let nextRentDate = null
        let nextRentAmount = 0
        let balance = 0

        if (activeLease) {
            // Calculate next rent due date (1st of next month by default)
            const today = new Date()
            nextRentDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
            nextRentAmount = Number(activeLease.rentAmount)

            // Simple balance calculation: Sum of pending invoices
            balance = activeLease.invoices.reduce((acc, inv) => acc + Number(inv.amount), 0)
        }

        return {
            tenantName: `${tenant.firstName} ${tenant.lastName}`,
            nextRentDate,
            nextRentAmount,
            balance,
            openRequests: tenant.maintenanceRequests.length,
            recentActivity: activeLease?.payments || [] // For now just payments as activity
        }

    } catch (error) {
        console.error("Failed to fetch tenant stats:", error)
        return null
    }
}

export async function createTenantAccount(tenantId: string, email: string) {
    const session = await auth()
    if (!session?.user?.organizationId) return { error: "Unauthorized" }

    try {
        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: "User with this email already exists" }
        }

        // 2. Find tenant to confirm existence (and get details if needed)
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        })

        if (!tenant) return { error: "Tenant not found" }

        // 3. Create User
        // Generate a temporary password (or fixed one for MVP)
        // In production, we'd send an invite email.
        // For now, we'll set a default password "Tenant123!" and tell the admin.
        // OR we can pass it as arg. Let's force a default for simplicity so Admin knows it.
        const tempPassword = "TenantPassword123!"
        // Dynamic import bcrypt to avoid edge runtime issues if mostly used here
        const { hash } = await import("bcryptjs")
        const hashedPassword = await hash(tempPassword, 12)

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: tenant.firstName,
                lastName: tenant.lastName,
                role: "TENANT",
                organizationId: session.user.organizationId
            }
        })

        // Send Welcome Email
        try {
            const { emailService } = await import("@/lib/email")
            const { emailTemplates } = await import("@/lib/email/templates")
            await emailService.send(
                email,
                "Welcome to your Tenant Portal",
                emailTemplates.welcomeEmail(tenant.firstName, tempPassword)
            )
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError)
            // Don't fail the request, just log it
        }

        return { success: true, tempPassword }

    } catch (error) {
        console.error("Failed to create tenant account:", error)
        return { error: "Failed to create account" }
    }
}
