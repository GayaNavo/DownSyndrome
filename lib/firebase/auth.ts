import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth'
import { getAuthInstance } from './config'
import { createUserDocument } from './firestore'

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  displayName?: string,
  phone?: string
): Promise<UserCredential> => {
  const auth = getAuthInstance()
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  
  // Update display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName: displayName,
    })
  }

  // Create user document in Firestore
  if (userCredential.user) {
    await createUserDocument({
      uid: userCredential.user.uid,
      email: userCredential.user.email || email,
      displayName: displayName || userCredential.user.displayName || '',
      phone: phone || '',
      role: 'parent', // Default role
    })
  }
  
  return userCredential
}

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const auth = getAuthInstance()
  return await signInWithEmailAndPassword(auth, email, password)
}

// Sign out
export const logOut = async (): Promise<void> => {
  const auth = getAuthInstance()
  return await signOut(auth)
}

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  const auth = getAuthInstance()
  return await sendPasswordResetEmail(auth, email)
}

// Get current user
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const auth = getAuthInstance()
  return auth.currentUser
}

