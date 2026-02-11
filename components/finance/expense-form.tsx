"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { createExpense } from "@/lib/actions/finance"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

const expenseSchema = z.object({
    propertyId: z.string().min(1, "Property is required"),
    amount: z.string().transform(v => parseFloat(v)).pipe(z.number().positive("Amount must be positive")),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    date: z.date(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

const categories = [
    "Maintenance",
    "Utilities",
    "Insurance",
    "Property Tax",
    "Management Fee",
    "Repairs",
    "Other"
]

export function ExpenseForm({ properties }: { properties: any[] }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [date, setDate] = useState<Date>(new Date())

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            date: new Date(),
        },
    })

    const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
        setIsLoading(true)
        const result = await createExpense(data)
        setIsLoading(false)

        if (result?.success) {
            setOpen(false)
            reset()
            router.refresh()
        } else {
            console.error(result?.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Record Expense</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Record Expense</DialogTitle>
                    <DialogDescription>
                        Log a property expense or payment.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="property">Property</Label>
                        <Select onValueChange={(val) => setValue("propertyId", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                                {properties.map((property) => (
                                    <SelectItem key={property.id} value={property.id}>
                                        {property.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.propertyId && <p className="text-sm text-destructive">{errors.propertyId.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={(val) => setValue("category", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            {...register("amount")}
                            placeholder="0.00"
                        />
                        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(selectedDate: Date | undefined) => {
                                        if (selectedDate) {
                                            setDate(selectedDate)
                                            setValue("date", selectedDate)
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Additional details..."
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Recording..." : "Record Expense"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
