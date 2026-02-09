"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { PropertyType } from "@prisma/client"
import { createProperty } from "@/lib/actions/property"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const propertySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
    country: z.string().min(2, "Country is required"),
    zipCode: z.string().optional(),
    type: z.nativeEnum(PropertyType),
    description: z.string().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

export function PropertyForm() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            type: "RESIDENTIAL",
            country: "USA", // Default
        },
    })

    const onSubmit = async (data: PropertyFormData) => {
        setIsLoading(true)
        const result = await createProperty(data)
        setIsLoading(false)

        if (result.success) {
            setOpen(false)
            reset()
            router.refresh()
        } else {
            console.error(result.error)
            // Add toast notification here
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Property</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                        Enter the details of the property you want to manage.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Property Name</Label>
                        <Input id="name" {...register("name")} placeholder="Sunset Apartments" />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">Property Type</Label>
                        <Select onValueChange={(val) => setValue("type", val as PropertyType)} defaultValue="RESIDENTIAL">
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                                <SelectItem value="MIXED">Mixed Use</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...register("address")} placeholder="123 Main St" />
                        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...register("city")} placeholder="New York" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" {...register("state")} placeholder="NY" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" {...register("country")} placeholder="USA" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input id="zipCode" {...register("zipCode")} placeholder="10001" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register("description")} placeholder="Property additional details..." />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Property"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
