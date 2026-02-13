"use client"

import { useState } from "react"
import { MoreHorizontal, Phone, Mail, FileText, Search, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { VendorDialog } from "@/components/vendors/vendor-dialog"
import { deleteVendor } from "@/lib/actions/vendor"
import { useToast } from "@/components/ui/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Vendor {
    id: string
    name: string
    serviceType: string
    email: string | null
    phone: string | null
    _count: {
        workOrders: number
    }
}

interface VendorListProps {
    initialVendors: Vendor[]
}

export function VendorList({ initialVendors }: VendorListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [vendorToDelete, setVendorToDelete] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    const filteredVendors = initialVendors.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async () => {
        if (!vendorToDelete) return

        const result = await deleteVendor(vendorToDelete)
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            })
        } else {
            toast({
                title: "Success",
                description: "Vendor deleted successfully",
            })
        }
        setVendorToDelete(null)
        router.refresh()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vendors..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Work Orders</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVendors.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No vendors found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVendors.map((vendor) => (
                                <TableRow key={vendor.id}>
                                    <TableCell className="font-medium">{vendor.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{vendor.serviceType}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                            {vendor.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3" />
                                                    {vendor.email}
                                                </div>
                                            )}
                                            {vendor.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3" />
                                                    {vendor.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {vendor._count.workOrders}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <VendorDialog vendor={vendor} />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setVendorToDelete(vendor.id)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!vendorToDelete} onOpenChange={(open: boolean) => !open && setVendorToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the vendor
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
