import { MetricCard } from "@/components/dashboard/metric-card"
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"

interface OverviewCardsProps {
    stats: {
        revenue: number
        expenses: number
        netIncome: number
        month: string
    }
}

function formatCurrency(val: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val)
}

export function OverviewCards({ stats }: OverviewCardsProps) {
    const isProfit = stats.netIncome >= 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
                title="Total Revenue"
                value={formatCurrency(stats.revenue)}
                change={stats.month}
                changeType="positive"
                icon={TrendingUp}
                gradient="gradient-metric-1"
            />
            <MetricCard
                title="Total Expenses"
                value={formatCurrency(stats.expenses)}
                change={stats.month}
                changeType="negative"
                icon={TrendingDown}
                gradient="gradient-metric-2"
            />
            <MetricCard
                title="Net Income"
                value={formatCurrency(stats.netIncome)}
                change={isProfit ? "Profit" : "Loss"}
                changeType={isProfit ? "positive" : "negative"}
                icon={isProfit ? DollarSign : Wallet} // or keep DollarSign
                gradient="gradient-metric-3"
            />
        </div>
    )
}
