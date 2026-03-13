'use client'

import Logo from './Logo'
import AppHeader from './AppHeader'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-mint-50">
      <AppHeader />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-mint-400">
        {/* Floating decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating circles */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-sunshine-300/30 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-coral-300/30 rounded-full animate-float-slow"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-lavender-300/30 rounded-full animate-float"></div>
          
          {/* Floating stars */}
          <svg className="absolute top-16 right-1/4 w-8 h-8 text-sunshine-300 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute bottom-20 right-16 w-6 h-6 text-coral-300 animate-pulse-slow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute top-1/2 left-16 w-10 h-10 text-lavender-300 animate-bounce-slow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          
          {/* Wave pattern */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              fill="rgba(255,255,255,0.3)"
              d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z"
            />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              fill="rgba(255,255,255,0.5)"
              d="M0,80 C480,20 960,100 1440,80 L1440,120 L0,120 Z"
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <Logo size="large" />
                </div>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                Growing Together
                <br />
                <span className="text-sunshine-200">Step by Step</span>
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0">
                A friendly companion for families and healthcare heroes to celebrate 
                every milestone on your child's amazing journey!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="/login"
                  className="bg-sunshine-400 text-sunshine-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-sunshine-300 focus:outline-none focus:ring-4 focus:ring-sunshine-300/50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Your Journey
                </a>
                <a
                  href="#features"
                  className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-sky-600 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
                >
                  Discover More
                </a>
              </div>
            </div>

            {/* Right Illustration/Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Decorative blob background */}
                <div className="absolute inset-0 bg-gradient-to-br from-sunshine-300/40 to-coral-300/40 rounded-full blur-3xl transform scale-110 animate-blob"></div>
                <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 border-4 border-white/30">
                  <img
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1000"
                    alt="Happy child playing and learning"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-900/20 to-transparent"></div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Milestones</p>
                      <p className="text-xs text-gray-500">Track progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white via-sky-50 to-mint-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-sunshine-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-lavender-200/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-coral-200/20 rounded-full blur-xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Amazing Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
              Tools for Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-mint-500"> Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to support your child's growth and celebrate every achievement!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Early Detection */}
            <div className="card-playful group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800" 
                  alt="Child learning and playing" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-500/20 to-transparent"></div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Detection</h3>
                <p className="text-gray-600 text-sm">
                  Gentle AI-powered tools to understand your child's unique development path early on.
                </p>
              </div>
            </div>

            {/* Feature 2 - Progress Tracking */}
            <div className="card-playful group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800" 
                  alt="Child achieving milestones" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mint-500/20 to-transparent"></div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 bg-mint-100 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-7 h-7 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Milestone Magic</h3>
                <p className="text-gray-600 text-sm">
                  Track every precious milestone with colorful charts and joyful celebrations!
                </p>
              </div>
            </div>

            {/* Feature 3 - Care Coordination */}
            <div className="card-playful group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&q=80&w=800" 
                  alt="Family together" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lavender-500/20 to-transparent"></div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👨‍👩‍👧</span>
                </div>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 bg-lavender-100 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-7 h-7 text-lavender-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Teamwork</h3>
                <p className="text-gray-600 text-sm">
                  Connect with doctors, therapists, and family members in one happy place.
                </p>
              </div>
            </div>

            {/* Feature 4 - Personalized Plans */}
            <div className="card-playful group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800" 
                  alt="Child with personalized care" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sunshine-500/20 to-transparent"></div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 bg-sunshine-100 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-7 h-7 text-sunshine-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Special Plans</h3>
                <p className="text-gray-600 text-sm">
                  Custom activities and goals designed just for your little superstar!
                </p>
              </div>
            </div>

            {/* Feature 5 - Secure Records */}
            <div className="card-playful group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&q=80&w=800" 
                  alt="Safe and secure" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-coral-500/20 to-transparent"></div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🔒</span>
                </div>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 bg-coral-100 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-7 h-7 text-coral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Safe & Secure</h3>
                <p className="text-gray-600 text-sm">
                  Your precious memories and records are protected like treasure!
                </p>
              </div>
            </div>

            {/* Feature 6 - Real-time Updates */}
            <div className="card-playful group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&q=80&w=800" 
                  alt="Happy moments" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-500/20 to-transparent"></div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🔔</span>
                </div>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                  <svg className="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Happy Updates</h3>
                <p className="text-gray-600 text-sm">
                  Get instant notifications for every new achievement and milestone!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-sky-400 via-lavender-400 to-coral-400 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/20 rounded-full animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float-slow"></div>
          <svg className="absolute top-20 right-1/3 w-10 h-10 text-white/30 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="text-lg">🚀</span>
            Start Your Adventure
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Ready to Begin the Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of families celebrating their children's amazing milestones every day!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-sunshine-400 text-sunshine-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-sunshine-300 focus:outline-none focus:ring-4 focus:ring-sunshine-300/50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Free Account
            </a>
            <a
              href="/login"
              className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-lavender-600 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-sky-400 to-mint-400 p-2 rounded-xl">
                  <Logo size="small" />
                </div>
                <span className="text-xl font-bold text-white">HARMONY</span>
              </div>
              <p className="text-sm">
                Growing together, step by step. Supporting families on their unique journey.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/features" className="hover:text-sky-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-sky-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-sky-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-sky-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-sky-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} HARMONY. Made with ❤️ for families everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

