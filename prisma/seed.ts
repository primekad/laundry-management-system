import {PricingType, PrismaClient} from '@prisma/client'
import {createSystemAdmin} from '../scripts/create-admin'

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

    // 8. Seed all customers from customer database
    await seedCustomersFromDatabase()

    // 9. Get customers for June Ledger orders
    const juneCustomers = await getCustomersForJuneLedger()

    // 10. Seed orders from June Ledger
    await seedOrdersFromJuneLedger(juneCustomers, branches.factory, serviceTypes, laundryCategories)

    // 11. Get customers for July Ledger orders
    const julyCustomers = await getCustomersForJulyLedger()

    // 12. Seed orders from July Ledger
    await seedOrdersFromJulyLedger(julyCustomers, branches.factory, serviceTypes, laundryCategories)

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
        { name: "WASH", description: "Washing service only" },
        { name: "WASH/PRESS", description: "Combined washing and pressing service" },
        { name: "PRESSING", description: "Pressing service only" },
    ]

    // Define a type for service type results
    const results: Record<string, { id: string; name: string; description: string | null; status: string; createdAt: Date; updatedAt: Date }> = {}

    for (const serviceType of serviceTypes) {
        const result = await prisma.serviceType.upsert({
            where: { name: serviceType.name },
            update: {},
            create: serviceType
        })
        results[serviceType.name.replace(/\s+/g, '').toLowerCase().replace('/', '')] = result
    }

    console.log('Service types created:', results)
    return results
}

