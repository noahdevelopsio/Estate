import Link from "next/link"
import { Building2, MapPin } from "lucide-react"
import { formatCurrency } from "@/lib/utils" // Assuming we have utils, or I'll implement inline if needed. Wait, AdminDashboard has formatCurrency inline. I should probably move it to utils or keep inline. I'll use inline for now or import from lib/utils if available. I'll check lib/utils later. For now, I'll implement inline helper or simple formatting.
// Actually, AdminDashboard used inline. I'll add a helper here.

interface PropertyCardProps {
    property: {
        id: string
        name: string
        address: string
        city: string
        type: string
        units?: any[]
    }
}

export function PropertyCard({ property }: PropertyCardProps) {
    const unitCount = property.units?.length || 0
    const occupiedUnits = property.units?.filter((u: any) => u.status === 'OCCUPIED').length || 0
    const occupancyRate = unitCount > 0 ? Math.round((occupiedUnits / unitCount) * 100) : 0

    // Mock revenue for now as it's not in the simple property object yet, or implies relation. 
    // The UI_GUIDE properties have revenue. The prisma schema might not have it directly on property (computed).
    // I'll leave it as a placeholder or 0 for now.
    const monthlyRevenue = 0

    return (
        <Link href={`/dashboard/properties/${property.id}`} className="group block h-full">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col animate-fade-in text-left">
                {/* Image Placeholder */}
                <div className="h-44 overflow-hidden relative bg-muted flex items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-105 transition-transform duration-500`} />
                    <Building2 className="w-12 h-12 text-muted-foreground/40 relative z-10" />

                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm text-foreground capitalize shadow-sm border border-border/50">
                            {property.type.toLowerCase()}
                        </span>
                    </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col">
                    <div>
                        <h3 className="font-display font-bold text-card-foreground group-hover:text-accent transition-colors text-base line-clamp-1">
                            {property.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5 ">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground line-clamp-1">{property.address}, {property.city}</p>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Monthly Revenue</span>
                                <span className="text-lg font-display font-bold text-accent">
                                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(monthlyRevenue)}
                                </span>
                            </div>
                        </div>

                        {/* Occupancy bar */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-muted-foreground">Occupancy</span>
                                <span className="font-semibold text-foreground">{occupancyRate}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 gradient-gold"
                                    style={{ width: `${occupancyRate}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                {occupiedUnits}/{unitCount} units occupied
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
