import {
    LayoutDashboard,
    Building2,
    Users,
    CreditCard,
    Wrench,
    FileText,
    Settings,
    PieChart,
    History,
    CheckSquare,
    Briefcase,
    MessageSquare
} from "lucide-react"

const adminNav = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Properties",
        href: "/dashboard/properties",
        icon: Building2,
    },
    {
        title: "Tenants",
        href: "/dashboard/tenants",
        icon: Users,
    },
    {
        title: "Finance",
        href: "/dashboard/finance",
        icon: CreditCard,
    },
    {
        title: "Maintenance",
        href: "/dashboard/maintenance",
        icon: Wrench,
    },
    {
        title: "Preventive",
        href: "/dashboard/maintenance/preventive",
        icon: Wrench,
    },
    {
        title: "Documents",
        href: "/dashboard/documents",
        icon: FileText,
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: PieChart,
    },
    {
        title: "Tasks",
        href: "/dashboard/tasks",
        icon: CheckSquare,
    },
    {
        title: "Vendors",
        href: "/dashboard/vendors",
        icon: Briefcase,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
    {
        title: "Audit Logs",
        href: "/dashboard/audit-logs",
        icon: History,
    },
    {
        title: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare,
    },
]

const tenantNav = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
    },
    {
        title: "Maintenance",
        href: "/dashboard/maintenance",
        icon: Wrench,
    },
    {
        title: "Documents",
        href: "/dashboard/documents",
        icon: FileText,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function getNavItems(role?: string) {
    if (role === "TENANT") {
        return tenantNav
    }
    return adminNav
}
