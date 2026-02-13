import { Metadata } from "next"
import { VendorHeader } from "@/components/vendors/vendor-header"
import { VendorList } from "@/components/vendors/vendor-list"
import { getVendors } from "@/lib/actions/vendor"

export const metadata: Metadata = {
    title: "Vendors | Estate Management",
    description: "Manage your vendors and service providers",
}

export default async function VendorsPage() {
    const vendors = await getVendors()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <VendorHeader />
            <VendorList initialVendors={vendors} />
        </div>
    )
}
