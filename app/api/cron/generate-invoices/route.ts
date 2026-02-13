
import { generateMonthlyInvoices } from "@/lib/actions/finance"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    // In production, require CRON_SECRET
    // In dev, allow if secret is set and matches, or if no secret is set (for testing convenience)
    // But best practice: always require if secret is set.

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const result = await generateMonthlyInvoices()
        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error("Cron Job Failed:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
