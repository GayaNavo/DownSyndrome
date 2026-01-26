'use client'

import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import AppHeader from './AppHeader'
import SDQTracker from './SDQTracker'



export default function AIDetectionPage() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
    if (!uploadedImage) {
      alert('Please upload a facial image first')
      return
    }

    // For now, just show a message since SDQ is handled by the separate component
    alert('Facial image uploaded successfully! The SDQ assessment is available in the separate SDQ section.')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar activePage="ai-detection" />

        {/* Main Content */}
        <div className="flex-1 ml-64 flex">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Main Content */}
            <main className="p-8 w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">AI-Based Detection Module</h2>
              <p className="text-gray-600">
                Upload a facial image and complete the SDQ for a preliminary likelihood assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Section 1: Upload Facial Image */}
              <div className="bg-white rounded-xl shadow-md p-8">
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

              {/* Section 2: Complete the SDQ */}
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Complete the SDQ</h3>
                    <p className="text-sm text-gray-600 mt-1">The Strengths and Difficulties Questionnaire provides holistic insights.</p>
                  </div>
                </div>
                
                <SDQTracker />
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
          </main>
        </div>

        {/* Right Sidebar - Results */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Dr. Aliyah Hayes</p>
            </div>
          </div>

          {/* SDQ Results will be shown in the SDQTracker component */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">SDQ Assessment</h3>
            <p className="text-sm text-gray-600 mb-4">Complete the behavioral assessment above to see detailed results.</p>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Important Disclaimer</h4>
                <p className="text-sm text-gray-700">
                  This is a preliminary screening tool, not a medical diagnosis. Please consult a qualified healthcare professional for accurate guidance and diagnosis.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a 
              href="/dashboard/entry"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 inline-block"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Add New Entry
            </a>
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Consult a Professional
            </button>
            <button className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}

