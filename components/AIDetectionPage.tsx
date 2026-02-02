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
      alert('Please sign in to save analysis results')
      return
    }

    // Get the current user's child
    const children = await getChildrenByParent(user.uid)
    if (children.length === 0) {
      alert('Please add a child to your profile first')
      return
    }
    const childId = children[0].id

    // Get SDQ results from the tracker
    const sdqResults = sdqTrackerRef.current?.getResults ? sdqTrackerRef.current.getResults() : null
    
    if (!sdqResults) {
      alert('Please complete the SDQ assessment first')
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
      await createAnalysisResult(analysisData)
      alert('Analysis results saved to history successfully!')
      setAnalysisResults(sdqResults) // Store locally to show results
    } catch (error) {
      console.error('Error saving analysis result:', error)
      alert('Failed to save analysis results. Please try again.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar activePage="ai-detection" />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="p-8 w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">AI-Based Detection Module</h2>
              <p className="text-gray-600">
                Upload a facial image and complete the SDQ for a preliminary likelihood assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Section 1: Upload Facial Image */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Upload Facial Image</h3>
                    <p className="text-gray-600 mt-1">
                      The face should be clear, well-lit, and forward-facing.
                    </p>
                  </div>
                </div>
              
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } ${imagePreview ? 'border-blue-500' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Uploaded"
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage(null)
                        setImagePreview(null)
                      }}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">
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
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Browse Files
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Instruction / Best Practices Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Instruction Guide
                </h4>
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-white shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1590033821368-7f7f469b1561?auto=format&fit=crop&q=80&w=400" 
                      alt="Correct pose example" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ul className="text-sm text-blue-800 space-y-3">
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-600">✓</span>
                      Face should be well-lit from the front
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-600">✓</span>
                      Neutral facial expression (closed mouth)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-600">✓</span>
                      Ensure the background is plain
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Privacy Note
                </h4>
                <p className="text-sm text-orange-800">
                  Facial images are processed securely and used only for preliminary analysis. We never share sensitive data with third parties.
                </p>
              </div>
            </div>

              {/* Section 2: Complete the SDQ */}
              <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Complete the SDQ</h3>
                    <p className="text-sm text-gray-600 mt-1">The Strengths and Difficulties Questionnaire provides holistic insights.</p>
                  </div>
                </div>
                
                <SDQTracker ref={sdqTrackerRef} />
              </div>
            </div>

            {/* Analyze Button */}
            <div className="mt-8">
              <button
                onClick={handleAnalyze}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analyze Data
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

