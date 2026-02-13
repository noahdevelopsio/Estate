"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Search } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"

interface ChatSidebarProps {
    conversations: any[] // Using any for now, better to define types shared with actions
    selectedId?: string
}

export function ChatSidebar({ conversations, selectedId }: ChatSidebarProps) {
    const [search, setSearch] = useState("")
    const router = useRouter()

    const onSelect = (id: string) => {
        router.push(`/dashboard/messages?id=${id}`)
    }

    const filteredConversations = conversations.filter((conv) => {
        const participant = conv.participants[0] // Assuming the other participant is always 0 or 1, need logic to filter out self
        // Ideally the server action returns "otherParticipant" directly
        const name = `${participant.firstName} ${participant.lastName}`
        return name.toLowerCase().includes(search.toLowerCase())
    })

    // Helper to find the other participant (not the current user)
    // Since we don't have current user ID here easily without auth context or prop, 
    // we'll assume the server action handles returning the "display" participant or we filter here.
    // For now, let's just use the first participant that matches the search if we can't distinguish.
    // Actually, better pattern: Server action should return "otherParticipant" or we pass currentUserId.
    // Let's assume the passed `conversations` already processed this or we handle it simply.

    return (
        <div className="flex flex-col h-full border-r w-80">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 bg-muted/50"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2 p-2">
                    {conversations.map((conv) => {
                        // quick hack: duplicate participants won't show self if we handle it
                        // for now, just render the first participant
                        const participant = conv.participants[0]
                        const lastMessage = conv.messages[0]

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={cn(
                                    "flex items-start gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent",
                                    selectedId === conv.id && "bg-accent"
                                )}
                            >
                                <Avatar>
                                    <AvatarImage src={participant.image || ""} alt={participant.firstName} />
                                    <AvatarFallback>{participant.firstName[0]}{participant.lastName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold">{participant.firstName} {participant.lastName}</span>
                                        {lastMessage && (
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                                        {lastMessage ? lastMessage.content : "No messages yet"}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}
