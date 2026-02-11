import { Suspense } from "react"
import { Metadata } from "next"
import { getFinancialStats } from "@/lib/actions/finance"
import { getProperties } from "@/lib/actions/property"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialReportTable } from "@/components/reports/financial-report-table"
import { OccupancyReportTable } from "@/components/reports/occupancy-report-table"
import { PrintButton } from "@/components/reports/print-button"

export const metadata: Metadata = {
    title: "Reports | Estate Management",
    description: "View and print financial and occupancy reports.",
}

export default async function ReportsPage() {
    const financialStats = await getFinancialStats()
    const rawProperties = await getProperties()

    // Serialize Decimal for Client Component
    const properties = rawProperties.map(p => ({
        ...p,
        purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : null,
        units: p.units.map(u => ({
            ...u,
            marketRent: Number(u.marketRent),
            // property is self reference, no need to include? 
            // actually getProperties includes units, does unit include property?
            // lib/actions/property.ts line 66: include: { units: true }
            // It does NOT include unit.property. So no circular ref or extra decimal there.
        }))
    }))

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                <div className="flex items-center space-x-2">
                    <PrintButton />
                </div>
            </div>

            <Tabs defaultValue="financial" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="financial">Financial Report</TabsTrigger>
                    <TabsTrigger value="occupancy">Occupancy Report</TabsTrigger>
                </TabsList>
                <TabsContent value="financial" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Overview ({financialStats?.month})</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <FinancialReportTable stats={financialStats} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="occupancy" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Occupancy Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OccupancyReportTable properties={properties} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
