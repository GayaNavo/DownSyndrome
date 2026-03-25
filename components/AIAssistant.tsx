'use client';

import React, { useState } from 'react';
import { GeminiService } from '@/services/geminiService';

interface AIAssistantProps {
  /** Optional child ID for context-aware responses */
  childId?: string;
  /** Context type: general, therapy, progress, sdq */
  context?: 'general' | 'therapy' | 'progress' | 'sdq';
  /** Pre-filled prompt (optional) */
  initialPrompt?: string;
  /** Custom title */
  title?: string;
}

/**
 * AI Assistant Component
 * 
 * A reusable chat-style interface for interacting with Gemini AI.
 * Can be used anywhere in your application for AI-powered assistance.
 * 
 * Example Usage:
 * 
 * // In ProgressPage
 * <AIAssistant 
 *   childId={selectedChild?._id}
 *   context="progress"
 *   title="Progress Analysis Assistant"
 * />
 * 
 * // In FeaturesPage or a dedicated help page
 * <AIAssistant 
 *   context="general"
 *   title="Parent Support Assistant"
 * />
 */
export const AIAssistant: React.FC<AIAssistantProps> = ({
  childId,
  context = 'general',
  initialPrompt = '',
  title = 'AI Assistant',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const getContextualHint = () => {
    switch (context) {
      case 'therapy':
        return 'Ask about therapy techniques, exercises, or developmental activities...';
      case 'progress':
        return 'Ask about progress patterns, achievements, or areas for improvement...';
      case 'sdq':
        return 'Ask about SDQ interpretation, behavioral concerns, or emotional development...';
      default:
        return 'Ask me anything about Down Syndrome care, development, or support...';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Add user message to history
      const userMessage = { role: 'user' as const, content: prompt };
      setHistory(prev => [...prev, userMessage]);

      // Build contextual prompt
      let enhancedPrompt = prompt;
      
      if (context === 'therapy') {
        enhancedPrompt = `[Therapy Context] ${prompt}`;
      } else if (context === 'progress') {
        enhancedPrompt = `[Progress Analysis Context] ${prompt}`;
      } else if (context === 'sdq') {
        enhancedPrompt = `[SDQ/Behavioral Assessment Context] ${prompt}`;
      }

      const result = await GeminiService.generateText(enhancedPrompt);

      if (result.success && result.response) {
        setResponse(result.response);
        
        // Add assistant response to history
        const assistantMessage = { role: 'assistant' as const, content: result.response };
        setHistory(prev => [...prev, assistantMessage]);
      } else {
        const errorMsg = result.error || 'Failed to get response from AI';
        setError(errorMsg);
        console.error('Gemini Service Error:', result.details);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('AI Assistant Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
    setError('');
    setHistory([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="text-white/80 hover:text-white text-sm transition-colors"
              title="Clear conversation"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Conversation History */}
        {history.length > 0 && (
          <div className="mb-6 max-h-96 overflow-y-auto space-y-4 pr-2">
            {history.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Latest Response */}
        {response && !loading && (
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">AI Response:</h3>
                <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {response}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-red-800 text-sm">{error}</p>
                <p className="text-red-600 text-xs mt-1">
                  Tip: Check that your Gemini API key is properly configured
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getContextualHint()}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`flex-1 py-3 px-6 rounded-xl text-white font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                loading || !prompt.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Get AI Response</span>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Info Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Powered by Google Gemini AI • Responses are AI-generated and should be discussed with healthcare professionals
          </p>
        </div>
      </div>
    </div>
  );
};
