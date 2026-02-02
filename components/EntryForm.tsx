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

  useEffect(() => {
    if (currentUser) {
      fetchChildren();
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

    try {
      if (formData.entryType === 'health') {
        // Validate health data
        if (!formData.weight && !formData.height && !formData.sleepingHours) {
          showNotification('error', 'Please enter at least one measurement (weight, height, or sleeping hours)');
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
        
        showNotification('success', 'Health data entry added successfully!');
      } else if (formData.entryType === 'milestone') {
        // Validate milestone data
        if (!formData.milestoneTitle) {
          showNotification('error', 'Please enter a milestone title');
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
        
        showNotification('success', 'Milestone entry added successfully!');
        
        // Refresh recent milestones
        const milestones = await getMilestonesByChild(formData.childId);
        setRecentMilestones(milestones.slice(0, 5));
      } else if (formData.entryType === 'progress') {
        // Validate progress data
        if (!formData.progressCategory || !formData.progressScore) {
          showNotification('error', 'Please enter both category and score for progress tracking');
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
        
        showNotification('success', 'Progress entry added successfully!');
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
    } catch (error) {
      console.error('Error adding entry:', error);
      showNotification('error', `Failed to add ${formData.entryType} entry. Please try again.`);
    }
  };

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex flex-1">
          <DashboardSidebar activePage="entry" />
          <div className="flex-1 ml-64">
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar activePage="entry" />
        
        <div className="flex-1 ml-64">
          
          <main className="p-6">
          {notification && (
            <div className={`mb-6 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {notification.message}
            </div>
          )}
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Form Banner Image */}
              <div className="h-40 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&q=80&w=1200" 
                  alt="Medical Entry" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-900/40 flex items-center px-6">
                  <h2 className="text-2xl font-bold text-white">Track Your Child's Development</h2>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap gap-4 mb-4">
                  <button
                    onClick={() => handleTabChange('health')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'health' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    Health Data
                  </button>
                  <button
                    onClick={() => handleTabChange('milestone')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'milestone' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    Milestone
                  </button>
                  <button
                    onClick={() => handleTabChange('progress')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'progress' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    Progress
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeTab === 'health' && 'Record Health Measurements'}
                  {activeTab === 'milestone' && 'Add New Milestone'}
                  {activeTab === 'progress' && 'Track Progress'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Child <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="childId"
                      value={formData.childId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a child</option>
                      {children.map(child => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Health Data Fields */}
                  {activeTab === 'health' && (
                    <>
                      <div>
                        <label htmlFor="weight" className="block text-gray-700 font-medium mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={formData.weight || ''}
                          onChange={handleInputChange}
                          step="0.1"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 12.5"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="height" className="block text-gray-700 font-medium mb-2">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          value={formData.height || ''}
                          onChange={handleInputChange}
                          step="0.1"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 85.2"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="sleepingHours" className="block text-gray-700 font-medium mb-2">
                          Daily Sleeping Hours
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 12.5"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Milestone Fields */}
                  {activeTab === 'milestone' && (
                    <>
                      <div className="md:col-span-2">
                        <label htmlFor="milestoneTitle" className="block text-gray-700 font-medium mb-2">
                          Milestone Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="milestoneTitle"
                          name="milestoneTitle"
                          value={formData.milestoneTitle || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Started walking independently"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="milestoneDescription" className="block text-gray-700 font-medium mb-2">
                          Description
                        </label>
                        <textarea
                          id="milestoneDescription"
                          name="milestoneDescription"
                          value={formData.milestoneDescription || ''}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe the milestone in detail..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="milestoneCategory" className="block text-gray-700 font-medium mb-2">
                          Category
                        </label>
                        <select
                          id="milestoneCategory"
                          name="milestoneCategory"
                          value={formData.milestoneCategory || 'general'}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="physical">Physical</option>
                          <option value="cognitive">Cognitive</option>
                          <option value="social">Social</option>
                          <option value="language">Language</option>
                          <option value="emotional">Emotional</option>
                          <option value="general">General</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {/* Progress Fields */}
                  {activeTab === 'progress' && (
                    <>
                      <div>
                        <label htmlFor="progressCategory" className="block text-gray-700 font-medium mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="progressCategory"
                          name="progressCategory"
                          value={formData.progressCategory || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select category</option>
                          <option value="motor_skills">Motor Skills</option>
                          <option value="language_development">Language Development</option>
                          <option value="social_skills">Social Skills</option>
                          <option value="cognitive_skills">Cognitive Skills</option>
                          <option value="self_care">Self-Care</option>
                          <option value="adaptive_behavior">Adaptive Behavior</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="progressScore" className="block text-gray-700 font-medium mb-2">
                          Score (1-10) <span className="text-red-500">*</span>
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Rate from 1-10"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="md:col-span-2">
                    <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional observations or notes..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                  >
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
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Tips for Adding Entries</h3>
              <ul className="list-disc pl-5 text-blue-700 space-y-1">
                <li>Use milestones to track significant achievements like first steps, words, or skills</li>
                <li>Use progress entries to track ongoing development with numerical scores</li>
                <li>Be specific in descriptions to help track patterns over time</li>
                <li>Regular entries help create more accurate developmental charts</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);
}