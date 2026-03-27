'use client'

import React, { useState, useEffect } from 'react'
import { Recommendation, RecommendationCategory, RecommendationPriority } from '../models/Recommendation'
import { RecommendationService, RecommendationStats } from '../services/recommendationService'
import { ChildData } from '../lib/firebase/firestore'

interface AIRecommendationsProps {
  child: ChildData
  sdqScores?: {
    emotional: number
    conduct: number
    hyperactivity: number
    peer: number
    prosocial: number
    totalDifficulty: number
    percentage: number
    interpretation: string
  }
  predictionAnalysis?: {
    confidence: number
    prediction: 'healthy' | 'downsyndrome'
    features?: number[]
  }
  growthAnalysis?: {
    height?: number
    weight?: number
    developmentalAge?: string
    milestones?: string[]
  }
  onRecommendationGenerated?: () => void
}

// Priority type definitions with icons and colors
type PriorityType = 'clinical' | 'skill' | 'wellness'

interface PriorityConfig {
  icon: string
  label: string
  badgeColor: string
  bgGradient: string
  borderColor: string
  headlinePrefix: string
}

const priorityConfig: Record<PriorityType, PriorityConfig> = {
  clinical: {
    icon: '🏥',
    label: 'Clinical Intervention',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    bgGradient: 'from-rose-50 to-red-50',
    borderColor: 'border-red-200',
    headlinePrefix: 'High Priority',
  },
  skill: {
    icon: '🌱',
    label: 'Skill Builder',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    bgGradient: 'from-amber-50 to-yellow-50',
    borderColor: 'border-amber-200',
    headlinePrefix: 'Medium Priority',
  },
  wellness: {
    icon: '❤️',
    label: 'Caregiver Wellness',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bgGradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    headlinePrefix: 'Supportive',
  },
}

// Map recommendation priority and category to our display types
const getRecommendationType = (rec: Recommendation): PriorityType => {
  if (rec.priority === 'high' || rec.category === 'medical') return 'clinical'
  if (rec.priority === 'medium' || rec.category === 'developmental' || rec.category === 'educational') return 'skill'
  return 'wellness'
}

// Helper function to clean markdown formatting
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/^#+\s*/gm, '') // Remove heading markers (#, ##, ###)
    .replace(/\*\*/g, '') // Remove bold markers (**)
    .replace(/\*/g, '') // Remove italic markers (*)
    .replace(/__/g, '') // Remove underline markers (__)
    .replace(/_/g, '') // Remove italic markers (_)
    .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code backticks
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers at start of lines
    .trim()
}

// Parse AI response to extract trigger, headline, why, and action steps
const parseRecommendationContent = (rec: Recommendation) => {
  const content = rec.aiGeneratedContent.fullResponse
  
  // Try to extract headline from title or first line
  const headline = cleanMarkdown(rec.title || 'Untitled Recommendation')
  
  // Extract "The Why" section - look for explanation text
  let theWhy = cleanMarkdown(rec.description || '')
  if (rec.aiGeneratedContent.keyPoints.length > 0) {
    theWhy = cleanMarkdown(rec.aiGeneratedContent.keyPoints[0])
  }
  
  // Extract trigger from source data
  const trigger = generateTriggerText(rec)
  
  // Action steps from actionable items - clean each step
  const actionSteps = rec.aiGeneratedContent.actionableItems.length > 0 
    ? rec.aiGeneratedContent.actionableItems.map(step => cleanMarkdown(step))
    : ['Follow the recommended activities', 'Monitor progress regularly', 'Consult with healthcare provider if needed']
  
  return { trigger, headline, theWhy, actionSteps }
}

// Generate trigger text based on source data
const generateTriggerText = (rec: Recommendation): string => {
  const { sourceData } = rec
  const triggers: string[] = []
  
  if (sourceData?.sdqAnalysis) {
    const sdq = sourceData.sdqAnalysis
    if (sdq.percentage >= 20) triggers.push(`SDQ scores in clinical range (${sdq.percentage.toFixed(0)}%)`)
    else if (sdq.percentage >= 15) triggers.push(`SDQ scores in borderline range (${sdq.percentage.toFixed(0)}%)`)
    if (sdq.emotional >= 5) triggers.push('elevated emotional symptoms')
    if (sdq.conduct >= 5) triggers.push('conduct concerns')
    if (sdq.hyperactivity >= 7) triggers.push('hyperactivity indicators')
    if (sdq.peer >= 5) triggers.push('peer relationship challenges')
  }
  
  if (sourceData?.predictionAnalysis) {
    const pred = sourceData.predictionAnalysis
    if (pred.confidence > 0.8) triggers.push(`high-confidence AI analysis (${(pred.confidence * 100).toFixed(0)}%)`)
  }
  
  if (sourceData?.growthAnalysis?.developmentalAge) {
    triggers.push(`developmental age: ${sourceData.growthAnalysis.developmentalAge}`)
  }
  
  return triggers.length > 0 ? triggers.join(' + ') : 'Regular developmental monitoring'
}

