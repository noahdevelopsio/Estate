"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createVendor, updateVendor } from "@/lib/actions/vendor"

const vendorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    serviceType: z.string().min(1, "Service type is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
})

type VendorFormValues = z.infer<typeof vendorSchema>

interface VendorDialogProps {
    vendor?: {
        id: string
        name: string
        serviceType: string
        email: string | null
        phone: string | null
    }
}

export function VendorDialog({ vendor }: VendorDialogProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const isEditing = !!vendor

    const form = useForm<VendorFormValues>({
        resolver: zodResolver(vendorSchema),
        defaultValues: {
            name: vendor?.name || "",
            serviceType: vendor?.serviceType || "",
            email: vendor?.email || "",
            phone: vendor?.phone || "",
        },
    })

    // Common service types for the dropdown
    const serviceTypes = [
        "Plumbing",
        "Electrical",
        "HVAC",
        "General Contracting",
        "Landscaping",
        "Cleaning",
        "Security",
        "Pest Control",
        "Other",
    ]

    async function onSubmit(data: VendorFormValues) {
        try {
            if (isEditing) {
                const result = await updateVendor(vendor.id, data)
                if (result.error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: result.error,
                    })
                } else {
                    toast({
                        title: "Success",
                        description: "Vendor updated successfully",
                    })
                    setOpen(false)
                }
            } else {
                const result = await createVendor(data)
                if (result.error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: result.error,
                    })
                } else {
                    toast({
                        title: "Success",
                        description: "Vendor created successfully",
                    })
                    setOpen(false)
                    form.reset()
                }
            }
            router.refresh()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Vendor
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update vendor details here."
                            : "Add a new vendor to your directory."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company / Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Services" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="serviceType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a service type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {serviceTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="contact@acme.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(555) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditing ? "Save Changes" : "Create Vendor"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
