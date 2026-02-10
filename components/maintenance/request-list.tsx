"use client"

import { format } from "date-fns"
import { MaintenanceRequest, WorkOrderStatus, Priority } from "@prisma/client"
import { updateMaintenanceStatus } from "@/lib/actions/maintenance"
import { useState } from "react"
import { useRouter } from "next/navigation"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"

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

    const getStatusColor = (status: WorkOrderStatus) => {
        switch (status) {
            case "SUBMITTED": return "bg-blue-500"
            case "ASSIGNED": return "bg-yellow-500"
            case "IN_PROGRESS": return "bg-orange-500"
            case "COMPLETED": return "bg-green-500"
            case "CLOSED": return "bg-gray-500"
            default: return "bg-gray-500"
        }
    }

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case "URGENT": return "text-red-600 font-bold"
            case "HIGH": return "text-orange-600 font-semibold"
            case "MEDIUM": return "text-blue-600"
            case "LOW": return "text-gray-600"
            default: return "text-gray-600"
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Property / Unit</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No maintenance requests found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>
                                    <div className="font-medium">{request.unit.property.name}</div>
                                    <div className="text-sm text-muted-foreground">Unit {request.unit.unitNumber}</div>
                                    {request.tenant && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {request.tenant.firstName} {request.tenant.lastName}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{request.title}</div>
                                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {request.description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={getPriorityColor(request.priority)}>
                                        {request.priority}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(request.status)}>
                                        {request.status.replace("_", " ")}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(request.createdAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
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
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
