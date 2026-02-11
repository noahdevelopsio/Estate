
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllDocuments, getTenantDocuments } from "@/lib/actions/document"
import { formatCurrency } from "@/lib/utils" // Not used but good import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Download, Trash } from "lucide-react"
import { deleteDocument } from "@/lib/actions/document"

export default async function DocumentsPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const isTenant = session.user.role === "TENANT"

    const documents = isTenant
        ? await getTenantDocuments()
        : await getAllDocuments()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                {!isTenant && (
                    <Button>Upload Document (Select Property)</Button>
                    // Admin upload is usually done contextually on Property/Tenant page.
                    // Global upload might need a selector. For now, leave as list.
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{isTenant ? "My Documents" : "All Documents"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Context</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.length > 0 ? (
                                documents.map((doc: any) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {doc.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{doc.type}</TableCell>
                                        <TableCell>{(doc.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                                        <TableCell>
                                            {doc.property?.name || (doc.tenant ? "Tenant Personal" : "General")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                {!isTenant && (
                                                    <form action={async () => {
                                                        "use server"
                                                        await deleteDocument(doc.id)
                                                    }}>
                                                        <Button variant="ghost" size="icon" type="submit">
                                                            <Trash className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </form>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No documents found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
