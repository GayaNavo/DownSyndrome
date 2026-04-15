'use client'

import { useState, useRef, useEffect } from 'react'
import DashboardSidebar from './DashboardSidebar'
import AppHeader from './AppHeader'
import WhimsicalBackground from './WhimsicalBackground'
import AnalysisResultsHistory from './AnalysisResultsHistory'
import SDQTracker, { type SDQTrackerHandle } from './SDQTracker'
import { useAuth } from '@/contexts/AuthContext'
import { getChildrenByParent } from '@/lib/firebase/firestore'
import { createAnalysisResult } from '@/services/analysisResultService'
import { analyzeImage, checkModelHealth, checkModelHealthWithRetry } from '@/services/modelApiService'
import { AnalysisResultModel } from '@/models/AnalysisResult'
import { ModelPrediction } from '@/config/model.config'



export default function AIDetectionPage() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [aiPrediction, setAiPrediction] = useState<ModelPrediction | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false)
  const [imageAnalysisResult, setImageAnalysisResult] = useState<ModelPrediction | null>(null)
  const [modelStatus, setModelStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const { currentUser: user } = useAuth()
  const sdqTrackerRef = useRef<any>(null)

  // Check model health on component mount and auto-retry for temporary outages
  useEffect(() => {
    let isActive = true

    const checkHealth = async () => {
      setModelStatus('checking')
      const isHealthy = await checkModelHealthWithRetry(12, 2500)
      if (!isActive) return
      setModelStatus(isHealthy ? 'online' : 'offline')
    }

    checkHealth()

    return () => {
      isActive = false
    }
  }, [])

  // Analyze image immediately after upload
  useEffect(() => {
    const analyzeUploadedImage = async () => {
      if (imagePreview && modelStatus === 'online') {
        setIsImageAnalyzing(true)
        try {
          console.log('Auto-analyzing uploaded image...')
          const apiResponse = await analyzeImage(imagePreview)
          
          if (apiResponse.success && apiResponse.data) {
            setImageAnalysisResult(apiResponse.data)
            console.log('Image Analysis Result:', apiResponse.data)
          } else {
            console.warn('Image analysis failed:', apiResponse.error)
          }
        } catch (error) {
          console.error('Error analyzing image:', error)
        } finally {
          setIsImageAnalyzing(false)
        }
      }
    }
    
    analyzeUploadedImage()
  }, [imagePreview, modelStatus])

  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      if (file.size <= 10 * 1024 * 1024) {
        setUploadedImage(file)
        setImageAnalysisResult(null) // Clear previous analysis
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        alert('File size must be less than 10MB')
      }
    } else {
      alert('Please upload a PNG or JPG image')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleAnalyze = async () => {
    if (!user) {
      alert('❌ Please sign in to save analysis results')
      return
    }

    // Get the current user's child
    const children = await getChildrenByParent(user.uid)
    if (children.length === 0) {
      alert('⚠️ Please add a child to your profile first')
      return
    }
    const childId = children[0].id

    // Get SDQ results from the tracker
    const sdqResults = sdqTrackerRef.current?.getResults ? sdqTrackerRef.current.getResults() : null
    
    if (!sdqResults) {
      alert('⚠️ Please complete the SDQ assessment first')
      return
    }

    setIsAnalyzing(true)
    let aiResults: ModelPrediction | null = null

    try {
      // If image is uploaded, send to Flask API for AI analysis
      if (imagePreview) {
        console.log('Sending image to AI model...')
        const apiResponse = await analyzeImage(imagePreview)
        
        if (apiResponse.success && apiResponse.data) {
          aiResults = apiResponse.data
          setAiPrediction(aiResults)
          console.log('AI Prediction:', aiResults)
        } else {
          console.warn('AI analysis failed:', apiResponse.error)
          // Continue with SDQ-only analysis if AI fails
        }
      }

      // Prepare analysis result data
      const analysisData = {
        childId: childId!,
        facialImageData: imagePreview || undefined,
        sdqScores: sdqResults.scores,
        totalDifficulty: sdqResults.totalDifficulty,
        percentage: sdqResults.percentage,
        interpretation: AnalysisResultModel.calculateInterpretation(sdqResults.percentage),
        analysisType: imagePreview ? 'combined' as const : 'sdq' as const,
        aiPrediction: aiResults ? {
          confidence: aiResults.confidence,
          prediction: aiResults.prediction,
          features: aiResults.features,
        } : undefined,
        notes: aiResults 
          ? `Combined analysis: AI confidence ${(aiResults.confidence * 100).toFixed(1)}%` 
          : 'Analysis based on SDQ assessment only'
      }

      // Save to Firestore
      const result = await createAnalysisResult(analysisData)
      if (result.success) {
        alert(result.message)
        setAnalysisResults({ ...sdqResults, aiPrediction: aiResults })
        setHistoryRefreshKey(prev => prev + 1) // Trigger history refresh
      } else {
        alert(result.message || '❌ Failed to save analysis results')
      }
    } catch (error: any) {
      console.error('Error during analysis:', error)
      alert(`❌ Analysis failed: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-whimsical relative">
      <WhimsicalBackground />
      <AppHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar activePage="ai-detection" />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="p-8 w-full">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold">
                  <span>🤖</span>
                  AI Assistant
                </div>
                {/* Model Status Indicator */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  modelStatus === 'online' 
                    ? 'bg-green-100 text-green-700' 
                    : modelStatus === 'offline'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    modelStatus === 'online' 
                      ? 'bg-green-500 animate-pulse' 
                      : modelStatus === 'offline'
                      ? 'bg-red-500'
                      : 'bg-yellow-500 animate-pulse'
                  }`}></span>
                  {modelStatus === 'online' 
                    ? 'AI Model Online' 
                    : modelStatus === 'offline'
                    ? 'AI Model Offline'
                    : 'Checking AI Model...'}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Smart Analysis Module</h2>
              <p className="text-gray-600">
                Upload a photo and complete the questionnaire to get helpful insights about your child's development.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Section 1: Upload Facial Image */}
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-mint-400 text-white rounded-2xl flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span>📸</span>
                      Upload a Photo
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Choose a clear photo where the face is visible and well-lit.
                    </p>
                  </div>
                </div>
              
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                  isDragging ? 'border-sky-400 bg-sky-50' : 'border-gray-200'
                } ${imagePreview ? 'border-mint-400' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Uploaded"
                      className="max-w-full max-h-64 mx-auto rounded-2xl shadow-lg"
                    />
                    
                    {/* Image Analysis Results Box */}
                    {isImageAnalyzing ? (
                      <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200">
                        <div className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sky-700 font-semibold">Analyzing image...</span>
                        </div>
                      </div>
                    ) : imageAnalysisResult ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                        <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                          <span>🎯</span>
                          Image Analysis Result
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white/80 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-600 mb-1">Prediction</p>
                            <p className={`text-lg font-bold capitalize ${
                              imageAnalysisResult.prediction === 'downsyndrome' 
                                ? 'text-amber-600' 
                                : 'text-green-600'
                            }`}>
                              {imageAnalysisResult.prediction === 'downsyndrome' ? 'Down Syndrome' : 'Healthy'}
                            </p>
                          </div>
                          <div className="bg-white/80 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-600 mb-1">Confidence</p>
                            <p className="text-lg font-bold text-sky-600">
                              {(imageAnalysisResult.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-white/80 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-600 mb-1">Probability</p>
                            <p className="text-lg font-bold text-lavender-600">
                              {(imageAnalysisResult.features.probability * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : modelStatus === 'offline' ? (
                      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                        <p className="text-yellow-700 text-sm text-center">
                          ⚠️ AI Model is offline. Cannot analyze image.
                        </p>
                      </div>
                    ) : null}
                    
                    <button
                      onClick={() => {
                        setUploadedImage(null)
                        setImagePreview(null)
                        setImageAnalysisResult(null)
                      }}
                      className="text-coral-500 hover:text-coral-600 font-bold"
                    >
                      Remove Photo ✕
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <span className="text-6xl">📷</span>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2 font-medium">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-sm text-gray-500">PNG or JPG (max. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block bg-gradient-to-r from-sky-500 to-mint-500 text-white px-6 py-3 rounded-xl font-bold hover:from-sky-600 hover:to-mint-600 cursor-pointer transition-all shadow-lg transform hover:scale-105"
                    >
                      Choose Photo
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Instruction / Best Practices Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-sky-50 rounded-3xl p-6 border border-sky-100">
                <h4 className="font-bold text-sky-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Photo Tips
                </h4>
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=400" 
                      alt="Happy child example" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ul className="text-sm text-sky-700 space-y-3">
                    <li className="flex gap-2 items-center">
                      <span className="text-mint-500 font-bold text-lg">✓</span>
                      Good lighting from the front
                    </li>
                    <li className="flex gap-2 items-center">
                      <span className="text-mint-500 font-bold text-lg">✓</span>
                      Natural, relaxed expression
                    </li>
                    <li className="flex gap-2 items-center">
                      <span className="text-mint-500 font-bold text-lg">✓</span>
                      Simple, uncluttered background
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-coral-50 rounded-3xl p-6 border border-coral-100">
                <h4 className="font-bold text-coral-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  Privacy Promise
                </h4>
                <p className="text-sm text-coral-700">
                  Your photos are kept safe and secure. We only use them to help analyze development and never share with anyone else.
                </p>
              </div>
            </div>

              {/* Section 2: Complete the SDQ */}
              <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-lavender-400 to-coral-400 text-white rounded-2xl flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span>📝</span>
                      Answer Some Questions
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">These questions help us understand your child's unique strengths and personality.</p>
                  </div>
                </div>
                
                <SDQTracker ref={sdqTrackerRef} />
              </div>
            </div>

            {/* Analyze Button */}
            <div className="mt-8">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-sky-500 via-lavender-500 to-coral-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-sky-600 hover:via-lavender-600 hover:to-coral-600 focus:outline-none focus:ring-4 focus:ring-lavender-300/50 transition-all shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">✨</span>
                    <span>Get Insights</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Prediction Results */}
            {aiPrediction && (
              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  AI Analysis Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 rounded-2xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Prediction</p>
                    <p className={`text-2xl font-bold capitalize ${
                      aiPrediction.prediction === 'downsyndrome' 
                        ? 'text-amber-600' 
                        : 'text-green-600'
                    }`}>
                      {aiPrediction.prediction === 'downsyndrome' ? 'Down Syndrome' : 'Healthy'}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-2xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-sky-600">
                      {(aiPrediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-2xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Probability</p>
                    <p className="text-2xl font-bold text-lavender-600">
                      {(aiPrediction.features.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Results History */}
            <div className="mt-12">
              <AnalysisResultsHistory refreshKey={historyRefreshKey} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

