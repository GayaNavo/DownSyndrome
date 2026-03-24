'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import AppHeader from './AppHeader';
import { getChildDocument, createMilestone, createProgressEntry, ChildData, createHealthDataEntry, getMilestonesByChild, MilestoneData } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

interface FormData {
  childId: string;
  weight?: number;
  height?: number;
  sleepingHours?: number;
  date: string;
  notes: string;
  // Milestone-specific fields
  milestoneTitle?: string;
  milestoneDescription?: string;
  milestoneCategory?: string;
  // Progress-specific fields
  progressCategory?: string;
  progressScore?: number;
  entryType: 'health' | 'milestone' | 'progress';
}

const tabEmojis = {
  health: '💪',
  milestone: '🏆',
  progress: '📈'
}

const tabColors = {
  health: 'from-sky-400 to-mint-400',
  milestone: 'from-sunshine-400 to-coral-400',
  progress: 'from-lavender-400 to-sky-400'
}

export default function EntryForm() {
  const { currentUser } = useAuth();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    childId: '',
    weight: undefined,
    height: undefined,
    sleepingHours: undefined,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    milestoneTitle: '',
    milestoneDescription: '',
    milestoneCategory: 'general',
    progressCategory: '',
    progressScore: undefined,
    entryType: 'health',
  });
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'health' | 'milestone' | 'progress'>('health');
  const [recentMilestones, setRecentMilestones] = useState<MilestoneData[]>([]);
  const [maxDate, setMaxDate] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      fetchChildren();
      // Set max date to today for date picker validation
      const today = new Date().toISOString().split('T')[0];
      setMaxDate(today);
    }
  }, [currentUser]);

  const fetchChildren = async () => {
    if (!currentUser) return;
    
    try {
      const childData = await getChildDocument(currentUser.uid);
      if (childData) {
        setChildren([childData]);
        setFormData(prev => ({
          ...prev,
          childId: childData.id || currentUser.uid
        }));
        
        // Fetch recent milestones for this child
        const milestones = await getMilestonesByChild(childData.id || currentUser.uid);
        setRecentMilestones(milestones.slice(0, 5)); // Show last 5 milestones
      } else {
        setChildren([]);
      }
    } catch (error) {
      console.error('Error fetching child:', error);
      showNotification('error', 'Failed to load child information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Numeric fields that should be converted to Number
    const numericFields = ['weight', 'height', 'sleepingHours', 'progressScore'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value ? Number(value) : undefined) : value
    }));
  };

  const handleTabChange = (tab: 'health' | 'milestone' | 'progress') => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      entryType: tab
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      showNotification('error', 'You must be logged in to add an entry');
      return;
    }

    if (!formData.childId) {
      showNotification('error', 'Please select a child');
      return;
    }

    // Validate date is not in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      showNotification('error', '⚠️ Invalid Date: Date cannot be in the future. Please select a valid date.');
      return;
    }

    try {
      if (formData.entryType === 'health') {
        // Validate health data
        if (!formData.weight && !formData.height && !formData.sleepingHours) {
          showNotification('error', '⚠️ Validation Error: Please enter at least one measurement (weight, height, or sleeping hours)');
          return;
        }
        
        // Add health data entry
        await createHealthDataEntry({
          childId: formData.childId,
          weight: formData.weight,
          height: formData.height,
          sleepingHours: formData.sleepingHours,
          date: Timestamp.fromDate(new Date(formData.date)),
          notes: formData.notes,
        });
        
        // Build success message based on what was entered
        let measurements = [];
        if (formData.weight) measurements.push(`weight ${formData.weight}kg`);
        if (formData.height) measurements.push(`height ${formData.height}cm`);
        if (formData.sleepingHours) measurements.push(`${formData.sleepingHours}h sleep`);
        
        showNotification('success', `✅ Health data recorded successfully! Tracked: ${measurements.join(', ')}. Great job monitoring your child's health! 💪`);
      } else if (formData.entryType === 'milestone') {
        // Validate milestone data
        if (!formData.milestoneTitle) {
          showNotification('error', '⚠️ Validation Error: Please enter a milestone title');
          return;
        }
        
        // Add milestone entry
        await createMilestone({
          childId: formData.childId,
          title: formData.milestoneTitle,
          description: formData.milestoneDescription || '',
          category: formData.milestoneCategory || 'general',
          achievedAt: Timestamp.fromDate(new Date(formData.date)),
        });
        
        showNotification('success', `🏆 Amazing! "${formData.milestoneTitle}" has been recorded! Your little star is shining bright! ⭐`);
        
        // Refresh recent milestones
        const milestones = await getMilestonesByChild(formData.childId);
        setRecentMilestones(milestones.slice(0, 5));
      } else if (formData.entryType === 'progress') {
        // Validate progress data
        if (!formData.progressCategory || !formData.progressScore) {
          showNotification('error', '⚠️ Validation Error: Please enter both category and score for progress tracking');
          return;
        }
        
        // Add progress entry
        await createProgressEntry({
          childId: formData.childId,
          category: formData.progressCategory,
          score: formData.progressScore,
          date: Timestamp.fromDate(new Date(formData.date)),
          notes: formData.notes,
        });
        
        const scoreEmoji = formData.progressScore >= 8 ? '🌟' : formData.progressScore >= 5 ? '⭐' : '💪';
        showNotification('success', `📈 Progress tracked! ${formData.progressCategory.replace('_', ' ')}: ${formData.progressScore}/10 ${scoreEmoji}. Keep encouraging your champion! 🎯`);
      }
      
      // Reset form
      setFormData({
        childId: formData.childId,
        weight: undefined,
        height: undefined,
        sleepingHours: undefined,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        milestoneTitle: '',
        milestoneDescription: '',
        milestoneCategory: 'general',
        progressCategory: '',
        progressScore: undefined,
        entryType: activeTab,
      });
    } catch (error: any) {
      console.error('Error adding entry:', error);
      
      // Provide specific error messages based on the type of entry
      const entryTypeName = formData.entryType === 'health' ? 'health data' : 
                           formData.entryType === 'milestone' ? 'milestone' : 'progress';
      
      let errorMessage = '❌ Failed to save entry. Please check your connection and try again.';
      
      if (error?.code === 'permission-denied') {
        errorMessage = '❌ Permission denied. Please make sure you have access to add entries for this child.';
      } else if (error?.message?.includes('network')) {
        errorMessage = '❌ Network error. Please check your internet connection and try again.';
      } else if (error?.message?.includes('timeout')) {
        errorMessage = '❌ Request timed out. Please try again.';
      }
      
      showNotification('error', `${errorMessage} If the problem persists, please contact support.`);
    }
  };

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-50 via-white to-mint-50">
        <AppHeader />
        <div className="flex flex-1">
          <DashboardSidebar activePage="entry" />
          <div className="flex-1 ml-64">
            <div className="p-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 text-center border-2 border-white">
                <span className="text-5xl animate-bounce inline-block">⏳</span>
                <p className="text-gray-500 mt-4 text-lg">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-50 via-white to-mint-50">
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar activePage="entry" />
        
        <div className="flex-1 ml-64">
          
          <main className="p-6">
          {notification && (
            <div className={`mb-6 p-4 rounded-2xl shadow-lg animate-bounce ${notification.type === 'success' ? 'bg-gradient-to-r from-mint-100 to-sky-100 text-green-800 border-2 border-mint-200' : 'bg-gradient-to-r from-red-100 to-coral-100 text-red-800 border-2 border-red-200'}`}>
              <span className="text-xl mr-2">{notification.type === 'success' ? '🎉' : '⚠️'}</span>
              {notification.message}
            </div>
          )}
          
          <div className="max-w-3xl mx-auto">
            {/* Fun Header */}
            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-sky-200 to-mint-200 mb-4 animate-float">
                <span className="text-5xl">📝</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 via-mint-500 to-lavender-500 bg-clip-text text-transparent mb-2">
                Track Your Child&apos;s Journey! 🌟
              </h1>
              <p className="text-gray-600 text-lg">Record every amazing moment of growth and development!</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border-2 border-white">
              {/* Form Banner Image */}
              <div className="h-48 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&q=80&w=1200" 
                  alt="Medical Entry" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-sky-900/60 to-transparent flex items-center px-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      <span className="text-4xl">📊</span>
                      Track Your Child&apos;s Development
                    </h2>
                    <p className="text-sky-100 mt-2 text-lg">Every milestone matters! 🎯</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-wrap gap-3 mb-6">
                  {(['health', 'milestone', 'progress'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-md ${
                        activeTab === tab 
                          ? `bg-gradient-to-r ${tabColors[tab]} text-white shadow-lg` 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <span className="mr-2">{tabEmojis[tab]}</span>
                      {tab === 'health' ? 'Health Data' : tab === 'milestone' ? 'Milestones' : 'Progress'}
                    </button>
                  ))}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>{tabEmojis[activeTab]}</span>
                  {activeTab === 'health' && 'Record Health Measurements 💪'}
                  {activeTab === 'milestone' && 'Add New Milestone 🏆'}
                  {activeTab === 'progress' && 'Track Progress 📈'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                      <span>👶</span> Child <span className="text-coral-500">*</span>
                    </label>
                    <select
                      name="childId"
                      value={formData.childId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                    >
                      <option value="">Select a child 👶</option>
                      {children.map(child => (
                        <option key={child.id} value={child.id}>
                          {child.name} ⭐
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Health Data Fields */}
                  {activeTab === 'health' && (
                    <>
                      <div>
                        <label htmlFor="weight" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                          <span>⚖️</span> Weight (kg)
                        </label>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={formData.weight || ''}
                          onChange={handleInputChange}
                          step="0.1"
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                          placeholder="e.g., 12.5 🎯"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="height" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                          <span>📏</span> Height (cm)
                        </label>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          value={formData.height || ''}
                          onChange={handleInputChange}
                          step="0.1"
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                          placeholder="e.g., 85.2 📊"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="sleepingHours" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                          <span>😴</span> Daily Sleeping Hours
                        </label>
                        <input
                          type="number"
                          id="sleepingHours"
                          name="sleepingHours"
                          value={formData.sleepingHours || ''}
                          onChange={handleInputChange}
                          step="0.5"
                          min="0"
                          max="24"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                          placeholder="e.g., 12.5 💤"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Milestone Fields */}
                  {activeTab === 'milestone' && (
                    <>
                      <div className="md:col-span-2">
                        <label htmlFor="milestoneTitle" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                          <span>🏆</span> Milestone Title <span className="text-coral-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="milestoneTitle"
                          name="milestoneTitle"
                          value={formData.milestoneTitle || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                          placeholder="e.g., Started walking independently! 🚶‍♂️"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="milestoneDescription" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                          <span>📝</span> Description
                        </label>
                        <textarea
                          id="milestoneDescription"
                          name="milestoneDescription"
                          value={formData.milestoneDescription || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                          placeholder="Describe this amazing achievement... 🌟"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="milestoneCategory" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                          <span>🏷️</span> Category
                        </label>
                        <select
                          id="milestoneCategory"
                          name="milestoneCategory"
                          value={formData.milestoneCategory || 'general'}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        >
                          <option value="physical">💪 Physical</option>
                          <option value="cognitive">🧠 Cognitive</option>
                          <option value="social">👥 Social</option>
                          <option value="language">🗣️ Language</option>
                          <option value="emotional">💝 Emotional</option>
                          <option value="general">🌟 General</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {/* Progress Fields */}
                  {activeTab === 'progress' && (
                    <>
                      <div>
                        <label htmlFor="progressCategory" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                          <span>📊</span> Category <span className="text-coral-500">*</span>
                        </label>
                        <select
                          id="progressCategory"
                          name="progressCategory"
                          value={formData.progressCategory || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        >
                          <option value="">Select category 📋</option>
                          <option value="motor_skills">🤸 Motor Skills</option>
                          <option value="language_development">🗣️ Language Development</option>
                          <option value="social_skills">👥 Social Skills</option>
                          <option value="cognitive_skills">🧠 Cognitive Skills</option>
                          <option value="self_care">🧼 Self-Care</option>
                          <option value="adaptive_behavior">🎯 Adaptive Behavior</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="progressScore" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                          <span>⭐</span> Score (1-10) <span className="text-coral-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="progressScore"
                          name="progressScore"
                          value={formData.progressScore || ''}
                          onChange={handleInputChange}
                          min="1"
                          max="10"
                          step="0.5"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                          placeholder="Rate from 1-10 ⭐"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="md:col-span-2">
                    <label htmlFor="date" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                      <span>📅</span> Date <span className="text-coral-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      max={maxDate}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                    />
                    {!formData.date && (
                      <p className="text-gray-500 text-xs mt-1">
                        📅 Required - Select the date for this entry
                      </p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg">
                      <span>💭</span> Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                      placeholder="Any additional observations or notes... 🌈"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    <span className="text-xl">✨</span>
                    Add {activeTab === 'health' ? 'Health Data' : activeTab === 'milestone' ? 'Milestone' : 'Progress'} Entry
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        childId: formData.childId,
                        weight: undefined,
                        height: undefined,
                        sleepingHours: undefined,
                        date: new Date().toISOString().split('T')[0],
                        notes: '',
                        milestoneTitle: '',
                        milestoneDescription: '',
                        milestoneCategory: 'general',
                        progressCategory: '',
                        progressScore: undefined,
                        entryType: activeTab,
                      });
                    }}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-50 transition-all hover:border-gray-400 flex items-center gap-2"
                  >
                    <span className="text-xl">🔄</span> Clear Form
                  </button>
                </div>
              </form>
            </div>
            
            {/* Tips Card */}
            <div className="mt-8 bg-gradient-to-r from-lavender-100 to-sky-100 border-2 border-lavender-200 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-lavender-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> Tips for Adding Entries
              </h3>
              <ul className="space-y-3 text-lavender-700">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🏆</span>
                  <span>Use milestones to track significant achievements like first steps, words, or skills</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">📈</span>
                  <span>Use progress entries to track ongoing development with numerical scores</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span>Be specific in descriptions to help track patterns over time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">⭐</span>
                  <span>Regular entries help create more accurate developmental charts</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);
}
