"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { TaskDialog } from "@/components/tasks/task-dialog"

export function TaskHeader() {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Tasks</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your team's tasks and to-dos</p>
            </div>
            <Button onClick={() => setOpen(true)} className="gap-2 bg-gradient-to-r from-navy-600 to-navy-500 hover:from-navy-700 hover:to-navy-600 shadow-md">
                <Plus className="w-4 h-4" />
                New Task
            </Button>
            <TaskDialog open={open} onOpenChange={setOpen} />
        </div>
    )
}
