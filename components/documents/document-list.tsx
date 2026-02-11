"use client"

import { FileText, Download, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Document } from "@prisma/client"
import { deleteDocument } from "@/lib/actions/document"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface DocumentListProps {
    documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
    const { toast } = useToast()

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return

        const result = await deleteDocument(id)
        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        } else {
            toast({ title: "Deleted", description: "Document deleted" })
        }
    }

    if (documents.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No documents uploaded.</div>
    }

    return (
        <div className="space-y-4">
            {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB • {format(doc.createdAt, "PPP")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