// Create laundry categories
async function seedLaundryCategories() {
    console.log('Creating laundry categories...')

    const categories = [
        // FLAT_RATE categories
        { name: "Shirts", description: "All types of shirts", pricingType: PricingType.FLAT_RATE },
        { name: "Trousers", description: "Regular trousers", pricingType: PricingType.FLAT_RATE },
        { name: "Shorts", description: "Shorts", pricingType: PricingType.FLAT_RATE },
        { name: "Jeans Trouser", description: "Jeans trousers", pricingType: PricingType.FLAT_RATE },
        { name: "Jalabiya", description: "Jalabiya", pricingType: PricingType.FLAT_RATE },
        { name: "Boubou (2pcs)", description: "Boubou 2 pieces", pricingType: PricingType.FLAT_RATE },
        { name: "Boubou(3 pcs)", description: "Boubou 3 pieces", pricingType: PricingType.FLAT_RATE },
        { name: "Kaba & Slit", description: "Kaba and slit", pricingType: PricingType.FLAT_RATE },
        { name: "Skirt", description: "Skirts", pricingType: PricingType.FLAT_RATE },
        { name: "Kente(Kaba& slit)", description: "Kente kaba and slit", pricingType: PricingType.FLAT_RATE },
        { name: "Ladies Suit", description: "Ladies suits", pricingType: PricingType.FLAT_RATE },
        { name: "Suit", description: "Men's suits", pricingType: PricingType.FLAT_RATE },
        { name: "Coat/Jacket", description: "Coats and jackets", pricingType: PricingType.FLAT_RATE },
        { name: "Smock", description: "Smocks", pricingType: PricingType.FLAT_RATE },
        { name: "Pillow case", description: "Pillow cases", pricingType: PricingType.FLAT_RATE },
        { name: "Socks", description: "Socks", pricingType: PricingType.FLAT_RATE },
        { name: "Boxers", description: "Boxers", pricingType: PricingType.FLAT_RATE },
        { name: "Panties", description: "Panties", pricingType: PricingType.FLAT_RATE },
        { name: "Singlet", description: "Singlets", pricingType: PricingType.FLAT_RATE },
        { name: "Tie", description: "Ties", pricingType: PricingType.FLAT_RATE },
        { name: "Scarf", description: "Scarfs", pricingType: PricingType.FLAT_RATE },

        // RANGE_BASED categories
        { name: "Wedding gowns", description: "Wedding gowns", pricingType: PricingType.RANGE_BASED },
        { name: "Dress", description: "Ladies dresses", pricingType: PricingType.RANGE_BASED },
        { name: "Men Cloth", description: "Men's traditional cloth", pricingType: PricingType.RANGE_BASED },
        { name: "Bedsheet", description: "Bedsheets", pricingType: PricingType.RANGE_BASED },
        { name: "Towel", description: "Towels", pricingType: PricingType.RANGE_BASED },
        { name: "Curtains", description: "Window curtains", pricingType: PricingType.RANGE_BASED },
        { name: "Comforter/ Duvet", description: "Comforters and duvets", pricingType: PricingType.RANGE_BASED },
        { name: "Doormat", description: "Doormats", pricingType: PricingType.RANGE_BASED },
        { name: "Carpet", description: "Carpets", pricingType: PricingType.RANGE_BASED },
    ]

    // Define a type for laundry category results
    const results: Record<string, { id: string; name: string; description: string | null; pricingType: PricingType; status: string; createdAt: Date; updatedAt: Date }> = {}

    for (const category of categories) {
        const result = await prisma.laundryCategory.upsert({
            where: { name: category.name },
            update: {},
            create: category
        })
        results[category.name.toLowerCase().replace(/[^a-z0-9]/g, '')] = result
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

    // Pricing data from new CSV - Flat rate items
    const flatRatePricing = [
        { category: 'shirts', serviceType: 'washpress', price: 15.0 },
        { category: 'shirts', serviceType: 'pressing', price: 10.0 },
        { category: 'trousers', serviceType: 'washpress', price: 15.0 },
        { category: 'trousers', serviceType: 'pressing', price: 10.0 },
        { category: 'shorts', serviceType: 'washpress', price: 10.0 },
        { category: 'shorts', serviceType: 'pressing', price: 8.0 },
        { category: 'jeanstrouser', serviceType: 'washpress', price: 25.0 },
        { category: 'jeanstrouser', serviceType: 'pressing', price: 15.0 },
        { category: 'jalabiya', serviceType: 'washpress', price: 30.0 },
        { category: 'jalabiya', serviceType: 'pressing', price: 20.0 },
        { category: 'boubou2pcs', serviceType: 'washpress', price: 35.0 },
        { category: 'boubou2pcs', serviceType: 'pressing', price: 30.0 },
        { category: 'boubou3pcs', serviceType: 'washpress', price: 50.0 },
        { category: 'boubou3pcs', serviceType: 'pressing', price: 40.0 },
        { category: 'kabaslit', serviceType: 'washpress', price: 35.0 },
        { category: 'kabaslit', serviceType: 'pressing', price: 30.0 },
        { category: 'skirt', serviceType: 'washpress', price: 12.0 },
        { category: 'skirt', serviceType: 'pressing', price: 10.0 },
        { category: 'kentekabaslit', serviceType: 'washpress', price: 50.0 },
        { category: 'kentekabaslit', serviceType: 'pressing', price: 40.0 },
        { category: 'ladiessuit', serviceType: 'washpress', price: 35.0 },
        { category: 'ladiessuit', serviceType: 'pressing', price: 20.0 },
        { category: 'suit', serviceType: 'washpress', price: 50.0 },
        { category: 'suit', serviceType: 'pressing', price: 40.0 },
        { category: 'coatjacket', serviceType: 'washpress', price: 35.0 },
        { category: 'coatjacket', serviceType: 'pressing', price: 30.0 },
        { category: 'smock', serviceType: 'washpress', price: 45.0 },
        { category: 'smock', serviceType: 'pressing', price: 20.0 },
        { category: 'pillowcase', serviceType: 'washpress', price: 4.0 },
        { category: 'pillowcase', serviceType: 'pressing', price: 3.0 },
        { category: 'socks', serviceType: 'wash', price: 5.0 },
        { category: 'socks', serviceType: 'washpress', price: 5.0 },
        { category: 'socks', serviceType: 'pressing', price: 5.0 },
        { category: 'boxers', serviceType: 'wash', price: 5.0 },
        { category: 'boxers', serviceType: 'washpress', price: 5.0 },
        { category: 'boxers', serviceType: 'pressing', price: 5.0 },
        { category: 'panties', serviceType: 'wash', price: 5.0 },
        { category: 'panties', serviceType: 'washpress', price: 5.0 },
        { category: 'panties', serviceType: 'pressing', price: 5.0 },
        { category: 'singlet', serviceType: 'wash', price: 5.0 },
        { category: 'singlet', serviceType: 'washpress', price: 5.0 },
        { category: 'singlet', serviceType: 'pressing', price: 5.0 },
        { category: 'tie', serviceType: 'wash', price: 5.0 },
        { category: 'tie', serviceType: 'washpress', price: 5.0 },
        { category: 'tie', serviceType: 'pressing', price: 5.0 },
        { category: 'scarf', serviceType: 'wash', price: 3.0 },
        { category: 'scarf', serviceType: 'washpress', price: 3.0 },
        { category: 'scarf', serviceType: 'pressing', price: 3.0 },
    ]

    // Range-based pricing from new CSV
    const rangeBasedPricing = [
        { category: 'weddinggowns', serviceType: 'washpress', minPrice: 70.0, maxPrice: 300.0 },
        { category: 'dress', serviceType: 'washpress', minPrice: 30.0, maxPrice: 35.0 },
        { category: 'dress', serviceType: 'pressing', minPrice: 30.0, maxPrice: 30.0 },
        { category: 'mencloth', serviceType: 'washpress', minPrice: 65.0, maxPrice: 150.0 },
        { category: 'bedsheet', serviceType: 'washpress', minPrice: 30.0, maxPrice: 50.0 },
        { category: 'bedsheet', serviceType: 'pressing', minPrice: 30.0, maxPrice: 30.0 },
        { category: 'towel', serviceType: 'washpress', minPrice: 20.0, maxPrice: 50.0 },
        { category: 'curtains', serviceType: 'washpress', minPrice: 40.0, maxPrice: 100.0 },
        { category: 'curtains', serviceType: 'pressing', minPrice: 30.0, maxPrice: 50.0 },
        { category: 'comforterduvet', serviceType: 'washpress', minPrice: 50.0, maxPrice: 100.0 },
        { category: 'doormat', serviceType: 'wash', minPrice: 20.0, maxPrice: 50.0 },
        { category: 'carpet', serviceType: 'wash', minPrice: 150.0, maxPrice: 500.0 },
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

    console.log('Pricing rules created successfully')
}

// Seed all customers from customer details CSV
async function seedCustomersFromDatabase() {
    console.log('Creating customers from customer database...')

    // Real customer data from customer-lms-details.csv
    const customerDatabase = [
        { name: "Dr Richard Kyereboah", phone: "0244384652", address: "community 20" },
        { name: "Ewuraesi", phone: "0558043363", address: "community 20" },
        { name: "Maa philo", phone: "0244250358", address: "community 20" },
        { name: "Maa Caro", phone: "0244156677", address: "community 20" },
        { name: "Mr Peter", phone: "0243161032", address: "community 20" },
        { name: "Mr Eugene", phone: null, address: "community 20" },
        { name: "Mr Elijah Danso", phone: "0242102183", address: "Collins dauda" },
        { name: "Maxwell Oman", phone: "0243516280", address: "Comm 16, corpus christi primary" },
        { name: "Mad shirley", phone: "0243442184", address: "Sakumono" },
        { name: "Mad Naa Tetteh", phone: "0546694944", address: "Sakumono" },
        { name: "Mr Kojo", phone: "0208474802", address: "Trasaco" },
        { name: "St Raphael youth center", phone: "0243442184", address: "Emefs estate" },
        { name: "Frimpong Toni", phone: "0508770000", address: "Kasapreko spintex" },
        { name: "Inusah", phone: null, address: null },
        { name: "Brother Happy", phone: null, address: null },
        { name: "Mad Annete", phone: "0597618482", address: null },
        { name: "Mr Ewoname", phone: null, address: null },
        { name: "Mr Addo", phone: "0533560135", address: null },
        { name: "Mr Prosper", phone: "0244071409", address: null },
        { name: "Felicia", phone: null, address: null },
        { name: "Mr Amoako", phone: null, address: null },
        { name: "Mrs Awudu", phone: null, address: null },
        { name: "Mr Dennis", phone: null, address: null },
        { name: "Mad. Millicent", phone: null, address: null },
        { name: "Mad. Wendy", phone: null, address: null },
        { name: "Mr Roberts", phone: "0246059333", address: null },
        { name: "Mr Owen", phone: null, address: null },
        { name: "Aunty Aggie", phone: "0244215316", address: null },
        { name: "Miss Ella", phone: "0535060406", address: null },
        { name: "Aunty Maggie", phone: "0244953314", address: null },
        { name: "Mr Eric", phone: "0248383967", address: null },
        { name: "Mad. freda", phone: null, address: null },
        { name: "Mr kofi ampong", phone: "0277855555", address: null },
        { name: "Sis Adwoa", phone: null, address: null },
        { name: "Mad deborah", phone: "0502712051", address: null },
        { name: "Mr Alex", phone: null, address: null },
        { name: "Mad Eunice", phone: null, address: null },
    ]

    const results: Record<string, { id: string; name: string; email: string; phone: string | null; address: string | null }> = {}

    for (const customer of customerDatabase) {
        // Generate email from name
        const email = customer.name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '.') // Replace spaces with dots
            + '@customer.com'

        const result = await prisma.customer.upsert({
            where: { email },
            update: {},
            create: {
                name: customer.name,
                email: email,
                phone: customer.phone,
                address: customer.address
            }
        })

        results[customer.name] = result
    }

    console.log('Customers created from database:', Object.keys(results).length)
    return results
}

// Get customers for June Ledger orders (with name mapping)
async function getCustomersForJuneLedger() {
    console.log('Mapping customers for June Ledger...')

    // Mapping from ledger names to database names
    const nameMapping: Record<string, string> = {
        "Dr. Ato Conduah": "Dr Richard Kyereboah", // Ato is likely short for Richard
        "Dr Kyereboah": "Dr Richard Kyereboah",
        "Ewurasi": "Ewuraesi",
        "Maa Philo": "Maa philo",
        "Youth centre": "St Raphael youth center",
        "Oman": "Maxwell Oman",
        "Mad. Lydia": "Maa Caro", // Best guess mapping
        "Davie Frimpong": "Frimpong Toni",
        // Direct matches (names that appear exactly or very similar)
        "Mr Eugene": "Mr Eugene",
        // Names that don't have clear matches - will create as new customers
        "Md Esther": "Md Esther",
        "Mr oxford": "Mr oxford",
        "Mr Joshua": "Mr Joshua",
        "Leslie": "Leslie",
        "Mr Hubert": "Mr Hubert",
        "Moro": "Moro",
        "Angelo": "Angelo",
        "Eben": "Eben",
        "A. Bernice": "A. Bernice",
        "P.K": "P.K",
    }

    const results: Record<string, { id: string; name: string; email: string; phone: string | null; address: string | null }> = {}

    // Get all existing customers
    const allCustomers = await prisma.customer.findMany()
    const customersByName = Object.fromEntries(allCustomers.map(c => [c.name, c]))

    for (const [ledgerName, dbName] of Object.entries(nameMapping)) {
        if (customersByName[dbName]) {
            results[ledgerName] = customersByName[dbName]
        } else {
            // Create new customer if not found
            const email = ledgerName.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '.')
                + '@customer.com'

            const newCustomer = await prisma.customer.upsert({
                where: { email },
                update: {},
                create: {
                    name: ledgerName,
                    email: email,
                    phone: null,
                    address: null
                }
            })
            results[ledgerName] = newCustomer
        }
    }

    console.log('June customers mapped:', Object.keys(results).length)
    return results
}

