'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardSidebar from './DashboardSidebar'
import AppHeader from './AppHeader'
import { getChildDocument, ChildData, getUpcomingEventsByChild, UpcomingEvent, getRecentEventsByChild, getMilestonesByChild, MilestoneData } from '@/lib/firebase/firestore'

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const [children, setChildren] = useState<ChildData[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [recentEvents, setRecentEvents] = useState<UpcomingEvent[]>([])
  const [recentMilestones, setRecentMilestones] = useState<MilestoneData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      getChildDocument(currentUser.uid)
        .then(async (childData) => {
          console.log('Fetched child:', childData)
          if (childData) {
            setChildren([childData])
            setSelectedChild(childData)
            
            // Fetch upcoming events
            try {
              const [events, recentEventsData, milestones] = await Promise.all([
                getUpcomingEventsByChild(childData.id || currentUser.uid),
                getRecentEventsByChild(childData.id || currentUser.uid),
                getMilestonesByChild(childData.id || currentUser.uid)
              ]);
              
              setUpcomingEvents(events);
              setRecentEvents(recentEventsData);
              setRecentMilestones(milestones);
            } catch (error) {
              console.error('Error fetching data:', error);
              // Use dummy data if fetch fails
              setUpcomingEvents([
                {
                  id: '1',
                  childId: childData.id || currentUser.uid,
                  title: 'Speech Therapy Appointment',
                  description: 'Weekly speech therapy session',
                  date: { toDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } as any,
                  type: 'therapy',
                  location: 'Therapy Center'
                } as any,
                {
                  id: '2',
                  childId: childData.id || currentUser.uid,
                  title: 'Developmental Assessment',
                  description: 'Quarterly developmental evaluation',
                  date: { toDate: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) } as any,
                  type: 'assessment',
                  location: 'Pediatric Clinic'
                } as any,
                {
                  id: '3',
                  childId: childData.id || currentUser.uid,
                  title: 'Follow-up with Dr. Smith',
                  description: 'Routine checkup and progress review',
                  date: { toDate: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) } as any,
                  type: 'follow_up',
                  location: "Children's Hospital"
                } as any
              ]);
              
              setRecentEvents([
                {
                  id: 'recent1',
                  childId: childData.id || currentUser.uid,
                  title: 'Milestone Achieved: Stacking two blocks',
                  description: 'Child successfully stacked two blocks together',
                  date: { toDate: () => new Date(Date.now() - 24 * 60 * 60 * 1000) } as any,
                  type: 'milestone'
                } as any,
                {
                  id: 'recent2',
                  childId: childData.id || currentUser.uid,
                  title: 'New document uploaded',
                  description: 'Developmental assessment report added',
                  date: { toDate: () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } as any,
                  type: 'assessment'
                } as any
              ]);
              
              setRecentMilestones([
                {
                  id: 'milestone1',
                  childId: childData.id || currentUser.uid,
                  title: 'First words spoken',
                  description: 'Child said first meaningful words',
                  category: 'language',
                  achievedAt: { toDate: () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } as any
                } as any
              ]);
            }
          } else {
            setChildren([])
            setSelectedChild(null)
            setUpcomingEvents([]);
            setRecentEvents([]);
            setRecentMilestones([]);
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
                <button 
                  onClick={() => {
                    // In a real app, this would navigate to activity history
                    alert('Activity history feature coming soon!');
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentEvents.length > 0 || recentMilestones.length > 0 ? (
                  [
                    ...recentMilestones.slice(0, 1).map(milestone => ({
                      id: `milestone-${milestone.id}`,
                      title: `Milestone Achieved: ${milestone.title}`,
                      description: milestone.description,
                      date: milestone.achievedAt,
                      type: 'milestone'
                    })),
                    ...recentEvents.slice(0, 2).map(event => ({
                      ...event,
                      title: event.title,
                      description: event.description
                    }))
                  ].slice(0, 3).map((activity, index) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'milestone':
                          return {
                            icon: (
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ),
                            bgColor: 'bg-green-100',
                            textColor: 'text-green-600'
                          };
                        case 'assessment':
                        case 'document':
                          return {
                            icon: (
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ),
                            bgColor: 'bg-blue-100',
                            textColor: 'text-blue-600'
                          };
                        default:
                          return {
                            icon: (
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            ),
                            bgColor: 'bg-purple-100',
                            textColor: 'text-purple-600'
                          };
                      }
                    };

                    const { icon, bgColor, textColor } = getActivityIcon(activity.type);
                    
                    // Format date
                    const activityDate = activity.date.toDate();
                    const now = new Date();
                    const diffTime = now.getTime() - activityDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    let dateText = '';
                    if (diffDays === 0) {
                      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                      if (diffHours === 0) {
                        const diffMinutes = Math.floor(diffTime / (1000 * 60));
                        dateText = `${diffMinutes} minutes ago`;
                      } else {
                        dateText = `${diffHours} hours ago`;
                      }
                    } else if (diffDays === 1) {
                      dateText = 'Yesterday';
                    } else {
                      dateText = `${diffDays} days ago`;
                    }

                    return (
                      <div key={activity.id || index} className="flex items-start gap-4 p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-100">
                        <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{dateText}</p>
                          {activity.description && (
                            <p className="text-xs text-gray-400 mt-1">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p>No recent activity</p>
                    <p className="text-sm mt-1">Add entries to see activity history</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Upcoming</h3>
                <button 
                  onClick={() => {
                    // In a real app, this would navigate to an events management page
                    alert('Event management feature coming soon!');
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Event
                </button>
              </div>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 3).map((event) => {
                    // Get icon and color based on event type
                    const getEventIcon = (type: string) => {
                      switch (type) {
                        case 'therapy':
                          return {
                            icon: (
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ),
                            bgColor: 'bg-blue-100',
                            textColor: 'text-blue-600'
                          };
                        case 'assessment':
                          return {
                            icon: (
                              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ),
                            bgColor: 'bg-orange-100',
                            textColor: 'text-orange-600'
                          };
                        case 'follow_up':
                          return {
                            icon: (
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            ),
                            bgColor: 'bg-green-100',
                            textColor: 'text-green-600'
                          };
                        case 'milestone':
                          return {
                            icon: (
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            ),
                            bgColor: 'bg-purple-100',
                            textColor: 'text-purple-600'
                          };
                        default:
                          return {
                            icon: (
                              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ),
                            bgColor: 'bg-gray-100',
                            textColor: 'text-gray-600'
                          };
                      }
                    };

                    const { icon, bgColor, textColor } = getEventIcon(event.type);
                    
                    // Format date
                    const eventDate = event.date.toDate();
                    const now = new Date();
                    const diffTime = eventDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    let dateText = '';
                    if (diffDays === 0) {
                      dateText = 'Today';
                    } else if (diffDays === 1) {
                      dateText = 'Tomorrow';
                    } else if (diffDays <= 7) {
                      dateText = `${diffDays} days from now`;
                    } else {
                      dateText = eventDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    }

                    return (
                      <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-100">
                        <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {dateText}
                            {event.location && ` • ${event.location}`}
                          </p>
                          {event.description && (
                            <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No upcoming events</p>
                    <p className="text-sm mt-1">Add events to stay organized</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
)
}

