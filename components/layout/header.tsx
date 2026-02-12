"use client"

import { useSession, signOut } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import { NotificationCenter } from "@/components/notifications/notification-center"

export function Header() {
    const { data: session } = useSession()
    const user = session?.user

    const userInitials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : "U"

    return (
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3 flex-1 max-w-lg pl-12 lg:pl-0">
                <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-4 py-2.5 w-full transition-colors focus-within:bg-muted focus-within:ring-1 focus-within:ring-accent/30">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search properties, tenants, orders..."
                        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationCenter />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 outline-none">
                            <div className="w-9 h-9 rounded-xl gradient-navy flex items-center justify-center ring-2 ring-accent/20">
                                <span className="text-xs font-bold text-primary-foreground">{userInitials}</span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-foreground leading-tight">{user?.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
