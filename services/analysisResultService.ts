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

export interface ServiceResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

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
): Promise<ServiceResponse<string>> => {
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: '❌ Error: This function can only be called on the client side',
    };
  }

  try {
    const analysisResultsRef = collection(ensureDb(), ANALYSIS_RESULTS_COLLECTION);
    const now = Timestamp.now();
    
    const docRef = await addDoc(analysisResultsRef, {
      ...analysisResult,
      createdAt: now,
    });
    
    return {
      success: true,
      message: '✅ Analysis results saved to history successfully!',
      data: docRef.id,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to save analysis results: ${error.message}`,
      error,
    };
  }
};

/**
 * Get analysis result by ID
 */
export const getAnalysisResultById = async (id: string): Promise<ServiceResponse<AnalysisResult | null>> => {
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: '❌ Error: This function can only be called on the client side',
    };
  }

  try {
    const analysisResultRef = doc(ensureDb(), ANALYSIS_RESULTS_COLLECTION, id);
    const analysisResultSnap = await getDoc(analysisResultRef);
    
    if (analysisResultSnap.exists()) {
      const data = analysisResultSnap.data();
      return {
        success: true,
        message: '✅ Analysis result retrieved successfully',
        data: {
          id: analysisResultSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as AnalysisResult,
      };
    }
    return {
      success: false,
      message: '⚠️ Analysis result not found',
      data: null,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to retrieve analysis result: ${error.message}`,
      error,
    };
  }
};

/**
 * Get all analysis results for a specific child
 */
export const getAnalysisResultsByChild = async (
  childId: string
): Promise<ServiceResponse<AnalysisResult[]>> => {
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: '❌ Error: This function can only be called on the client side',
    };
  }

  try {
    const analysisResultsRef = collection(ensureDb(), ANALYSIS_RESULTS_COLLECTION);
    const q = query(
      analysisResultsRef, 
      where('childId', '==', childId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return {
      success: true,
      message: `✅ Retrieved ${querySnapshot.size} analysis result(s)`,
      data: querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
      } as AnalysisResult)),
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to retrieve analysis results: ${error.message}`,
      error,
    };
  }
};

/**
 * Get the most recent analysis result for a child
 */
export const getMostRecentAnalysisResult = async (
  childId: string
): Promise<ServiceResponse<AnalysisResult | null>> => {
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: '❌ Error: This function can only be called on the client side',
    };
  }

  try {
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
        success: true,
        message: '✅ Most recent analysis result retrieved',
        data: {
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp).toDate(),
        } as AnalysisResult,
      };
    }
    
    return {
      success: false,
      message: '⚠️ No analysis results found',
      data: null,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to retrieve analysis result: ${error.message}`,
      error,
    };
  }
};

/**
 * Update an existing analysis result
 */
export const updateAnalysisResult = async (
  id: string,
  updates: Partial<AnalysisResult>
): Promise<ServiceResponse<void>> => {
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: '❌ Error: This function can only be called on the client side',
    };
  }

  try {
    const analysisResultRef = doc(ensureDb(), ANALYSIS_RESULTS_COLLECTION, id);
    await setDoc(analysisResultRef, { ...updates }, { merge: true });
    return {
      success: true,
      message: '✅ Analysis result updated successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to update analysis result: ${error.message}`,
      error,
    };
  }
};

/**
 * Delete an analysis result
 */
export const deleteAnalysisResult = async (id: string): Promise<ServiceResponse<void>> => {
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: '❌ Error: This function can only be called on the client side',
    };
  }

  try {
    const analysisResultRef = doc(ensureDb(), ANALYSIS_RESULTS_COLLECTION, id);
    await deleteDoc(analysisResultRef);
    return {
      success: true,
      message: '✅ Analysis result deleted successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to delete analysis result: ${error.message}`,
      error,
    };
  }
};

/**
 * Get analysis results by type for a specific child
 */
export const getAnalysisResultsByType = async (
  childId: string,
  analysisType: 'facial' | 'sdq' | 'combined'
): Promise<ServiceResponse<AnalysisResult[]>> => {
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: '❌ Error: This function can only be called on the client side',
    };
  }

  try {
    const analysisResultsRef = collection(ensureDb(), ANALYSIS_RESULTS_COLLECTION);
    const q = query(
      analysisResultsRef,
      where('childId', '==', childId),
      where('analysisType', '==', analysisType),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return {
      success: true,
      message: `✅ Retrieved ${querySnapshot.size} ${analysisType} analysis result(s)`,
      data: querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
      } as AnalysisResult)),
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to retrieve analysis results: ${error.message}`,
      error,
    };
  }
};