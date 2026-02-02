'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import AppHeader from './AppHeader';
import { getUserDocument, updateUserDocument, UserData } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export default function ParentProfile() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
  });
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    if (currentUser) {
      try {
        setLoading(true);
        const userData = await getUserDocument(currentUser.uid);
        if (userData) {
          setUserProfile(userData);
          setFormData({
            displayName: userData.displayName || '',
            email: userData.email || '',
            phone: userData.phone || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        showNotification('error', 'Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      try {
        await updateUserDocument(currentUser.uid, {
          displayName: formData.displayName,
          phone: formData.phone,
        });
        setUserProfile(prev => prev ? {
          ...prev,
          displayName: formData.displayName,
          phone: formData.phone,
        } : null);
        setEditing(false);
        showNotification('success', 'Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('error', 'Failed to update profile');
      }
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
          <DashboardSidebar activePage="profile" />
          <div className="flex-1 ml-64">
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">Loading profile...</p>
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
        <DashboardSidebar activePage="profile" />
        
        <div className="flex-1 ml-64">
          
          <main className="p-6">
          {notification && (
            <div className={`mb-6 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {notification.message}
            </div>
          )}
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{userProfile?.displayName || 'Parent Profile'}</h1>
                    <p className="text-blue-200 mt-1">{userProfile?.email}</p>
                    <p className="text-blue-200">Member since {userProfile?.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              {/* Profile Content */}
              <div className="p-8">
                {editing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="displayName">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="displayName"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          disabled
                        />
                        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            displayName: userProfile?.displayName || '',
                            email: userProfile?.email || '',
                            phone: userProfile?.phone || '',
                          });
                        }}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Full Name</h3>
                        <p className="text-gray-900 text-lg">{userProfile?.displayName || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Email Address</h3>
                        <p className="text-gray-900 text-lg">{userProfile?.email || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Phone Number</h3>
                        <p className="text-gray-900 text-lg">{userProfile?.phone || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Member Since</h3>
                        <p className="text-gray-900 text-lg">
                          {userProfile?.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Information Section */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Account Status</h3>
                  <p className="text-gray-900">Active</p>
                </div>
                
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Role</h3>
                  <p className="text-gray-900">Parent</p>
                </div>
                
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Last Login</h3>
                  <p className="text-gray-900">Today</p>
                </div>
                
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Security</h3>
                  <p className="text-gray-900">Password set</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);
}