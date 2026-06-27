import {
  FieldValue,
  Timestamp,
} from 'firebase-admin/firestore'
import Groq from 'groq-sdk'
import { config } from '../../config'
import { adminDb } from '../../config/firebase'
import { AppError } from '../../utils/AppError'

const RATE_LIMIT_COLLECTION = 'rate_limits'
const MAX_REQUESTS_PER_HOUR = 10
const WINDOW_MS = 60 * 60 * 1000
const AI_TIMEOUT_MS = 10_000
const GROQ_MODEL = 'llama-3.3-70b-versatile'

type GenerateDescriptionParams = {
  name: string
  category: string
  price: number
}

type RateLimitDoc = {
  count: number
  windowStart: Timestamp
}

async function assertWithinRateLimit(uid: string): Promise<void> {
  const doc = await adminDb.collection(RATE_LIMIT_COLLECTION).doc(uid).get()

  if (!doc.exists) {
    return
  }

  const data = doc.data() as RateLimitDoc
  const windowStartMs = data.windowStart.toMillis()
  const elapsed = Date.now() - windowStartMs

  if (elapsed < WINDOW_MS && data.count >= MAX_REQUESTS_PER_HOUR) {
    throw new AppError(
      'AI generation rate limit exceeded. Try again later.',
      'RATE_LIMIT_EXCEEDED',
      429,
    )
  }
}

async function recordSuccessfulGeneration(uid: string): Promise<void> {
  const docRef = adminDb.collection(RATE_LIMIT_COLLECTION).doc(uid)

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef)
    const now = Timestamp.now()

    if (!snapshot.exists) {
      transaction.set(docRef, { count: 1, windowStart: now })
      return
    }

    const data = snapshot.data() as RateLimitDoc
    const elapsed = now.toMillis() - data.windowStart.toMillis()

    if (elapsed >= WINDOW_MS) {
      transaction.set(docRef, { count: 1, windowStart: now })
      return
    }

    transaction.update(docRef, { count: FieldValue.increment(1) })
  })
}

export async function generateDescription(
  params: GenerateDescriptionParams,
  uid: string,
): Promise<string> {
  if (!config.groqApiKey) {
    throw new AppError(
      'AI generation temporarily unavailable',
      'AI_UNAVAILABLE',
      503,
    )
  }

  await assertWithinRateLimit(uid)

  const client = new Groq({ apiKey: config.groqApiKey })
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const { name, category, price } = params

    const completion = await client.chat.completions.create(
      {
        model: GROQ_MODEL,
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `Write a 2-3 sentence professional product description for a SaaS dashboard.
Product name: ${name}, Category: ${category}, Price: $${price}.
Be concise and professional. Return only the description text, no quotes.`,
          },
        ],
      },
      { signal: controller.signal },
    )

    const description = completion.choices[0]?.message?.content?.trim() ?? ''

    if (!description) {
      throw new AppError(
        'AI generation temporarily unavailable',
        'AI_UNAVAILABLE',
        503,
      )
    }

    await recordSuccessfulGeneration(uid)
    return description
  } catch (err) {
    if (err instanceof AppError) {
      throw err
    }

    throw new AppError(
      'AI generation temporarily unavailable',
      'AI_UNAVAILABLE',
      503,
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
