'use client';

import React, { useState } from 'react';
import { GeminiService } from '@/services/geminiService';
import { AIAssistant } from '@/components/AIAssistant';

/**
 * Test page for Gemini AI integration
 * 
 * Access this page at: http://localhost:3000/test-gemini
 * 
 * This page demonstrates:
 * 1. Direct service calls using GeminiService
 * 2. Using the AIAssistant component
 * 3. Quick test functions for common scenarios
 */
export default function TestGeminiPage() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'component' | 'direct'>('component');

  // Test 1: Simple question
  const handleSimpleQuestion = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const result = await GeminiService.generateText(
        'What are 3 early intervention strategies commonly recommended for children with Down Syndrome?'
      );
      
      if (result.success && result.response) {
        setTestResult(result.response);
      } else {
        setTestResult(`Error: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Therapy recommendations
  const handleTherapyRecommendations = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const result = await GeminiService.generateTherapyRecommendations(
        4, // age
        'Down Syndrome',
        { speech: 6, motor: 7, social: 8, cognitive: 7 }
      );
      
      if (result.success && result.response) {
        setTestResult(result.response);
      } else {
        setTestResult(`Error: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Progress summary
  const handleProgressSummary = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const sampleChildData = {
        name: 'Sample Child',
        age: 5,
        diagnosis: 'Down Syndrome'
      };
      
      const sampleProgress = [
        { date: '2024-01-15', type: 'Speech', score: 6, notes: 'Improved vocabulary' },
        { date: '2024-02-15', type: 'Speech', score: 7, notes: 'Using short sentences' },
        { date: '2024-03-15', type: 'Motor', score: 7, notes: 'Better coordination' },
      ];
      
      const result = await GeminiService.generateProgressSummary(sampleChildData, sampleProgress);
      
      if (result.success && result.response) {
        setTestResult(result.response);
      } else {
        setTestResult(`Error: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 Gemini AI Integration Test
          </h1>
          <p className="text-gray-600">
            Test and verify your Gemini AI setup
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('component')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'component'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Assistant Component
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'direct'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Direct Service Tests
          </button>
        </div>

        {/* Content */}
        {activeTab === 'component' ? (
          <div className="max-w-3xl mx-auto">
            <AIAssistant
              context="general"
              title="Test AI Assistant"
              initialPrompt="Hello! I'm testing the Gemini AI integration. Can you tell me about your capabilities?"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Test Buttons */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Tests</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleSimpleQuestion}
                  disabled={loading}
                  className={`px-6 py-4 rounded-lg font-medium text-white transition-all ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  📝 Simple Question
                </button>
                
                <button
                  onClick={handleTherapyRecommendations}
                  disabled={loading}
                  className={`px-6 py-4 rounded-lg font-medium text-white transition-all ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                  }`}
                >
                  💊 Therapy Recommendations
                </button>
                
                <button
                  onClick={handleProgressSummary}
                  disabled={loading}
                  className={`px-6 py-4 rounded-lg font-medium text-white transition-all ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
                  }`}
                >
                  📊 Progress Summary
                </button>
              </div>

              {loading && (
                <div className="mt-6 text-center text-gray-600">
                  <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p>Generating response... Please wait.</p>
                </div>
              )}
            </div>

            {/* Results Display */}
            {testResult && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Result</h2>
                  <button
                    onClick={() => setTestResult('')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="prose max-w-none">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {testResult}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-semibold text-yellow-900 mb-2">📌 Testing Tips:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Make sure you've added your GEMINI_API_KEY to the .env file</li>
                <li>• The API key should be server-side only (no NEXT_PUBLIC_ prefix)</li>
                <li>• First request might take a few seconds - subsequent calls are faster</li>
                <li>• If you get quota errors, wait a minute and try again</li>
                <li>• Check browser console for detailed error messages</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Files created:</p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            app/api/gemini/route.ts • services/geminiService.ts • components/AIAssistant.tsx
          </code>
        </div>
      </div>
    </div>
  );
}
