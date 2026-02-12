import { Suspense } from "react"
import { getMaintenanceRequests } from "@/lib/actions/maintenance"
import { MaintenanceRequestList } from "@/components/maintenance/request-list"
import { MaintenanceRequestForm } from "@/components/maintenance/request-form"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Search } from "lucide-react"

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

    // Calculate Status Counts
    const statusCounts = {
        SUBMITTED: requests.filter(r => r.status === "SUBMITTED").length,
        ASSIGNED: requests.filter(r => r.status === "ASSIGNED").length,
        IN_PROGRESS: requests.filter(r => r.status === "IN_PROGRESS").length,
        COMPLETED: requests.filter(r => r.status === "COMPLETED").length,
        CLOSED: requests.filter(r => r.status === "CLOSED").length,
    }

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Maintenance</h1>
                    <p className="text-sm text-muted-foreground mt-1">{requests.length} work orders</p>
                </div>
                <div className="flex items-center space-x-2">
                    <MaintenanceRequestForm units={units} />
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-card max-w-md focus-within:ring-1 focus-within:ring-accent/30 transition-all">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search work orders..."
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                />
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="bg-card border border-border rounded-xl p-4 shadow-card text-center hover:shadow-card-hover transition-shadow">
                        <p className="text-2xl font-display font-bold text-card-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">{status.replace('_', ' ').toLowerCase()}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <Suspense fallback={<div>Loading requests...</div>}>
                    <MaintenanceRequestList requests={requests} isAdmin={!isTenant} />
                </Suspense>
            </div>
        </div>
    )
}
