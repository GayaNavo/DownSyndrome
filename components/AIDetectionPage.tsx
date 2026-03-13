'use client'

import { useState, useRef } from 'react'
import DashboardSidebar from './DashboardSidebar'
import AppHeader from './AppHeader'
import AnalysisResultsHistory from './AnalysisResultsHistory'
import SDQTracker, { type SDQTrackerHandle } from './SDQTracker'
import { useAuth } from '@/contexts/AuthContext'
import { getChildrenByParent } from '@/lib/firebase/firestore'
import { createAnalysisResult } from '@/services/analysisResultService'
import { AnalysisResultModel } from '@/models/AnalysisResult'



export default function AIDetectionPage() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const { currentUser: user } = useAuth()
  const sdqTrackerRef = useRef<any>(null)

  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      if (file.size <= 10 * 1024 * 1024) {
        setUploadedImage(file)
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

    // Prepare analysis result data
    const analysisData = {
      childId: childId!, // Ensure childId is a string
      facialImageData: imagePreview || undefined, // Save image preview as base64 if available
      sdqScores: sdqResults.scores,
      totalDifficulty: sdqResults.totalDifficulty,
      percentage: sdqResults.percentage,
      interpretation: AnalysisResultModel.calculateInterpretation(sdqResults.percentage),
      analysisType: imagePreview ? 'combined' as const : 'sdq' as const, // If image is present, it's combined; otherwise just SDQ
      notes: 'Automated analysis based on SDQ assessment'
    }

    try {
      // Save to Firestore
      const result = await createAnalysisResult(analysisData)
      if (result.success) {
        alert(result.message) // Shows: ✅ Analysis results saved to history successfully!
        setAnalysisResults(sdqResults) // Store locally to show results
      } else {
        alert(result.message || '❌ Failed to save analysis results')
      }
    } catch (error: any) {
      console.error('Error saving analysis result:', error)
      alert(`❌ Failed to save analysis results: ${error.message}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-50 via-white to-mint-50">
      <AppHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar activePage="ai-detection" />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="p-8 w-full">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span>🤖</span>
                AI Assistant
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
                    <button
                      onClick={() => {
                        setUploadedImage(null)
                        setImagePreview(null)
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
                className="w-full bg-gradient-to-r from-sky-500 via-lavender-500 to-coral-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-sky-600 hover:via-lavender-600 hover:to-coral-600 focus:outline-none focus:ring-4 focus:ring-lavender-300/50 transition-all shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02]"
              >
                <span className="text-2xl">✨</span>
                Get Insights
              </button>
            </div>

            {/* Analysis Results History */}
            <div className="mt-12">
              <AnalysisResultsHistory />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

