"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { getMessages, sendMessage } from "@/lib/actions/message"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Loader2, Send } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"

interface ChatWindowProps {
    conversationId: string | null
    currentUserId: string
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [inputText, setInputText] = useState("")
    const [isSending, startTransition] = useTransition()
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (conversationId) {
            setLoading(true)
            getMessages(conversationId).then((data) => {
                setMessages(data)
                setLoading(false)
            })
        } else {
            setMessages([])
        }
    }, [conversationId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!inputText.trim() || !conversationId) return

        const tempId = Math.random().toString()
        const optimisticMessage = {
            id: tempId,
            content: inputText,
            senderId: currentUserId,
            createdAt: new Date(),
            sender: { id: currentUserId } // Minimal mock
        }

        setMessages((prev) => [...prev, optimisticMessage])
        setInputText("")

        startTransition(async () => {
            const result = await sendMessage({
                conversationId,
                content: optimisticMessage.content
            })

            if (result.error) {
                // Revert or show error (simplified here)
                console.error("Failed to send")
            } else {
                // Refresh messages to get real ID and server timestamp
                getMessages(conversationId).then(setMessages)
            }
        })
    }

    if (!conversationId) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
                Select a conversation to start messaging
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="border-b p-4 flex items-center justify-between">
                {/* Header could show participant name here if passed or fetched */}
                <h3 className="font-semibold">Chat</h3>
            </div>

            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="space-y-4" ref={scrollRef}>
                        {messages.map((msg) => {
                            const isMe = msg.senderId === currentUserId
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                        isMe
                                            ? "ml-auto bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}
                                >
                                    {msg.content}
                                    <span className="text-[10px] opacity-70 self-end">
                                        {format(new Date(msg.createdAt), "HH:mm")}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        placeholder="Type your message..."
                        disabled={isSending}
                    />
                    <Button size="icon" onClick={handleSend} disabled={isSending || !inputText.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
