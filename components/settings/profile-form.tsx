"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/lib/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

const profileSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
    user: {
        firstName: string
        lastName: string
        email: string
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        },
    })

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true)
        const result = await updateProfile(data)
        setIsLoading(false)

        if (result?.success) {
            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            })
            router.refresh()
        } else {
            toast({
                title: "Error",
                description: result?.error || "Failed to update profile.",
                variant: "destructive",
            })
        }
    }

    return (
        <Card className="glass-panel transition-all hover:scale-[1.005] duration-300 border-opacity-50">
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    Update your personal information.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...register("firstName")} />
                            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" {...register("lastName")} />
                            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" {...register("email")} disabled />
                        <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
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
