"use client"

import { Building2, Users, DollarSign, AlertTriangle, ArrowUpRight } from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { mockFinancials, mockWorkOrders, mockRevenueData, mockProperties } from "@/components/dashboard/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

function formatCurrency(val: number) {
    return '₦' + (val / 1000000).toFixed(1) + 'M'
}

export function AdminDashboard({ adminName, orgName }: { adminName: string, orgName: string }) {
    const recentOrders = mockWorkOrders.filter(o => o.status !== 'completed' && o.status !== 'closed').slice(0, 4)

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Good morning, {adminName}</p>
                    <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Dashboard</h1>
                </div>
                <p className="text-sm text-muted-foreground hidden sm:block">
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(mockFinancials.totalRevenue)}
                    change="+8.2% from last month"
                    changeType="positive"
                    icon={DollarSign}
                    gradient="gradient-metric-1"
                />
                <MetricCard
                    title="Occupancy Rate"
                    value={mockFinancials.occupancyRate + '%'}
                    change="+2.1% from last month"
                    changeType="positive"
                    icon={Building2}
                    gradient="gradient-metric-2"
                />
                <MetricCard
                    title="Active Tenants"
                    value="127"
                    change="3 leases expiring soon"
                    changeType="neutral"
                    icon={Users}
                    gradient="gradient-metric-3"
                />
                <MetricCard
                    title="Open Work Orders"
                    value={recentOrders.length.toString()}
                    change="1 urgent"
                    changeType="negative"
                    icon={AlertTriangle}
                    gradient="gradient-metric-4"
                />
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-display font-bold text-card-foreground">Revenue & Expenses</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 6 months overview</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <span className="text-muted-foreground">Revenue</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                                <span className="text-muted-foreground">Expenses</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockRevenueData} barGap={6}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 92%)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => '₦' + (v / 1000000).toFixed(0) + 'M'} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(222, 47%, 11%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: 'hsl(45, 100%, 96%)',
                                        fontSize: '12px',
                                        boxShadow: '0 8px 24px -4px rgba(0,0,0,0.3)',
                                    }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                />
                                <Bar dataKey="revenue" fill="hsl(222, 47%, 18%)" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="expenses" fill="hsl(220, 13%, 88%)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Work Orders */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-display font-bold text-card-foreground">Open Orders</h2>
                        <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">{recentOrders.length} active</span>
                    </div>
                    <div className="space-y-4">
                        {recentOrders.map(order => (
                            <div key={order.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{
                                    backgroundColor: order.priority === 'urgent' ? 'hsl(0, 72%, 51%)' :
                                        order.priority === 'high' ? 'hsl(38, 92%, 50%)' :
                                            order.priority === 'medium' ? 'hsl(210, 80%, 52%)' : 'hsl(220, 9%, 46%)'
                                }} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-card-foreground truncate group-hover:text-accent transition-colors">{order.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{order.property} · {order.unit}</p>
                                </div>
                                <StatusBadge variant={order.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Properties Overview */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
                <div className="p-6 pb-4 flex items-center justify-between">
                    <h2 className="text-lg font-display font-bold text-card-foreground">Property Overview</h2>
                    <button className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                        View all <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-t border-border bg-muted/30">
                                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Occupancy</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockProperties.map(p => {
                                const occupancy = Math.round((p.occupiedUnits / p.totalUnits) * 100);
                                return (
                                    <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                        <td className="py-4 px-6 font-semibold text-card-foreground">{p.name}</td>
                                        <td className="py-4 px-6 text-muted-foreground">{p.city}</td>
                                        <td className="py-4 px-6"><StatusBadge variant="active" label={p.type} /></td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-accent rounded-full" style={{ width: `${occupancy}%` }} />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">{occupancy}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right font-semibold text-card-foreground">{formatCurrency(p.monthlyRevenue)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
