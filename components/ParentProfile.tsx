'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import AppHeader from './AppHeader';
import WhimsicalBackground from './WhimsicalBackground';
import { getUserDocument, updateUserDocument, UserData } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageInstance } from '@/lib/firebase/config';

export default function ParentProfile() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    photoURL: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
            photoURL: userData.photoURL || '',
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
          photoURL: formData.photoURL,
        });
        setUserProfile(prev => prev ? {
          ...prev,
          displayName: formData.displayName,
          phone: formData.phone,
          photoURL: formData.photoURL,
        } : null);
        setEditing(false);
        showNotification('success', '🎉 Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('error', 'Failed to update profile');
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('error', '⚠️ Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', '⚠️ Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Create storage path: profiles/{uid}/{timestamp}_{filename}
      const timestamp = Date.now();
      const filePath = `profiles/${currentUser.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(getStorageInstance(), filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update form data and user profile
      setFormData(prev => ({ ...prev, photoURL: downloadURL }));
      
      // Also update Firestore immediately
      await updateUserDocument(currentUser.uid, {
        photoURL: downloadURL,
      });
      
      setUserProfile(prev => prev ? {
        ...prev,
        photoURL: downloadURL,
      } : null);

      showNotification('success', '✅ Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showNotification('error', '❌ Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-whimsical relative">
        <WhimsicalBackground />
        <AppHeader />
        <div className="flex flex-1">
          <DashboardSidebar activePage="profile" />
          <div className="flex-1 ml-64">
            <div className="p-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 text-center border-2 border-white">
                <span className="text-6xl animate-bounce inline-block">👤</span>
                <p className="text-gray-500 mt-4 text-lg">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-whimsical relative">
      <WhimsicalBackground />
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar activePage="profile" />
        
        <div className="flex-1 ml-64">
          
          <main className="p-6">
          {notification && (
            <div className={`mb-6 p-4 rounded-2xl shadow-lg animate-bounce ${notification.type === 'success' ? 'bg-gradient-to-r from-mint-100 to-sky-100 text-green-800 border-2 border-mint-200' : 'bg-gradient-to-r from-red-100 to-coral-100 text-red-800 border-2 border-red-200'}`}>
              <span className="text-xl mr-2">{notification.type === 'success' ? '🎉' : '⚠️'}</span>
              {notification.message}
            </div>
          )}
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border-2 border-white">
              {/* Profile Cover Photo */}
              <div className="h-56 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=2000" 
                  alt="Profile Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/60 to-transparent"></div>
              </div>

              {/* Profile Header */}
              <div className="bg-white p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row items-center gap-6 -mt-24 relative z-10">
                  <div className="relative group">
                    <div className="w-36 h-36 bg-white p-2 rounded-full shadow-2xl overflow-hidden">
                      {userProfile?.photoURL ? (
                        <img 
                          src={userProfile.photoURL} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-400 to-mint-400 rounded-full flex items-center justify-center text-white text-6xl">
                          👤
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-sky-400 to-mint-400 text-white p-3 rounded-full shadow-lg hover:from-sky-500 hover:to-mint-500 transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Change profile photo"
                    >
                      {uploadingPhoto ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <span className="text-xl">📷</span>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </div>
                  <div className="text-center md:text-left pt-4 md:pt-16">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      {userProfile?.displayName || 'Parent Profile'}
                      <span className="text-4xl">👋</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">{userProfile?.email}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <span>⭐</span> Member since {userProfile?.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Profile Content */}
              <div className="p-8">
                {editing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg" htmlFor="displayName">
                          <span>👤</span> Full Name
                        </label>
                        <input
                          type="text"
                          id="displayName"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg" htmlFor="email">
                          <span>📧</span> Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-500 cursor-not-allowed text-lg"
                          disabled
                        />
                        <p className="text-sm text-gray-400 mt-1">Email cannot be changed 🔒</p>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg" htmlFor="phone">
                          <span>📱</span> Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition-all text-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-lg" htmlFor="photoURL">
                          <span>📷</span> Profile Photo
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                            {formData.photoURL ? (
                              <img 
                                src={formData.photoURL} 
                                alt="Profile Preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl">
                                👤
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-4 py-2 rounded-full font-semibold hover:from-sky-500 hover:to-mint-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {uploadingPhoto ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <span>📷</span> Change Photo
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Click to upload a new photo (JPG, PNG, max 5MB)</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                      >
                        <span>💾</span> Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            displayName: userProfile?.displayName || '',
                            email: userProfile?.email || '',
                            phone: userProfile?.phone || '',
                            photoURL: userProfile?.photoURL || '',
                          });
                        }}
                        className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-50 transition-all hover:border-gray-400 flex items-center gap-2"
                      >
                        <span>❌</span> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-r from-sky-50 to-mint-50 p-4 rounded-2xl">
                        <h3 className="text-gray-500 text-sm font-bold mb-1 flex items-center gap-1">
                          <span>👤</span> Full Name
                        </h3>
                        <p className="text-gray-900 text-xl font-bold">{userProfile?.displayName || 'Not provided'}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-sky-50 to-mint-50 p-4 rounded-2xl">
                        <h3 className="text-gray-500 text-sm font-bold mb-1 flex items-center gap-1">
                          <span>📧</span> Email Address
                        </h3>
                        <p className="text-gray-900 text-xl font-bold">{userProfile?.email || 'Not provided'}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-sky-50 to-mint-50 p-4 rounded-2xl">
                        <h3 className="text-gray-500 text-sm font-bold mb-1 flex items-center gap-1">
                          <span>📱</span> Phone Number
                        </h3>
                        <p className="text-gray-900 text-xl font-bold">{userProfile?.phone || 'Not provided'}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-sky-50 to-mint-50 p-4 rounded-2xl">
                        <h3 className="text-gray-500 text-sm font-bold mb-1 flex items-center gap-1">
                          <span>📅</span> Member Since
                        </h3>
                        <p className="text-gray-900 text-xl font-bold">
                          {userProfile?.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-sky-500 hover:to-mint-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <span>✏️</span> Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Information Section */}
            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border-2 border-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-3xl">ℹ️</span> Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-mint-50 p-4 rounded-2xl">
                  <h3 className="text-gray-500 text-sm font-bold mb-1 flex items-center gap-1">
                    <span>✅</span> Account Status
                  </h3>
                  <p className="text-gray-900 text-lg font-bold">Active 🎉</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 rounded-2xl">
                  <h3 className="text-gray-500 text-sm font-bold mb-1 flex items-center gap-1">
                    <span>👨‍👩‍👧</span> Role
                  </h3>
                  <p className="text-gray-900 text-lg font-bold">Parent ⭐</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-lavender-50 p-4 rounded-2xl">
                  <h3 className="text-gray-500 text-sm font-bold mb-1 flex items-center gap-1">
                    <span>🕐</span> Last Login
                  </h3>
                  <p className="text-gray-900 text-lg font-bold">Today 👋</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-sunshine-50 p-4 rounded-2xl">
                  <h3 className="text-gray-500 text-sm font-bold mb-1 flex items-center gap-1">
                    <span>🔒</span> Security
                  </h3>
                  <p className="text-gray-900 text-lg font-bold">Password set ✅</p>
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
