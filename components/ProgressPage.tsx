'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader from './DashboardHeader'
import { getChildrenByParent, ChildData, getMilestonesByChild, MilestoneData, getHealthDataByChild, HealthData } from '@/lib/firebase/firestore'

export default function ProgressPage() {
  const { currentUser } = useAuth()
  const [children, setChildren] = useState<ChildData[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null)
  const [milestones, setMilestones] = useState<MilestoneData[]>([])
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [timePeriod, setTimePeriod] = useState<'7days' | '30days' | '6months' | 'alltime'>('30days')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      getChildrenByParent(currentUser.uid)
        .then((childrenData) => {
          setChildren(childrenData)
          if (childrenData.length > 0) {
            setSelectedChild(childrenData[0])
            // Fetch milestones and health data for the first child
            if (childrenData[0].id) {
              Promise.all([
                getMilestonesByChild(childrenData[0].id),
                getHealthDataByChild(childrenData[0].id)
              ]).then(([milestonesData, healthData]) => {
                setMilestones(milestonesData);
                setHealthData(healthData);
              });
            }
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching children:', error)
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
        getHealthDataByChild(selectedChild.id)
      ]).then(([milestonesData, healthData]) => {
        setMilestones(milestonesData);
        setHealthData(healthData);
      });
    }
  }, [selectedChild])

  // Extract data from healthData
  const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
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
    .map(entry => entry.weight as number);
  
  const heightData = filteredHealthData
    .filter(entry => entry.height !== undefined)
    .map(entry => entry.height as number);
  
  const sleepData = filteredHealthData
    .filter(entry => entry.sleepingHours !== undefined)
    .map(entry => entry.sleepingHours as number);

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
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar activePage="progress" />
        <div className="flex-1 ml-64">
          <DashboardHeader title="Progress" />
          <main className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!selectedChild) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar activePage="progress" />
        <div className="flex-1 ml-64">
          <DashboardHeader title="Progress" />
          <main className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No children registered yet.</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                + Add Your First Child
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar activePage="progress" />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <DashboardHeader title={`${selectedChild.name}'s Dashboard`} />

        {/* Main Content Area */}
        <main className="p-6">
          {/* Title and Time Period Selector */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedChild.name}'s Dashboard</h1>
              <p className="text-gray-600">Here's a detailed overview of the latest progress.</p>
            </div>
            <div className="flex gap-2">
              {[
                { id: '7days', label: '7 Days' },
                { id: '30days', label: '30 Days' },
                { id: '6months', label: '6 Months' },
                { id: 'alltime', label: 'All Time' },
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setTimePeriod(period.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timePeriod === period.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Weight Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight</h3>
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900 mb-1">{latestWeight !== null && latestWeight !== undefined ? `${latestWeight} kg` : 'No data'}</p>
                <p
                  className={`text-sm font-medium ${
                    weightChange.isPositive ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {weightChange.isPositive ? '+' : '-'}
                  {weightChange.value.toFixed(1)}% in the last {timePeriod === '7days' ? '7 days' : timePeriod === '30days' ? '30 days' : timePeriod === '6months' ? '6 months' : 'time period'}
                </p>
              </div>
              {/* Line Chart */}
              <div className="h-32 flex items-end justify-between gap-2">
                {weightData.map((value, index) => {
                  const maxValue = Math.max(...weightData)
                  const minValue = Math.min(...weightData)
                  const range = maxValue - minValue || 1
                  const height = ((value - minValue) / range) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-end justify-center mb-1">
                        <div
                          className="w-full bg-blue-600 rounded-t"
                          style={{ height: `${Math.max(height, 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{weightDates[index]}</span>
                      <span className="text-xs text-gray-700 font-medium mt-1">{value !== null && value !== undefined ? `${value} kg` : ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Height Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Height</h3>
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900 mb-1">{latestHeight !== null && latestHeight !== undefined ? `${latestHeight} cm` : 'No data'}</p>
                <p
                  className={`text-sm font-medium ${
                    heightChange.isPositive ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {heightChange.isPositive ? '+' : '-'}
                  {heightChange.value.toFixed(1)}% in the last {timePeriod === '7days' ? '7 days' : timePeriod === '30days' ? '30 days' : timePeriod === '6months' ? '6 months' : 'time period'}
                </p>
              </div>
              {/* Line Chart */}
              <div className="h-32 flex items-end justify-between gap-2">
                {heightData.map((value, index) => {
                  const maxValue = Math.max(...heightData)
                  const minValue = Math.min(...heightData)
                  const range = maxValue - minValue || 1
                  const height = ((value - minValue) / range) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-end justify-center mb-1">
                        <div
                          className="w-full bg-blue-600 rounded-t"
                          style={{ height: `${Math.max(height, 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{heightDates[index]}</span>
                      <span className="text-xs text-gray-700 font-medium mt-1">{value !== null && value !== undefined ? `${value} cm` : ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Avg. Daily Sleep Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg. Daily Sleep</h3>
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900 mb-1">{latestSleep !== null && latestSleep !== undefined ? `${latestSleep.toFixed(1)} hrs` : 'No data'}</p>
                <p
                  className={`text-sm font-medium ${
                    sleepChange.isPositive ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {sleepChange.isPositive ? '+' : '-'}
                  {sleepChange.value.toFixed(1)}% in the last {timePeriod === '7days' ? '7 days' : timePeriod === '30days' ? '30 days' : timePeriod === '6months' ? '6 months' : 'time period'}
                </p>
              </div>
              {/* Bar Chart */}
              <div className="h-32 flex items-end justify-between gap-1">
                {sleepData.map((value, index) => {
                  const maxValue = Math.max(...sleepData)
                  const minValue = Math.min(...sleepData)
                  const range = maxValue - minValue || 1
                  const height = ((value - minValue) / range) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-end justify-center mb-1">
                        <div
                          className="w-full bg-blue-600 rounded-t"
                          style={{ height: `${Math.max(height, 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{sleepDates[index]}</span>
                      <span className="text-xs text-gray-700 font-medium mt-1">{value !== null && value !== undefined ? `${value.toFixed(1)}h` : ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Summary & Insights and Recent Milestones Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary & Insights Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Summary & Insights</h3>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Consistent growth has been observed this month. Weight and height are tracking along the 50th
                percentile. Sleep patterns show a slight decrease over the last week, which is worth monitoring.
                Continue to encourage regular nap times.
              </p>
              <a
                href="/dashboard/progress/report"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                View Detailed Report
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Recent Milestones Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Recent Milestones</h3>
              </div>
              <div className="space-y-3">
                {milestones.length > 0 ? (
                  milestones.slice(0, 3).map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">{milestone.title}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">Started to crawl</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">Responds to name</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0"></div>
                      <span className="text-gray-700">Pulls up to stand</span>
                    </div>
                  </>
                )}
              </div>
              <a
                href="/dashboard/milestones"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 mt-4"
              >
                View All Milestones
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

