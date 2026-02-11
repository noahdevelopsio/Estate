"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function OccupancyReportTable({ properties }: { properties: any[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Total Units</TableHead>
                    <TableHead>Occupied</TableHead>
                    <TableHead>Vacant</TableHead>
                    <TableHead>Occupancy Rate</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {properties.map((property) => {
                    const totalUnits = property.units.length
                    const occupied = property.units.filter((u: any) => u.status === 'OCCUPIED').length
                    const vacant = property.units.filter((u: any) => u.status === 'VACANT').length
                    const rate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0

                    return (
                        <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.name}</TableCell>
                            <TableCell>{totalUnits}</TableCell>
                            <TableCell>{occupied}</TableCell>
                            <TableCell>{vacant}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{rate}%</span>
                                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${rate}%` }}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
