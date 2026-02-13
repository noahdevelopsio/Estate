"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const MessageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty"),
    conversationId: z.string().uuid().optional(),
    recipientId: z.string().uuid().optional(), // For new conversations
})

export type MessageFormValues = z.infer<typeof MessageSchema>

export async function startConversation(recipientId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id || !session?.user?.organizationId) {
            return { error: "Unauthorized" }
        }

        // Check for existing conversation
        const existingConv = await db.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: session.user.id } } },
                    { participants: { some: { id: recipientId } } },
                ]
            }
        })

        if (existingConv) {
            return { conversationId: existingConv.id }
        }

        // Create new
        const newConv = await db.conversation.create({
            data: {
                organizationId: session.user.organizationId,
                participants: {
                    connect: [
                        { id: session.user.id },
                        { id: recipientId }
                    ]
                }
            }
        })

        revalidatePath(`/dashboard/messages`)
        return { conversationId: newConv.id }

    } catch (error) {
        console.error("Failed to start conversation:", error)
        return { error: "Failed to start conversation" }
    }
}

export async function getConversations() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return []
        }

        const conversations = await db.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: session.user.id
                    }
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        image: true,
                        role: true,
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return conversations
    } catch (error) {
        console.error("Failed to get conversations:", error)
        return []
    }
}

export async function getMessages(conversationId: string) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return []
        }

        // Verify participation
        const conversation = await db.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: { select: { id: true } } }
        })

        const isParticipant = conversation?.participants.some(p => p.id === session.user.id)
        if (!isParticipant) {
            return []
        }

        const messages = await db.message.findMany({
            where: {
                conversationId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        return messages
    } catch (error) {
        console.error("Failed to get messages:", error)
        return []
    }
}

export async function sendMessage(data: MessageFormValues) {
    try {
        const session = await auth()
        if (!session?.user?.id || !session?.user?.organizationId) {
            return { error: "Unauthorized" }
        }

        const validatedOnly = MessageSchema.safeParse(data)
        if (!validatedOnly.success) {
            return { error: "Invalid data" }
        }

        const { content, conversationId, recipientId } = validatedOnly.data
        let finalConversationId = conversationId

        // If no conversationId, create one with recipientId
        if (!conversationId) {
            if (!recipientId) return { error: "Recipient required for new conversation" }

            // Check if conversation already exists between these two
            const existingConv = await db.conversation.findFirst({
                where: {
                    AND: [
                        { participants: { some: { id: session.user.id } } },
                        { participants: { some: { id: recipientId } } },
                        // This simplistic check assumes 1-on-1 chats.
                        // For exact match on 2 participants, it's more complex, but this suffices for now.
                    ]
                }
            })

            if (existingConv) {
                finalConversationId = existingConv.id
            } else {
                const newConv = await db.conversation.create({
                    data: {
                        organizationId: session.user.organizationId,
                        participants: {
                            connect: [
                                { id: session.user.id },
                                { id: recipientId }
                            ]
                        }
                    }
                })
                finalConversationId = newConv.id
            }
        }

        if (!finalConversationId) return { error: "Failed to determine conversation" }

        await db.message.create({
            data: {
                content,
                conversationId: finalConversationId,
                senderId: session.user.id
            }
        })

        await db.conversation.update({
            where: { id: finalConversationId },
            data: { updatedAt: new Date() }
        })

        revalidatePath(`/dashboard/messages`)
        return { success: true, conversationId: finalConversationId }

    } catch (error) {
        console.error("Failed to send message:", error)
        return { error: "Failed to send message" }
    }
}
