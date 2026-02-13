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

// --- Automation ---

export async function generateMonthlyInvoices() {
    // This function is intended to be called by a Cron Job
    // It creates invoices for all active leases for the current month

    // 1. Get all active leases
    const activeLeases = await prisma.lease.findMany({
        where: { isActive: true },
        include: { unit: true, tenant: true }
    })

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const stats = { created: 0, skipped: 0, errors: 0 }

    for (const lease of activeLeases) {
        try {
            // 2. Check if invoice already exists for this month
            const existingInvoice = await prisma.invoice.findFirst({
                where: {
                    leaseId: lease.id,
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    },
                    description: {
                        contains: "Rent" // Simple check to distinguish from other potential invoices
                    }
                }
            })

            if (existingInvoice) {
                stats.skipped++
                continue
            }

            // 3. Create Invoice
            await prisma.invoice.create({
                data: {
                    leaseId: lease.id,
                    amount: lease.rentAmount,
                    dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), // Due 1st of next month? Or current? Let's say 5 days from now for safety in this demo logic, or standard 1st of month.
                    // PRD says "Auto-generates on 1st of month". So due date usually +5 days or same day.
                    // Let's set Due Date to 5th of current month to allow grace period.
                    description: `Rent for ${format(now, "MMMM yyyy")}`,
                    status: "PENDING"
                }
            })

            // Optional: Send email notification here (or separate job)

            stats.created++
        } catch (error) {
            console.error(`Failed to generate invoice for lease ${lease.id}:`, error)
            stats.errors++
        }
    }

    revalidatePath("/dashboard/finance")
    return stats
}

export async function sendRentReminders() {
    // Cron job to send reminders for unpaid invoices
    // 1. Find invoices due in 3 days (Upcoming) OR Overdue
    const now = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(now.getDate() + 3)

    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0))
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999))

    // A. Upcoming Reminders (Due in 3 days)
    const upcomingInvoices = await prisma.invoice.findMany({
        where: {
            status: "PENDING",
            dueDate: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: { lease: { include: { tenant: true } } }
    })

    // B. Overdue Reminders (Due yesterday? Or just generally overdue?)
    // Let's just do "Due Yesterday" to avoid spamming every day.
    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0))
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999))

    const overdueInvoices = await prisma.invoice.findMany({
        where: {
            status: "PENDING", // Still unpaid
            dueDate: {
                gte: startOfYesterday,
                lte: endOfYesterday
            }
        },
        include: { lease: { include: { tenant: true } } }
    })

    const stats = { upcomingSent: 0, overdueSent: 0, errors: 0 }

    // Helper to safely send email
    const safeSend = async (invoice: any, type: "UPCOMING" | "OVERDUE") => {
        try {
            if (!invoice.lease.tenant.email) return

            const { emailService } = await import("@/lib/email")
            // Assuming we have templates or just sending raw text for now
            const subject = type === "UPCOMING"
                ? `Reminder: Rent Due in 3 Days`
                : `Overdue: Rent Payment Required`

            const message = type === "UPCOMING"
                ? `Dear ${invoice.lease.tenant.firstName}, this is a reminder that your rent of $${invoice.amount} is due on ${format(invoice.dueDate, "PPP")}.`
                : `Dear ${invoice.lease.tenant.firstName}, your rent of $${invoice.amount} was due on ${format(invoice.dueDate, "PPP")}. Please pay immediately to avoid late fees.`

            await emailService.send(invoice.lease.tenant.email, subject, message)

            if (type === "UPCOMING") stats.upcomingSent++
            else stats.overdueSent++

        } catch (error) {
            console.error(`Failed to send reminder for invoice ${invoice.id}:`, error)
            stats.errors++
        }
    }

    // Process all
    await Promise.all([
        ...upcomingInvoices.map(inv => safeSend(inv, "UPCOMING")),
        ...overdueInvoices.map(inv => safeSend(inv, "OVERDUE"))
    ])

    return stats
}
