import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { getTenantById } from "@/lib/actions/tenant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, Calendar, Building2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default async function TenantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const tenant = await getTenantById(id)

    if (!tenant) {
        notFound()
    }

    const activeLease = tenant.leases.find(l => l.isActive)

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/tenants">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {tenant.firstName} {tenant.lastName}
                    </h1>
                    <div className="flex items-center text-muted-foreground text-sm space-x-4">
                        <span className="flex items-center"><Mail className="h-4 w-4 mr-1" /> {tenant.email}</span>
                        <span className="flex items-center"><Phone className="h-4 w-4 mr-1" /> {tenant.phone}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Lease</CardTitle>
                        <CardDescription>Active rental agreement details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeLease ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Property Unit</p>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Building2 className="mr-1 h-3 w-3" />
                                            {activeLease.unit.property.name} - Unit {activeLease.unit.unitNumber}
                                        </div>
                                    </div>
                                    <Badge>Active</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Lease Term</p>
                                        <div className="flex items-center mt-1">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {format(activeLease.startDate, "MMM d, yyyy")} - {format(activeLease.endDate, "MMM d, yyyy")}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Monthly Rent</p>
                                        <p className="mt-1 font-semibold">${Number(activeLease.rentAmount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Deposit</p>
                                        <p className="mt-1">${Number(activeLease.depositAmount).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                No active lease found.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lease History</CardTitle>
                        <CardDescription>Previous rental records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tenant.leases.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No lease history available.</p>
                            ) : (
                                tenant.leases.map((lease) => (
                                    <div key={lease.id} className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {lease.unit.property.name} - {lease.unit.unitNumber}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(lease.startDate, "MMM yyyy")} - {format(lease.endDate, "MMM yyyy")}
                                            </p>
                                        </div>
                                        <Badge variant={lease.isActive ? "default" : "secondary"}>
                                            {lease.isActive ? "Active" : "Past"}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
