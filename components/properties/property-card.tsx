import Link from "next/link"
import { Building2, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    // Simplified occupancy calc
    const occupiedUnits = property.units?.filter((u: any) => u.status === 'OCCUPIED').length || 0
    const occupancyRate = unitCount > 0 ? Math.round((occupiedUnits / unitCount) * 100) : 0

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
                <div className="h-40 w-full bg-muted flex items-center justify-center rounded-t-lg">
                    <Building2 className="h-12 w-12 text-muted-foreground/50" />
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-1">{property.name}</CardTitle>
                    <Badge variant={property.type === 'RESIDENTIAL' ? 'default' : 'secondary'}>
                        {property.type}
                    </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.address}, {property.city}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Units</p>
                        <p className="font-semibold">{unitCount}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Occupancy</p>
                        <p className={occupancyRate >= 90 ? "text-green-600 font-semibold" : "font-semibold"}>
                            {occupancyRate}%
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="text-sm text-primary hover:underline w-full text-center"
                >
                    View Details
                </Link>
            </CardFooter>
        </Card>
    )
}
