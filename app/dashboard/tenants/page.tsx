import { Suspense } from "react"
import Link from "next/link"
import { getTenants } from "@/lib/actions/tenant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Phone, Mail, Building2 } from "lucide-react"
import { TenantActions } from "@/components/tenants/tenant-actions"

export default async function TenantsPage() {
    const tenants = await getTenants()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                    <p className="text-muted-foreground">Manage your tenants and lease agreements.</p>
                </div>
                <Link href="/dashboard/tenants/new">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Tenant
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search tenants..."
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Current Unit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Rent</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No tenants found. Add your first tenant to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tenants.map((tenant) => {
                                const activeLease = tenant.leases.find((l: any) => l.isActive)
                                return (
                                    <TableRow key={tenant.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{tenant.firstName} {tenant.lastName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {tenant.email}
                                                </div>
                                                <div className="flex items-center mt-1">
                                                    <Phone className="h-3 w-3 mr-1" />
                                                    {tenant.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {activeLease ? (
                                                <div className="flex items-center">
                                                    <Building2 className="h-3 w-3 mr-1 text-muted-foreground" />
                                                    {activeLease.unit.property.name} - {activeLease.unit.unitNumber}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">No active lease</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={activeLease ? "default" : "secondary"}>
                                                {activeLease ? "Active" : "Past"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {activeLease ? (
                                                `$${Number(activeLease.rentAmount).toLocaleString()}`
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <TenantActions
                                                tenantId={tenant.id}
                                                email={tenant.email}
                                                hasAccount={(tenant as any).hasAccount}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
