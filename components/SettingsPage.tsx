'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import AppHeader from './AppHeader';
import { 
  getUserDocument, 
  updateUserDocument, 
  getChildDocument, 
  updateChildDocument,
  UserData,
  ChildData
} from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export default function SettingsPage() {
  const { currentUser, resetPassword } = useAuth();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'child' | 'security'>('profile');
  
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    phone: '',
  });
  
  const [childForm, setChildForm] = useState({
    name: '',
    age: 0,
    dateOfBirth: '',
  });
  
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [userData, child] = await Promise.all([
        getUserDocument(currentUser.uid),
        getChildDocument(currentUser.uid)
      ]);
      
      if (userData) {
        setUserProfile(userData);
        setProfileForm({
          displayName: userData.displayName || '',
          phone: userData.phone || '',
        });
      }
      
      if (child) {
        setChildData(child);
        setChildForm({
          name: child.name || '',
          age: child.age || 0,
          dateOfBirth: child.dateOfBirth ? new Date(child.dateOfBirth.toDate()).toISOString().split('T')[0] : '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings data:', error);
      showNotification('error', 'Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await updateUserDocument(currentUser.uid, {
        displayName: profileForm.displayName,
        phone: profileForm.phone,
      });
      showNotification('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Failed to update profile');
    }
  };

  const handleChildUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !childData) return;
    try {
      const dob = new Date(childForm.dateOfBirth);
      await updateChildDocument(currentUser.uid, {
        name: childForm.name,
        age: parseInt(childForm.age.toString()),
        dateOfBirth: Timestamp.fromDate(dob),
      });
      showNotification('success', 'Child information updated successfully');
    } catch (error) {
      console.error('Error updating child data:', error);
      showNotification('error', 'Failed to update child information');
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      showNotification('success', 'Password reset email sent!');
    } catch (error) {
      console.error('Error sending reset email:', error);
      showNotification('error', 'Failed to send reset email');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex flex-1">
          <DashboardSidebar activePage="settings" />
          <div className="flex-1 ml-64 flex items-center justify-center">
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar activePage="settings" />
        
        <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
          
          {notification && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.message}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Account Profile
              </button>
              <button
                onClick={() => setActiveTab('child')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'child' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Child Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Security
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={userProfile?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              )}

              {activeTab === 'child' && (
                <form onSubmit={handleChildUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Child's Name</label>
                      <input
                        type="text"
                        value={childForm.name}
                        onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Child's full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Child's Age</label>
                      <input
                        type="number"
                        value={childForm.age}
                        onChange={(e) => setChildForm({ ...childForm, age: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Age"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={childForm.dateOfBirth}
                        onChange={(e) => setChildForm({ ...childForm, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Update Child Info
                  </button>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Password</h3>
                    <p className="text-gray-500 mb-4">
                      To change your password, click the button below and we'll send a reset link to your email address: <strong>{userProfile?.email}</strong>
                    </p>
                    <button
                      onClick={handlePasswordReset}
                      className="bg-orange-100 text-orange-700 px-6 py-2 rounded-lg font-medium hover:bg-orange-200 transition-colors"
                    >
                      Send Password Reset Email
                    </button>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-gray-500 mb-4">
                      Deleting your account is permanent and cannot be undone. All your data, including child records and documents, will be permanently removed.
                    </p>
                    <button
                      onClick={() => alert('Account deletion is restricted. Please contact support.')}
                      className="border border-red-200 text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
