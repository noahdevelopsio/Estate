import { Suspense } from "react"
import { Metadata } from "next"
import { getFinancialStats } from "@/lib/actions/finance"
import { getProperties } from "@/lib/actions/property"
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

        }))
    }))

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Reports</h1>
                    <p className="text-sm text-muted-foreground mt-1">View and generate detailed reports</p>
                </div>
                <div className="flex items-center space-x-2">
                    <PrintButton />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                <div className="p-6 md:p-8">
                    <Tabs defaultValue="financial" className="space-y-8">
                        <div className="border-b border-border pb-4">
                            <TabsList className="bg-muted/50 p-1">
                                <TabsTrigger value="financial" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Financial Report</TabsTrigger>
                                <TabsTrigger value="occupancy" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Occupancy Report</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="financial" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-display font-bold text-foreground">Financial Overview ({financialStats?.month})</h3>
                                <p className="text-sm text-muted-foreground">
                                    Summary of revenue, expenses, and net income.
                                </p>
                            </div>
                            <div className="rounded-xl border border-border overflow-hidden">
                                <FinancialReportTable stats={financialStats} />
                            </div>
                        </TabsContent>
                        <TabsContent value="occupancy" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-display font-bold text-foreground">Occupancy Status</h3>
                                <p className="text-sm text-muted-foreground">
                                    Occupancy rates across all properties.
                                </p>
                            </div>
                            <div className="rounded-xl border border-border overflow-hidden">
                                <OccupancyReportTable properties={properties} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
