
import { PrismaClient, PropertyType, UnitStatus, PaymentMethod } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Create Organization
    const orgSlug = 'demo-org'
    const orgName = 'Demo Estates'

    let org = await prisma.organization.findUnique({
        where: { slug: orgSlug }
    })

    if (!org) {
        org = await prisma.organization.create({
            data: {
                name: orgName,
                slug: orgSlug
            }
        })
        console.log(`Created Organization: ${org.name}`)
    } else {
        console.log(`Organization ${org.name} already exists.`)
    }

    // 2. Create User (Owner)
    const email = 'demo@example.com'

    let user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        const hashedPassword = await hash('DemoPass123!', 12)
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: 'Demo',
                lastName: 'Admin',
                role: 'SUPER_ADMIN',
                organizationId: org.id
            }
        })
        console.log(`Created User: ${user.email}`)
    } else {
        console.log(`User ${user.email} already exists.`)
    }

    // 3. Create Properties
    const propertiesData = [
        {
            name: 'Sunset Apartments',
            address: '123 Sunset Blvd',
            city: 'Los Angeles',
            country: 'USA',
            type: PropertyType.RESIDENTIAL,
            description: 'Luxury apartments with ocean view.',
            units: [
                { number: '101', beds: 2, baths: 2, rent: 2500, status: UnitStatus.OCCUPIED },
                { number: '102', beds: 2, baths: 2, rent: 2600, status: UnitStatus.OCCUPIED },
                { number: '201', beds: 3, baths: 2, rent: 3200, status: UnitStatus.VACANT },
                { number: '202', beds: 1, baths: 1, rent: 1800, status: UnitStatus.OCCUPIED },
            ]
        },
        {
            name: 'Downtown Lofts',
            address: '456 Main St',
            city: 'San Francisco',
            country: 'USA',
            type: PropertyType.MIXED,
            description: 'Modern lofts in the city center.',
            units: [
                { number: '1A', beds: 1, baths: 1, rent: 2200, status: UnitStatus.OCCUPIED },
                { number: '1B', beds: 1, baths: 1, rent: 2200, status: UnitStatus.VACANT },
                { number: '2A', beds: 2, baths: 2, rent: 3000, status: UnitStatus.OCCUPIED },
            ]
        }
    ]

    for (const propData of propertiesData) {
        // Check if property exists
        let property = await prisma.property.findFirst({
            where: { name: propData.name, organizationId: org.id }
        })

        if (!property) {
            property = await prisma.property.create({
                data: {
                    name: propData.name,
                    address: propData.address,
                    city: propData.city,
                    country: propData.country,
                    type: propData.type,
                    description: propData.description,
                    organizationId: org.id
                }
            })
            console.log(`Created Property: ${property.name}`)
        }

        // Create Units
        for (const unitData of propData.units) {
            const unitParams = {
                unitNumber: unitData.number,
                bedrooms: unitData.beds,
                bathrooms: unitData.baths,
                marketRent: unitData.rent,
                status: unitData.status,
                propertyId: property.id
            }

            const existingUnit = await prisma.unit.findFirst({
                where: { unitNumber: unitData.number, propertyId: property.id }
            })

            if (!existingUnit) {
                await prisma.unit.create({ data: unitParams })
                console.log(`Created Unit: ${unitData.number}`)
            }
        }
    }

    // 4. Create Tenants & Leases & Payments
    // Helper to get units
    const allUnits = await prisma.unit.findMany({
        where: { property: { organizationId: org.id }, status: UnitStatus.OCCUPIED },
        include: { property: true }
    })

    const tenantsData = [
        { first: 'Alice', last: 'Smith', email: 'alice@example.com' },
        { first: 'Bob', last: 'Jones', email: 'bob@example.com' },
        { first: 'Charlie', last: 'Brown', email: 'charlie@example.com' },
        { first: 'Diana', last: 'Prince', email: 'diana@example.com' },
        { first: 'Evan', last: 'Wright', email: 'evan@example.com' },
    ]

    for (let i = 0; i < allUnits.length; i++) {
        if (i >= tenantsData.length) break;
        const unit = allUnits[i]
        const tData = tenantsData[i]

        let tenant = await prisma.tenant.findUnique({ where: { email: tData.email } })
        if (!tenant) {
            tenant = await prisma.tenant.create({
                data: {
                    firstName: tData.first,
                    lastName: tData.last,
                    email: tData.email,
                    phone: `555-010${i}`,
                }
            })
            console.log(`Created Tenant: ${tenant.firstName}`)
        }

        // Create Lease
        // Start date 6 months ago
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 6)
        const endDate = new Date(startDate)
        endDate.setFullYear(endDate.getFullYear() + 1)

        const existingLease = await prisma.lease.findFirst({
            where: { unitId: unit.id, isActive: true }
        })

        if (!existingLease) {
            const lease = await prisma.lease.create({
                data: {
                    tenantId: tenant.id,
                    unitId: unit.id,
                    startDate,
                    endDate,
                    rentAmount: unit.marketRent,
                    depositAmount: unit.marketRent,
                    isActive: true,
                }
            })
            console.log(`Created Lease for Unit ${unit.unitNumber}`)

            // 5. Create Payments History (last 6 months)
            for (let m = 0; m < 6; m++) {
                const pDate = new Date(startDate)
                pDate.setMonth(pDate.getMonth() + m)

                if (pDate > new Date()) continue; // Don't pay future

                await prisma.payment.create({
                    data: {
                        leaseId: lease.id,
                        amount: Number(lease.rentAmount),
                        method: PaymentMethod.BANK_TRANSFER,
                        status: 'PAID',
                        date: pDate
                    }
                })
            }
            console.log(`Created Payments for Lease ${lease.id}`)
        }
    }

    // 6. Create Expenses
    const properties = await prisma.property.findMany({ where: { organizationId: org.id } })
    for (const prop of properties) {
        // 3 expenses per property in last 3 months
        for (let j = 0; j < 3; j++) {
            const eDate = new Date()
            eDate.setMonth(eDate.getMonth() - j)

            await prisma.expense.create({
                data: {
                    propertyId: prop.id,
                    category: j % 2 === 0 ? 'Maintenance' : 'Utilities',
                    amount: 150 + (j * 50),
                    description: 'Monthly service',
                    date: eDate
                }
            })
        }
    }
    console.log("Seeding completed.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
