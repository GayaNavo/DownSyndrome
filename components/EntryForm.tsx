'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import AppHeader from './AppHeader';
import { getChildDocument, createMilestone, createProgressEntry, ChildData, createHealthDataEntry } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

interface FormData {
  childId: string;
  weight?: number;
  height?: number;
  sleepingHours?: number;
  date: string;
  notes: string;
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
  });
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);

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
    const numericFields = ['weight', 'height', 'sleepingHours'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value ? Number(value) : undefined) : value
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

    if (!formData.weight && !formData.height && !formData.sleepingHours) {
      showNotification('error', 'Please enter at least one measurement (weight, height, or sleeping hours)');
      return;
    }

    try {
      // For now, we'll store this data in a new collection called 'healthData'
      // This will be used to update charts on the progress page
      await createHealthDataEntry({
        childId: formData.childId,
        weight: formData.weight,
        height: formData.height,
        sleepingHours: formData.sleepingHours,
        date: Timestamp.fromDate(new Date(formData.date)),
        notes: formData.notes,
      });
      
      showNotification('success', 'Health data entry added successfully!');
      
      // Reset form
      setFormData({
        childId: formData.childId,
        weight: undefined,
        height: undefined,
        sleepingHours: undefined,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (error) {
      console.error('Error adding health data entry:', error);
      showNotification('error', 'Failed to add health data entry. Please try again.');
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
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Entry Details</h2>
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
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Health Data Entry
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