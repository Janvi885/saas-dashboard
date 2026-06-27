import 'dotenv/config'
import { FieldValue } from 'firebase-admin/firestore'
import { FirebaseAuthError } from 'firebase-admin/auth'
import { adminAuth, adminDb } from '../config/firebase'
import type { ProductCategory, ProductStatus } from '../types'

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
  description?: string
  sku?: string
  stock?: number
}

const ADMIN_USER: SeedUser = {
  email: 'admin@test.com',
  password: 'Admin123!',
  displayName: 'Admin User',
  role: 'admin',
}

const VIEWER_USER: SeedUser = {
  email: 'viewer@test.com',
  password: 'Viewer123!',
  displayName: 'Viewer User',
  role: 'viewer',
}

const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 149.99,
    status: 'active',
    sku: 'WH-001',
    stock: 42,
    description:
      'Premium noise-cancelling over-ear headphones with 30-hour battery life and crystal-clear audio for work and travel.',
  },
  {
    name: 'Cotton T-Shirt',
    category: 'Clothing',
    price: 29.99,
    status: 'active',
    sku: 'CT-002',
    stock: 120,
    description:
      'Soft, breathable 100% organic cotton tee with a relaxed fit. Available in multiple colors for everyday comfort.',
  },
  {
    name: 'Organic Coffee Beans',
    category: 'Food',
    price: 18.5,
    status: 'inactive',
    sku: 'FC-003',
    stock: 0,
    description:
      'Single-origin Arabica beans, fair-trade certified and medium-roasted for a smooth, balanced cup with notes of chocolate and caramel.',
  },
  {
    name: 'Project Management SaaS',
    category: 'Software',
    price: 49.0,
    status: 'active',
    sku: 'SW-004',
    stock: 999,
    description:
      'All-in-one project management platform with kanban boards, time tracking, and team collaboration tools built for growing SaaS teams.',
  },
  {
    name: 'Desk Lamp',
    category: 'Home',
    price: 64.99,
    status: 'active',
    sku: 'HM-005',
    stock: 28,
    description:
      'Adjustable LED desk lamp with warm-to-cool color temperature control and a sleek minimalist design for any home office.',
  },
]

function isEmailAlreadyExists(error: unknown): boolean {
  return (
    error instanceof FirebaseAuthError &&
    error.code === 'auth/email-already-exists'
  )
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
  } catch (error) {
    if (isEmailAlreadyExists(error)) {
      const existing = await adminAuth.getUserByEmail(user.email)
      uid = existing.uid
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

  return uid
}

async function seedProducts(createdBy: string): Promise<void> {
  const collection = adminDb.collection('products')
  const existing = await collection.limit(1).get()

  if (!existing.empty) {
    console.log(' Products collection already has data — skipping product seed')
    return
  }

  const now = FieldValue.serverTimestamp()

  for (const product of SEED_PRODUCTS) {
    await collection.add({
      ...product,
      createdAt: now,
      updatedAt: now,
      createdBy,
    })
  }

  console.log(`✅ Seeded ${SEED_PRODUCTS.length} products into Firestore`)
}

async function seed(): Promise<void> {
  const adminUid = await ensureUser(ADMIN_USER)
  console.log('✅ Admin user ready: admin@test.com')

  await ensureUser(VIEWER_USER)
  console.log('✅ Viewer user ready: viewer@test.com')

  await seedProducts(adminUid)

  console.log('🌱 Seed complete')
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