export default function AIRecommendations({
  child,
  sdqScores,
  predictionAnalysis,
  growthAnalysis,
  onRecommendationGenerated,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [stats, setStats] = useState<RecommendationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<PriorityType | 'all'>('all')
  const [expandedRec, setExpandedRec] = useState<string | null>(null)
  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; recId: string | null }>({
    open: false,
    recId: null,
  })
  const [feedbackText, setFeedbackText] = useState('')

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations()
  }, [child.id])

  const loadRecommendations = async () => {
    if (!child?.id) {
      setError('Missing child ID');
      return;
    }

    setLoading(true)
    setError(null)
    try {
      const recs = await RecommendationService.getRecommendations(child.id)
      setRecommendations(recs)
      
      const statsData = await RecommendationService.getStats(child.id)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = async () => {
    if (!child?.id) {
      setError('Missing child ID');
      return;
    }

    setGenerating(true)
    setError(null)
    try {
      const result = await RecommendationService.generateRecommendations({
        childId: child.id,
        childAge: child.age,
        growthAnalysis,
        predictionAnalysis,
        sdqAnalysis: sdqScores,
      })

      if (result.success && result.recommendations) {
        setRecommendations(result.recommendations)
        const statsData = await RecommendationService.getStats(child.id)
        setStats(statsData)
        onRecommendationGenerated?.()
      } else {
        setError(result.error || 'Failed to generate recommendations')
      }
    } catch (err) {
      console.error('Error generating recommendations:', err)
      setError('Failed to generate recommendations. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const completeRecommendation = async (recId: string) => {
    const success = await RecommendationService.completeRecommendation(recId)
    if (success) {
      // Update local state to show completed status without reloading
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recId 
            ? { ...rec, status: 'completed', completedAt: new Date() }
            : rec
        )
      )
    }
  }

  const dismissRecommendation = async (recId: string) => {
    const success = await RecommendationService.dismissRecommendation(recId)
    if (success) {
      loadRecommendations()
    }
  }

  const submitFeedback = async () => {
    if (feedbackModal.recId && feedbackText.trim()) {
      const success = await RecommendationService.addFeedback(feedbackModal.recId, feedbackText)
      if (success) {
        setFeedbackModal({ open: false, recId: null })
        setFeedbackText('')
        loadRecommendations()
      }
    }
  }

  // Filter recommendations by type
  const activeRecs = recommendations.filter(r => r.status === 'active')
  const filteredRecommendations = selectedType === 'all'
    ? activeRecs
    : activeRecs.filter(r => getRecommendationType(r) === selectedType)

  // Count by type
  const countByType = {
    clinical: activeRecs.filter(r => getRecommendationType(r) === 'clinical').length,
    skill: activeRecs.filter(r => getRecommendationType(r) === 'skill').length,
    wellness: activeRecs.filter(r => getRecommendationType(r) === 'wellness').length,
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h2 className="text-xl font-bold text-white">AI-Powered Recommendations</h2>
              <p className="text-indigo-100 text-sm">
                Personalized guidance for {child.name}'s development
              </p>
            </div>
          </div>
          <button
            onClick={generateRecommendations}
            disabled={generating}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate New
              </>
            )}
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span>📋</span>
            All Recommendations
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{activeRecs.length}</span>
          </button>
          <button
            onClick={() => setSelectedType('clinical')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedType === 'clinical'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
            }`}
          >
            <span>🏥</span>
            Clinical
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{countByType.clinical}</span>
          </button>
          <button
            onClick={() => setSelectedType('skill')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedType === 'skill'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span>🌱</span>
            Skill Builder
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{countByType.skill}</span>
          </button>
          <button
            onClick={() => setSelectedType('wellness')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedType === 'wellness'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <span>❤️</span>
            Caregiver Wellness
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{countByType.wellness}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Recommendations List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">💡</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No recommendations yet</h3>
            <p className="text-gray-500 mb-4">
              Generate personalized AI recommendations based on {child.name}'s analysis data
            </p>
            <button
              onClick={generateRecommendations}
              disabled={generating}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {generating ? 'Generating...' : 'Generate Recommendations'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRecommendations.map((rec) => {
              const type = getRecommendationType(rec)
              const config = priorityConfig[type]
              const { trigger, headline, theWhy, actionSteps } = parseRecommendationContent(rec)
              const isExpanded = expandedRec === rec.id

              return (
                <div
                  key={rec.id}
                  className={`bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} rounded-2xl overflow-hidden transition-all hover:shadow-lg`}
                >
                  {/* Card Header */}
                  <div className="p-5">
                    {/* Badge Row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeColor}`}>
                        <span>{config.icon}</span>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({config.headlinePrefix})
                      </span>
                    </div>

                    {/* Trigger */}
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trigger:</span>
                      <p className="text-sm text-gray-700 mt-0.5">{trigger}</p>
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{headline}</h3>

                    {/* The Why */}
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">The Why:</span>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{theWhy}</p>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? 'Show Less' : 'View Action Steps'}
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Content - Action Steps */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-200/60 pt-4">
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                          <span className="text-lg">✅</span>
                          Action Steps:
                        </span>
                        <ul className="mt-3 space-y-3">
                          {actionSteps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-sm text-gray-800 bg-white/60 p-3 rounded-xl"
                            >
                              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                        {rec.status === 'completed' ? (
                          <button
                            disabled
                            className="flex-1 bg-gray-300 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 cursor-default"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Completed
                          </button>
                        ) : (
                          <button
                            onClick={() => completeRecommendation(rec.id)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => setFeedbackModal({ open: true, recId: rec.id })}
                          className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-2xl font-semibold hover:bg-indigo-200 transition-all"
                        >
                          Feedback
                        </button>
                        <button
                          onClick={() => dismissRecommendation(rec.id)}
                          className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Add Feedback</h3>
            <p className="text-gray-500 text-sm mb-4">
              Share your thoughts on this recommendation to help improve future suggestions.
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback..."
              className="w-full border border-gray-300 rounded-xl p-3 h-32 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setFeedbackModal({ open: false, recId: null })}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={!feedbackText.trim()}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
