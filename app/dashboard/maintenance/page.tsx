import { Suspense } from "react"
import { getMaintenanceRequests } from "@/lib/actions/maintenance"
import { MaintenanceRequestList } from "@/components/maintenance/request-list"
import { MaintenanceRequestForm } from "@/components/maintenance/request-form"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get units for the form
async function getUserUnits(email: string) {
    if (!email) return []
    // If tenant, get their units
    const tenant = await prisma.tenant.findUnique({
        where: { email },
        include: {
            leases: {
                where: { isActive: true },
                include: {
                    unit: {
                        include: { property: true }
                    }
                }
            }
        }
    })

    if (tenant) {
        return tenant.leases.map(l => ({
            ...l.unit,
            marketRent: Number(l.unit.marketRent),
            property: {
                ...l.unit.property,
                purchasePrice: l.unit.property.purchasePrice ? Number(l.unit.property.purchasePrice) : null
            }
        }))
    }

    // If admin, maybe return all units? Or just let them pick any property?
    // For now, let's assume this form is primarily for tenants or admins submitting ON BEHALF of a unit.
    // If admin, show all units (optimize later)
    const allUnits = await prisma.unit.findMany({
        take: 100, // Limit for now
        include: { property: true }
    })

    // Serializing Decimal to Number for Client Component
    return allUnits.map(u => ({
        ...u,
        marketRent: Number(u.marketRent),
        property: {
            ...u.property,
            purchasePrice: u.property.purchasePrice ? Number(u.property.purchasePrice) : null
        }
    }))
}

export default async function MaintenancePage() {
    const session = await auth()
    const requests = await getMaintenanceRequests()

    // Determine if User is Tenant or Admin based on role
    // This logic might need refinement based on exact role names
    const isTenant = session?.user?.role === "TENANT"

    // For the form, we need units
    const units = await getUserUnits(session?.user?.email || "")

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
                <div className="flex items-center space-x-2">
                    <MaintenanceRequestForm units={units} />
                </div>
            </div>

            <div className="space-y-4">
                <Suspense fallback={<div>Loading requests...</div>}>
                    <MaintenanceRequestList requests={requests} isAdmin={!isTenant} />
                </Suspense>
            </div>
        </div>
    )
}