// Seed orders from June Ledger CSV
async function seedOrdersFromJuneLedger(
    customers: Record<string, { id: string; name: string; email: string; phone: string | null; address: string | null }>,
    factoryBranch: { id: string; name: string; address: string | null; phone: string | null; createdAt: Date; updatedAt: Date },
    serviceTypes: Record<string, { id: string; name: string; description: string | null; status: string; createdAt: Date; updatedAt: Date }>,
    laundryCategories: Record<string, { id: string; name: string; description: string | null; pricingType: PricingType; status: string; createdAt: Date; updatedAt: Date }>
) {
    console.log('Creating orders from June Ledger...')

    // Order data from June Ledger CSV (quantity column ignored - calculated from items)
    const orderData = [
        { date: '2025-06-02', invoice: '5651', customer: 'Dr. Ato Conduah', items: '15 shirts, 2 boubou,', amount: 210, service: 'pressing' },
        { date: '2025-06-02', invoice: '5652', customer: 'Md Esther', items: '10 trouser', amount: 100, service: 'pressing' },
        { date: '2025-06-02', invoice: '5653', customer: 'Mr oxford', items: '8 Shirts', amount: 80, service: 'pressing' },
        { date: '2025-06-02', invoice: '5654', customer: 'Dr Kyereboah', items: '15 shirts, 1 trouser, 3 singlet, 5 Boxers, 1 short, 1 bdsht', amount: 320, service: 'W/P' },
        { date: '2025-06-05', invoice: '5655', customer: 'Mr Joshua', items: '25 Shirts , 2 trousers', amount: 270, service: 'pressing' },
        { date: '2025-06-05', invoice: '5656', customer: 'Leslie', items: '20 shirts, 10 trouser', amount: 300, service: 'pressing' },
        { date: '2025-06-05', invoice: '5657', customer: 'Mr Hubert', items: '10 shirts', amount: 100, service: 'pressing' },
        { date: '2025-06-09', invoice: '5658', customer: 'Moro', items: '10 shirts(iron only) & 3 Shirts (W/P)', amount: 145, service: 'mixed' },
        { date: '2025-06-09', invoice: '5659', customer: 'Angelo', items: '3 shirts (Pressing) 2 W/P', amount: 60, service: 'mixed' },
        { date: '2025-06-09', invoice: '5660', customer: 'Mr Eugene', items: '4 shirts', amount: 60, service: 'W/P' },
        { date: '2025-06-11', invoice: '5661', customer: 'Ewurasi', items: '21 shirts', amount: 210, service: 'pressing' },
        { date: '2025-06-14', invoice: '5662', customer: 'Dr. Ato Conduah', items: '15 shirts , 4 Trousers', amount: 190, service: 'pressing' },
        { date: '2025-06-14', invoice: '5663', customer: 'Mr Eugene', items: '3 shirts, 2 trouser', amount: 75, service: 'W/P' },
        { date: '2025-06-14', invoice: '5664', customer: 'Eben', items: '10 shirts 8 trousers', amount: 270, service: 'W/P' },
        { date: '2025-06-18', invoice: '5665', customer: 'Dr Kyereboah', items: '10 Shirts, 5 Trousers, 6 T-shirt, 14 boxers, 1 short, 1 boubou, 1 singlet', amount: 405, service: 'W/P' },
        { date: '2025-06-18', invoice: '5666', customer: 'A. Bernice', items: '9 bedsheets, 10 pillow case, 6 towels', amount: 280, service: 'W/P' },
        { date: '2025-06-18', invoice: '5667', customer: 'Mad. Lydia', items: '5 singlets, 5 towels', amount: 100, service: 'W/P' },
        { date: '2025-06-18', invoice: '5668', customer: 'Oman', items: '7 shirts, 2 trousers, 4 singlet', amount: 155, service: 'W/P' },
        { date: '2025-06-19', invoice: '5669', customer: 'Youth centre', items: '4 curtain, 2 robes, 14 table covers, 1 pillowcase', amount: 445, service: 'W/P' },
        { date: '2025-06-24', invoice: '5670', customer: 'Davie Frimpong', items: '24 shirts', amount: 360, service: 'W/P' },
        { date: '2025-06-26', invoice: '5671', customer: 'Oman', items: '5 shirts, 2 Trouser,', amount: 105, service: 'W/P' },
        { date: '2025-06-26', invoice: '5672', customer: 'P.K', items: '7 comforter', amount: 280, service: 'W/P' },
        { date: '2025-06-26', invoice: '5673', customer: 'Maa Philo', items: '12 shirts, 4 dress, 2 comforter, 2 bdsheet, 5 pillowcase', amount: 345, service: 'W/P' },
    ]

    // Item mapping function (updated for new price list)
    const mapItemToCategory = (itemName: string): string | null => {
        const item = itemName.toLowerCase().trim()
        if (item.includes('shirt')) return 'shirts'
        if (item.includes('trouser') && !item.includes('jeans')) return 'trousers'
        if (item.includes('jeans')) return 'jeanstrouser'
        if (item.includes('boubou') && item.includes('3')) return 'boubou3pcs'
        if (item.includes('boubou')) return 'boubou2pcs' // Default to 2pcs
        if (item.includes('singlet')) return 'singlet'
        if (item.includes('boxer')) return 'boxers'
        if (item.includes('short')) return 'shorts'
        if (item.includes('bdsht') || item.includes('bdsheet') || item.includes('bedsheet')) return 'bedsheet'
        if (item.includes('pillow')) return 'pillowcase'
        if (item.includes('towel')) return 'towel'
        if (item.includes('curtain')) return 'curtains'
        if (item.includes('comforter')) return 'comforterduvet'
        if (item.includes('dress')) return 'dress'
        if (item.includes('robe')) return 'suit' // Approximate mapping
        if (item.includes('t-shirt')) return 'shirts' // Map to shirts
        if (item.includes('table cover')) return 'bedsheet' // Approximate mapping
        if (item.includes('smock')) return 'smock'
        if (item.includes('k&s')) return 'kabaslit'
        if (item.includes('tops')) return 'shirts' // Approximate mapping
        if (item.includes('inner')) return 'panties' // Approximate mapping
        return null
    }

    // Service type mapping (updated for new service types)
    const getServiceType = (service: string): string => {
        if (service === 'pressing') return 'pressing'
        if (service === 'W/P') return 'washpress'
        return 'washpress' // default
    }

    // Parse items string to extract individual items with quantities
    const parseItems = (itemsString: string, service: string) => {
        const items: Array<{ name: string, quantity: number, serviceType: string }> = []

        // Handle mixed service types
        if (service === 'mixed') {
            // Special parsing for mixed orders
            if (itemsString.includes('iron only') && itemsString.includes('W/P')) {
                // Parse "10 shirts(iron only) & 3 Shirts (W/P)"
                const ironOnlyMatch = itemsString.match(/(\d+)\s+shirts?\s*\(iron only\)/i)
                const wpMatch = itemsString.match(/(\d+)\s+shirts?\s*\(W\/P\)/i) || itemsString.match(/(\d+)\s+W\/P/i)

                if (ironOnlyMatch) {
                    items.push({ name: 'shirts', quantity: parseInt(ironOnlyMatch[1]), serviceType: 'pressing' })
                }
                if (wpMatch) {
                    items.push({ name: 'shirts', quantity: parseInt(wpMatch[1]), serviceType: 'washpress' })
                }
            } else if (itemsString.includes('Pressing') && itemsString.includes('W/P')) {
                // Parse "3 shirts (Pressing) 2 W/P"
                const pressingMatch = itemsString.match(/(\d+)\s+shirts?\s*\(Pressing\)/i)
                const wpMatch = itemsString.match(/(\d+)\s+W\/P/i)

                if (pressingMatch) {
                    items.push({ name: 'shirts', quantity: parseInt(pressingMatch[1]), serviceType: 'pressing' })
                }
                if (wpMatch) {
                    items.push({ name: 'shirts', quantity: parseInt(wpMatch[1]), serviceType: 'washpress' })
                }
            }
        } else {
            // Regular parsing for single service type
            const serviceType = getServiceType(service)
            const itemMatches = itemsString.match(/(\d+)\s+([^,&]+)/g)

            if (itemMatches) {
                for (const match of itemMatches) {
                    const parts = match.match(/(\d+)\s+(.+)/)
                    if (parts) {
                        const quantity = parseInt(parts[1])
                        const name = parts[2].trim().replace(/,$/, '')
                        items.push({ name, quantity, serviceType })
                    }
                }
            }
        }

        return items
    }

    // Get pricing for an item (updated for new price list)
    const getItemPrice = (categoryKey: string, serviceTypeKey: string): number => {
        // Flat rate pricing lookup
        const flatRateMap: Record<string, Record<string, number>> = {
            'shirts': { 'washpress': 15.0, 'pressing': 10.0 },
            'trousers': { 'washpress': 15.0, 'pressing': 10.0 },
            'shorts': { 'washpress': 10.0, 'pressing': 8.0 },
            'jeanstrouser': { 'washpress': 25.0, 'pressing': 15.0 },
            'jalabiya': { 'washpress': 30.0, 'pressing': 20.0 },
            'boubou2pcs': { 'washpress': 35.0, 'pressing': 30.0 },
            'boubou3pcs': { 'washpress': 50.0, 'pressing': 40.0 },
            'kabaslit': { 'washpress': 35.0, 'pressing': 30.0 },
            'skirt': { 'washpress': 12.0, 'pressing': 10.0 },
            'kentekabaslit': { 'washpress': 50.0, 'pressing': 40.0 },
            'ladiessuit': { 'washpress': 35.0, 'pressing': 20.0 },
            'suit': { 'washpress': 50.0, 'pressing': 40.0 },
            'coatjacket': { 'washpress': 35.0, 'pressing': 30.0 },
            'smock': { 'washpress': 45.0, 'pressing': 20.0 },
            'pillowcase': { 'washpress': 4.0, 'pressing': 3.0 },
            'socks': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'boxers': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'panties': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'singlet': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'tie': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'scarf': { 'wash': 3.0, 'washpress': 3.0, 'pressing': 3.0 },
        }

        // Range-based pricing (use average)
        const rangeBasedMap: Record<string, Record<string, number>> = {
            'weddinggowns': { 'washpress': 185.0 }, // Average of 70-300
            'dress': { 'washpress': 32.5, 'pressing': 30.0 }, // Average
            'mencloth': { 'washpress': 107.5 }, // Average of 65-150
            'bedsheet': { 'washpress': 40.0, 'pressing': 30.0 }, // Average of 30-50
            'towel': { 'washpress': 35.0 }, // Average of 20-50
            'curtains': { 'washpress': 70.0, 'pressing': 40.0 }, // Average
            'comforterduvet': { 'washpress': 75.0 }, // Average of 50-100
            'doormat': { 'wash': 35.0 }, // Average of 20-50
            'carpet': { 'wash': 325.0 }, // Average of 150-500
        }

        return flatRateMap[categoryKey]?.[serviceTypeKey] ||
               rangeBasedMap[categoryKey]?.[serviceTypeKey] ||
               15.0 // Default price
    }

    // Create orders
    for (const orderInfo of orderData) {
        try {
            const customer = customers[orderInfo.customer]
            if (!customer) {
                console.log(`Customer not found: ${orderInfo.customer}`)
                continue
            }

            // Parse items
            const parsedItems = parseItems(orderInfo.items, orderInfo.service)

            // Calculate actual quantity from parsed items
            const actualQuantity = parsedItems.reduce((sum, item) => sum + item.quantity, 0)
            console.log(`Order ${orderInfo.invoice}: Parsed ${actualQuantity} items from "${orderInfo.items}"`)

            // Calculate expected total and create order items data
            let expectedTotal = 0
            const orderItemsData: Array<{
                categoryKey: string
                serviceTypeKey: string
                quantity: number
                expectedPrice: number
                expectedSubtotal: number
            }> = []

            for (const item of parsedItems) {
                const categoryKey = mapItemToCategory(item.name)
                if (!categoryKey) {
                    console.log(`Could not map item: ${item.name}`)
                    continue
                }

                const expectedPrice = getItemPrice(categoryKey, item.serviceType)
                const expectedSubtotal = expectedPrice * item.quantity
                expectedTotal += expectedSubtotal

                orderItemsData.push({
                    categoryKey,
                    serviceTypeKey: item.serviceType,
                    quantity: item.quantity,
                    expectedPrice,
                    expectedSubtotal
                })
            }

            // Calculate adjustment factor if needed
            const adjustmentFactor = orderInfo.amount / expectedTotal

            if (Math.abs(adjustmentFactor - 1.0) > 0.01) {
                console.log(`Order ${orderInfo.invoice}: Price adjustment needed - Expected: ${expectedTotal}, CSV: ${orderInfo.amount}, Factor: ${adjustmentFactor.toFixed(3)}`)
            } else {
                console.log(`Order ${orderInfo.invoice}: Prices match perfectly - Total: ${orderInfo.amount}`)
            }

            // Create order
            const order = await prisma.order.create({
                data: {
                    invoiceNumber: orderInfo.invoice,
                    branchId: factoryBranch.id,
                    customerId: customer.id,
                    totalAmount: orderInfo.amount,
                    amountPaid: 0,
                    amountDue: orderInfo.amount,
                    status: 'COMPLETED',
                    paymentStatus: 'PENDING',
                    orderDate: new Date(orderInfo.date),
                    notes: `Migrated from June Ledger - Original items: ${orderInfo.items}`
                }
            })

            // Create order items
            for (const itemData of orderItemsData) {
                const adjustedPrice = itemData.expectedPrice * adjustmentFactor
                const adjustedSubtotal = adjustedPrice * itemData.quantity

                await prisma.orderItem.create({
                    data: {
                        orderId: order.id,
                        serviceTypeId: serviceTypes[itemData.serviceTypeKey].id,
                        categoryId: laundryCategories[itemData.categoryKey].id,
                        quantity: itemData.quantity,
                        price: Math.round(adjustedPrice * 100) / 100, // Round to 2 decimal places
                        subtotal: Math.round(adjustedSubtotal * 100) / 100
                    }
                })
            }

            console.log(`Created order ${orderInfo.invoice} for ${orderInfo.customer}`)

        } catch (error) {
            console.error(`Error creating order ${orderInfo.invoice}:`, error)
        }
    }

    console.log('Orders from June Ledger created successfully')
}

