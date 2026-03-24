import { MODEL_CONFIG, ModelPrediction, ModelErrorResponse } from '@/config/model.config';

export interface AnalysisRequest {
  image: string; // Base64 encoded image
  childId?: string;
  sdqScores?: Record<string, number>;
}

export interface AnalysisResponse {
  success: boolean;
  data?: ModelPrediction;
  error?: string;
}

/**
 * Send image to Flask backend for AI analysis
 */
export const analyzeImage = async (
  imageBase64: string
): Promise<AnalysisResponse> => {
  try {
    console.log('🤖 Sending image to Flask API...');
    console.log('API Endpoint:', MODEL_CONFIG.API_ENDPOINT);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MODEL_CONFIG.TIMEOUT);

    const response = await fetch(MODEL_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(MODEL_CONFIG.API_KEY && { 'Authorization': `Bearer ${MODEL_CONFIG.API_KEY}` }),
      },
      body: JSON.stringify({ image: imageBase64 }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData: ModelErrorResponse = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: ModelPrediction = await response.json();
    console.log('✅ AI Analysis successful:', data.prediction);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('❌ Model API Error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to analyze image';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. The AI model took too long to respond.';
    } else if (error.message?.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to AI model server. Make sure it\'s running on http://localhost:5000';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Check if the Flask backend is healthy
 */
export const checkModelHealth = async (): Promise<boolean> => {
  try {
    const healthUrl = MODEL_CONFIG.API_ENDPOINT.replace('/predict', '/health');
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        ...(MODEL_CONFIG.API_KEY && { 'Authorization': `Bearer ${MODEL_CONFIG.API_KEY}` }),
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};
