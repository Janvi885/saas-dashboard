/**
 * SERVER-SIDE ONLY — uses service account credentials
 */
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { config } from './index'

const adminApp: App = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    })

export { adminApp }
export const adminAuth: Auth = getAuth(adminApp)
export const adminDb: Firestore = getFirestore(adminApp)