// Get customers for July Ledger orders (with name mapping)
async function getCustomersForJulyLedger() {
    console.log('Mapping customers for July Ledger...')

    // Mapping from ledger names to database names
    const nameMapping: Record<string, string> = {
        "Ewurasei": "Ewuraesi",
        "Maa caro": "Maa Caro",
        "Dr Kyereboah": "Dr Richard Kyereboah",
        "Mr Danso": "Mr Elijah Danso",
        "Mad Naa Tetteh": "Mad Naa Tetteh",
        "Tony": "Frimpong Toni",
        // Names that don't have clear matches - will create as new customers
        "Aunty Charllote": "Aunty Charllote",
        "Bernard": "Bernard",
        "Leslie": "Leslie",
    }

    const results: Record<string, { id: string; name: string; email: string; phone: string | null; address: string | null }> = {}

    // Get all existing customers
    const allCustomers = await prisma.customer.findMany()
    const customersByName = Object.fromEntries(allCustomers.map(c => [c.name, c]))

    for (const [ledgerName, dbName] of Object.entries(nameMapping)) {
        if (customersByName[dbName]) {
            results[ledgerName] = customersByName[dbName]
        } else {
            // Create new customer if not found
            const email = ledgerName.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '.')
                + '@customer.com'

            const newCustomer = await prisma.customer.upsert({
                where: { email },
                update: {},
                create: {
                    name: ledgerName,
                    email: email,
                    phone: null,
                    address: null
                }
            })
            results[ledgerName] = newCustomer
        }
    }

    console.log('July customers mapped:', Object.keys(results).length)
    return results
}

