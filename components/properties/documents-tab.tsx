import { Suspense } from "react"
import { getDocuments } from "@/lib/actions/document"
import { DocumentList } from "@/components/documents/document-list"
import { DocumentUpload } from "@/components/documents/document-upload"

interface DocumentsTabProps {
    propertyId: string
}

export async function DocumentsTab({ propertyId }: DocumentsTabProps) {
    const documents = await getDocuments(propertyId)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Property Documents</h3>
                    <p className="text-sm text-muted-foreground">Manage leases, deeds, and other files.</p>
                </div>
                <DocumentUpload propertyId={propertyId} />
            </div>

            <Suspense fallback={<div>Loading documents...</div>}>
                <DocumentList documents={documents} />
            </Suspense>
        </div>
    )
}
