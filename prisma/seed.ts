import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@legaldashboard.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@legaldashboard.com',
      password: adminPassword,
      role: 'admin'
    }
  })

  // Create sample client users
  const client1Password = await bcrypt.hash('client123', 12)
  const client1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: client1Password,
      role: 'client'
    }
  })

  const client2Password = await bcrypt.hash('client123', 12)
  const client2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: client2Password,
      role: 'client'
    }
  })

  // Create sample products (in Indonesian Rupiah)
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'contract-review' },
      update: {},
      create: {
        id: 'contract-review',
        title: 'Contract Review',
        description: 'Comprehensive review of contracts, agreements, and legal documents to ensure compliance and protect your interests.',
        price: 4500000,
        category: 'Contract Law'
      }
    }),
    prisma.product.upsert({
      where: { id: 'legal-consultation' },
      update: {},
      create: {
        id: 'legal-consultation',
        title: 'Legal Consultation',
        description: 'One-on-one consultation with experienced attorneys to discuss your legal matters and receive expert advice.',
        price: 2250000,
        category: 'General Legal'
      }
    }),
    prisma.product.upsert({
      where: { id: 'document-drafting' },
      update: {},
      create: {
        id: 'document-drafting',
        title: 'Document Drafting',
        description: 'Professional drafting of legal documents including wills, trusts, agreements, and corporate documents.',
        price: 6750000,
        category: 'Document Services'
      }
    }),
    prisma.product.upsert({
      where: { id: 'business-formation' },
      update: {},
      create: {
        id: 'business-formation',
        title: 'Business Formation',
        description: 'Complete business formation services including LLC formation, corporation setup, and regulatory compliance.',
        price: 13500000,
        category: 'Business Law'
      }
    }),
    prisma.product.upsert({
      where: { id: 'intellectual-property' },
      update: {},
      create: {
        id: 'intellectual-property',
        title: 'Intellectual Property Protection',
        description: 'Trademark registration, copyright protection, and patent consultation services.',
        price: 9000000,
        category: 'Intellectual Property'
      }
    }),
    prisma.product.upsert({
      where: { id: 'employment-law' },
      update: {},
      create: {
        id: 'employment-law',
        title: 'Employment Law Consultation',
        description: 'Advice on employment contracts, workplace policies, and labor law compliance.',
        price: 5250000,
        category: 'Employment Law'
      }
    })
  ])

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: client1.id,
        productId: products[0].id,
        status: 'completed',
        paymentMethod: 'credit_card'
      }
    }),
    prisma.order.create({
      data: {
        userId: client1.id,
        productId: products[1].id,
        status: 'in_progress',
        paymentMethod: 'bank_transfer'
      }
    }),
    prisma.order.create({
      data: {
        userId: client2.id,
        productId: products[2].id,
        status: 'pending',
        paymentMethod: 'paypal'
      }
    }),
    prisma.order.create({
      data: {
        userId: client2.id,
        productId: products[3].id,
        status: 'completed',
        paymentMethod: 'credit_card'
      }
    })
  ])

  // Create sample analytics data (in Indonesian Rupiah)
  const analyticsData = [
    { month: 1, year: 2025, visitors: 1200, sales: 67500000, profit: 48000000, loss: 19500000 },
    { month: 2, year: 2025, visitors: 1350, sales: 78000000, profit: 57000000, loss: 21000000 },
    { month: 3, year: 2025, visitors: 1180, sales: 72000000, profit: 52500000, loss: 19500000 },
    { month: 4, year: 2025, visitors: 1420, sales: 91500000, profit: 63000000, loss: 28500000 },
    { month: 5, year: 2025, visitors: 1380, sales: 87000000, profit: 61500000, loss: 25500000 },
    { month: 6, year: 2025, visitors: 1550, sales: 100500000, profit: 72000000, loss: 28500000 }
  ]

  for (const data of analyticsData) {
    await prisma.analytics.upsert({
      where: {
        month_year: {
          month: data.month,
          year: data.year
        }
      },
      update: {},
      create: data
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Sample Accounts:')
  console.log('Admin: admin@legaldashboard.com / admin123')
  console.log('Client: john.doe@example.com / client123')
  console.log('Client: jane.smith@example.com / client123')
  console.log('\n🚀 Ready to use!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
