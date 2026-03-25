import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST /api/gemini
 * 
 * Server-side endpoint for Gemini AI interactions.
 * Supports both text-only and image+text inputs.
 * 
 * Request body:
 * - prompt: string (required) - The text prompt/question
 * - imageBase64?: string (optional) - Base64 encoded image for vision models
 * 
 * Response:
 * - success: boolean
 * - response?: string - Generated text response
 * - error?: string - Error message if failed
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, imageBase64 } = await request.json();

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('🔍 Checking GEMINI_API_KEY:', apiKey ? 'Found (starts with: ' + apiKey.substring(0, 15) + '...)' : 'NOT FOUND');
    
    if (!apiKey) {
      console.error('❌ Gemini API key not configured in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
      return NextResponse.json(
        { error: 'Gemini API key not configured on server' },
        { status: 500 }
      );
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Select appropriate model based on input type
    // Using gemini-2.5-flash which is the latest available model
    const modelName = 'gemini-2.5-flash';
    console.log('🤖 Using model:', modelName);
    console.log('🔑 API Key first 20 chars:', apiKey.substring(0, 20));
    
    const model = genAI.getGenerativeModel({ model: modelName });

    let result;
    
    if (imageBase64) {
      // Handle image + text input
      const base64Data = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix
        : imageBase64;
      
      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        },
      ];
      
      result = await model.generateContent([prompt, ...imageParts]);
    } else {
      // Handle text-only input
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    // Return successful response
    return NextResponse.json({ 
      success: true,
      response: text 
    });

  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isQuotaError = errorMessage.toLowerCase().includes('quota') || 
                         errorMessage.toLowerCase().includes('rate limit');
    const isAuthError = errorMessage.toLowerCase().includes('api_key_invalid') ||
                        errorMessage.toLowerCase().includes('permission');
    
    return NextResponse.json(
      { 
        error: isQuotaError 
          ? 'API quota exceeded. Please try again later.' 
          : isAuthError
          ? 'API key invalid or not authorized. Please check your Gemini API key.'
          : 'Failed to generate response from Gemini AI',
        details: errorMessage
      },
      { status: isQuotaError ? 429 : 500 }
    );
  }
}
