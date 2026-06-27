import 'dotenv/config'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { FirebaseAuthError } from 'firebase-admin/auth'
import { adminAuth, adminDb } from '../config/firebase'
import type { ProductCategory, ProductStatus } from '../types'

const SEED_META_DOC = 'meta/seed'
const SEED_VERSION = 1

type SeedUser = {
  email: string
  password: string
  displayName: string
  role: 'admin' | 'viewer'
}

type SeedProduct = {
  name: string
  category: ProductCategory
  price: number
  status: ProductStatus
  description: string
  sku: string
  stock: number
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    displayName: 'Admin User',
    role: 'admin',
  },
  {
    email: 'viewer@test.com',
    password: 'Viewer123!',
    displayName: 'Viewer User',
    role: 'viewer',
  },
]

const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: 'Pro Analytics Suite',
    category: 'Software',
    price: 299.99,
    status: 'active',
    sku: 'SW-001',
    stock: 500,
    description:
      'Advanced analytics dashboard with real-time KPIs, custom reports, and team-wide data visibility for growing SaaS businesses.',
  },
  {
    name: 'Basic Storage Plan',
    category: 'Software',
    price: 19.99,
    status: 'active',
    sku: 'SW-002',
    stock: 999,
    description:
      'Affordable cloud storage tier with 50 GB capacity, automatic backups, and seamless file sharing for small teams.',
  },
  {
    name: 'Team Collaboration Hub',
    category: 'Software',
    price: 49.99,
    status: 'active',
    sku: 'SW-003',
    stock: 750,
    description:
      'Centralized workspace for chat, tasks, and document collaboration with role-based access controls.',
  },
  {
    name: 'Enterprise CRM Platform',
    category: 'Software',
    price: 999.99,
    status: 'inactive',
    sku: 'SW-004',
    stock: 100,
    description:
      'Full-featured CRM with pipeline management, automated workflows, and enterprise-grade security compliance.',
  },
  {
    name: 'Smart Inventory Tracker',
    category: 'Software',
    price: 79.99,
    status: 'active',
    sku: 'SW-005',
    stock: 400,
    description:
      'Real-time inventory monitoring with low-stock alerts, barcode scanning integration, and multi-location support.',
  },
  {
    name: 'Wireless Ergonomic Keyboard',
    category: 'Electronics',
    price: 129.99,
    status: 'active',
    sku: 'EL-001',
    stock: 85,
    description:
      'Split ergonomic keyboard with Bluetooth connectivity, adjustable tilt, and whisper-quiet mechanical switches.',
  },
  {
    name: '4K Webcam Pro',
    category: 'Electronics',
    price: 89.99,
    status: 'active',
    sku: 'EL-002',
    stock: 120,
    description:
      'Ultra HD webcam with auto-focus, built-in ring light, and noise-reducing dual microphones for professional video calls.',
  },
  {
    name: 'USB-C Docking Station',
    category: 'Electronics',
    price: 159.99,
    status: 'inactive',
    sku: 'EL-003',
    stock: 45,
    description:
      '12-in-1 docking hub with dual 4K display support, 100W power delivery, and gigabit Ethernet connectivity.',
  },
  {
    name: 'Premium Cotton Hoodie',
    category: 'Clothing',
    price: 59.99,
    status: 'active',
    sku: 'CL-001',
    stock: 200,
    description:
      'Soft heavyweight cotton hoodie with embroidered logo, kangaroo pocket, and unisex relaxed fit.',
  },
  {
    name: 'Developer Merch Pack',
    category: 'Clothing',
    price: 34.99,
    status: 'active',
    sku: 'CL-002',
    stock: 150,
    description:
      'Curated bundle including a branded tee, sticker sheet, and enamel pin — perfect for conference swag or team gifts.',
  },
  {
    name: 'Organic Energy Bars (12pk)',
    category: 'Food',
    price: 24.99,
    status: 'active',
    sku: 'FD-001',
    stock: 300,
    description:
      'Plant-based energy bars made with organic oats, dark chocolate, and almond butter. No artificial sweeteners.',
  },
  {
    name: 'Artisan Dark Roast Coffee',
    category: 'Food',
    price: 18.5,
    status: 'inactive',
    sku: 'FD-002',
    stock: 0,
    description:
      'Small-batch dark roast beans sourced from Colombia with rich chocolate and nutty undertones.',
  },
  {
    name: 'Minimalist Desk Organizer',
    category: 'Home',
    price: 39.99,
    status: 'active',
    sku: 'HM-001',
    stock: 175,
    description:
      'Bamboo desk caddy with compartments for pens, cables, and devices to keep your workspace clutter-free.',
  },
  {
    name: 'LED Monitor Light Bar',
    category: 'Home',
    price: 64.99,
    status: 'active',
    sku: 'HM-002',
    stock: 90,
    description:
      'Screen-mounted LED light bar with adjustable color temperature to reduce eye strain during long work sessions.',
  },
  {
    name: 'Cloud Architecture Handbook',
    category: 'Books',
    price: 49.99,
    status: 'active',
    sku: 'BK-001',
    stock: 250,
    description:
      'Comprehensive guide to designing scalable cloud-native systems with practical patterns and real-world case studies.',
  },
  {
    name: 'TypeScript Mastery Guide',
    category: 'Books',
    price: 29.99,
    status: 'inactive',
    sku: 'BK-002',
    stock: 60,
    description:
      'Deep dive into advanced TypeScript patterns, generics, and type-safe API design for modern web applications.',
  },
  {
    name: 'Custom API Integration Kit',
    category: 'Other',
    price: 199.99,
    status: 'active',
    sku: 'OT-001',
    stock: 80,
    description:
      'Pre-built connectors and webhook templates for integrating third-party services into your SaaS dashboard.',
  },
  {
    name: 'Starter Onboarding Bundle',
    category: 'Other',
    price: 9.99,
    status: 'active',
    sku: 'OT-002',
    stock: 999,
    description:
      'Entry-level package with guided setup wizard, sample data import, and email templates to launch quickly.',
  },
  {
    name: 'Advanced Reporting Module',
    category: 'Software',
    price: 149.99,
    status: 'active',
    sku: 'SW-006',
    stock: 320,
    description:
      'Add-on module for scheduled PDF exports, custom chart builders, and cross-team report sharing.',
  },
  {
    name: 'White-Label Dashboard Theme',
    category: 'Software',
    price: 449.99,
    status: 'inactive',
    sku: 'SW-007',
    stock: 50,
    description:
      'Fully customizable white-label theme with brand colors, logo placement, and client-facing portal support.',
  },
]

