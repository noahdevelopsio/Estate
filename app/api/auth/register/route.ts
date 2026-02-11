import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    organizationName: z.string().min(2),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const validation = registerSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { email, password, firstName, lastName, organizationName } = validation.data

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create organization slug from name
        const slug = organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")

        // Create organization and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: organizationName,
                    slug,
                },
            })

            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role: "SUPER_ADMIN",
                    organizationId: organization.id,
                },
            })

            return { user, organization }
        })

        return NextResponse.json(
            {
                message: "Registration successful",
                userId: result.user.id,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "An error occurred during registration" },
            { status: 500 }
        )
    }
}
