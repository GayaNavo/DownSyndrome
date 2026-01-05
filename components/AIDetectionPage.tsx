'use client'

import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader from './DashboardHeader'

interface SDQQuestion {
  id: string
  text: string
  category: string
}

const sdqQuestions: SDQQuestion[] = [
  // Emotional Symptoms
  { id: 'e1', text: 'Often complains of headaches, stomach-aches or sickness.', category: 'emotional' },
  { id: 'e2', text: 'Many worries or often seems worried.', category: 'emotional' },
  { id: 'e3', text: 'Often unhappy, down-hearted or tearful.', category: 'emotional' },
  { id: 'e4', text: 'Nervous or clingy in new situations, easily loses confidence.', category: 'emotional' },
  { id: 'e5', text: 'Many fears, easily scared.', category: 'emotional' },
  
  // Conduct Problems
  { id: 'c1', text: 'Often has temper tantrums or hot tempers.', category: 'conduct' },
  { id: 'c2', text: 'Generally obedient, usually does what adults request.', category: 'conduct' },
  { id: 'c3', text: 'Often fights with other children or bullies them.', category: 'conduct' },
  { id: 'c4', text: 'Often lies or cheats.', category: 'conduct' },
  { id: 'c5', text: 'Steals from home, school or elsewhere.', category: 'conduct' },
  
  // Hyperactivity
  { id: 'h1', text: 'Restless, overactive, cannot stay still for long.', category: 'hyperactivity' },
  { id: 'h2', text: 'Constantly fidgeting or squirming.', category: 'hyperactivity' },
  { id: 'h3', text: 'Easily distracted, concentration wanders.', category: 'hyperactivity' },
  { id: 'h4', text: 'Thinks things out before acting.', category: 'hyperactivity' },
  { id: 'h5', text: 'Sees tasks through to the end, good attention span.', category: 'hyperactivity' },
  
  // Peer Problems
  { id: 'p1', text: 'Rather solitary, tends to play alone.', category: 'peer' },
  { id: 'p2', text: 'Has at least one good friend.', category: 'peer' },
  { id: 'p3', text: 'Generally liked by other children.', category: 'peer' },
  { id: 'p4', text: 'Picked on or bullied by other children.', category: 'peer' },
  { id: 'p5', text: 'Gets along better with adults than with other children.', category: 'peer' },
  
  // Prosocial Behavior
  { id: 's1', text: 'Considerate of other people\'s feelings.', category: 'prosocial' },
  { id: 's2', text: 'Shares readily with other children.', category: 'prosocial' },
  { id: 's3', text: 'Helpful if someone is hurt, upset or feeling ill.', category: 'prosocial' },
  { id: 's4', text: 'Kind to younger children.', category: 'prosocial' },
  { id: 's5', text: 'Often volunteers to help others.', category: 'prosocial' },
]

export default function AIDetectionPage() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [sdqAnswers, setSdqAnswers] = useState<Record<string, string>>({})
  const [openCategory, setOpenCategory] = useState<string>('emotional')
  const [likelihood, setLikelihood] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const categories = [
    { id: 'emotional', name: 'Emotional Symptoms', icon: '😔' },
    { id: 'conduct', name: 'Conduct Problems', icon: '😠' },
    { id: 'hyperactivity', name: 'Hyperactivity', icon: '⚡' },
    { id: 'peer', name: 'Peer Problems', icon: '👥' },
    { id: 'prosocial', name: 'Prosocial Behavior', icon: '❤️' },
  ]

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

    const answeredQuestions = Object.keys(sdqAnswers).length
    const totalQuestions = sdqQuestions.length
    if (answeredQuestions < totalQuestions) {
      alert(`Please answer all ${totalQuestions} SDQ questions`)
      return
    }

    setIsAnalyzing(true)
    
    // Simulate AI analysis (replace with actual API call)
    setTimeout(() => {
      // Calculate a mock likelihood based on answers
      const scores: number[] = Object.values(sdqAnswers).map(answer => {
        if (answer === 'certainly') return 2
        if (answer === 'somewhat') return 1
        return 0
      })
      const totalScore = scores.reduce((a, b) => a + b, 0)
      const maxScore = totalQuestions * 2
      const calculatedLikelihood = Math.round((totalScore / maxScore) * 100)
      
      setLikelihood(calculatedLikelihood)
      setIsAnalyzing(false)
    }, 2000)
  }

  const getCategoryQuestions = (categoryId: string) => {
    return sdqQuestions.filter(q => q.category === categoryId)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar activePage="ai-detection" />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex">
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Header */}
          <DashboardHeader title="AI-Based Detection Module" />

          {/* Main Content */}
          <main className="p-6 max-w-4xl">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">AI-Based Detection Module</h2>
              <p className="text-gray-600">
                Upload a facial image and complete the SDQ for a preliminary likelihood assessment.
              </p>
            </div>

            {/* Section 1: Upload Facial Image */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upload Facial Image</h3>
              </div>
              <p className="text-gray-600 mb-4 ml-11">
                The face should be clear, well-lit, and forward-facing.
              </p>
              
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
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Complete the SDQ</h3>
                  <p className="text-sm text-gray-600">The Strengths and Difficulties Questionnaire provides holistic insights.</p>
                </div>
              </div>

              <div className="space-y-3">
                {categories.map((category) => {
                  const questions = getCategoryQuestions(category.id)
                  const isOpen = openCategory === category.id
                  
                  return (
                    <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setOpenCategory(isOpen ? '' : category.id)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-semibold text-gray-900">{category.name}</span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isOpen && (
                        <div className="p-4 space-y-4 bg-white">
                          {questions.map((question, index) => (
                            <div key={question.id} className="border-b border-gray-100 pb-4 last:border-0">
                              <p className="text-gray-900 mb-3 font-medium">
                                {index + 1}. {question.text}
                              </p>
                              <div className="flex gap-4">
                                {['not', 'somewhat', 'certainly'].map((option) => (
                                  <label
                                    key={option}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="radio"
                                      name={question.id}
                                      value={option}
                                      checked={sdqAnswers[question.id] === option}
                                      onChange={(e) =>
                                        setSdqAnswers({ ...sdqAnswers, [question.id]: e.target.value })
                                      }
                                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 capitalize">
                                      {option === 'not' ? 'Not True' : option === 'somewhat' ? 'Somewhat True' : 'Certainly True'}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
            </button>
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

          {/* Likelihood Result */}
          {likelihood !== null && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Likelihood Result</h3>
              <p className="text-sm text-gray-600 mb-4">Based on the data provided.</p>
              
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#3b82f6"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(likelihood / 100) * 552.92} 552.92`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{likelihood}%</div>
                    <div className="text-sm text-gray-600">Likelihood</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">High Likelihood Indicated</h4>
                <p className="text-sm text-gray-600">
                  The analysis combines facial feature recognition with SDQ results to generate a preliminary score.
                </p>
              </div>
            </div>
          )}

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
  )
}

