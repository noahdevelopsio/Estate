"use client"

import { format } from "date-fns"
import { MaintenanceRequest, WorkOrderStatus, Priority } from "@prisma/client"
import { updateMaintenanceStatus } from "@/lib/actions/maintenance"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText } from "lucide-react"
import { StatusBadge } from "@/components/dashboard/status-badge"

interface RequestListProps {
    requests: (MaintenanceRequest & {
        unit: { unitNumber: string; property: { name: string } }
        tenant: { firstName: string; lastName: string } | null
    })[]
    isAdmin?: boolean
}

export function MaintenanceRequestList({ requests, isAdmin = false }: RequestListProps) {
    const router = useRouter()
    const [isUpdating, setIsUpdating] = useState<string | null>(null)

    const handleStatusUpdate = async (id: string, status: WorkOrderStatus) => {
        setIsUpdating(id)
        await updateMaintenanceStatus(id, status)
        setIsUpdating(null)
        router.refresh()
    }

    return (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            {/* Optional Header if needed, but page has header. Let's just have the table. 
                 Or maybe "Active Requests" title? UI_GUIDE just puts it in the card.
             */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-border">
                        <tr>
                            <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID / Issue</th>
                            <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property / Unit</th>
                            <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                            <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submitted</th>
                            <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No maintenance requests found.
                                </td>
                            </tr>
                        ) : (
                            requests.map((request) => (
                                <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs text-muted-foreground mb-1 select-all">#{request.id.slice(0, 8)}</span>
                                            <span className="font-medium text-foreground">{request.title}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{request.description}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{request.unit.property.name}</span>
                                            <span className="text-xs text-muted-foreground">Unit {request.unit.unitNumber}</span>
                                            {request.tenant && (
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    By: {request.tenant.firstName} {request.tenant.lastName}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge variant={request.priority.toLowerCase()} />
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge variant={request.status.toLowerCase().replace('_', '-')} />
                                    </td>
                                    <td className="py-4 px-6 text-muted-foreground">
                                        {format(new Date(request.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(request.id)}>
                                                    Copy ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "IN_PROGRESS")}>
                                                            Mark In Progress
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "COMPLETED")}>
                                                            Mark Completed
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "CLOSED")}>
                                                            Close Ticket
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
