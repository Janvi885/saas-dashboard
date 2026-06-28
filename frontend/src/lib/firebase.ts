/**
 * CLIENT-SIDE ONLY — never import firebase-admin here
 */
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth'

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const

for (const key of requiredEnvKeys) {
  if (!import.meta.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}. Check your frontend/.env file.`,
    )
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app: FirebaseApp = getApps().length
  ? getApps()[0]!
  : initializeApp(firebaseConfig)

export { app }
export const auth: Auth = getAuth(app)

// Firebase manages JWT refresh tokens securely in browser storage.
// ID tokens are never placed in URLs — only sent via Authorization headers.
void setPersistence(auth, browserLocalPersistence)
