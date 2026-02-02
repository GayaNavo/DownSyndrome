import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

// Google Sign In
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const auth = getAuthInstance()
  const provider = new GoogleAuthProvider()
  
  // Add scopes for additional information if needed
  provider.addScope('profile')
  provider.addScope('email')
  
  try {
    // Try popup first (better for desktop)
    const result = await signInWithPopup(auth, provider)
    
    // Create user document in Firestore if this is a new user
    if (result.user) {
      await createUserDocument({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        phone: result.user.phoneNumber || '',
        role: 'parent',
        photoURL: result.user.photoURL || '',
      })
    }
    
    return result
  } catch (error: any) {
    // Fallback to redirect for mobile devices
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, provider)
      // This will redirect the user, so we won't return anything
      throw new Error('Redirecting to Google sign in...')
    }
    throw error
  }
}

// Handle Google redirect result (call this on app load)
export const handleGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  const auth = getAuthInstance()
  try {
    const result = await getRedirectResult(auth)
    if (result?.user) {
      // Create user document in Firestore if this is a new user
      await createUserDocument({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        phone: result.user.phoneNumber || '',
        role: 'parent',
        photoURL: result.user.photoURL || '',
      })
      return result
    }
    return null
  } catch (error) {
    console.error('Error handling Google redirect result:', error)
    return null
  }
}