// Seed orders from July Ledger CSV
async function seedOrdersFromJulyLedger(
    customers: Record<string, { id: string; name: string; email: string; phone: string | null; address: string | null }>,
    factoryBranch: { id: string; name: string; address: string | null; phone: string | null; createdAt: Date; updatedAt: Date },
    serviceTypes: Record<string, { id: string; name: string; description: string | null; status: string; createdAt: Date; updatedAt: Date }>,
    laundryCategories: Record<string, { id: string; name: string; description: string | null; pricingType: PricingType; status: string; createdAt: Date; updatedAt: Date }>
) {
    console.log('Creating orders from July Ledger...')

    // Order data from July Ledger CSV (quantity column ignored - calculated from items)
    const orderData = [
        { date: '2025-07-09', invoice: '5674', customer: 'Ewurasei', items: '21 shirts, 3 boubou, 1 trouser', amount: 295, service: 'Pressing' },
        { date: '2025-07-09', invoice: '5675', customer: 'Maa caro', items: '2 dress, 6 pillow case', amount: 90, service: 'W/P' },
        { date: '2025-07-09', invoice: '5676', customer: 'Aunty Charllote', items: '17 shirts', amount: 170, service: 'Pressing' },
        { date: '2025-07-09', invoice: '5677', customer: 'Bernard', items: '9 shirts , 2 trouser, 5 boubou', amount: 340, service: 'W/P' },
        { date: '2025-07-09', invoice: '5678', customer: 'Leslie', items: '22 shirts, 4 trousers, 2 boubou', amount: 310, service: 'Pressing' },
        { date: '2025-07-09', invoice: '5679', customer: 'Mr Danso', items: '17 shirts, 10 trousers, 2 boubou, 1 jeans, 1 smock', amount: 535, service: 'w/P' },
        { date: '2025-07-09', invoice: '5680', customer: 'Dr Kyereboah', items: '17 shirts, 6 trou, 1 boubou, 8 boxers, 3 singlet, 4 inner, 10 bedsht, 7 pillcase', amount: 840, service: 'W/P' },
        { date: '2025-07-09', invoice: '5681', customer: 'Mad Naa Tetteh', items: '11 dress, 2 K&S, 7 Tops, 3 trousers', amount: 325, service: 'Pressing' },
        { date: '2025-07-25', invoice: '5682', customer: 'Tony', items: '25 shirts, 3 Trous, 10 shorts, 2 boubou, 20 singlet, 2 trou(Press only)', amount: 710, service: 'mixed' },
    ]

    // Item mapping function for July (updated for new price list)
    const mapItemToCategory = (itemName: string): string | null => {
        const item = itemName.toLowerCase().trim()
        if (item.includes('shirt')) return 'shirts'
        if (item.includes('trouser') || item.includes('trou')) {
            if (item.includes('jeans')) return 'jeanstrouser'
            return 'trousers'
        }
        if (item.includes('boubou') && item.includes('3')) return 'boubou3pcs'
        if (item.includes('boubou')) return 'boubou2pcs' // Default to 2pcs
        if (item.includes('singlet')) return 'singlet'
        if (item.includes('boxer')) return 'boxers'
        if (item.includes('short')) return 'shorts'
        if (item.includes('bdsht') || item.includes('bdsheet') || item.includes('bedsheet') || item.includes('bedsht')) return 'bedsheet'
        if (item.includes('pillow') || item.includes('pillcase')) return 'pillowcase'
        if (item.includes('towel')) return 'towel'
        if (item.includes('curtain')) return 'curtains'
        if (item.includes('comforter')) return 'comforterduvet'
        if (item.includes('dress')) return 'dress'
        if (item.includes('robe')) return 'suit' // Approximate mapping
        if (item.includes('t-shirt')) return 'shirts' // Map to shirts
        if (item.includes('jeans')) return 'jeanstrouser'
        if (item.includes('smock')) return 'smock'
        if (item.includes('inner')) return 'panties' // Inner wear
        if (item.includes('k&s')) return 'kabaslit' // Kaba & Slit
        if (item.includes('tops')) return 'shirts' // Approximate mapping
        return null
    }

    // Service type mapping (updated for new service types)
    const getServiceType = (service: string): string => {
        if (service.toLowerCase() === 'pressing') return 'pressing'
        if (service.toLowerCase() === 'w/p') return 'washpress'
        return 'washpress' // default
    }

    // Parse items string for July data
    const parseItems = (itemsString: string, service: string) => {
        const items: Array<{ name: string, quantity: number, serviceType: string }> = []

        // Handle mixed service types (Tony's order)
        if (service === 'mixed') {
            // Parse "25 shirts, 3 Trous, 10 shorts, 2 boubou, 20 singlet, 2 trou(Press only)"
            const pressOnlyMatch = itemsString.match(/(\d+)\s+trou\s*\(Press only\)/i)

            if (pressOnlyMatch) {
                // Add the press-only items
                items.push({ name: 'trouser', quantity: parseInt(pressOnlyMatch[1]), serviceType: 'pressing' })

                // Remove the press-only part and parse the rest as W/P
                const remainingItems = itemsString.replace(/,?\s*\d+\s+trou\s*\(Press only\)/i, '')
                const itemMatches = remainingItems.match(/(\d+)\s+([^,]+)/g)

                if (itemMatches) {
                    for (const match of itemMatches) {
                        const parts = match.match(/(\d+)\s+(.+)/)
                        if (parts) {
                            const quantity = parseInt(parts[1])
                            const name = parts[2].trim().replace(/,$/, '')
                            items.push({ name, quantity, serviceType: 'washpress' })
                        }
                    }
                }
            }
        } else {
            // Regular parsing for single service type
            const serviceType = getServiceType(service)
            const itemMatches = itemsString.match(/(\d+)\s+([^,]+)/g)

            if (itemMatches) {
                for (const match of itemMatches) {
                    const parts = match.match(/(\d+)\s+(.+)/)
                    if (parts) {
                        const quantity = parseInt(parts[1])
                        const name = parts[2].trim().replace(/,$/, '')
                        items.push({ name, quantity, serviceType })
                    }
                }
            }
        }

        return items
    }

    // Get pricing for an item (updated for new price list)
    const getItemPrice = (categoryKey: string, serviceTypeKey: string): number => {
        // Flat rate pricing lookup
        const flatRateMap: Record<string, Record<string, number>> = {
            'shirts': { 'washpress': 15.0, 'pressing': 10.0 },
            'trousers': { 'washpress': 15.0, 'pressing': 10.0 },
            'shorts': { 'washpress': 10.0, 'pressing': 8.0 },
            'jeanstrouser': { 'washpress': 25.0, 'pressing': 15.0 },
            'jalabiya': { 'washpress': 30.0, 'pressing': 20.0 },
            'boubou2pcs': { 'washpress': 35.0, 'pressing': 30.0 },
            'boubou3pcs': { 'washpress': 50.0, 'pressing': 40.0 },
            'kabaslit': { 'washpress': 35.0, 'pressing': 30.0 },
            'skirt': { 'washpress': 12.0, 'pressing': 10.0 },
            'kentekabaslit': { 'washpress': 50.0, 'pressing': 40.0 },
            'ladiessuit': { 'washpress': 35.0, 'pressing': 20.0 },
            'suit': { 'washpress': 50.0, 'pressing': 40.0 },
            'coatjacket': { 'washpress': 35.0, 'pressing': 30.0 },
            'smock': { 'washpress': 45.0, 'pressing': 20.0 },
            'pillowcase': { 'washpress': 4.0, 'pressing': 3.0 },
            'socks': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'boxers': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'panties': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'singlet': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'tie': { 'wash': 5.0, 'washpress': 5.0, 'pressing': 5.0 },
            'scarf': { 'wash': 3.0, 'washpress': 3.0, 'pressing': 3.0 },
        }

        // Range-based pricing (use average)
        const rangeBasedMap: Record<string, Record<string, number>> = {
            'weddinggowns': { 'washpress': 185.0 }, // Average of 70-300
            'dress': { 'washpress': 32.5, 'pressing': 30.0 }, // Average
            'mencloth': { 'washpress': 107.5 }, // Average of 65-150
            'bedsheet': { 'washpress': 40.0, 'pressing': 30.0 }, // Average of 30-50
            'towel': { 'washpress': 35.0 }, // Average of 20-50
            'curtains': { 'washpress': 70.0, 'pressing': 40.0 }, // Average
            'comforterduvet': { 'washpress': 75.0 }, // Average of 50-100
            'doormat': { 'wash': 35.0 }, // Average of 20-50
            'carpet': { 'wash': 325.0 }, // Average of 150-500
        }

        return flatRateMap[categoryKey]?.[serviceTypeKey] ||
               rangeBasedMap[categoryKey]?.[serviceTypeKey] ||
               15.0 // Default price
    }

    // Create orders
    for (const orderInfo of orderData) {
        try {
            const customer = customers[orderInfo.customer]
            if (!customer) {
                console.log(`Customer not found: ${orderInfo.customer}`)
                continue
            }

            // Parse items
            const parsedItems = parseItems(orderInfo.items, orderInfo.service)

            // Calculate actual quantity from parsed items
            const actualQuantity = parsedItems.reduce((sum, item) => sum + item.quantity, 0)
            console.log(`Order ${orderInfo.invoice}: Parsed ${actualQuantity} items from "${orderInfo.items}"`)

            // Calculate expected total and create order items data
            let expectedTotal = 0
            const orderItemsData: Array<{
                categoryKey: string
                serviceTypeKey: string
                quantity: number
                expectedPrice: number
                expectedSubtotal: number
            }> = []

            for (const item of parsedItems) {
                const categoryKey = mapItemToCategory(item.name)
                if (!categoryKey) {
                    console.log(`Could not map item: ${item.name}`)
                    continue
                }

                const expectedPrice = getItemPrice(categoryKey, item.serviceType)
                const expectedSubtotal = expectedPrice * item.quantity
                expectedTotal += expectedSubtotal

                orderItemsData.push({
                    categoryKey,
                    serviceTypeKey: item.serviceType,
                    quantity: item.quantity,
                    expectedPrice,
                    expectedSubtotal
                })
            }

            // Calculate adjustment factor if needed
            const adjustmentFactor = orderInfo.amount / expectedTotal

            if (Math.abs(adjustmentFactor - 1.0) > 0.01) {
                console.log(`Order ${orderInfo.invoice}: Price adjustment needed - Expected: ${expectedTotal}, CSV: ${orderInfo.amount}, Factor: ${adjustmentFactor.toFixed(3)}`)
            } else {
                console.log(`Order ${orderInfo.invoice}: Prices match perfectly - Total: ${orderInfo.amount}`)
            }

            // Create order
            const order = await prisma.order.create({
                data: {
                    invoiceNumber: orderInfo.invoice,
                    branchId: factoryBranch.id,
                    customerId: customer.id,
                    totalAmount: orderInfo.amount,
                    amountPaid: 0,
                    amountDue: orderInfo.amount,
                    status: 'COMPLETED',
                    paymentStatus: 'PENDING',
                    orderDate: new Date(orderInfo.date),
                    notes: `Migrated from July Ledger - Original items: ${orderInfo.items}`
                }
            })

            // Create order items
            for (const itemData of orderItemsData) {
                const adjustedPrice = itemData.expectedPrice * adjustmentFactor
                const adjustedSubtotal = adjustedPrice * itemData.quantity

                await prisma.orderItem.create({
                    data: {
                        orderId: order.id,
                        serviceTypeId: serviceTypes[itemData.serviceTypeKey].id,
                        categoryId: laundryCategories[itemData.categoryKey].id,
                        quantity: itemData.quantity,
                        price: Math.round(adjustedPrice * 100) / 100, // Round to 2 decimal places
                        subtotal: Math.round(adjustedSubtotal * 100) / 100
                    }
                })
            }

            console.log(`Created order ${orderInfo.invoice} for ${orderInfo.customer}`)

        } catch (error) {
            console.error(`Error creating order ${orderInfo.invoice}:`, error)
        }
    }

    console.log('Orders from July Ledger created successfully')
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