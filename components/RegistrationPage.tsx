'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Logo from './Logo'
import AppHeader from './AppHeader'
import { useAuth } from '@/contexts/AuthContext'

export default function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, fullName, phone)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      await signInWithGoogle()
      router.push('/dashboard')
    } catch (err: any) {
      if (err.message !== 'Redirecting to Google sign in...') {
        setError(err.message || 'Failed to sign up with Google. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex flex-1">
        {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&q=80&w=1200"
          alt="Happy family"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>
        
        {/* Logo and Branding Overlay */}
        <div className="absolute bottom-12 left-12 flex items-center gap-4 z-10 text-white">
          <div className="bg-white p-2 rounded-full shadow-lg">
            <Logo size="large" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">HARMONY</h1>
            <p className="text-blue-100 text-lg font-medium">Empowering Early Detection & Care</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 lg:w-1/2 bg-gray-50 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-8 relative overflow-y-auto">
        <div className="w-full max-w-[640px] mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-4 transform transition-all hover:shadow-2xl">
            {/* Form Header Image */}
            <div className="h-32 sm:h-40 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&q=80&w=1000" 
                alt="Harmony Family" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>

            <div className="p-6 sm:p-10 -mt-8 relative z-10">
              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-1.5">
                  Join HARMONY
                </h2>
                <p className="text-gray-500 text-sm">
                  Create your account to start tracking progress
                </p>
              </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Registration Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name Input */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">
                    Phone <span className="text-[10px] font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1..."
                      className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">
                    Confirm
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showConfirmPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start ml-1">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  required
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-[11px] text-gray-600 leading-tight">
                  I agree to the <a href="#" className="text-blue-600 font-bold">Terms</a> and <a href="#" className="text-blue-600 font-bold">Privacy Policy</a>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Sign up with Google */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col items-center gap-2">
                <p className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-600 hover:text-blue-800 font-bold">
                    Sign In
                  </a>
                </p>
                <a href="/" className="text-[10px] text-gray-400 hover:text-gray-600 font-medium tracking-tight">
                  BACK TO HOME
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
)
}

