import { Metadata } from "next"
import { getSchedules } from "@/lib/actions/maintenance"
import { getProperties } from "@/lib/actions/property"
import { ScheduleList } from "@/components/maintenance/schedule-list"
import { MaintenanceHeader } from "@/components/maintenance/maintenance-header"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: "Preventive Maintenance | Estate Management",
    description: "Manage recurring maintenance schedules",
}

export default async function PreventiveMaintenancePage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const schedules = await getSchedules()
    const properties = await getProperties()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <MaintenanceHeader properties={properties} />
            <ScheduleList schedules={schedules} />
        </div>
    )
}
