'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import AppHeader from './AppHeader';
import WhimsicalBackground from './WhimsicalBackground';
import { createChildDocument, ChildData, getChildDocument, updateChildDocument } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

interface FormData {
  name: string;
  dateOfBirth: string;
  age?: number;
  developmentalAge: string;
  lastMilestone: string;
  notes: string;
}

export default function AddChildForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dateOfBirth: '',
    age: undefined,
    developmentalAge: '',
    lastMilestone: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [hasChild, setHasChild] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [childId, setChildId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);
  const [maxDate, setMaxDate] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      checkIfChildExists();
      // Set max date to today for date picker validation
      const today = new Date().toISOString().split('T')[0];
      setMaxDate(today);
    }
  }, [currentUser]);

  const checkIfChildExists = async () => {
    if (!currentUser) return;
    
    try {
      const child = await getChildDocument(currentUser.uid);
      if (child) {
        setHasChild(true);
        setChildId(child.id || currentUser.uid);
        // Pre-fill form with existing data
        setFormData({
          name: child.name,
          dateOfBirth: child.dateOfBirth.toDate().toISOString().split('T')[0],
          age: child.age,
          developmentalAge: child.developmentalAge || '',
          lastMilestone: child.lastMilestone || '',
          notes: '',
        });
        setIsEditMode(true);
      }
    } catch (error: any) {
      console.error('Error checking if child exists:', error);
      showNotification(
        'error',
        `❌ Failed to Load Data: ${error.message || 'Unable to check existing child information'}`
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If changing date of birth, calculate and update age
    if (name === 'dateOfBirth' && value) {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({ ...prev, [name]: value, age: calculatedAge }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      showNotification('error', '❌ Authentication Error: You must be logged in to add a child');
      return;
    }
    
    if (hasChild && !isEditMode) {
      showNotification('error', '⚠️ Limit Reached: You can only manage one child. Please update the existing child instead.');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      showNotification('error', '⚠️ Validation Error: Child\'s name is required');
      return;
    }
    
    if (formData.name.trim().length < 2) {
      showNotification('error', '⚠️ Validation Error: Child\'s name must be at least 2 characters long');
      return;
    }
    
    if (!formData.dateOfBirth) {
      showNotification('error', '⚠️ Validation Error: Date of birth is required');
      return;
    }

    // Validate date is not in the future
    const selectedDate = new Date(formData.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      showNotification('error', '⚠️ Invalid Date: Date of birth cannot be in the future. Please select a valid date.');
      return;
    }
    
    // Validate notes length
    if (formData.notes && formData.notes.length > 500) {
      showNotification('error', '⚠️ Validation Error: Special notes cannot exceed 500 characters. Please shorten your message.');
      return;
    }

    setLoading(true);
    
    try {
      // Convert date of birth to Timestamp
      const dateOfBirthTimestamp = Timestamp.fromDate(new Date(formData.dateOfBirth));
      
      if (isEditMode && childId) {
        // UPDATE operation
        const childData: Partial<ChildData> = {
          name: formData.name,
          age: formData.age || calculateAge(formData.dateOfBirth),
          dateOfBirth: dateOfBirthTimestamp,
          developmentalAge: formData.developmentalAge || undefined,
          lastMilestone: formData.lastMilestone || undefined,
        };

        await updateChildDocument(childId, childData);
        showNotification('success', '✅ Success! Child profile has been updated successfully! 🎉');
      } else {
        // CREATE operation
        const childData: Omit<ChildData, 'id' | 'createdAt' | 'updatedAt'> = {
          parentId: currentUser.uid,
          name: formData.name,
          age: formData.age || calculateAge(formData.dateOfBirth),
          dateOfBirth: dateOfBirthTimestamp,
          developmentalAge: formData.developmentalAge || undefined,
          lastMilestone: formData.lastMilestone || undefined,
        };

        await createChildDocument(childData);
        showNotification('success', '✅ Success! Child profile has been created successfully! Welcome to the family! 🎉');
        
        // Reset form after creation
        setFormData({
          name: '',
          dateOfBirth: '',
          age: undefined,
          developmentalAge: '',
          lastMilestone: '',
          notes: '',
        });
        
        setHasChild(true);
        setIsEditMode(true);
        setChildId(currentUser.uid);
      }
    } catch (error: any) {
      console.error('Error saving child:', error);
      showNotification(
        'error', 
        `❌ Failed to Save: ${error.message || 'An unexpected error occurred. Please try again.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust if the birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  };

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-whimsical relative">
      <WhimsicalBackground />
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar activePage="children" />
        
        <div className="flex-1 ml-64">
          
          <main className="p-6">
          {notification && (
            <div className={`mb-6 p-4 rounded-2xl shadow-lg animate-bounce ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-mint-100 to-sky-100 text-green-800 border-2 border-mint-200' 
                : notification.type === 'info'
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-200'
                  : 'bg-gradient-to-r from-red-100 to-coral-100 text-red-800 border-2 border-red-200'
            }`}>
              <span className="text-xl mr-2">
                {notification.type === 'success' 
                  ? '🎉' 
                  : notification.type === 'info'
                    ? 'ℹ️'
                    : '⚠️'}
              </span>
              {notification.message}
            </div>
          )}
          
          <div className="max-w-3xl mx-auto">
            {/* Fun Header */}
            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-sky-200 to-mint-200 mb-4 animate-float">
                <span className="text-5xl">👶</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 via-mint-500 to-lavender-500 bg-clip-text text-transparent mb-2">
                {isEditMode ? 'Update Your Little Star! ⭐' : 'Add Your Little Star! ⭐'}
              </h1>
              <p className="text-gray-600 text-lg">
                {isEditMode 
                  ? "Update your child's information below! ✏️" 
                  : "Let's create a special profile for your amazing child!"}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-white">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-3xl">📝</span> Child Information
              </h2>
              
              {!hasChild ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                        <span>👤</span> Child&apos;s Full Name <span className="text-coral-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        placeholder="Enter your child's magical name ✨"
                      />
                      {formData.name && formData.name.trim().length < 2 && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <span>⚠️</span> Name must be at least 2 characters long
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                        <span>🎂</span> Date of Birth <span className="text-coral-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        max={maxDate}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                      />
                      {!formData.dateOfBirth && (
                        <p className="text-gray-500 text-xs mt-1">
                          📅 Required - Your child's birth date
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="age" className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                        <span>🎈</span> Current Age
                      </label>
                      <input
                        type="text"
                        id="age"
                        name="age"
                        value={formData.age !== undefined ? `${formData.age} years old` : 'Enter date of birth first'}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-600 cursor-not-allowed text-lg"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="developmentalAge" className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                        <span>📏</span> Developmental Age <span className="text-gray-400 text-sm">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="developmentalAge"
                        name="developmentalAge"
                        value={formData.developmentalAge}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        placeholder="e.g., 2 years 3 months 🌟"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        💡 If different from chronological age
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="lastMilestone" className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                        <span>🏆</span> Last Achieved Milestone <span className="text-gray-400 text-sm">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="lastMilestone"
                        name="lastMilestone"
                        value={formData.lastMilestone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        placeholder="e.g., First steps, First words, High five! 🎉"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        🌟 Recent achievements your child has reached
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="notes" className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                        <span>💕</span> Special Notes <span className="text-gray-400 text-sm">(Optional)</span>
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        placeholder="Tell us something special about your child... 💕"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        📝 Any additional information you'd like to share (max 500 characters)
                      </p>
                      {formData.notes && formData.notes.length > 500 && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <span>⚠️</span> Notes exceed 500 characters ({formData.notes.length}/500)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transform transition-all hover:scale-105 ${
                        loading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : isEditMode
                            ? 'bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white'
                            : 'bg-gradient-to-r from-sky-400 to-mint-400 hover:from-sky-500 hover:to-mint-500 text-white'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span>{isEditMode ? '✏️' : '✨'}</span> {isEditMode ? 'Update My Child!' : 'Add My Child!'}
                        </span>
                      )}
                    </button>
                    
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => {
                          // Reset to view mode without clearing data
                          showNotification('success', '✅ Edit mode cancelled. Current data preserved.');
                        }}
                        className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-50 transition-all hover:border-gray-400"
                      >
                        ❌ Cancel Edit
                      </button>
                    )}
                    
                    {!isEditMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            name: '',
                            dateOfBirth: '',
                            age: undefined,
                            developmentalAge: '',
                            lastMilestone: '',
                            notes: '',
                          });
                          showNotification('info', '🧹 Form cleared! Ready to start fresh.');
                        }}
                        className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-50 transition-all hover:border-gray-400"
                      >
                        🔄 Clear Form
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-sky-200 to-mint-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <span className="text-5xl">🌟</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Child Already Registered! 🎉</h3>
                  <p className="text-gray-600 mb-6 text-lg">You can only manage one child at a time. Visit the dashboard to see your little star&apos;s progress!</p>
                  <a
                    href="/dashboard"
                    className="inline-block bg-gradient-to-r from-sky-400 to-mint-400 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🚀 Go to Dashboard
                  </a>
                </div>
              )}
            </div>
            
            {/* Tips Card */}
            <div className="mt-8 bg-gradient-to-r from-lavender-100 to-sky-100 border-2 border-lavender-200 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-lavender-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> Helpful Tips for Parents
              </h3>
              <ul className="space-y-3 text-lavender-700">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span>Provide an accurate date of birth to track developmental milestones properly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">📊</span>
                  <span>Include any known developmental age if assessed by a professional</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🏅</span>
                  <span>Record the last milestone achieved to establish a baseline for tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">💝</span>
                  <span>Add any relevant notes that might help with care coordination</span>
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
