"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserPlus, Key } from "lucide-react"
import Link from "next/link"
import { createTenantAccount } from "@/lib/actions/tenant"
import { useToast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface TenantActionsProps {
    tenantId: string
    email: string
    hasAccount: boolean // We might need to pass this if we know it
}

export function TenantActions({ tenantId, email, hasAccount }: TenantActionsProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [showCredentials, setShowCredentials] = useState(false)
    const [tempPassword, setTempPassword] = useState("")

    const handleCreateAccount = async () => {
        setIsLoading(true)
        try {
            const result = await createTenantAccount(tenantId, email)
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                })
            } else if (result.success && result.tempPassword) {
                setTempPassword(result.tempPassword)
                setShowCredentials(true)
                toast({
                    title: "Success",
                    description: "Tenant account created successfully.",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create account.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/tenants/${tenantId}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/tenants/${tenantId}/edit`}>Edit Tenant</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCreateAccount} disabled={isLoading || hasAccount}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {hasAccount ? "Account Exists" : "Create Account"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Account Created</DialogTitle>
                        <DialogDescription>
                            Please share these credentials with the tenant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="rounded-md bg-muted p-4">
                            <div className="grid gap-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Email:</span>
                                    <span>{email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Password:</span>
                                    <span className="font-mono">{tempPassword}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-yellow-600">
                            Note: This is a temporary password. The tenant should change it after logging in.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowCredentials(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
