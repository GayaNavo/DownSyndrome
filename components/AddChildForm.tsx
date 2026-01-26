'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import AppHeader from './AppHeader';
import { createChildDocument, ChildData, getChildDocument } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

interface FormData {
  name: string;
  dateOfBirth: string;
  developmentalAge: string;
  lastMilestone: string;
  notes: string;
}

export default function AddChildForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dateOfBirth: '',
    developmentalAge: '',
    lastMilestone: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [hasChild, setHasChild] = useState(false);
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);

  useEffect(() => {
    if (currentUser) {
      checkIfChildExists();
    }
  }, [currentUser]);

  const checkIfChildExists = async () => {
    if (!currentUser) return;
    
    try {
      const child = await getChildDocument(currentUser.uid);
      setHasChild(!!child);
    } catch (error) {
      console.error('Error checking if child exists:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      showNotification('error', 'You must be logged in to add a child');
      return;
    }
    
    if (hasChild) {
      showNotification('error', 'You can only manage one child. Please update the existing child instead.');
      return;
    }

    setLoading(true);
    
    try {
      // Convert date of birth to Timestamp
      const dateOfBirthTimestamp = Timestamp.fromDate(new Date(formData.dateOfBirth));
      
      // Prepare child data
      const childData: Omit<ChildData, 'id' | 'createdAt' | 'updatedAt'> = {
        parentId: currentUser.uid,
        name: formData.name,
        age: calculateAge(formData.dateOfBirth),
        dateOfBirth: dateOfBirthTimestamp,
        developmentalAge: formData.developmentalAge || undefined,
        lastMilestone: formData.lastMilestone || undefined,
      };

      // Create child document in Firestore
      await createChildDocument(childData);
      
      showNotification('success', 'Child added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        dateOfBirth: '',
        developmentalAge: '',
        lastMilestone: '',
        notes: '',
      });
      
      // Update hasChild state
      setHasChild(true);
    } catch (error) {
      console.error('Error adding child:', error);
      showNotification('error', 'Failed to add child. Please try again.');
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar activePage="children" />
        
        <div className="flex-1 ml-64">
          
          <main className="p-6">
          {notification && (
            <div className={`mb-6 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {notification.message}
            </div>
          )}
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Child Information</h2>
              
              {!hasChild ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                        Child's Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter child's full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-gray-700 font-medium mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.dateOfBirth && (
                        <p className="text-sm text-gray-500 mt-1">
                          Calculated age: {calculateAge(formData.dateOfBirth)} years
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="developmentalAge" className="block text-gray-700 font-medium mb-2">
                        Developmental Age
                      </label>
                      <input
                        type="text"
                        id="developmentalAge"
                        name="developmentalAge"
                        value={formData.developmentalAge}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2 years 3 months"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="lastMilestone" className="block text-gray-700 font-medium mb-2">
                        Last Achieved Milestone
                      </label>
                      <input
                        type="text"
                        id="lastMilestone"
                        name="lastMilestone"
                        value={formData.lastMilestone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Walking independently"
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
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional information about your child..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        loading 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white transition-colors`}
                    >
                      {loading ? 'Adding Child...' : 'Add Child'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          name: '',
                          dateOfBirth: '',
                          developmentalAge: '',
                          lastMilestone: '',
                          notes: '',
                        });
                      }}
                      className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Child Already Registered</h3>
                  <p className="text-gray-600 mb-6">You can only manage one child at a time. Please visit the dashboard to view and update your child's information.</p>
                  <a
                    href="/dashboard"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                </div>
              )}
            </div>
            
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Tips for Adding Your Child</h3>
              <ul className="list-disc pl-5 text-blue-700 space-y-1">
                <li>Provide an accurate date of birth to track developmental milestones properly</li>
                <li>Include any known developmental age if assessed by a professional</li>
                <li>Record the last milestone achieved to establish a baseline for tracking</li>
                <li>Add any relevant notes that might help with care coordination</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);
}