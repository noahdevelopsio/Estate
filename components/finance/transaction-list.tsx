import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

interface Transaction {
    id: string
    type: "INCOME" | "EXPENSE"
    amount: number
    date: Date
    description: string
    entity: string
    // Add status if available in data, or mock it? 
    // The current interface doesn't have status. 
    // UI_GUIDE has status (completed, pending, failed).
    // I will mock visualization based on type or just show 'Completed' for now.
    status?: string
}

interface TransactionListProps {
    transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
    return (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
            <div className="p-6 pb-4">
                <h2 className="text-lg font-display font-bold text-card-foreground">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-t border-border">
                        <tr>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                            <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No transactions yet.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-4 px-6 font-semibold text-foreground">
                                        {transaction.entity || transaction.description}
                                        <div className="text-xs text-muted-foreground font-normal">{transaction.description}</div>
                                    </td>
                                    <td className="py-4 px-6 text-muted-foreground capitalize">
                                        {transaction.type.toLowerCase()}
                                    </td>
                                    <td className="py-4 px-6 text-muted-foreground">
                                        {format(transaction.date, "MMM d, yyyy")}
                                    </td>
                                    <td className={`py-4 px-6 text-right font-semibold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.type === 'INCOME' ? '+' : '-'}
                                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(transaction.amount)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 text-xs font-semibold capitalize text-success`}>
                                            <ArrowUpRight className="w-3 h-3" />
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
