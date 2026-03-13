'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardSidebar from './DashboardSidebar'
import AppHeader from './AppHeader'
import { getChildDocument, ChildData, getUpcomingEventsByChild, UpcomingEvent, getRecentEventsByChild, getMilestonesByChild, MilestoneData, createUpcomingEvent, updateUpcomingEvent, deleteUpcomingEvent } from '@/lib/firebase/firestore'
import { Timestamp } from 'firebase/firestore'

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const [children, setChildren] = useState<ChildData[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [recentEvents, setRecentEvents] = useState<UpcomingEvent[]>([])
  const [recentMilestones, setRecentMilestones] = useState<MilestoneData[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null)
  const [savingEvent, setSavingEvent] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'appointment' as UpcomingEvent['type']
  })

  const loadDashboardData = async (childId: string) => {
    try {
      const [events, recentEventsData, milestones] = await Promise.all([
        getUpcomingEventsByChild(childId),
        getRecentEventsByChild(childId),
        getMilestonesByChild(childId)
      ]);
      setUpcomingEvents(events);
      setRecentEvents(recentEventsData);
      setRecentMilestones(milestones);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setUpcomingEvents([]);
      setRecentEvents([]);
      setRecentMilestones([]);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getChildDocument(currentUser.uid)
        .then(async (childData) => {
          if (childData) {
            setChildren([childData])
            setSelectedChild(childData)
            await loadDashboardData(childData.id || currentUser.uid);
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
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [currentUser]);

  // Event management functions
  const openEventModal = (event?: UpcomingEvent) => {
    if (event) {
      const eventDate = event.date.toDate();
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || '',
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        location: event.location || '',
        type: event.type
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        location: '',
        type: 'appointment'
      });
    }
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChild?.id) {
      alert('⚠️ No child selected. Please add a child first.');
      return;
    }

    setSavingEvent(true);
    try {
      const dateTime = new Date(`${eventForm.date}T${eventForm.time}`);
      
      if (editingEvent && editingEvent.id) {
        await updateUpcomingEvent(editingEvent.id, {
          title: eventForm.title,
          description: eventForm.description,
          date: Timestamp.fromDate(dateTime),
          location: eventForm.location,
          type: eventForm.type
        });
        alert(`✅ Event updated successfully! 📅`);
      } else {
        await createUpcomingEvent({
          childId: selectedChild.id,
          title: eventForm.title,
          description: eventForm.description,
          date: Timestamp.fromDate(dateTime),
          location: eventForm.location,
          type: eventForm.type
        });
        alert(`✅ Event created successfully! 🎉`);
      }
      
      // Refresh the upcoming events list
      await loadDashboardData(selectedChild.id);
      closeEventModal();
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(`❌ Failed to save event: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setSavingEvent(false);
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-50 via-white to-mint-50">
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
            <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-mint-400 rounded-3xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 right-10 w-8 h-8 bg-white/20 rounded-full animate-float"></div>
                <div className="absolute bottom-4 left-10 w-6 h-6 bg-white/20 rounded-full animate-float-delayed"></div>
              </div>
              <div className="text-center py-8 relative">
                <p className="text-white/90">Loading your little one's information...</p>
              </div>
            </div>
          ) : selectedChild ? (
            <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-mint-400 rounded-3xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-4 right-20 w-12 h-12 bg-white/10 rounded-full animate-float"></div>
                <div className="absolute bottom-4 left-20 w-8 h-8 bg-white/10 rounded-full animate-float-delayed"></div>
                <svg className="absolute top-8 right-1/3 w-6 h-6 text-white/20 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-6">
                  {/* Child Avatar */}
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                    <span className="text-4xl">👶</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-3xl font-bold">{selectedChild.name}</h2>
                      <svg className="w-6 h-6 text-sunshine-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <p className="text-white/90 text-lg">Age: {selectedChild.age} years</p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  {/* Developmental Age */}
                  <div className="text-center">
                    <p className="text-white/80 text-sm mb-1">Developmental Age</p>
                    <p className="text-2xl font-semibold">{selectedChild.developmentalAge || 'Not set'}</p>
                  </div>

                  {/* Last Milestone */}
                  <div className="text-center">
                    <p className="text-white/80 text-sm mb-1">Last Milestone</p>
                    <p className="text-2xl font-semibold">{selectedChild.lastMilestone || 'No milestones yet'}</p>
                  </div>

                  {/* Add New Entry Button */}
                  <a 
                    href="/dashboard/entry"
                    className="bg-white text-sky-600 px-6 py-3 rounded-2xl font-bold hover:bg-sky-50 transition-colors shadow-lg inline-block transform hover:scale-105"
                  >
                    + Add Entry
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-mint-400 rounded-3xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 right-10 w-8 h-8 bg-white/20 rounded-full animate-float"></div>
              </div>
              <div className="text-center py-8 relative">
                <span className="text-5xl mb-4 block">👋</span>
                <p className="text-white/90 mb-4">No child registered yet.</p>
                <a 
                  href="/dashboard/children"
                  className="bg-white text-sky-600 px-6 py-3 rounded-2xl font-bold hover:bg-sky-50 transition-colors shadow-lg inline-block transform hover:scale-105"
                >
                  + Add Your Child
                </a>
              </div>
            </div>
          )}



          {/* Quick Access Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Quick Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Progress Monitoring Card */}
              <div className="card-playful group">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800" 
                    alt="Child achieving milestones" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mint-500/80 to-transparent flex items-end p-6">
                    <div className="flex items-end justify-between w-full h-12 gap-1">
                      {[40, 60, 45, 80, 55, 90].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-white/50 rounded-t backdrop-blur-sm"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">📈</span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Milestone Tracker</h4>
                  <p className="text-gray-600 mb-4">
                    Celebrate every achievement on your child's journey!
                  </p>
                  <a
                    href="/dashboard/progress"
                    className="text-mint-600 font-bold hover:text-mint-700 inline-flex items-center gap-1"
                  >
                    View Progress →
                  </a>
                </div>
              </div>

              {/* AI Detection Card */}
              <div className="card-playful group">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&q=80&w=800" 
                    alt="AI Analysis" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-500/80 to-transparent flex items-center justify-center">
                    <div className="text-white text-center">
                      <span className="text-5xl mb-2 block">🤖</span>
                      <p className="text-sm font-bold">Smart Analysis</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">✨</span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">AI Assistant</h4>
                  <p className="text-gray-600 mb-4">
                    Get helpful insights about your child's development.
                  </p>
                  <a
                    href="/dashboard/ai-detection"
                    className="text-sky-600 font-bold hover:text-sky-700 inline-flex items-center gap-1"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  Recent Activity
                </h3>
                <button 
                  onClick={() => setShowActivityModal(true)}
                  className="text-sky-500 hover:text-sky-600 text-sm font-bold"
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
                    <span className="text-5xl mb-3 block">🌟</span>
                    <p className="font-semibold">No recent activity</p>
                    <p className="text-sm mt-1">Add entries to see your child's journey!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  Upcoming
                </h3>
                <button 
                  onClick={() => openEventModal()}
                  className="text-mint-500 hover:text-mint-600 text-sm font-bold"
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
                    <span className="text-5xl mb-3 block">🎈</span>
                    <p className="font-semibold">No upcoming events</p>
                    <p className="text-sm mt-1">Add events to plan your adventures!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    {/* Event Management Modal */}
    {showEventModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveEvent}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                  type="button"
                  onClick={closeEventModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Event Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Speech Therapy Appointment"
                    required
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type *
                  </label>
                  <select
                    id="type"
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="appointment">Appointment</option>
                    <option value="assessment">Assessment</option>
                    <option value="therapy">Therapy Session</option>
                    <option value="milestone">Milestone</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the event"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      id="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pediatric Clinic, Room 101"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEventModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingEvent ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Activity History Modal */}
    {showActivityModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              {(() => {
                const allActivities = [
                  ...recentMilestones.map(milestone => ({
                    id: `milestone-${milestone.id}`,
                    title: `Milestone Achieved: ${milestone.title}`,
                    description: milestone.description,
                    date: milestone.achievedAt,
                    type: 'milestone' as const
                  })),
                  ...recentEvents.map(event => ({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    type: event.type
                  }))
                ].sort((a, b) => b.date.toMillis() - a.date.toMillis());

                if (allActivities.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No recent activity</p>
                      <p className="text-sm mt-1">Add entries to see activity history</p>
                    </div>
                  );
                }

                return allActivities.map((activity) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'milestone':
                        return {
                          icon: (
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ),
                          bgColor: 'bg-green-100'
                        };
                      case 'assessment':
                      case 'document':
                        return {
                          icon: (
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          ),
                          bgColor: 'bg-blue-100'
                        };
                      case 'therapy':
                        return {
                          icon: (
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          ),
                          bgColor: 'bg-purple-100'
                        };
                      default:
                        return {
                          icon: (
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          ),
                          bgColor: 'bg-gray-100'
                        };
                    }
                  };

                  const { icon, bgColor } = getActivityIcon(activity.type);
                  
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
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{dateText}</p>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowActivityModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)
}

