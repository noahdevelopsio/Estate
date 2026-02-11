import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CreditCard, FileText, Wrench } from "lucide-react"
import Link from "next/link"
import { getTenantDashboardStats } from "@/lib/actions/tenant"
import { formatCurrency } from "@/lib/utils"

export async function TenantDashboard({ tenantName }: { tenantName: string }) {
    const stats = await getTenantDashboardStats()

    if (!stats) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome, {tenantName}</h2>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                    <p>No tenant record found. Please contact your property manager to link your account.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Welcome, {stats.tenantName}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Next Rent Due
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.nextRentAmount)}</div>
                        <p className="text-xs text-muted-foreground">
                            Due on {stats.nextRentDate ? new Date(stats.nextRentDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Balance
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.balance)}</div>
                        <p className="text-xs text-muted-foreground">
                            Current outstanding
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Open Requests
                        </CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.openRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Active maintenance requests
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentActivity.map((activity: any) => (
                                    <div key={activity.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Payment</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {formatCurrency(Number(activity.amount))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No recent activity.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full justify-start" asChild>
                            <Link href="/dashboard/payments">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Make Payment
                            </Link>
                        </Button>
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/dashboard/maintenance">
                                <Wrench className="mr-2 h-4 w-4" />
                                Report Issue
                            </Link>
                        </Button>
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/dashboard/documents">
                                <FileText className="mr-2 h-4 w-4" />
                                View Lease
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
