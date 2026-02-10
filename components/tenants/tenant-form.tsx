"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { createTenant } from "@/lib/actions/tenant"
import { createLease } from "@/lib/actions/lease"
import { getProperties } from "@/lib/actions/property"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const tenantFormSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    emergencyContact: z.string().optional(),

    // Lease details
    unitId: z.string().min(1, "Unit selection is required"),
    startDate: z.date(),
    endDate: z.date(),
    rentAmount: z.coerce.number().min(0, "Rent must be a positive number"),
    depositAmount: z.coerce.number().min(0, "Deposit must be a positive number"),
})

type TenantFormData = z.infer<typeof tenantFormSchema>

export function TenantForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [properties, setProperties] = useState<any[]>([])
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")

    // Fetch properties on mount to populate unit selection
    useEffect(() => {
        const loadProperties = async () => {
            const data = await getProperties()
            setProperties(data)
        }
        loadProperties()
    }, [])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(tenantFormSchema),
    })

    const availableUnits = properties
        .find(p => p.id === selectedPropertyId)
        ?.units.filter((u: any) => u.status === 'VACANT') || []

    const onSubmit = async (data: z.infer<typeof tenantFormSchema>) => {
        setIsLoading(true)

        // 1. Create Tenant
        const tenantResult = await createTenant({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            emergencyContact: data.emergencyContact
        })

        if (!tenantResult || !tenantResult.success || !tenantResult.tenantId) {
            console.error(tenantResult?.error || "Failed to create tenant")
            setIsLoading(false)
            return
        }

        // 2. Create Lease
        const leaseResult = await createLease(tenantResult.tenantId, {
            unitId: data.unitId,
            startDate: data.startDate,
            endDate: data.endDate,
            rentAmount: data.rentAmount,
            depositAmount: data.depositAmount
        })

        if (!leaseResult || !leaseResult.success) {
            console.error(leaseResult?.error || "Failed to create lease")
            // Ideally rollback tenant creation here, but for MVP we'll manual fix
            setIsLoading(false)
            return
        }

        setIsLoading(false)
        router.push("/dashboard/tenants")
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" {...register("firstName")} placeholder="John" />
                        {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" {...register("lastName")} placeholder="Doe" />
                        {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...register("phone")} placeholder="(555) 123-4567" />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Lease Details</h3>

                <div className="space-y-2">
                    <Label>Property</Label>
                    <Select onValueChange={setSelectedPropertyId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                            {properties.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select onValueChange={(val) => setValue("unitId", val)} disabled={!selectedPropertyId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select available unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUnits.map((u: any) => (
                                <SelectItem key={u.id} value={u.id}>
                                    {u.unitNumber} - ${Number(u.marketRent)}/mo
                                </SelectItem>
                            ))}
                            {availableUnits.length === 0 && (
                                <SelectItem value="none" disabled>No vacant units</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.unitId && <p className="text-sm text-destructive">{errors.unitId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !watch("startDate") && "text-muted-foreground"
                                    )}
                                >
                                    {watch("startDate") ? format(watch("startDate"), "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={watch("startDate")}
                                    onSelect={(date: Date | undefined) => date && setValue("startDate", date)}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label>End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !watch("endDate") && "text-muted-foreground"
                                    )}
                                >
                                    {watch("endDate") ? format(watch("endDate"), "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={watch("endDate")}
                                    onSelect={(date: Date | undefined) => date && setValue("endDate", date)}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="rentAmount">Rent Amount ($)</Label>
                        <Input type="number" id="rentAmount" {...register("rentAmount")} placeholder="1500" />
                        {errors.rentAmount && <p className="text-sm text-destructive">{errors.rentAmount.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="depositAmount">Security Deposit ($)</Label>
                        <Input type="number" id="depositAmount" {...register("depositAmount")} placeholder="1500" />
                        {errors.depositAmount && <p className="text-sm text-destructive">{errors.depositAmount.message}</p>}
                    </div>
                </div>
            </div>

            <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? "Creating Tenant..." : "Create Tenant & Lease"}
            </Button>
        </form>
    )
}
