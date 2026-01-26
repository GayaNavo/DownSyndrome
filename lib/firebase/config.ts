import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAnalytics, Analytics } from 'firebase/analytics'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBZrpSrEpwjwvonU1ZmJVAQ8y7GvkBN0L0',
  authDomain: 'downsyndrome-ecf0f.firebaseapp.com',
  projectId: 'downsyndrome-ecf0f',
  storageBucket: 'downsyndrome-ecf0f.firebasestorage.app',
  messagingSenderId: '777109459808',
  appId: '1:777109459808:web:c7eedb440aad90b186c405',
  measurementId: 'G-8KH1B971FQ',
}

// Initialize Firebase App
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize services only on client side
let analytics: Analytics | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (typeof window !== 'undefined') {
  // Initialize Analytics only on client side
  analytics = getAnalytics(app)

  // Initialize Auth only on client side
  auth = getAuth(app)

  // Initialize Firestore only on client side
  db = getFirestore(app)

  // Initialize Storage only on client side
  storage = getStorage(app)
}

// Helper function to get auth (throws error if called on server)
export const getAuthInstance = (): Auth => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be used on the client side')
  }
  if (!auth) {
    auth = getAuth(app)
  }
  return auth
}

// Helper function to get storage (throws error if called on server)
export const getStorageInstance = (): FirebaseStorage => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Storage can only be used on the client side')
  }
  if (!storage) {
    storage = getStorage(app)
  }
  return storage
}

export { app, analytics, auth, db, storage }
export default app

