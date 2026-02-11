"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PaymentMethod, PaymentStatus } from "@prisma/client"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

// --- Payments (Revenue) ---

export async function recordPayment(data: {
    leaseId: string
    amount: number
    method: PaymentMethod
    date: Date
}) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const payment = await prisma.payment.create({
            data: {
                leaseId: data.leaseId,
                amount: data.amount,
                method: data.method,
                status: "PAID",
                date: data.date
            },
            include: {
                lease: {
                    include: {
                        tenant: true
                    }
                }
            }
        })

        // Notify Tenant
        if (payment.lease.tenant?.email) {
            const tenantUser = await prisma.user.findUnique({
                where: { email: payment.lease.tenant.email }
            })
            if (tenantUser) {
                const { createNotification } = await import("@/lib/actions/notification")
                await createNotification(
                    tenantUser.id,
                    "Payment Received",
                    `We received your payment of $${data.amount} via ${data.method}.`,
                    "SUCCESS"
                )

                // Send Email Receipt
                try {
                    const { emailService } = await import("@/lib/email")
                    const { emailTemplates } = await import("@/lib/email/templates")
                    await emailService.send(
                        tenantUser.email,
                        "Payment Receipt",
                        emailTemplates.paymentReceipt(data.amount, data.date, data.method)
                    )
                } catch (emailError) {
                    console.error("Failed to send receipt email:", emailError)
                }
            }
        }

        revalidatePath("/dashboard/finance")
        return { success: true }
    } catch (error) {
        console.error("Failed to record payment:", error)
        return { error: "Failed to record payment" }
    }
}

// --- Expenses ---

export async function createExpense(data: {
    propertyId: string
    amount: number
    category: string
    description?: string
    date: Date
}) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await prisma.expense.create({
            data: {
                propertyId: data.propertyId,
                amount: data.amount,
                category: data.category,
                description: data.description,
                date: data.date
            }
        })
        revalidatePath("/dashboard/finance")
        return { success: true }
    } catch (error) {
        console.error("Failed to create expense:", error)
        return { error: "Failed to record expense" }
    }
}

// --- Stats & Reporting ---

export async function getFinancialStats() {
    const session = await auth()
    if (!session?.user?.organizationId) return null

    // Filter by organization properties
    const orgId = session.user.organizationId

    // Get all properties for this org
    const properties = await prisma.property.findMany({
        where: { organizationId: orgId },
        select: { id: true }
    })
    const propertyIds = properties.map(p => p.id)

    // 1. Calculate Total Revenue (All time or this month?) -> Let's do Current Month
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const revenueResult = await prisma.payment.aggregate({
        where: {
            lease: { unit: { propertyId: { in: propertyIds } } },
            date: { gte: monthStart, lte: monthEnd },
            status: "PAID"
        },
        _sum: { amount: true }
    })
    const currentMonthRevenue = Number(revenueResult._sum.amount || 0)

    // 2. Calculate Total Expenses (Current Month)
    const expenseResult = await prisma.expense.aggregate({
        where: {
            propertyId: { in: propertyIds },
            date: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
    })
    const currentMonthExpenses = Number(expenseResult._sum.amount || 0)

    // 3. Outstanding Rent (All time active leases pending payments?)
    // This is complex. For now, let's just get "Overdue" invoices if we had them.
    // Simpler: Just return net income.
    const netIncome = currentMonthRevenue - currentMonthExpenses

    return {
        revenue: currentMonthRevenue,
        expenses: currentMonthExpenses,
        netIncome,
        month: format(now, "MMMM yyyy")
    }
}

export async function getMonthlychartData() {
    const session = await auth()
    if (!session?.user?.organizationId) return []

    const orgId = session.user.organizationId
    const properties = await prisma.property.findMany({
        where: { organizationId: orgId },
        select: { id: true }
    })
    const propertyIds = properties.map(p => p.id)

    // Last 6 months
    const data = []
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const start = startOfMonth(date)
        const end = endOfMonth(date)
        const monthName = format(date, "MMM")

        const revenue = await prisma.payment.aggregate({
            where: {
                lease: { unit: { propertyId: { in: propertyIds } } },
                date: { gte: start, lte: end },
                status: "PAID"
            },
            _sum: { amount: true }
        })

        const expenses = await prisma.expense.aggregate({
            where: {
                propertyId: { in: propertyIds },
                date: { gte: start, lte: end }
            },
            _sum: { amount: true }
        })

        data.push({
            name: monthName,
            revenue: Number(revenue._sum.amount || 0),
            expenses: Number(expenses._sum.amount || 0)
        })
    }
    return data
}

export async function getRecentTransactions() {
    const session = await auth()
    if (!session?.user?.organizationId) return []

    const orgId = session.user.organizationId
    const properties = await prisma.property.findMany({
        where: { organizationId: orgId },
        select: { id: true }
    })
    const propertyIds = properties.map(p => p.id)

    // Fetch last 5 payments
    const payments = await prisma.payment.findMany({
        where: { lease: { unit: { propertyId: { in: propertyIds } } } },
        orderBy: { date: 'desc' },
        take: 5,
        include: { lease: { include: { unit: true, tenant: true } } }
    })

    // Fetch last 5 expenses
    const expenses = await prisma.expense.findMany({
        where: { propertyId: { in: propertyIds } },
        orderBy: { date: 'desc' },
        take: 5,
        include: { property: true }
    })

    // Combine and sort
    const combined = [
        ...payments.map(p => ({
            id: p.id,
            type: "INCOME" as const,
            amount: Number(p.amount),
            date: p.date,
            description: `Rent - Unit ${p.lease.unit.unitNumber} (${p.lease.tenant.lastName})`,
            entity: p.lease.unit.unitNumber
        })),
        ...expenses.map(e => ({
            id: e.id,
            type: "EXPENSE" as const,
            amount: Number(e.amount),
            date: e.date,
            description: e.category + (e.description ? ` - ${e.description}` : ""),
            entity: e.property.name
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

    return combined
}
