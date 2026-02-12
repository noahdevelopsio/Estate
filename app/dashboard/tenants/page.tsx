import { Suspense } from "react"
import Link from "next/link"
import { getTenants } from "@/lib/actions/tenant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Mail, Phone, Building2 } from "lucide-react"
import { TenantActions } from "@/components/tenants/tenant-actions"
import { StatusBadge } from "@/components/dashboard/status-badge"

export default async function TenantsPage() {
    const tenants = await getTenants()

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Tenants</h1>
                    <p className="text-sm text-muted-foreground mt-1">{tenants.length} tenants across all properties</p>
                </div>
                <Link href="/dashboard/tenants/new">
                    <Button className="gap-2 gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90 transition-opacity border-0">
                        <Plus className="w-4 h-4" />
                        Add Tenant
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-card max-w-md focus-within:ring-1 focus-within:ring-accent/30 transition-all">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search tenants..."
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                />
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tenant</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Unit</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Rent</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No tenants found. Add your first tenant to get started.
                                    </td>
                                </tr>
                            ) : (
                                tenants.map((tenant) => {
                                    const activeLease = tenant.leases.find((l: any) => l.isActive)
                                    return (
                                        <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs ring-1 ring-primary/20">
                                                        {tenant.firstName[0]}{tenant.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{tenant.firstName} {tenant.lastName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {tenant.email}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {tenant.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {activeLease ? (
                                                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                                        {activeLease.unit.property.name} <span className="text-muted-foreground">·</span> {activeLease.unit.unitNumber}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground italic text-xs">No active lease</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <StatusBadge variant={activeLease ? "active" : "closed"} label={activeLease ? "Active" : "Inactive"} />
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-foreground">
                                                {activeLease ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(activeLease.rentAmount)) : '-'}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <TenantActions
                                                    tenantId={tenant.id}
                                                    email={tenant.email}
                                                    hasAccount={(tenant as any).hasAccount}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
