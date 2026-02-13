"use client"

import { VendorDialog } from "@/components/vendors/vendor-dialog"

export function VendorHeader() {
    return (
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Vendors</h2>
                <p className="text-muted-foreground">
                    Manage external service providers and contractors.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <VendorDialog />
            </div>
        </div>
    )
}