function isEmailAlreadyExists(error: unknown): boolean {
  return (
    error instanceof FirebaseAuthError &&
    error.code === 'auth/email-already-exists'
  )
}

function randomDateWithinLastSixMonths(): Date {
  const now = Date.now()
  const sixMonthsMs = 180 * 24 * 60 * 60 * 1000
  const start = now - sixMonthsMs
  return new Date(start + Math.random() * (now - start))
}

async function hasSeedRun(): Promise<boolean> {
  const doc = await adminDb.collection('meta').doc('seed').get()
  return doc.exists
}

async function ensureUser(user: SeedUser): Promise<string> {
  let uid: string

  try {
    const record = await adminAuth.createUser({
      email: user.email,
      password: user.password,
      displayName: user.displayName,
    })
    uid = record.uid
    console.log(`  Created auth user: ${user.email}`)
  } catch (error) {
    if (isEmailAlreadyExists(error)) {
      const existing = await adminAuth.getUserByEmail(user.email)
      uid = existing.uid
      console.log(`  Auth user already exists: ${user.email}`)
    } else {
      throw error
    }
  }

  await adminAuth.setCustomUserClaims(uid, { role: user.role })

  await adminDb
    .collection('users')
    .doc(uid)
    .set(
      {
        uid,
        email: user.email,
        role: user.role,
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    )

  console.log(`  Set role "${user.role}" and /users/${uid} document`)
  return uid
}

async function seedProducts(createdBy: string): Promise<void> {
  const collection = adminDb.collection('products')
  console.log(`  Seeding ${SEED_PRODUCTS.length} products...`)

  for (const product of SEED_PRODUCTS) {
    const createdAt = Timestamp.fromDate(randomDateWithinLastSixMonths())

    await collection.add({
      ...product,
      createdAt,
      updatedAt: createdAt,
      createdBy,
    })
  }

  const activeCount = SEED_PRODUCTS.filter((p) => p.status === 'active').length
  const categories = new Set(SEED_PRODUCTS.map((p) => p.category))

  console.log(`  Products seeded: ${SEED_PRODUCTS.length} total`)
  console.log(`  Active: ${activeCount}, Inactive: ${SEED_PRODUCTS.length - activeCount}`)
  console.log(`  Categories: ${categories.size} (${[...categories].join(', ')})`)
}

async function markSeedComplete(): Promise<void> {
  await adminDb.collection('meta').doc('seed').set({
    seededAt: FieldValue.serverTimestamp(),
    version: SEED_VERSION,
  })
  console.log('  Wrote /meta/seed marker document')
}

async function seed(): Promise<void> {
  console.log('🌱 Starting database seed...')

  if (await hasSeedRun()) {
    console.log('⏭️  Seed already ran (found /meta/seed) — skipping')
    return
  }

  console.log('\n👤 Creating test users...')
  let adminUid = ''

  for (const user of SEED_USERS) {
    const uid = await ensureUser(user)
    if (user.role === 'admin') {
      adminUid = uid
    }
  }

  console.log('\n📦 Creating sample products...')
  await seedProducts(adminUid)

  console.log('\n📝 Recording seed metadata...')
  await markSeedComplete()

  console.log('\n✅ Seed complete!')
  console.log('   Login credentials:')
  console.log('   Admin  → admin@test.com  / Admin123!')
  console.log('   Viewer → viewer@test.com / Viewer123!')
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  })
