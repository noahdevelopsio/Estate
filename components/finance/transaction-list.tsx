import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

interface Transaction {
    id: string
    type: "INCOME" | "EXPENSE"
    amount: number
    date: Date
    description: string
    entity: string
}

interface TransactionListProps {
    transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest 10 financial activities</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No transactions yet.
                        </p>
                    ) : (
                        transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${transaction.type === "INCOME"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-red-100 text-red-600"
                                        }`}>
                                        {transaction.type === "INCOME" ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownLeft className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{transaction.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-muted-foreground">
                                                {transaction.entity}
                                            </p>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <p className="text-xs text-muted-foreground">
                                                {format(transaction.date, "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-sm font-semibold ${transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                                    }`}>
                                    {transaction.type === "INCOME" ? "+" : "-"}${transaction.amount.toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
