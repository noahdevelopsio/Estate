"use client"

import { useState } from "react"
import { uploadDocument } from "@/lib/actions/document"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, File as FileIcon, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DocumentUploadProps {
    propertyId?: string
    tenantId?: string
}

export function DocumentUpload({ propertyId, tenantId }: DocumentUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return

        const file = e.target.files[0]
        const formData = new FormData()
        formData.append("file", file)
        if (propertyId) formData.append("propertyId", propertyId)
        if (tenantId) formData.append("tenantId", tenantId)

        setIsUploading(true)
        try {
            const result = await uploadDocument(formData)
            if (result.error) {
                toast({ title: "Upload failed", description: result.error, variant: "destructive" })
            } else {
                toast({ title: "Success", description: "Document uploaded successfully" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
        } finally {
            setIsUploading(false)
            // Reset input
            e.target.value = ""
        }
    }

    return (
        <div className="flex items-center gap-4">
            <Button variant="outline" className="relative" disabled={isUploading}>
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                    </>
                )}
                <Input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </Button>
            <p className="text-sm text-muted-foreground">
                Max 50MB. PDF, DOCX, Images.
            </p>
        </div>
    )
}
