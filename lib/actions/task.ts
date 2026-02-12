"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const TaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
})

export async function getTasks() {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const tasks = await prisma.task.findMany({
        where: {
            organizationId: session.user.organizationId
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                }
            },
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return tasks
}

export async function createTask(data: z.infer<typeof TaskSchema>) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const validated = TaskSchema.parse(data)

    await prisma.task.create({
        data: {
            title: validated.title,
            description: validated.description,
            priority: validated.priority,
            status: validated.status,
            dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
            organizationId: session.user.organizationId,
            creatorId: session.user.id,
            assigneeId: validated.assigneeId || session.user.id // Default to self if not assigned
        }
    })

    revalidatePath("/dashboard/tasks")
}

export async function updateTaskStatus(taskId: string, status: "TODO" | "IN_PROGRESS" | "DONE") {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    await prisma.task.update({
        where: {
            id: taskId,
            organizationId: session.user.organizationId
        },
        data: {
            status
        }
    })

    revalidatePath("/dashboard/tasks")
}

export async function deleteTask(taskId: string) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    await prisma.task.delete({
        where: {
            id: taskId,
            organizationId: session.user.organizationId
        }
    })

    revalidatePath("/dashboard/tasks")
}
