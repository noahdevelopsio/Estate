"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers } from "@/lib/actions/user"
import { startConversation } from "@/lib/actions/message"
import { Loader2, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface NewChatDialogProps {
    onConversationCreated?: (id: string) => void
}

export function NewChatDialog({ onConversationCreated }: NewChatDialogProps) {
    const [open, setOpen] = useState(false)
    const [users, setUsers] = useState<any[]>([]) // Using any for simplicity with action return type
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [startingChat, setStartingChat] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (open) {
            setLoading(true)
            getUsers().then((data) => {
                setUsers(data)
                setLoading(false)
            })
        }
    }, [open])

    const filteredUsers = users.filter((user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
    )

    const handleStartChat = async (userId: string) => {
        setStartingChat(true)
        const result = await startConversation(userId)
        setStartingChat(false)

        if (result.conversationId) {
            setOpen(false)
            if (onConversationCreated) {
                onConversationCreated(result.conversationId)
            } else {
                // Fallback or default behavior if no callback
                router.push(`/dashboard/messages?id=${result.conversationId}`)
            }
        } else {
            console.error(result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">New Chat</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search people..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <ScrollArea className="h-[300px]">
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No users found.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {filteredUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        disabled={startingChat}
                                        onClick={() => handleStartChat(user.id)}
                                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent text-left transition-colors"
                                    >
                                        <Avatar>
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback>
                                                {user.firstName[0]}
                                                {user.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {user.role}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
