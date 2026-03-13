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

const tabEmojis = {
  profile: '👤',
  child: '👶',
  security: '🔒'
}

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
      showNotification('success', '🎉 Profile updated successfully!');
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
      showNotification('success', '🎉 Child information updated successfully!');
    } catch (error) {
      console.error('Error updating child data:', error);
      showNotification('error', 'Failed to update child information');
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      showNotification('success', '🔐 Password reset email sent! Check your inbox!');
    } catch (error) {
      console.error('Error sending reset email:', error);
      showNotification('error', 'Failed to send reset email');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-50 via-white to-mint-50">
        <AppHeader />
        <div className="flex flex-1">
          <DashboardSidebar activePage="settings" />
          <div className="flex-1 ml-64 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl animate-bounce inline-block">⚙️</span>
              <p className="text-gray-500 mt-4 text-lg">Loading settings...</p>
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
        <DashboardSidebar activePage="settings" />
        
        <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Fun Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-gradient-to-br from-sky-200 to-mint-200 mb-4 animate-float">
              <span className="text-5xl">⚙️</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 via-mint-500 to-lavender-500 bg-clip-text text-transparent mb-2">
              Settings 🎯
            </h1>
            <p className="text-gray-600 text-lg">Customize your experience and manage your account!</p>
          </div>
          
          {notification && (
            <div className={`mb-6 p-4 rounded-2xl shadow-lg animate-bounce ${notification.type === 'success' ? 'bg-gradient-to-r from-mint-100 to-sky-100 text-green-800 border-2 border-mint-200' : 'bg-gradient-to-r from-red-100 to-coral-100 text-red-800 border-2 border-red-200'}`}>
              <span className="text-xl mr-2">{notification.type === 'success' ? '🎉' : '⚠️'}</span>
              {notification.message}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-white overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              {(['profile', 'child', 'security'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-center font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab 
                      ? 'text-sky-600 border-b-4 border-sky-400 bg-gradient-to-t from-sky-50 to-transparent' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{tabEmojis[tab]}</span>
                  {tab === 'profile' ? 'Account Profile' : tab === 'child' ? 'Child Information' : 'Security'}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span>👤</span> Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        placeholder="Your full name ✨"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span>📧</span> Email Address
                      </label>
                      <input
                        type="email"
                        value={userProfile?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-500 cursor-not-allowed text-lg"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed 🔒</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span>📱</span> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        placeholder="Your phone number 📞"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>💾</span> Save Changes
                  </button>
                </form>
              )}

              {activeTab === 'child' && (
                <form onSubmit={handleChildUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span>👶</span> Child&apos;s Name
                      </label>
                      <input
                        type="text"
                        value={childForm.name}
                        onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        placeholder="Child's full name ⭐"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span>🎂</span> Child&apos;s Age
                      </label>
                      <input
                        type="number"
                        value={childForm.age}
                        onChange={(e) => setChildForm({ ...childForm, age: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        placeholder="Age 🎯"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span>📅</span> Date of Birth
                      </label>
                      <input
                        type="date"
                        value={childForm.dateOfBirth}
                        onChange={(e) => setChildForm({ ...childForm, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>✨</span> Update Child Info
                  </button>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-orange-50 to-sunshine-50 p-6 rounded-2xl border-2 border-orange-200">
                    <h3 className="text-xl font-bold text-orange-800 mb-2 flex items-center gap-2">
                      <span className="text-2xl">🔐</span> Password
                    </h3>
                    <p className="text-orange-700 mb-4">
                      To change your password, click the button below and we&apos;ll send a reset link to your email address: <strong>{userProfile?.email}</strong>
                    </p>
                    <button
                      onClick={handlePasswordReset}
                      className="bg-gradient-to-r from-orange-400 to-sunshine-400 text-white px-6 py-3 rounded-full font-bold hover:from-orange-500 hover:to-sunshine-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <span>📧</span> Send Password Reset Email
                    </button>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                      <span className="text-2xl">⚠️</span> Danger Zone
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Deleting your account is permanent and cannot be undone. All your data, including child records and documents, will be permanently removed.
                    </p>
                    <button
                      onClick={() => alert('Account deletion is restricted. Please contact support. 📞')}
                      className="border-2 border-red-300 text-red-600 px-6 py-3 rounded-full font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                      <span>🗑️</span> Delete Account
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
