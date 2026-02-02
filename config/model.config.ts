// AI Model Configuration
export const MODEL_CONFIG = {
  // Cloud API endpoint (replace with your actual endpoint)
  API_ENDPOINT: process.env.NEXT_PUBLIC_MODEL_API_ENDPOINT || 'https://your-model-api.com/predict',
  
  // API key for authentication (if required)
  API_KEY: process.env.MODEL_API_KEY || '',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Model parameters
  MODEL_PARAMS: {
    confidenceThreshold: 0.7,
    maxRetries: 3,
  },
  
  // Image processing settings
  IMAGE_PROCESSING: {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
    supportedFormats: ['image/jpeg', 'image/png', 'image/jpg'],
  },
} as const

// Type definitions for model responses
export interface ModelPrediction {
  confidence: number
  prediction: 'likely' | 'unlikely' | 'uncertain'
  features: {
    facialFeatures: number[]
    probability: number
  }
  timestamp: Date
}

export interface ModelErrorResponse {
  error: string
  code: string
  details?: string
}