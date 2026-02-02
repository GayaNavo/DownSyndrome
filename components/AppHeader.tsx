'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';

export default function AppHeader() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href={currentUser ? '/dashboard' : '/'} className="flex items-center gap-3">
              <Logo size="small" />
              <span className="text-xl font-bold text-gray-900">SyndromeTrack</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {currentUser ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/documents" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Documents
                </Link>
                <Link 
                  href="/dashboard/settings" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/features" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Features
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="hidden sm:inline text-gray-600 text-sm">
                  Welcome, {currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}