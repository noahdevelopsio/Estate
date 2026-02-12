"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ChevronLeft, Building2, Settings, LogOut } from "lucide-react"
import { getNavItems } from "@/config/nav"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { useOrg } from "@/components/providers/org-provider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [collapsed, setCollapsed] = useState(false)
    const { currentOrgId } = useOrg() // usage for future multi-org

    const navItems = getNavItems(session?.user?.role)

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
                collapsed ? "w-[72px]" : "w-[260px]",
                "hidden md:flex", // Hide on mobile, show on md+
                className
            )}
            style={{ background: 'var(--gradient-sidebar)' }}
        >
            {/* Logo area */}
            <div className="flex items-center h-16 px-5 border-b border-sidebar-border">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0 shadow-gold">
                        <Building2 className="w-4.5 h-4.5 text-sidebar-primary-foreground" />
                    </div>
                    {!collapsed && (
                        <span className="font-display font-extrabold text-sidebar-accent-foreground text-lg tracking-tight truncate">
                            {session?.user?.organizationName || "EstateOS"}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent transition-colors hidden lg:flex"
                >
                    <ChevronLeft className={cn(
                        "w-4 h-4 text-sidebar-foreground transition-transform duration-300",
                        collapsed && "rotate-180"
                    )} />
                </button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4 px-3">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "drop-shadow-sm")} />
                                {!collapsed && <span className="truncate">{item.title}</span>}
                                {isActive && !collapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-sidebar-border space-y-1">
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Settings</span>}
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors w-full"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    )
}

export function MobileSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const navItems = getNavItems(session?.user?.role)
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="md:hidden fixed top-4 left-4 z-50 p-2.5 h-auto w-auto rounded-xl bg-card shadow-md border border-border"
                >
                    <Menu className="w-5 h-5 text-foreground" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-0 w-[280px]" style={{ background: 'var(--gradient-sidebar)' }}>
                <div className="flex items-center h-16 px-5 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0 shadow-gold">
                            <Building2 className="w-4.5 h-4.5 text-sidebar-primary-foreground" />
                        </div>
                        <span className="font-display font-extrabold text-sidebar-accent-foreground text-lg tracking-tight">
                            {session?.user?.organizationName || "EstateOS"}
                        </span>
                    </div>
                </div>
                <ScrollArea className="h-[calc(100vh-4rem)]">
                    <div className="flex flex-col py-4 px-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "drop-shadow-sm")} />
                                    <span>{item.title}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                                    )}
                                </Link>
                            )
                        })}
                        <div className="my-2 border-t border-sidebar-border" />
                        <Link
                            href="/dashboard/settings"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
                        >
                            <Settings className="w-5 h-5 flex-shrink-0" />
                            <span>Settings</span>
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors w-full"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
