import { Metadata } from "next"
import { getTasks, createTask, updateTaskStatus, deleteTask } from "@/lib/actions/task"
import { TaskList } from "@/components/tasks/task-list"
import { TaskHeader } from "@/components/tasks/task-header"

export const metadata: Metadata = {
    title: "Tasks | Estate Management",
    description: "Manage your tasks and to-dos.",
}

export default async function TasksPage() {
    const tasks = await getTasks()

    return (
        <div className="space-y-6 max-w-7xl">
            <TaskHeader />
            <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                <div className="p-6 md:p-8">
                    <TaskList tasks={tasks} />
                </div>
            </div>
        </div>
    )
}
