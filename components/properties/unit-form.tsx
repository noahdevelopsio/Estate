"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { UnitStatus } from "@prisma/client"
import { createUnit } from "@/lib/actions/unit"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const unitSchema = z.object({
    unitNumber: z.string().min(1, "Unit number is required"),
    bedrooms: z.coerce.number().min(0),
    bathrooms: z.coerce.number().min(0),
    sqFt: z.coerce.number().optional(),
    marketRent: z.coerce.number().min(0),
    status: z.nativeEnum(UnitStatus),
})

type UnitFormData = z.infer<typeof unitSchema>

export function UnitForm({ propertyId }: { propertyId: string }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            status: "VACANT",
            bedrooms: "1",
            bathrooms: "1",
        },
    })

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        const result = await createUnit(propertyId, data)
        setIsLoading(false)

        if (result.success) {
            setOpen(false)
            reset()
            router.refresh()
        } else {
            console.error(result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Add Unit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Unit</DialogTitle>
                    <DialogDescription>
                        Add a unit to this property.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="unitNumber">Unit Number</Label>
                        <Input id="unitNumber" {...register("unitNumber")} placeholder="A101" />
                        {errors.unitNumber && <p className="text-sm text-destructive">{String(errors.unitNumber.message)}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="bedrooms">Bedrooms</Label>
                            <Input type="number" id="bedrooms" {...register("bedrooms")} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bathrooms">Bathrooms</Label>
                            <Input type="number" step="0.5" id="bathrooms" {...register("bathrooms")} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="marketRent">Market Rent ($)</Label>
                            <Input type="number" id="marketRent" {...register("marketRent")} placeholder="1500" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sqFt">Sq Ft</Label>
                            <Input type="number" id="sqFt" {...register("sqFt")} placeholder="800" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={(val: UnitStatus) => setValue("status", val)} defaultValue="VACANT">
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VACANT">Vacant</SelectItem>
                                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                <SelectItem value="RESERVED">Reserved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Unit"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
