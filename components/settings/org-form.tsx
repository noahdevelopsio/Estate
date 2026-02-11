"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { updateOrganization } from "@/lib/actions/organization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

const orgSchema = z.object({
    name: z.string().min(2, "Name is required"),
})

type OrgFormData = z.infer<typeof orgSchema>

interface OrgFormProps {
    organization: {
        name: string
        slug: string
    }
}

export function OrgForm({ organization }: OrgFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OrgFormData>({
        resolver: zodResolver(orgSchema),
        defaultValues: {
            name: organization.name,
        },
    })

    const onSubmit = async (data: OrgFormData) => {
        setIsLoading(true)
        const result = await updateOrganization(data)
        setIsLoading(false)

        if (result?.success) {
            toast({
                title: "Organization updated",
                description: "Organization details have been updated successfully.",
            })
            router.refresh()
        } else {
            toast({
                title: "Error",
                description: result?.error || "Failed to update organization.",
                variant: "destructive",
            })
        }
    }

    return (
        <Card className="glass-panel transition-all hover:scale-[1.005] duration-300 border-opacity-50">
            <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                    Manage your organization profile.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input id="orgName" {...register("name")} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL Identifier)</Label>
                        <Input id="slug" value={organization.slug} disabled />
                        <p className="text-xs text-muted-foreground">Unique identifier for your organization.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
