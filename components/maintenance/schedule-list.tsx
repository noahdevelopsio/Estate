"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Calendar, Trash, Edit } from "lucide-react"
import { format } from "date-fns"
import { deleteSchedule } from "@/lib/actions/maintenance"
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ScheduleListProps {
    schedules: any[] // Type should be inferred from Prisma return or defined shared type
}

export function ScheduleList({ schedules }: ScheduleListProps) {
    const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null)

    const handleDelete = async () => {
        if (scheduleToDelete) {
            await deleteSchedule(scheduleToDelete)
            setScheduleToDelete(null)
        }
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedules.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No maintenance schedules found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{schedule.title}</span>
                                        {schedule.description && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {schedule.description}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{schedule.property.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {schedule.frequency.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span>{format(new Date(schedule.nextRunDate), "PPP")}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {schedule.assignedTo ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={schedule.assignedTo.image || ""} />
                                                <AvatarFallback>
                                                    {schedule.assignedTo.firstName[0]}
                                                    {schedule.assignedTo.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">
                                                {schedule.assignedTo.firstName} {schedule.assignedTo.lastName}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
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
                                            <DropdownMenuItem onClick={() => setScheduleToDelete(schedule.id)} className="text-destructive focus:text-destructive">
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <AlertDialog open={!!scheduleToDelete} onOpenChange={(open) => !open && setScheduleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the maintenance schedule.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
