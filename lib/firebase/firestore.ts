import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore'
import { db } from './config'
import { getAuthInstance } from './config'

// Helper function to ensure Firestore is initialized
const ensureDb = () => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }
  if (!db) {
    throw new Error('Firestore is not initialized. Make sure Firestore is enabled in Firebase Console.')
  }
  return db
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CHILDREN: 'children',
  MILESTONES: 'milestones',
  PROGRESS: 'progress',
  DOCUMENTS: 'documents',
  APPOINTMENTS: 'appointments',
  HEALTH_DATA: 'health_data',
} as const

// User data structure
export interface UserData {
  uid: string
  email: string
  displayName: string
  phone?: string
  role: 'parent' | 'healthcare_provider' | 'admin'
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Child data structure
export interface ChildData {
  id?: string
  parentId: string
  name: string
  age: number
  dateOfBirth: Timestamp
  developmentalAge?: string
  lastMilestone?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Milestone data structure
export interface MilestoneData {
  id?: string
  childId: string
  title: string
  description: string
  category: string
  achievedAt: Timestamp
  createdAt: Timestamp
}

// Progress data structure
export interface ProgressData {
  id?: string
  childId: string
  category: string
  score: number
  date: Timestamp
  notes?: string
  createdAt: Timestamp
}

// Document data structure
export interface DocumentData {
  id?: string
  childId: string
  title: string
  type: 'report' | 'therapy_note' | 'assessment' | 'other'
  fileUrl: string
  fileName: string
  uploadedAt: Timestamp
  createdAt: Timestamp
}

// Appointment data structure
export interface AppointmentData {
  id?: string
  childId: string
  title: string
  description?: string
  date: Timestamp
  location?: string
  type: 'therapy' | 'assessment' | 'follow_up' | 'other'
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Health data structure
export interface HealthData {
  id?: string
  childId: string
  weight?: number
  height?: number
  sleepingHours?: number
  date: Timestamp
  notes?: string
  createdAt: Timestamp
}

// ============ USER OPERATIONS ============

/**
 * Create or update user document in Firestore
 */
export const createUserDocument = async (userData: Omit<UserData, 'createdAt' | 'updatedAt'>): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const userRef = doc(ensureDb(), COLLECTIONS.USERS, userData.uid)
  const now = Timestamp.now()
  
  await setDoc(userRef, {
    ...userData,
    createdAt: now,
    updatedAt: now,
  }, { merge: true })
}

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (uid: string): Promise<UserData | null> => {
  if (typeof window === 'undefined') {
    return null
  }

  const database = ensureDb()
  const userRef = doc(database, COLLECTIONS.USERS, uid)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    return userSnap.data() as UserData
  }
  return null
}

/**
 * Update user document
 */
export const updateUserDocument = async (uid: string, updates: Partial<UserData>): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  if (!db) {
    throw new Error('Firestore is not initialized')
  }

  const userRef = doc(db, COLLECTIONS.USERS, uid)
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// ============ CHILD OPERATIONS ============

/**
 * Create a new child document
 */
export const createChildDocument = async (childData: Omit<ChildData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const database = ensureDb()
  const childrenRef = collection(database, COLLECTIONS.CHILDREN)
  const now = Timestamp.now()
  
  const docRef = await addDoc(childrenRef, {
    ...childData,
    createdAt: now,
    updatedAt: now,
  })
  
  return docRef.id
}

/**
 * Get child document by ID
 */
export const getChildDocument = async (childId: string): Promise<ChildData | null> => {
  if (typeof window === 'undefined') {
    return null
  }

  const database = ensureDb()
  const childRef = doc(database, COLLECTIONS.CHILDREN, childId)
  const childSnap = await getDoc(childRef)
  
  if (childSnap.exists()) {
    return { id: childSnap.id, ...childSnap.data() } as ChildData
  }
  return null
}

/**
 * Get all children for a parent
 */
export const getChildrenByParent = async (parentId: string): Promise<ChildData[]> => {
  if (typeof window === 'undefined') {
    return []
  }

  const database = ensureDb()
  const childrenRef = collection(database, COLLECTIONS.CHILDREN)
  const q = query(childrenRef, where('parentId', '==', parentId))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as ChildData))
}

/**
 * Update child document
 */
export const updateChildDocument = async (childId: string, updates: Partial<ChildData>): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const database = ensureDb()
  const childRef = doc(database, COLLECTIONS.CHILDREN, childId)
  await updateDoc(childRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// ============ MILESTONE OPERATIONS ============

/**
 * Create a new milestone
 */
export const createMilestone = async (milestoneData: Omit<MilestoneData, 'id' | 'createdAt'>): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const milestonesRef = collection(ensureDb(), COLLECTIONS.MILESTONES)
  const docRef = await addDoc(milestonesRef, {
    ...milestoneData,
    createdAt: Timestamp.now(),
  })
  
  return docRef.id
}

