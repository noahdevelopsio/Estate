"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function FinancialReportTable({ stats }: { stats: any }) {
    if (!stats) return <div>No data available</div>

    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/30">
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium">Total Revenue (Collected)</TableCell>
                    <TableCell className="text-right text-emerald-600 font-bold">
                        ${stats.revenue.toLocaleString()}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="font-medium">Total Expenses</TableCell>
                    <TableCell className="text-right text-rose-600 font-bold">
                        ${stats.expenses.toLocaleString()}
                    </TableCell>
                </TableRow>
                <TableRow className="bg-muted/10">
                    <TableCell className="font-bold">Net Income</TableCell>
                    <TableCell className="text-right font-bold text-lg text-foreground">
                        ${stats.netIncome.toLocaleString()}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}
