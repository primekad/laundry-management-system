import { PrismaClient, PricingType, UnitOfMeasurement } from '@prisma/client'
import { createSystemAdmin } from '../scripts/create-admin'

const prisma = new PrismaClient()

async function run() {
    console.log('Running database seed...')
    
    // 1. First create admin user via auth API
    await createSystemAdmin()
    
    // 2. Create branches (shop and factory)
    const branches = await seedBranches()
    
    // 3. Update admin user with default branch and assigned branches
    await updateAdminBranches(branches.shop.id, [branches.shop.id, branches.factory.id])
    
    // 4. Create expense categories
    await seedExpenseCategories()
    
    // 5. Create service types
    const serviceTypes = await seedServiceTypes()
    
    // 6. Create laundry categories
    const laundryCategories = await seedLaundryCategories()
    
    // 7. Create pricing rules
    await seedPricingRules(serviceTypes, laundryCategories)
    
    console.log('Database seed completed successfully!')
}

// Create branches: shop and factory
async function seedBranches() {
    console.log('Creating branches...')
    
    // Create Shop branch
    const shop = await prisma.branch.upsert({
        where: { name: "Shop" },
        update: {},
        create: {
            name: "Shop",
            address: "123 Main Street, City Center",
            phone: "0241234567",
        }
    })
    
    // Create Factory branch
    const factory = await prisma.branch.upsert({
        where: { name: "Factory" },
        update: {},
        create: {
            name: "Factory",
            address: "456 Industrial Zone, Outskirts",
            phone: "0249876543",
        }
    })
    
    console.log('Branches created:', { shop, factory })
    return { shop, factory }
}

// Update admin user with default branch and assigned branches
async function updateAdminBranches(defaultBranchId: string, assignedBranchIds: string[]) {
    console.log('Updating admin user with branch assignments...')
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
        where: {
            role: 'admin'
        }
    })
    
    if (!adminUser) {
        console.log('Admin user not found. Please run create-admin script first.')
        return
    }
    
    // Update admin with default branch
    const updatedAdmin = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
            defaultBranchId: defaultBranchId,
            assignedBranches: {
                connect: assignedBranchIds.map(id => ({ id }))
            }
        }
    })
    
    console.log('Admin user updated with branch assignments:', updatedAdmin)
    return updatedAdmin
}

// Create expense categories
async function seedExpenseCategories() {
    console.log('Creating expense categories...')
    
    const categories = [
        { name: "Utilities", description: "Electricity, water, internet, etc." },
        { name: "Payroll", description: "Staff salaries and wages" },
        { name: "Maintenance", description: "Equipment repair and maintenance" },
        { name: "Supplies", description: "Detergent, packaging, and other supplies" },
    ]
    
    const results = []
    
    for (const category of categories) {
        const result = await prisma.expenseCategory.upsert({
            where: { name: category.name },
            update: {},
            create: category
        })
        results.push(result)
    }
    
    console.log('Expense categories created:', results)
    return results
}

// Create service types
async function seedServiceTypes() {
    console.log('Creating service types...')
    
    const serviceTypes = [
        { name: "Wash", description: "Washing service only" },
        { name: "Iron", description: "Ironing service only" },
        { name: "Wash & Iron", description: "Combined washing and ironing service" },
        { name: "Dry Clean", description: "Professional dry cleaning service" },
    ]
    
    // Define a type for service type results
    const results: Record<string, { id: string; name: string; description: string | null; status: string; createdAt: Date; updatedAt: Date }> = {}
    
    for (const serviceType of serviceTypes) {
        const result = await prisma.serviceType.upsert({
            where: { name: serviceType.name },
            update: {},
            create: serviceType
        })
        results[serviceType.name.replace(/\s+/g, '').toLowerCase()] = result
    }
    
    console.log('Service types created:', results)
    return results
}

// Create laundry categories
async function seedLaundryCategories() {
    console.log('Creating laundry categories...')
    
    const categories = [
        { name: "Shirt", description: "All types of shirts", pricingType: PricingType.FLAT_RATE },
        { name: "Dress", description: "All types of dresses", pricingType: PricingType.FLAT_RATE },
        { name: "Suit", description: "Complete suits", pricingType: PricingType.RANGE_BASED },
        { name: "Gown", description: "Formal gowns", pricingType: PricingType.RANGE_BASED },
        { name: "Curtains", description: "Window curtains", pricingType: PricingType.PER_UNIT },
        { name: "Carpet", description: "All types of carpets and rugs", pricingType: PricingType.SIZE_BASED },
        { name: "Trousers", description: "All types of pants and trousers", pricingType: PricingType.FLAT_RATE },
    ]
    
    // Define a type for laundry category results
    const results: Record<string, { id: string; name: string; description: string | null; pricingType: PricingType; status: string; createdAt: Date; updatedAt: Date }> = {}
    
    for (const category of categories) {
        const result = await prisma.laundryCategory.upsert({
            where: { name: category.name },
            update: {},
            create: category
        })
        results[category.name.toLowerCase()] = result
    }
    
    console.log('Laundry categories created:', results)
    return results
}

