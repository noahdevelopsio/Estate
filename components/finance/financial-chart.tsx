"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FinancialChartProps {
    data: Array<{
        name: string
        revenue: number
        expenses: number
    }>
}

export function FinancialChart({ data }: FinancialChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Last 6 months comparison</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            formatter={(value: any) => [`$${(value || 0).toLocaleString()}`, "Amount"]}
                            contentStyle={{ borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
