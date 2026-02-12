import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllDocuments, getTenantDocuments } from "@/lib/actions/document"
import { deleteDocument } from "@/lib/actions/document"
import { Button } from "@/components/ui/button"
import { FileText, Download, Trash, Upload, Folder } from "lucide-react"

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
        <div className="space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Documents</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage all your property and tenant documents</p>
                </div>
                {!isTenant && (
                    <Button className="gap-2 gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90 transition-opacity border-0">
                        <Upload className="w-4 h-4" />
                        Upload
                    </Button>
                )}
            </div>

            {/* Upload Zone (Visual Only for now, connecting to real upload requires client component) */}
            {!isTenant && (
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center bg-card hover:border-primary/40 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-card-foreground">Drag & drop files here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse. PDF, DOC, XLS, JPG up to 10MB</p>
                </div>
            )}

            {/* Documents List */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size</th>
                                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {documents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-muted-foreground">
                                        No documents found.
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc: any) => (
                                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{doc.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {doc.property?.name || (doc.tenant ? "Tenant Personal" : "General")}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-muted-foreground uppercase text-xs">
                                            {doc.type}
                                        </td>
                                        <td className="py-4 px-6 text-muted-foreground">
                                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                {!isTenant && (
                                                    <form action={async () => {
                                                        "use server"
                                                        await deleteDocument(doc.id)
                                                    }}>
                                                        <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
