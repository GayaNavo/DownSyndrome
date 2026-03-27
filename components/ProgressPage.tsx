'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardSidebar from './DashboardSidebar'
import AppHeader from './AppHeader'
import WhimsicalBackground from './WhimsicalBackground'
import { getChildDocument, ChildData, getMilestonesByChild, MilestoneData, getHealthDataByChild, HealthData, getProgressByChild, ProgressData, UpcomingEvent, createUpcomingEvent, updateUpcomingEvent, deleteUpcomingEvent, getUpcomingEventsByChild } from '@/lib/firebase/firestore'
import AIRecommendations from './AIRecommendations'
import { AnalysisResult } from '@/models/AnalysisResult'
import { Timestamp } from 'firebase/firestore'

const eventTypeEmojis: Record<string, string> = {
  appointment: '🏥',
  assessment: '📊',
  therapy: '🏃',
  milestone: '🏆',
  follow_up: '🔄',
  other: '📅'
}

const eventTypeColors: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-800 border-blue-200',
  assessment: 'bg-purple-100 text-purple-800 border-purple-200',
  therapy: 'bg-green-100 text-green-800 border-green-200',
  milestone: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  follow_up: 'bg-orange-100 text-orange-800 border-orange-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function ProgressPage() {
  const { currentUser } = useAuth()
  const [children, setChildren] = useState<ChildData[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null)
  const [milestones, setMilestones] = useState<MilestoneData[]>([])
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [timePeriod, setTimePeriod] = useState<'7days' | '30days' | '6months' | 'alltime'>('30days')
  const [loading, setLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'appointment' as UpcomingEvent['type']
  })

  // Functions to open and close the report modal
  const openReportModal = () => {
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
  };

  // Functions to manage milestones modal
  const openMilestoneModal = () => {
    setShowMilestoneModal(true);
  };

  const closeMilestoneModal = () => {
    setShowMilestoneModal(false);
  };

  // Functions to manage events
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
      setNotification({ message: '⚠️ No child selected', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

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
        setNotification({ message: `✅ Event updated successfully! 📅`, type: 'success' });
      } else {
        await createUpcomingEvent({
          childId: selectedChild.id,
          title: eventForm.title,
          description: eventForm.description,
          date: Timestamp.fromDate(dateTime),
          location: eventForm.location,
          type: eventForm.type
        });
        setNotification({ message: `✅ Event created successfully! 🎉`, type: 'success' });
      }
      
      // Refresh events
      await loadEvents();
      closeEventModal();
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error saving event:', error);
      setNotification({ message: '❌ Failed to save event. Please try again.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteUpcomingEvent(eventId);
      setNotification({ message: '✅ Event deleted successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 5000);
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setNotification({ message: '❌ Failed to delete event. Please try again.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const loadEvents = async () => {
    if (!selectedChild?.id) return;
    
    try {
      const events = await getUpcomingEventsByChild(selectedChild.id);
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setLoading(true)
      getChildDocument(currentUser.uid)
        .then((childData: ChildData | null) => {
          if (childData) {
            setChildren([childData])
            setSelectedChild(childData)
            // Fetch milestones, health data, and progress data
            const childId = childData.id || currentUser.uid
            Promise.all([
              getMilestonesByChild(childId),
              getHealthDataByChild(childId),
              getProgressByChild(childId)
            ]).then(([milestonesData, healthData, progressData]) => {
              setMilestones(milestonesData);
              setHealthData(healthData);
              setProgressData(progressData);
            });
          } else {
            setChildren([])
            setSelectedChild(null)
          }
          setLoading(false)
        })
        .catch((error: any) => {
          console.error('Error fetching child:', error)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (selectedChild?.id) {
      Promise.all([
        getMilestonesByChild(selectedChild.id),
        getHealthDataByChild(selectedChild.id),
        getProgressByChild(selectedChild.id),
        getUpcomingEventsByChild(selectedChild.id)
      ]).then(([milestonesData, healthData, progressData, eventsData]) => {
        setMilestones(milestonesData);
        setHealthData(healthData);
        setProgressData(progressData);
        setUpcomingEvents(eventsData);
      });
      
      // Load latest SDQ analysis from localStorage
      const savedAnalysis = localStorage.getItem(`sdq_analysis_${selectedChild.id}`)
      if (savedAnalysis) {
        try {
          const parsed = JSON.parse(savedAnalysis)
          setLatestAnalysis(parsed)
        } catch (e) {
          console.error('Error parsing saved analysis:', e)
        }
      }
    }
  }, [selectedChild]);

  // Extract data from healthData
  const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
  }

  // Generate insights based on health data
  const generateInsights = () => {
    if (!selectedChild) {
      return 'No child data available.';
    }
    
    const insights: string[] = [];
    
    if (latestWeight !== null && latestWeight !== undefined) {
      if (weightChange.isPositive) {
        insights.push(`🎉 Great progress! ${selectedChild.name}'s weight has increased by ${weightChange.value.toFixed(1)}% over this period.`);
      } else {
        insights.push(`📊 ${selectedChild.name}'s weight has decreased by ${weightChange.value.toFixed(1)}%. Consider consulting with your healthcare provider if you have concerns.`);
      }
    }
    
    if (latestHeight !== null && latestHeight !== undefined) {
      if (heightChange.isPositive) {
        insights.push(`📏 Height has grown by ${heightChange.value.toFixed(1)}%, showing healthy development.`);
      } else {
        insights.push(`📊 Height measurement shows a ${heightChange.value.toFixed(1)}% variation. This is normal for growing children.`);
      }
    }
    
    if (latestSleep !== null && latestSleep !== undefined) {
      if (sleepChange.isPositive) {
        insights.push(`😴 Sleep patterns have improved with a ${sleepChange.value.toFixed(1)}% increase in daily sleep hours.`);
      } else {
        insights.push(`😴 Sleep hours have decreased by ${sleepChange.value.toFixed(1)}%. Ensure ${selectedChild.name} gets adequate rest for healthy development.`);
      }
    }
    
    if (milestones.length > 0) {
      insights.push(`🏆 ${selectedChild.name} has achieved ${milestones.length} milestone${milestones.length > 1 ? 's' : ''} recently. Keep up the great work!`);
    }
    
    if (insights.length === 0) {
      return `🌟 Start tracking ${selectedChild.name}'s health metrics to see personalized insights. Record weight, height, sleep patterns, and developmental milestones to monitor growth and development.`;
    }
    
    return insights.join(' ');
  }

  // Filter health data based on time period
  const filteredHealthData = healthData.filter(healthEntry => {
    if (!healthEntry.date) return false;
    
    const entryDate = healthEntry.date.toDate();
    const now = new Date();
    
    switch (timePeriod) {
      case '7days':
        return (now.getTime() - entryDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      case '30days':
        return (now.getTime() - entryDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      case '6months':
        return (now.getTime() - entryDate.getTime()) <= 6 * 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  // Prepare chart data
  const weightData = filteredHealthData
    .filter(entry => entry.weight !== undefined)
    .map(entry => Number(entry.weight));
  
  const heightData = filteredHealthData
    .filter(entry => entry.height !== undefined)
    .map(entry => Number(entry.height));
  
  const sleepData = filteredHealthData
    .filter(entry => entry.sleepingHours !== undefined)
    .map(entry => Number(entry.sleepingHours));

  // Prepare labels
  const weightDates = filteredHealthData
    .filter(entry => entry.weight !== undefined)
    .map(entry => entry.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  
  const heightDates = filteredHealthData
    .filter(entry => entry.height !== undefined)
    .map(entry => entry.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  
  const sleepDates = filteredHealthData
    .filter(entry => entry.sleepingHours !== undefined)
    .map(entry => entry.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  // Calculate changes
  const weightChange = weightData.length > 0 ? 
    calculateChange(weightData[weightData.length - 1], weightData[0]) : { value: 0, isPositive: true };
  
  const heightChange = heightData.length > 0 ? 
    calculateChange(heightData[heightData.length - 1], heightData[0]) : { value: 0, isPositive: true };
  
  const sleepChange = sleepData.length > 0 ? 
    calculateChange(sleepData[sleepData.length - 1], sleepData[0]) : { value: 0, isPositive: true };

  // Get latest values
  const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1] : null;
  const latestHeight = heightData.length > 0 ? heightData[heightData.length - 1] : null;
  const latestSleep = sleepData.length > 0 ? sleepData[sleepData.length - 1] : null;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-whimsical relative">
        <WhimsicalBackground />
        <AppHeader />
        <div className="flex flex-1">
          <DashboardSidebar activePage="progress" />
          <div className="flex-1 ml-64">
            <main className="p-6">
              <div className="text-center py-12">
                <span className="text-6xl animate-bounce inline-block">📊</span>
                <p className="text-gray-600 mt-4 text-xl">Loading your child&apos;s progress...</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedChild) {
    return (
      <div className="flex flex-col min-h-screen bg-whimsical relative">
        <WhimsicalBackground />
        <AppHeader />
        <div className="flex flex-1">
          <DashboardSidebar activePage="progress" />
          <div className="flex-1 ml-64">
            <main className="p-6">
              <div className="text-center py-12">
                <span className="text-6xl">👶</span>
                <p className="text-gray-600 mb-4 text-xl">No children registered yet.</p>
                <button className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  ✨ Add Your First Child
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-whimsical relative">
      <WhimsicalBackground />
      <AppHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar activePage="progress" />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Notification Banner */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <span>{notification.message}</span>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="p-6">
          {/* Page Banner Image */}
          <div className="mb-8 rounded-3xl overflow-hidden h-56 relative shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=2000" 
              alt="Growth Tracking" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sky-900/70 to-transparent flex items-center px-8">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <span className="text-4xl">🌱</span>
                  Growth & Development
                </h2>
                <p className="text-sky-100 text-lg">Monitor your child&apos;s journey with detailed health metrics and milestone tracking! 🎯</p>
              </div>
            </div>
          </div>

          {/* Title and Time Period Selector */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span className="text-5xl">👶</span>
                {selectedChild.name}&apos;s Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Here&apos;s a detailed overview of the latest progress! 🌟</p>
            </div>
            <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-lg">
              {[
                { id: '7days', label: '7 Days', emoji: '📅' },
                { id: '30days', label: '30 Days', emoji: '📆' },
                { id: '6months', label: '6 Months', emoji: '🗓️' },
                { id: 'alltime', label: 'All Time', emoji: '⏰' },
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setTimePeriod(period.id as any)}
                  className={`px-5 py-2 rounded-xl font-bold transition-all ${
                    timePeriod === period.id
                      ? 'bg-gradient-to-r from-sky-400 to-mint-400 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{period.emoji}</span>
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Weight Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border-2 border-white hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">⚖️</span>
                <h3 className="text-xl font-bold text-gray-900">Weight</h3>
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-gray-900 mb-1">{latestWeight !== null && latestWeight !== undefined ? `${Number(latestWeight).toFixed(1)} kg` : 'No data'}</p>
                <p
                  className={`text-sm font-bold ${
                    weightChange.isPositive ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {weightChange.isPositive ? '📈 +' : '📉 -'}
                  {weightChange.value.toFixed(1)}% in the last {timePeriod === '7days' ? '7 days' : timePeriod === '30days' ? '30 days' : timePeriod === '6months' ? '6 months' : 'time period'}
                </p>
              </div>
              {/* Weight Line Chart */}
              <div className="h-48 mt-4 relative overflow-hidden">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between py-2 text-xs text-gray-500 w-10">
                  {Array.from({length: 5}).map((_, i) => {
                    const maxValue = weightData.length > 0 ? Math.max(...weightData) : 10;
                    const minValue = weightData.length > 0 ? Math.min(...weightData) : 0;
                    const range = maxValue - minValue || 1;
                    const value = minValue + (range * (4-i) / 4);
                    return (
                      <span key={i} className="pr-1">
                        {value.toFixed(1)}
                      </span>
                    );
                  })}
                </div>
                
                {/* Chart area */}
                <div className="ml-10 mr-2 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-6">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className="border-t border-gray-100"></div>
                    ))}
                  </div>
                  
                  {/* Line graph */}
                  <div className="absolute inset-0 pt-2 pb-6 pl-2 pr-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Data line */}
                      {weightData.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          points={weightData.map((value, index) => {
                            const maxValue = Math.max(...weightData);
                            const minValue = Math.min(...weightData);
                            const range = maxValue - minValue || 1;
                            const x = (index / (weightData.length - 1)) * 100;
                            const y = 100 - (((value - minValue) / range) * 100);
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                      )}
                      
                      {/* Data points */}
                      {weightData.map((value, index) => {
                        const maxValue = Math.max(...weightData);
                        const minValue = Math.min(...weightData);
                        const range = maxValue - minValue || 1;
                        const x = (index / (weightData.length - 1)) * 100;
                        const y = 100 - (((value - minValue) / range) * 100);
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#3b82f6"
                            stroke="#fff"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-2 right-2 flex justify-between text-xs text-gray-500 pb-1">
                    {weightDates.map((date, index) => (
                      <span key={index} className="text-center" style={{ width: `${100/weightDates.length}%` }}>
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Height Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border-2 border-white hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">📏</span>
                <h3 className="text-xl font-bold text-gray-900">Height</h3>
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-gray-900 mb-1">{latestHeight !== null && latestHeight !== undefined ? `${Number(latestHeight).toFixed(1)} cm` : 'No data'}</p>
                <p
                  className={`text-sm font-bold ${
                    heightChange.isPositive ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {heightChange.isPositive ? '📈 +' : '📉 -'}
                  {heightChange.value.toFixed(1)}% in the last {timePeriod === '7days' ? '7 days' : timePeriod === '30days' ? '30 days' : timePeriod === '6months' ? '6 months' : 'time period'}
                </p>
              </div>
              {/* Height Line Chart */}
              <div className="h-48 mt-4 relative overflow-hidden">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between py-2 text-xs text-gray-500 w-10">
                  {Array.from({length: 5}).map((_, i) => {
                    const maxValue = heightData.length > 0 ? Math.max(...heightData) : 100;
                    const minValue = heightData.length > 0 ? Math.min(...heightData) : 0;
                    const range = maxValue - minValue || 1;
                    const value = minValue + (range * (4-i) / 4);
                    return (
                      <span key={i} className="pr-1">
                        {value.toFixed(1)}
                      </span>
                    );
                  })}
                </div>
                
                {/* Chart area */}
                <div className="ml-10 mr-2 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-6">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className="border-t border-gray-100"></div>
                    ))}
                  </div>
                  
                  {/* Line graph */}
                  <div className="absolute inset-0 pt-2 pb-6 pl-2 pr-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Data line */}
                      {heightData.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          points={heightData.map((value, index) => {
                            const maxValue = Math.max(...heightData);
                            const minValue = Math.min(...heightData);
                            const range = maxValue - minValue || 1;
                            const x = (index / (heightData.length - 1)) * 100;
                            const y = 100 - (((value - minValue) / range) * 100);
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                      )}
                      
                      {/* Data points */}
                      {heightData.map((value, index) => {
                        const maxValue = Math.max(...heightData);
                        const minValue = Math.min(...heightData);
                        const range = maxValue - minValue || 1;
                        const x = (index / (heightData.length - 1)) * 100;
                        const y = 100 - (((value - minValue) / range) * 100);
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#10b981"
                            stroke="#fff"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-2 right-2 flex justify-between text-xs text-gray-500 pb-1">
                    {heightDates.map((date, index) => (
                      <span key={index} className="text-center" style={{ width: `${100/heightDates.length}%` }}>
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Avg. Daily Sleep Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border-2 border-white hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">😴</span>
                <h3 className="text-xl font-bold text-gray-900">Daily Sleep</h3>
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-gray-900 mb-1">{latestSleep !== null && latestSleep !== undefined ? `${Number(latestSleep).toFixed(1)} hrs` : 'No data'}</p>
                <p
                  className={`text-sm font-bold ${
                    sleepChange.isPositive ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {sleepChange.isPositive ? '📈 +' : '📉 -'}
                  {sleepChange.value.toFixed(1)}% in the last {timePeriod === '7days' ? '7 days' : timePeriod === '30days' ? '30 days' : timePeriod === '6months' ? '6 months' : 'time period'}
                </p>
              </div>
              {/* Sleep Line Chart */}
              <div className="h-48 mt-4 relative overflow-hidden">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between py-2 text-xs text-gray-500 w-10">
                  {Array.from({length: 5}).map((_, i) => {
                    const maxValue = sleepData.length > 0 ? Math.max(...sleepData) : 12;
                    const minValue = sleepData.length > 0 ? Math.min(...sleepData) : 0;
                    const range = maxValue - minValue || 1;
                    const value = minValue + (range * (4-i) / 4);
                    return (
                      <span key={i} className="pr-1">
                        {value.toFixed(1)}
                      </span>
                    );
                  })}
                </div>
                
                {/* Chart area */}
                <div className="ml-10 mr-2 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-6">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className="border-t border-gray-100"></div>
                    ))}
                  </div>
                  
                  {/* Line graph */}
                  <div className="absolute inset-0 pt-2 pb-6 pl-2 pr-2">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Data line */}
                      {sleepData.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="2"
                          points={sleepData.map((value, index) => {
                            const maxValue = Math.max(...sleepData);
                            const minValue = Math.min(...sleepData);
                            const range = maxValue - minValue || 1;
                            const x = (index / (sleepData.length - 1)) * 100;
                            const y = 100 - (((value - minValue) / range) * 100);
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                      )}
                      
                      {/* Data points */}
                      {sleepData.map((value, index) => {
                        const maxValue = Math.max(...sleepData);
                        const minValue = Math.min(...sleepData);
                        const range = maxValue - minValue || 1;
                        const x = (index / (sleepData.length - 1)) * 100;
                        const y = 100 - (((value - minValue) / range) * 100);
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#8b5cf6"
                            stroke="#fff"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-2 right-2 flex justify-between text-xs text-gray-500 pb-1">
                    {sleepDates.map((date, index) => (
                      <span key={index} className="text-center" style={{ width: `${100/sleepDates.length}%` }}>
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Insights and Recent Milestones Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Summary & Insights Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border-2 border-white hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💡</span>
                <h3 className="text-xl font-bold text-gray-900">Summary & Insights</h3>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                {generateInsights()}
              </p>
              <button
                onClick={openReportModal}
                className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-6 py-3 rounded-full font-bold hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <span>📊</span> View Detailed Report
              </button>
            </div>

            {/* Recent Milestones Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border-2 border-white hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏆</span>
                <h3 className="text-xl font-bold text-gray-900">Recent Milestones</h3>
              </div>
              <div className="space-y-3">
                {milestones.length > 0 ? (
                  milestones.slice(0, 3).map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-mint-50 rounded-2xl">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                        <span className="text-lg">✓</span>
                      </div>
                      <span className="text-gray-700 font-medium">{milestone.title}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-mint-50 rounded-2xl">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                        <span className="text-lg">✓</span>
                      </div>
                      <span className="text-gray-700 font-medium">Started to crawl 🚼</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-mint-50 rounded-2xl">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                        <span className="text-lg">✓</span>
                      </div>
                      <span className="text-gray-700 font-medium">Responds to name 👂</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">○</span>
                      </div>
                      <span className="text-gray-500 font-medium">Pulls up to stand 🦵</span>
                    </div>
                  </>
                )}
              </div>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  openMilestoneModal();
                }}
                className="text-sky-600 hover:text-sky-700 font-bold inline-flex items-center gap-2 mt-4 text-lg cursor-pointer"
              >
                <span>🏆</span> View All Milestones →
              </a>
            </div>
          </div>

          {/* AI Recommendations Section */}
          <div className="mt-8 mb-8">
            <AIRecommendations
              child={selectedChild}
              sdqScores={latestAnalysis?.sdqScores ? {
                emotional: latestAnalysis.sdqScores.emotional,
                conduct: latestAnalysis.sdqScores.conduct,
                hyperactivity: latestAnalysis.sdqScores.hyperactivity,
                peer: latestAnalysis.sdqScores.peer,
                prosocial: latestAnalysis.sdqScores.prosocial,
                totalDifficulty: latestAnalysis.totalDifficulty,
                percentage: latestAnalysis.percentage,
                interpretation: latestAnalysis.interpretation,
              } : undefined}
              predictionAnalysis={latestAnalysis?.aiPrediction ? {
                confidence: latestAnalysis.aiPrediction.confidence,
                prediction: latestAnalysis.aiPrediction.prediction,
                features: latestAnalysis.aiPrediction.features?.facialFeatures,
              } : undefined}
              growthAnalysis={healthData.length > 0 ? {
                height: healthData[healthData.length - 1].height,
                weight: healthData[healthData.length - 1].weight,
                developmentalAge: selectedChild.developmentalAge,
                milestones: milestones.map(m => m.title),
              } : {
                developmentalAge: selectedChild.developmentalAge,
                milestones: milestones.map(m => m.title),
              }}
              onRecommendationGenerated={() => {
                setNotification({ message: '✅ New AI recommendations generated!', type: 'success' })
                setTimeout(() => setNotification(null), 5000)
              }}
            />
          </div>

          {/* Upcoming Events Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">📅</span>
                Upcoming Events
              </h2>
              <button
                onClick={() => openEventModal()}
                className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-6 py-3 rounded-full font-bold hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <span className="text-xl">➕</span>
                Add Event
              </button>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.slice(0, 6).map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border-l-4 border-sky-400 hover:shadow-xl transition-all hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1 text-lg">{event.title}</h3>
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${eventTypeColors[event.type]}`}>
                          <span className="mr-1">{eventTypeEmojis[event.type]}</span>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEventModal(event)}
                          className="text-gray-400 hover:text-sky-500 text-xl"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id!)}
                          className="text-gray-400 hover:text-red-500 text-xl"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    )}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        <span>{event.date.toDate().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⏰</span>
                        <span>{event.date.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 text-center border-2 border-white">
                <span className="text-6xl">📅</span>
                <p className="text-gray-600 mb-4 text-lg">No upcoming events scheduled</p>
                <button
                  onClick={() => openEventModal()}
                  className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-6 py-3 rounded-full font-bold hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <span>➕</span> Add Your First Event
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>

      {/* Detailed Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">📊</span> Detailed Progress Report
                </h3>
                <button 
                  onClick={closeReportModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-sky-100 to-mint-100 p-5 rounded-2xl border-2 border-sky-200">
                  <h4 className="font-bold text-sky-800 mb-2 text-lg flex items-center gap-2">
                    <span>💡</span> Executive Summary
                  </h4>
                  <p className="text-gray-700">{generateInsights()}</p>
                </div>
                
                {/* Health Data Summary */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <span>💪</span> Health Data Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-sky-50 to-mint-50 p-4 rounded-2xl border-2 border-white shadow-md">
                      <p className="text-sm text-gray-600 font-medium">⚖️ Weight</p>
                      <p className="text-2xl font-bold">{latestWeight ? `${latestWeight} kg` : 'No data'}</p>
                      <p className={`text-sm font-bold ${weightChange.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                        {weightChange.isPositive ? '📈 +' : '📉 -'}{weightChange.value.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-mint-50 p-4 rounded-2xl border-2 border-white shadow-md">
                      <p className="text-sm text-gray-600 font-medium">📏 Height</p>
                      <p className="text-2xl font-bold">{latestHeight ? `${latestHeight} cm` : 'No data'}</p>
                      <p className={`text-sm font-bold ${heightChange.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                        {heightChange.isPositive ? '📈 +' : '📉 -'}{heightChange.value.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-mint-50 p-4 rounded-2xl border-2 border-white shadow-md">
                      <p className="text-sm text-gray-600 font-medium">😴 Sleep</p>
                      <p className="text-2xl font-bold">{latestSleep ? `${latestSleep} hrs` : 'No data'}</p>
                      <p className={`text-sm font-bold ${sleepChange.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                        {sleepChange.isPositive ? '📈 +' : '📉 -'}{sleepChange.value.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Milestones */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <span>🏆</span> Recent Milestones
                  </h4>
                  <div className="space-y-2">
                    {milestones.length > 0 ? (
                      milestones.slice(0, 5).map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-mint-50 rounded-2xl border-2 border-white">
                          <div>
                            <p className="font-bold">{milestone.title}</p>
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {milestone.achievedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No milestones recorded yet 📝</p>
                    )}
                  </div>
                </div>
                
                {/* Progress Tracking */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <span>📈</span> Progress Tracking
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-sky-50 to-mint-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">📊 Category</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">⭐ Score</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">📅 Date</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">📝 Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {progressData.length > 0 ? (
                          progressData.slice(0, 5).map((progress) => (
                            <tr key={progress.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{progress.category}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gradient-to-r from-sky-100 to-mint-100 text-sky-800 border border-sky-200">
                                  ⭐ {progress.score}/10
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {progress.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{progress.notes || 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">No progress data recorded yet 📝</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Report Generation Info */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    📅 Report generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

      {/* Event Management Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveEvent}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-3xl">{editingEvent ? '✏️' : '➕'}</span>
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </h3>
                  <button
                    type="button"
                    onClick={closeEventModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Event Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all"
                      placeholder="e.g., Speech Therapy Appointment 🗣️"
                      required
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-bold text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <select
                      id="type"
                      value={eventForm.type}
                      onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all"
                      required
                    >
                      <option value="appointment">🏥 Appointment</option>
                      <option value="assessment">📊 Assessment</option>
                      <option value="therapy">🏃 Therapy Session</option>
                      <option value="milestone">🏆 Milestone</option>
                      <option value="follow_up">🔄 Follow-up</option>
                      <option value="other">📅 Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all"
                      placeholder="Brief description of the event... 📝"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">
                        📅 Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-sm font-bold text-gray-700 mb-2">
                        ⏰ Time *
                      </label>
                      <input
                        type="time"
                        id="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2">
                      📍 Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all"
                      placeholder="e.g., Pediatric Clinic, Room 101 🏥"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeEventModal}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-400 to-mint-400 text-white rounded-2xl hover:from-sky-500 hover:to-mint-500 transition-all font-bold shadow-lg"
                  >
                    {editingEvent ? '✨ Update Event' : '✨ Create Event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Milestones Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">🏆</span> All Milestones
                </h3>
                <button 
                  onClick={closeMilestoneModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {milestones.length > 0 ? (
                  milestones.map((milestone) => (
                    <div 
                      key={milestone.id} 
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-mint-50 rounded-2xl border-2 border-white hover:shadow-lg transition-all"
                    >
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                        <span className="text-2xl">✓</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-1">{milestone.title}</h4>
                            {milestone.description && (
                              <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                            )}
                            {milestone.category && (
                              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-sky-100 to-mint-100 text-sky-800 border border-sky-200">
                                📋 {milestone.category.charAt(0).toUpperCase() + milestone.category.slice(1)}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                              📅 {milestone.achievedAt.toDate().toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-5xl">🏆</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No Milestones Yet!</h4>
                    <p className="text-gray-600">Start tracking your child's amazing achievements! 🌟</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  📊 Total: {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} recorded
                </p>
                <button
                  onClick={closeMilestoneModal}
                  className="px-6 py-3 bg-gradient-to-r from-sky-400 to-mint-400 text-white rounded-2xl hover:from-sky-500 hover:to-mint-500 transition-all font-bold shadow-lg"
                >
                  Close ✨
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
