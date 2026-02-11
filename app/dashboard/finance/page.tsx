import { Suspense } from "react"
import { getFinancialStats, getMonthlychartData, getRecentTransactions } from "@/lib/actions/finance"
import { OverviewCards } from "@/components/finance/overview-cards"
import { FinancialChart } from "@/components/finance/financial-chart"
import { TransactionList } from "@/components/finance/transaction-list"
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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
                <div className="flex items-center space-x-2">
                    <ExpenseForm properties={properties} />
                </div>
            </div>

            <Suspense fallback={<div>Loading stats...</div>}>
                <OverviewCards stats={safeStats} />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-2">
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
