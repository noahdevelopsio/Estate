import { cn } from "@/lib/utils"

type BadgeVariant = 'active' | 'pending' | 'overdue' | 'low' | 'medium' | 'high' | 'urgent' | 'submitted' | 'assigned' | 'in-progress' | 'completed' | 'closed'

const variantStyles: Record<BadgeVariant, string> = {
    active: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    overdue: 'bg-destructive/10 text-destructive',
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-info/10 text-info',
    high: 'bg-warning/10 text-warning',
    urgent: 'bg-destructive/10 text-destructive',
    submitted: 'bg-muted text-muted-foreground',
    assigned: 'bg-info/10 text-info',
    'in-progress': 'bg-accent/10 text-accent-foreground',
    completed: 'bg-success/10 text-success',
    closed: 'bg-muted text-muted-foreground',
}

interface StatusBadgeProps {
    variant: BadgeVariant | string
    label?: string
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
    // Safe fallback if variant string doesn't match known keys
    const style = variantStyles[variant as BadgeVariant] || 'bg-muted text-muted-foreground'

    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize",
            style
        )}>
            {label || variant}
        </span>
    )
}
