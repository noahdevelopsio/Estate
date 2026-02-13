
import { sendRentReminders } from "@/lib/actions/finance"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const result = await sendRentReminders()
        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error("Reminder Job Failed:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
