"use client"

import { format } from "date-fns"
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateTaskStatus, deleteTask } from "@/lib/actions/task"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

interface Task {
    id: string
    title: string
    description: string | null
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    status: "TODO" | "IN_PROGRESS" | "DONE"
    dueDate: Date | null
    assignee: {
        firstName: string
        lastName: string
        image: string | null
    } | null
}

export function TaskList({ tasks }: { tasks: Task[] }) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No tasks yet</h3>
                <p className="text-muted-foreground mt-1">Get started by creating a new task.</p>
            </div>
        )
    }

    const handleStatusChange = async (taskId: string, status: "TODO" | "IN_PROGRESS" | "DONE") => {
        try {
            await updateTaskStatus(taskId, status)
            toast.success("Task status updated")
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleDelete = async (taskId: string) => {
        try {
            await deleteTask(taskId)
            toast.success("Task deleted")
        } catch (error) {
            toast.error("Failed to delete task")
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT": return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200"
            case "HIGH": return "bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-200"
            case "MEDIUM": return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200"
            case "LOW": return "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-200"
            default: return "bg-slate-100 text-slate-800"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "DONE": return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            case "IN_PROGRESS": return <Clock className="w-4 h-4 text-blue-600" />
            default: return <Circle className="w-4 h-4 text-slate-400" />
        }
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className="group bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className={`text-base font-semibold ${task.status === 'DONE' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {task.title}
                            </h3>
                            <Badge variant="outline" className={`${getPriorityColor(task.priority)} border font-medium`}>
                                {task.priority}
                            </Badge>
                        </div>
                        {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                {task.description}
                            </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {task.assignee && (
                                <div className="flex items-center gap-1.5">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={task.assignee.image || ""} />
                                        <AvatarFallback className="text-[10px]">
                                            {task.assignee.firstName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                                </div>
                            )}
                            {task.dueDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <Badge variant="secondary" className="gap-1.5 pl-1.5 pr-2.5 py-1">
                            {getStatusIcon(task.status)}
                            <span className="capitalize">{task.status.replace("_", " ").toLowerCase()}</span>
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "TODO")}>
                                    Mark as To Do
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}>
                                    Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "DONE")}>
                                    Mark as Done
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(task.id)}>
                                    Delete Task
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
        </div>
    )
}
