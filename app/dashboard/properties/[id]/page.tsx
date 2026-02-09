import { notFound } from "next/navigation"
import Link from "next/link"
import { getPropertyById } from "@/lib/actions/property"
import { UnitForm } from "@/components/properties/unit-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Building2, MapPin, DollarSign, Bed, Bath, Hash } from "lucide-react"
import { DocumentsTab } from "@/components/properties/documents-tab"

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const property = await getPropertyById(id)

    if (!property) {
        notFound()
    }

    const totalUnits = property.units.length
    const occupiedUnits = property.units.filter(u => u.status === 'OCCUPIED').length
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

    // Calculate potential monthly revenue
    const potentialRevenue = property.units.reduce((acc, unit) => acc + Number(unit.marketRent), 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/properties">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {property.name}
                        <Badge variant="outline">{property.type}</Badge>
                    </h1>
                    <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.address}, {property.city}, {property.state} {property.zipCode}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{occupancyRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {occupiedUnits} / {totalUnits} units occupied
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUnits}</div>
                        <p className="text-xs text-muted-foreground">
                            Across this property
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${potentialRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Monthly potential rent
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Units</h2>
                    <UnitForm propertyId={property.id} />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Unit</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Market Rent</TableHead>
                                <TableHead>Bed/Bath</TableHead>
                                <TableHead>Sq Ft</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {property.units.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No units added yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                property.units.map((unit) => (
                                    <TableRow key={unit.id}>
                                        <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                unit.status === 'OCCUPIED' ? 'default' :
                                                    unit.status === 'VACANT' ? 'secondary' : 'outline'
                                            }>
                                                {unit.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${Number(unit.marketRent).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <span className="flex items-center"><Bed className="h-3 w-3 mr-1" />{unit.bedrooms}</span>
                                                <span className="flex items-center"><Bath className="h-3 w-3 mr-1" />{unit.bathrooms}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{unit.sqFt || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="pt-6 border-t">
                <DocumentsTab propertyId={property.id} />
            </div>
        </div>
    )
}
