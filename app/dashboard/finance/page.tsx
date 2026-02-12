import { Suspense } from "react"
import { getFinancialStats, getMonthlychartData, getRecentTransactions } from "@/lib/actions/finance"
import { OverviewCards } from "@/components/finance/overview-cards"
import { FinancialChart } from "@/components/finance/financial-chart"
import { TransactionList } from "@/components/finance/transaction-list"
// import { ExpenseForm } from "@/components/finance/expense-form" // Not in UI_GUIDE basic view, but good to have. I'll keep it or hide it.
// UI_GUIDE doesn't show an explicit "Add Expense" button in the header, but it's a useful feature.
// I'll keep it but style it if needed. For now I'll comment it out or put it in header if I want to keep functionality.
// The user said "Migrate Finance Page", functionality should be improved or kept. I'll keep the button.
import { ExpenseForm } from "@/components/finance/expense-form"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getProperties() {
    const session = await auth()
    if (!session?.user?.organizationId) return []

    return await prisma.property.findMany({
        where: { organizationId: session.user.organizationId },
        select: { id: true, name: true }
    })
}

export default async function FinancePage() {
    const [stats, chartData, transactions, properties] = await Promise.all([
        getFinancialStats(),
        getMonthlychartData(),
        getRecentTransactions(),
        getProperties()
    ])

    // Fallback for null stats
    const safeStats = stats || {
        revenue: 0,
        expenses: 0,
        netIncome: 0,
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    return (
        <div className="space-y-8 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Finances</h1>
                    <p className="text-sm text-muted-foreground mt-1">Financial overview across your portfolio</p>
                </div>
                <div className="flex items-center space-x-2">
                    {/* ExpenseForm usually renders a button. I should verify it matches Harmony. 
                         If not, I should style it. 
                         I'll stick with keeping it here.
                     */}
                    <ExpenseForm properties={properties} />
                </div>
            </div>

            <Suspense fallback={<div>Loading stats...</div>}>
                <OverviewCards stats={safeStats} />
            </Suspense>

            {/* Stacked Layout as per UI_GUIDE */}
            <div className="space-y-8">
                <Suspense fallback={<div>Loading chart...</div>}>
                    <FinancialChart data={chartData} />
                </Suspense>

                <Suspense fallback={<div>Loading transactions...</div>}>
                    <TransactionList transactions={transactions} />
                </Suspense>
            </div>
        </div>
    )
}