/**
 * Get milestones for a child
 */
export const getMilestonesByChild = async (childId: string): Promise<MilestoneData[]> => {
  if (typeof window === 'undefined') {
    return []
  }

  const milestonesRef = collection(ensureDb(), COLLECTIONS.MILESTONES)
  const q = query(milestonesRef, where('childId', '==', childId))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as MilestoneData))
}

// ============ PROGRESS OPERATIONS ============

/**
 * Create a new progress entry
 */
export const createProgressEntry = async (progressData: Omit<ProgressData, 'id' | 'createdAt'>): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const progressRef = collection(ensureDb(), COLLECTIONS.PROGRESS)
  const docRef = await addDoc(progressRef, {
    ...progressData,
    createdAt: Timestamp.now(),
  })
  
  return docRef.id
}

/**
 * Get progress entries for a child
 */
export const getProgressByChild = async (childId: string): Promise<ProgressData[]> => {
  if (typeof window === 'undefined') {
    return []
  }

  const progressRef = collection(ensureDb(), COLLECTIONS.PROGRESS)
  const q = query(progressRef, where('childId', '==', childId))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as ProgressData))
}

// ============ DOCUMENT OPERATIONS ============

/**
 * Create a new document entry
 */
export const createDocumentEntry = async (documentData: Omit<DocumentData, 'id' | 'createdAt'>): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const documentsRef = collection(ensureDb(), COLLECTIONS.DOCUMENTS)
  const docRef = await addDoc(documentsRef, {
    ...documentData,
    createdAt: Timestamp.now(),
  })
  
  return docRef.id
}

/**
 * Get documents for a child
 */
export const getDocumentsByChild = async (childId: string): Promise<DocumentData[]> => {
  if (typeof window === 'undefined') {
    return []
  }

  const documentsRef = collection(ensureDb(), COLLECTIONS.DOCUMENTS)
  const q = query(documentsRef, where('childId', '==', childId))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as DocumentData))
}

// ============ APPOINTMENT OPERATIONS ============

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: Omit<AppointmentData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const appointmentsRef = collection(ensureDb(), COLLECTIONS.APPOINTMENTS)
  const now = Timestamp.now()
  const docRef = await addDoc(appointmentsRef, {
    ...appointmentData,
    createdAt: now,
    updatedAt: now,
  })
  
  return docRef.id
}

/**
 * Get appointments for a child
 */
export const getAppointmentsByChild = async (childId: string): Promise<AppointmentData[]> => {
  if (typeof window === 'undefined') {
    return []
  }

  const appointmentsRef = collection(ensureDb(), COLLECTIONS.APPOINTMENTS)
  const q = query(appointmentsRef, where('childId', '==', childId))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as AppointmentData))
}

/**
 * Update appointment
 */
export const updateAppointment = async (appointmentId: string, updates: Partial<AppointmentData>): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const appointmentRef = doc(ensureDb(), COLLECTIONS.APPOINTMENTS, appointmentId)
  await updateDoc(appointmentRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

/**
 * Delete appointment
 */
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const appointmentRef = doc(ensureDb(), COLLECTIONS.APPOINTMENTS, appointmentId)
  await deleteDoc(appointmentRef)
}

// ============ HEALTH DATA OPERATIONS ============

/**
 * Create a new health data entry
 */
export const createHealthDataEntry = async (healthData: Omit<HealthData, 'id' | 'createdAt'>): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const healthDataRef = collection(ensureDb(), COLLECTIONS.HEALTH_DATA)
  const docRef = await addDoc(healthDataRef, {
    ...healthData,
    createdAt: Timestamp.now(),
  })
  
  return docRef.id
}

/**
 * Get health data entries for a child
 */
export const getHealthDataByChild = async (childId: string): Promise<HealthData[]> => {
  if (typeof window === 'undefined') {
    return []
  }

  const healthDataRef = collection(ensureDb(), COLLECTIONS.HEALTH_DATA)
  const q = query(healthDataRef, where('childId', '==', childId))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as HealthData))
}

/**
 * Update health data entry
 */
export const updateHealthDataEntry = async (healthDataId: string, updates: Partial<HealthData>): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side')
  }

  const database = ensureDb()
  const healthDataRef = doc(database, COLLECTIONS.HEALTH_DATA, healthDataId)
  await updateDoc(healthDataRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

