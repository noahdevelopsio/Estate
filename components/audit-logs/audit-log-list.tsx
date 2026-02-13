"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface AuditLog {
    id: string
    action: string
    entity: string
    entityId: string
    details: string | null
    createdAt: Date
    user: {
        firstName: string
        lastName: string
        email: string
        image: string | null
    }
}

interface AuditLogListProps {
    logs: AuditLog[]
}

export function AuditLogList({ logs }: AuditLogListProps) {

    const getActionColor = (action: string) => {
        const act = action.toUpperCase()
        if (act.includes("CREATE")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        if (act.includes("UPDATE")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        if (act.includes("DELETE")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No audit logs found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={log.user.image || ""} alt={log.user.firstName} />
                                            <AvatarFallback>
                                                {log.user.firstName[0]}
                                                {log.user.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {log.user.firstName} {log.user.lastName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{log.user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={getActionColor(log.action)}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{log.entity}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{log.entityId.substring(0, 8)}...</span>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[300px] truncate" title={log.details || ""}>
                                    {log.details || "-"}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
