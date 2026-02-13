"use client"

import { ScheduleDialog } from "@/components/maintenance/schedule-dialog"

interface MaintenanceHeaderProps {
    properties: { id: string; name: string }[]
}

export function MaintenanceHeader({ properties }: MaintenanceHeaderProps) {
    return (
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Preventive Maintenance</h2>
                <p className="text-muted-foreground">
                    Manage recurring maintenance schedules and tasks.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <ScheduleDialog properties={properties} />
            </div>
        </div>
    )
}
