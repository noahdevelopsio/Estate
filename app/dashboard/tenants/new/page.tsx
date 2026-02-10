import { TenantForm } from "@/components/tenants/tenant-form"
import { Separator } from "@/components/ui/separator"

export default function NewTenantPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Add New Tenant</h1>
                <p className="text-muted-foreground">
                    Create a tenant profile and assign them to a property unit.
                </p>
            </div>
            <Separator />
            <TenantForm />
        </div>
    )
}
