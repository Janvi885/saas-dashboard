import 'dotenv/config'

const ALLOWED_NODE_ENVS = ['development', 'staging', 'production'] as const
type NodeEnv = (typeof ALLOWED_NODE_ENVS)[number]

const nodeEnv = (process.env.NODE_ENV || 'development') as NodeEnv

if (!ALLOWED_NODE_ENVS.includes(nodeEnv)) {
  throw new Error(
    `NODE_ENV must be one of: ${ALLOWED_NODE_ENVS.join(', ')}. Received: ${process.env.NODE_ENV}`,
  )
}

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
] as const

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}. Check your backend/.env file.`,
    )
  }
}

if (nodeEnv === 'production' && !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error(
    'FIREBASE_PRIVATE_KEY must be set when NODE_ENV is production.',
  )
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  groqApiKey: process.env.GROQ_API_KEY,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  },
}
