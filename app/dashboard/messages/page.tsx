import { Metadata } from "next"
import { ChatSidebar } from "@/components/messages/chat-sidebar"
import { ChatWindow } from "@/components/messages/chat-window"
import { NewChatDialog } from "@/components/messages/new-chat-dialog"
import { getConversations } from "@/lib/actions/message"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: "Messages | Estate Management",
    description: "Internal and tenant communication",
}

interface MessagesPageProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const conversations = await getConversations()
    const conversationId = typeof searchParams.id === "string" ? searchParams.id : null

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]"> {/* Adjust height based on header */}
            <div className="border-b bg-background px-4 py-2 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Messages</h1>
                <NewChatDialog />
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="hidden md:flex">
                    <ChatSidebar
                        conversations={conversations}
                        selectedId={conversationId || undefined}
                    />

                </div>
                <div className="flex-1 bg-muted/20">
                    <ChatWindow
                        conversationId={conversationId}
                        currentUserId={session.user.id}
                    />
                </div>
            </div>
        </div>
    )
}
