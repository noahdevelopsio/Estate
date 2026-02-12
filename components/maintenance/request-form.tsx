"use client"

import { Plus } from "lucide-react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { createMaintenanceRequest } from "@/lib/actions/maintenance"
import { Priority } from "@prisma/client"

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
import { getTenants } from "@/lib/actions/tenant" // We might need a better way to get current user's units

const maintenanceSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, "Please provide more detail"),
    priority: z.nativeEnum(Priority),
    unitId: z.string().min(1, "Unit is required"),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

export function MaintenanceRequestForm({ units }: { units: any[] }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<MaintenanceFormData>({
        resolver: zodResolver(maintenanceSchema),
        defaultValues: {
            priority: "MEDIUM",
            // If only one unit, select it by default
            unitId: units.length === 1 ? units[0].id : "",
        },
    })

    const onSubmit = async (data: MaintenanceFormData) => {
        setIsLoading(true)
        const result = await createMaintenanceRequest(data)
        setIsLoading(false)

        if (result?.success) {
            setOpen(false)
            reset()
            router.refresh()
        } else {
            console.error(result?.error)
            // Show toast error here
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90 transition-opacity border-0">
                    <Plus className="w-4 h-4" />
                    New Work Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Report Maintenance Issue</DialogTitle>
                    <DialogDescription>
                        Describe the issue in detail. Our team will review it shortly.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select onValueChange={(val) => setValue("unitId", val)} defaultValue={units.length === 1 ? units[0].id : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                        {unit.unitNumber} - {unit.property.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.unitId && <p className="text-sm text-destructive">{errors.unitId.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" {...register("title")} placeholder="e.g. Leaking faucet" />
                        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select onValueChange={(val: Priority) => setValue("priority", val)} defaultValue="MEDIUM">
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Describe the issue... (e.g. location, severity)"
                            className="min-h-[100px]"
                        />
                        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit Request"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
