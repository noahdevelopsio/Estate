import { Suspense } from "react"
import { getProperties } from "@/lib/actions/property"
import { PropertyForm } from "@/components/properties/property-form"
import { PropertyCard } from "@/components/properties/property-card"
import { Loader2 } from "lucide-react"

export default async function PropertiesPage() {
    const properties = await getProperties()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
                    <p className="text-muted-foreground">Manage your real estate portfolio.</p>
                </div>
                <PropertyForm />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                    {properties.length === 0 ? (
                        <div className="col-span-full text-center py-12 border rounded-lg border-dashed">
                            <p className="text-muted-foreground">No properties found. Add your first property to get started.</p>
                        </div>
                    ) : (
                        properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))
                    )}
                </Suspense>
            </div>
        </div>
    )
}
