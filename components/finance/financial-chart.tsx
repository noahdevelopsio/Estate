"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface FinancialChartProps {
    data: Array<{
        name: string
        revenue: number
        expenses: number
    }>
}

function formatCurrency(val: number) {
    // Basic formatting for chart axis/tooltip
    if (val >= 1000000) {
        return '₦' + (val / 1000000).toFixed(1) + 'M';
    }
    return '₦' + (val / 1000).toFixed(1) + 'k';
}

export function FinancialChart({ data }: FinancialChartProps) {
    // Map data keys if needed. The prop has 'name', 'revenue', 'expenses'.
    // UI_GUIDE uses 'month' and 'revenue'. My data has 'name' which is month.

    return (
        <Card className="border border-border shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
            <CardHeader>
                <CardTitle className="font-display font-bold text-card-foreground">Revenue Trend</CardTitle>
                <CardDescription>Financial performance over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pl-0">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => formatCurrency(v)}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                color: 'hsl(var(--card-foreground))',
                                fontSize: '12px',
                                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value: number | undefined) => [new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value || 0), '']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--accent))"
                            fill="url(#colorRevenue)"
                            strokeWidth={2.5}
                            name="Revenue"
                        />
                        {/* Optional: Add Expenses area if we want to show both, or just Revenue as per UI_GUIDE request.
                             The generic component had both. I'll keep both but style them nicely, or just Revenue?
                             UI_GUIDE showed only Revenue Trend.
                             But `FinancialChartProps` has expenses. I'll overlay them or just show Revenue.
                             Let's show both for utility, but styled.
                         */}
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="hsl(var(--destructive))"
                            fill="url(#colorExpenses)"
                            strokeWidth={2.5}
                            name="Expenses"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
