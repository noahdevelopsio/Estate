
import { createProperty } from "@/lib/actions/property"
import { createUnit } from "@/lib/actions/unit"
import { createTenant } from "@/lib/actions/tenant"
import { createLease } from "@/lib/actions/lease"
import { createMaintenanceRequest } from "@/lib/actions/maintenance"
import { recordPayment } from "@/lib/actions/finance"
import { prisma } from "@/lib/prisma"

describe("Integration Flows", () => {
    jest.setTimeout(30000) // Increase timeout for remote DB

    let propertyId: string
    let unitId: string
    let tenantId: string
    let leaseId: string

    beforeAll(async () => {
        try {
            await prisma.$connect()
            console.log("Connected to Database")
            // Create a test organization if needed?
            // But our mock auth says organizationId: 'test-org-id'
            // We need to ensure 'test-org-id' exists in Organization table?
            // Or foreign keys will fail logic...
            // Wait, Property table: organizationId String.
            // Relation: organization Organization @relation(...)
            // YES. We need to create an Organization with id 'test-org-id' first!
            await prisma.organization.upsert({
                where: { id: 'test-org-id' },
                update: {},
                create: {
                    id: 'test-org-id',
                    name: 'Test Org',
                    slug: 'test-org'
                }
            })
        } catch (e) {
            console.error("DB Connection Failed", e)
        }
    })

    test("1. Create Property", async () => {
        const res = await createProperty({
            name: "Integration Test Property " + Date.now(),
            address: "123 Test St",
            city: "Test City", // Added required field
            country: "Test Country", // Added required field
            type: "RESIDENTIAL", // Added required enum
            description: "Test Property"
        })
        if (!res.success) {
            console.error("Create Property Failed:", res)
        }
        expect(res.success).toBe(true)
        propertyId = res.propertyId as string
    })

    test("2. Create Unit", async () => {
        const res = await createUnit(propertyId, {
            unitNumber: "101-Test",
            marketRent: 1000,
            bedrooms: 1,
            bathrooms: 1,
            status: "VACANT",
        })
        if (!res.success) {
            console.error("Create Unit Failed:", res)
        }
        expect(res.success).toBe(true)
        // Need to find unit ID
        const unit = await prisma.unit.findFirst({
            where: { unitNumber: "101-Test", propertyId }
        })
        unitId = unit!.id
    })

    test("3. Create Tenant", async () => {
        const email = `test.tenant.${Date.now()}@example.com`
        const res = await createTenant({
            firstName: "Test",
            lastName: "Tenant",
            email: email,
            phone: "555-0123-4567"
        })
        if (!res.success) {
            console.error("Create Tenant Failed:", res)
        }
        expect(res.success).toBe(true)
        tenantId = res.tenantId as string
    })

    test("4. Create Lease", async () => {
        console.log("Creating Lease with TenantID:", tenantId, "UnitID:", unitId)
        const res = await createLease(tenantId, {
            unitId: unitId,
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            rentAmount: 1000,
            depositAmount: 1000
        })
        if (!res.success) {
            console.error("Create Lease Failed:", res)
        }
        expect(res.success).toBe(true)

        // Get lease ID
        const lease = await prisma.lease.findFirst({
            where: { tenantId, unitId, isActive: true }
        })
        leaseId = lease!.id
    })

    test("5. Create Maintenance Request", async () => {
        const res = await createMaintenanceRequest({
            title: "Test Request",
            description: "Something is broken",
            priority: "MEDIUM",
            unitId: unitId
        })
        expect(res.success).toBe(true)
    })

    test("6. Record Payment", async () => {
        const res = await recordPayment({
            leaseId: leaseId,
            amount: 1000,
            method: "CASH",
            date: new Date()
        })
        expect(res.success).toBe(true)
    })
})
