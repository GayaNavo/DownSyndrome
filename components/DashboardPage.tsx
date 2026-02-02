'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardSidebar from './DashboardSidebar'
import AppHeader from './AppHeader'
import { getChildDocument, ChildData } from '@/lib/firebase/firestore'

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const [children, setChildren] = useState<ChildData[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      getChildDocument(currentUser.uid)
        .then((childData) => {
          console.log('Fetched child:', childData)
          if (childData) {
            setChildren([childData])
            setSelectedChild(childData)
          } else {
            setChildren([])
            setSelectedChild(null)
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching child:', error)
          console.log('Current user ID:', currentUser?.uid)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [currentUser])
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar activePage="dashboard" />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Main Content Area */}
          <main className="p-6">
            {/* Child Overview Card */}
          {loading ? (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white shadow-lg">
              <div className="text-center py-8">
                <p className="text-blue-100">Loading child information...</p>
              </div>
            </div>
          ) : selectedChild ? (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Child Avatar */}
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-3xl font-bold">{selectedChild.name}</h2>
                      <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <p className="text-blue-100 text-lg">Age: {selectedChild.age} years</p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  {/* Developmental Age */}
                  <div className="text-center">
                    <p className="text-blue-200 text-sm mb-1">Developmental Age</p>
                    <p className="text-2xl font-semibold">{selectedChild.developmentalAge || 'Not set'}</p>
                  </div>

                  {/* Last Milestone */}
                  <div className="text-center">
                    <p className="text-blue-200 text-sm mb-1">Last Milestone</p>
                    <p className="text-2xl font-semibold">{selectedChild.lastMilestone || 'No milestones yet'}</p>
                  </div>

                  {/* Add New Entry Button */}
                  <a 
                    href="/dashboard/entry"
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md inline-block"
                  >
                    + Add New Entry
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white shadow-lg">
              <div className="text-center py-8">
                <p className="text-blue-100 mb-4">No child registered yet.</p>
                <a 
                  href="/dashboard/children"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md inline-block"
                >
                  + Add Your Child
                </a>
              </div>
            </div>
          )}



          {/* Quick Access Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Progress Monitoring Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all group">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" 
                    alt="Progress Monitoring" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent flex items-end p-6">
                    <div className="flex items-end justify-between w-full h-12 gap-1">
                      {[40, 60, 45, 80, 55, 90].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-white/40 rounded-t backdrop-blur-sm"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Progress Monitoring</h4>
                  <p className="text-gray-600 mb-4">
                    View developmental charts and track milestones.
                  </p>
                  <a
                    href="/dashboard/progress"
                    className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    View Progress →
                  </a>
                </div>
              </div>

              {/* AI Detection Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all group">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80&w=800" 
                    alt="AI Detection" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <p className="text-sm font-semibold">AI Analysis</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">AI Detection</h4>
                  <p className="text-gray-600 mb-4">
                    Analyze new media for developmental insights.
                  </p>
                  <a
                    href="/dashboard/ai-detection"
                    className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    Start Analysis →
                  </a>
                </div>
              </div>


            </div>
          </div>

          {/* Recent Activity and Upcoming Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Milestone Achieved: Stacking two blocks</p>
                    <p className="text-sm text-gray-500 mt-1">Yesterday, 3:45 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">New document uploaded</p>
                    <p className="text-sm text-gray-500 mt-1">2 days ago, 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Progress report generated</p>
                    <p className="text-sm text-gray-500 mt-1">3 days ago, 2:15 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upcoming</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Speech Therapy Appointment</p>
                    <p className="text-sm text-gray-500 mt-1">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Developmental Assessment</p>
                    <p className="text-sm text-gray-500 mt-1">Next Monday, 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Follow-up with Dr. Smith</p>
                    <p className="text-sm text-gray-500 mt-1">Next Friday, 11:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
)
}

