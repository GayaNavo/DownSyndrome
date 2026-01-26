import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  Timestamp,
  orderBy,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AnalysisResult } from '@/models/AnalysisResult';

// Helper function to ensure Firestore is initialized
const ensureDb = () => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }
  if (!db) {
    throw new Error('Firestore is not initialized. Make sure Firestore is enabled in Firebase Console.');
  }
  return db;
};

// Collection name for analysis results
export const ANALYSIS_RESULTS_COLLECTION = 'analysis_results';

/**
 * Create a new analysis result in Firestore
 */
export const createAnalysisResult = async (
  analysisResult: Omit<AnalysisResult, 'id' | 'createdAt'>
): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }

  const analysisResultsRef = collection(ensureDb(), ANALYSIS_RESULTS_COLLECTION);
  const now = Timestamp.now();
  
  const docRef = await addDoc(analysisResultsRef, {
    ...analysisResult,
    createdAt: now,
  });
  
  return docRef.id;
};

/**
 * Get analysis result by ID
 */
export const getAnalysisResultById = async (id: string): Promise<AnalysisResult | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const analysisResultRef = doc(ensureDb(), ANALYSIS_RESULTS_COLLECTION, id);
  const analysisResultSnap = await getDoc(analysisResultRef);
  
  if (analysisResultSnap.exists()) {
    const data = analysisResultSnap.data();
    return {
      id: analysisResultSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as AnalysisResult;
  }
  return null;
};

/**
 * Get all analysis results for a specific child
 */
export const getAnalysisResultsByChild = async (
  childId: string
): Promise<AnalysisResult[]> => {
  if (typeof window === 'undefined') {
    return [];
  }

  const analysisResultsRef = collection(ensureDb(), ANALYSIS_RESULTS_COLLECTION);
  const q = query(
    analysisResultsRef, 
    where('childId', '==', childId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
  } as AnalysisResult));
};

/**
 * Get the most recent analysis result for a child
 */
export const getMostRecentAnalysisResult = async (
  childId: string
): Promise<AnalysisResult | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const analysisResultsRef = collection(ensureDb(), ANALYSIS_RESULTS_COLLECTION);
  const q = query(
    analysisResultsRef,
    where('childId', '==', childId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
    } as AnalysisResult;
  }
  
  return null;
};

/**
 * Update an existing analysis result
 */
export const updateAnalysisResult = async (
  id: string,
  updates: Partial<AnalysisResult>
): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }

  const analysisResultRef = doc(ensureDb(), ANALYSIS_RESULTS_COLLECTION, id);
  await setDoc(analysisResultRef, { ...updates }, { merge: true });
};

/**
 * Delete an analysis result
 */
export const deleteAnalysisResult = async (id: string): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }

  const analysisResultRef = doc(ensureDb(), ANALYSIS_RESULTS_COLLECTION, id);
  await deleteDoc(analysisResultRef);
};

/**
 * Get analysis results by type for a specific child
 */
export const getAnalysisResultsByType = async (
  childId: string,
  analysisType: 'facial' | 'sdq' | 'combined'
): Promise<AnalysisResult[]> => {
  if (typeof window === 'undefined') {
    return [];
  }

  const analysisResultsRef = collection(ensureDb(), ANALYSIS_RESULTS_COLLECTION);
  const q = query(
    analysisResultsRef,
    where('childId', '==', childId),
    where('analysisType', '==', analysisType),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
  } as AnalysisResult));
};