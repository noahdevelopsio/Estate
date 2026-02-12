import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
    title: string
    value: string
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    icon: LucideIcon
    gradient?: string
}

export function MetricCard({ title, value, change, changeType = "neutral", icon: Icon, gradient }: MetricCardProps) {
    const isGradient = !!gradient

    return (
        <div className={cn(
            "rounded-xl p-5 animate-fade-in transition-all duration-300 hover:scale-[1.02]",
            isGradient
                ? `${gradient} text-primary-foreground shadow-lg`
                : "bg-card border border-border shadow-card hover:shadow-card-hover"
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className={cn(
                        "text-sm font-medium",
                        isGradient ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>{title}</p>
                    <p className={cn(
                        "text-2xl font-display font-bold",
                        isGradient ? "text-primary-foreground" : "text-card-foreground"
                    )}>{value}</p>
                    {change && (
                        <p className={cn(
                            "text-xs font-medium",
                            isGradient ? "text-primary-foreground/70" :
                                changeType === "positive" ? "text-success" :
                                    changeType === "negative" ? "text-destructive" :
                                        "text-muted-foreground"
                        )}>
                            {change}
                        </p>
                    )}
                </div>
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isGradient ? "bg-primary-foreground/15" : "bg-accent/15"
                )}>
                    <Icon className={cn(
                        "w-5 h-5",
                        isGradient ? "text-primary-foreground" : "text-accent"
                    )} />
                </div>
            </div>
        </div>
    )
}