// Create pricing rules
async function seedPricingRules(
    serviceTypes: Record<string, { id: string; name: string; description: string | null; status: string; createdAt: Date; updatedAt: Date }>, 
    laundryCategories: Record<string, { id: string; name: string; description: string | null; pricingType: PricingType; status: string; createdAt: Date; updatedAt: Date }>
) {
    console.log('Creating pricing rules...')
    
    // Flat rate pricing for shirt, dress, trousers
    const flatRatePricing = [
        { category: 'shirt', serviceType: 'wash', price: 5.0 },
        { category: 'shirt', serviceType: 'iron', price: 3.5 },
        { category: 'shirt', serviceType: 'wash&iron', price: 8.0 },
        { category: 'shirt', serviceType: 'dryclean', price: 10.0 },
        
        { category: 'dress', serviceType: 'wash', price: 8.0 },
        { category: 'dress', serviceType: 'iron', price: 6.0 },
        { category: 'dress', serviceType: 'wash&iron', price: 12.0 },
        { category: 'dress', serviceType: 'dryclean', price: 15.0 },
        
        { category: 'trousers', serviceType: 'wash', price: 6.0 },
        { category: 'trousers', serviceType: 'iron', price: 4.0 },
        { category: 'trousers', serviceType: 'wash&iron', price: 9.0 },
        { category: 'trousers', serviceType: 'dryclean', price: 12.0 },
    ]
    
    // Range-based pricing for suit and gown
    const rangeBasedPricing = [
        { category: 'suit', serviceType: 'dryclean', minPrice: 20.0, maxPrice: 45.0 },
        { category: 'gown', serviceType: 'dryclean', minPrice: 15.0, maxPrice: 40.0 },
    ]
    
    // Size-based pricing for carpet
    // Structure for sizeBasedRates based on frontend requirements:
    // Each object has a size (range description) and price
    const carpetSizeBasedRates = [
        { size: "0-10 sq meters", price: 5.0 },
        { size: "11-20 sq meters", price: 4.5 },
        { size: "21-30 sq meters", price: 4.0 },
        { size: "31+ sq meters", price: 3.5 }
    ]
    
    // Create flat rate pricing rules
    for (const item of flatRatePricing) {
        await prisma.pricingRule.upsert({
            where: {
                id: `${item.category}-${item.serviceType}`
            },
            update: {
                price: item.price,
                status: "ACTIVE"
            },
            create: {
                laundryCategory: {
                    connect: { id: laundryCategories[item.category].id }
                },
                serviceType: {
                    connect: { id: serviceTypes[item.serviceType].id }
                },
                price: item.price,
                status: "ACTIVE"
            }
        })
    }
    
    // Create range-based pricing rules
    for (const item of rangeBasedPricing) {
        await prisma.pricingRule.upsert({
            where: {
                id: `${item.category}-${item.serviceType}`
            },
            update: {
                minPrice: item.minPrice,
                maxPrice: item.maxPrice,
                status: "ACTIVE"
            },
            create: {
                laundryCategory: {
                    connect: { id: laundryCategories[item.category].id }
                },
                serviceType: {
                    connect: { id: serviceTypes[item.serviceType].id }
                },
                minPrice: item.minPrice,
                maxPrice: item.maxPrice,
                status: "ACTIVE"
            }
        })
    }
    
    // Create size-based pricing rule for carpet
    await prisma.pricingRule.upsert({
        where: {
            id: `carpet-wash&iron`
        },
        update: {
            sizeBasedRates: carpetSizeBasedRates,
            unitOfMeasurement: UnitOfMeasurement.METRES,
            status: "ACTIVE"
        },
        create: {
            laundryCategory: {
                connect: { id: laundryCategories['carpet'].id }
            },
            serviceType: {
                connect: { id: serviceTypes['wash&iron'].id }
            },
            sizeBasedRates: carpetSizeBasedRates,
            unitOfMeasurement: UnitOfMeasurement.METRES,
            status: "ACTIVE"
        }
    })
    
    console.log('Pricing rules created successfully')
}

run()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('Seed error:', e)
        await prisma.$disconnect()
        process.exit(1)
    })