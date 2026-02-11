
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTenantDashboardStats } from "@/lib/actions/tenant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default async function TenantPaymentsPage() {
    const session = await auth()

    if (!session || session.user.role !== "TENANT") {
        redirect("/dashboard")
    }

    const stats = await getTenantDashboardStats()

    if (!stats) {
        return <div className="p-8">Tenant information not found.</div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Next Rent Due
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.nextRentAmount)}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.nextRentDate ? new Date(stats.nextRentDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.balance)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Reference</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((payment: any) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            {new Date(payment.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(Number(payment.amount))}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={payment.status === 'PAID' ? 'default' : 'secondary'}>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{payment.method}</TableCell>
                                        <TableCell>{payment.reference || '-'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No payments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
