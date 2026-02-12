import { Suspense } from "react"
import { getProperties } from "@/lib/actions/property"
import { PropertyForm } from "@/components/properties/property-form"
import { PropertyCard } from "@/components/properties/property-card"
import { Loader2, Search, Plus } from "lucide-react"

export default async function PropertiesPage() {
    const properties = await getProperties()

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Properties</h1>
                    <p className="text-sm text-muted-foreground mt-1">{properties.length} properties in your portfolio</p>
                </div>
                {/* 
                  PropertyForm is the "Add Property" button/modal. 
                  I need to check if PropertyForm renders a button. 
                  If so, I might need to pass className to it to match the design (Gold gradient),
                  OR wrap it.
                  Let's assume PropertyForm renders a DialogTrigger.
                  I'll check PropertyForm later. For now, I'll place it here.
                */}
                <PropertyForm />
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-card max-w-md focus-within:ring-1 focus-within:ring-accent/30 transition-all">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search properties..."
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin mx-auto" />}>
                    {properties.length === 0 ? (
                        <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20">
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
