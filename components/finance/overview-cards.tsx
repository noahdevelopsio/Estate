import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"

interface OverviewCardsProps {
    stats: {
        revenue: number
        expenses: number
        netIncome: number
        month: string
    }
}

export function OverviewCards({ stats }: OverviewCardsProps) {
    const isProfit = stats.netIncome >= 0

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{stats.month}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.expenses.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{stats.month}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                    <Wallet className={`h-4 w-4 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(stats.netIncome).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {isProfit ? 'Profit' : 'Loss'} for {stats.month}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
