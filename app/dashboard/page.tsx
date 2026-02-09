
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { TenantDashboard } from "@/components/dashboard/tenant-dashboard"

export default async function DashboardPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    if (session.user.role === "TENANT") {
        return <TenantDashboard tenantName={session.user.name || "Tenant"} />
    }

    return (
        <AdminDashboard
            adminName={session.user.name || "Admin"}
            orgName={session.user.organizationName || "Your Organization"}
        />
    )
}
