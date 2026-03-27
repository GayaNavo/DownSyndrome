'use client'

export default function WhimsicalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated cartoon clouds - Enhanced with more details */}
      <div className="absolute top-10 left-[10%] w-32 h-12 bg-white rounded-full opacity-70 animate-cloud shadow-xl">
        <div className="absolute -top-6 left-4 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute -top-8 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute -top-4 left-14 w-14 h-14 bg-gradient-to-br from-white to-sky-50 rounded-full"></div>
      </div>
      
      <div className="absolute top-20 right-[15%] w-40 h-14 bg-white rounded-full opacity-60 animate-cloud-delayed shadow-xl">
        <div className="absolute -top-8 left-6 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute -top-10 left-12 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute -top-6 left-16 w-18 h-18 bg-gradient-to-br from-white to-mint-50 rounded-full"></div>
      </div>
      
      <div className="absolute top-40 left-[60%] w-28 h-10 bg-white rounded-full opacity-50 animate-cloud-slow shadow-xl">
        <div className="absolute -top-5 left-4 w-14 h-14 bg-white rounded-full"></div>
        <div className="absolute -top-7 left-8 w-18 h-18 bg-white rounded-full"></div>
        <div className="absolute -top-4 left-12 w-12 h-12 bg-gradient-to-br from-white to-lavender-50 rounded-full"></div>
      </div>

      {/* Floating stars - Enhanced with sparkle effect */}
      <svg className="absolute top-16 right-[25%] w-8 h-8 text-yellow-400 opacity-70 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      
      <svg className="absolute top-32 left-[30%] w-6 h-6 text-pink-300 opacity-60 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      
      <svg className="absolute bottom-40 right-[35%] w-7 h-7 text-blue-300 opacity-60 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>

      <svg className="absolute top-1/2 left-[15%] w-5 h-5 text-purple-300 opacity-50 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>

      {/* Floating circles/bubbles - Enhanced with gradients */}
      <div className="absolute top-1/4 left-[5%] w-16 h-16 bg-gradient-to-br from-sky-300 via-sky-400 to-sky-500 rounded-full opacity-40 animate-float-shape blur-md shadow-lg"></div>
      <div className="absolute top-1/3 right-[10%] w-12 h-12 bg-gradient-to-br from-mint-300 via-mint-400 to-mint-500 rounded-full opacity-40 animate-float-shape-reverse blur-md shadow-lg"></div>
      <div className="absolute bottom-1/4 left-[15%] w-14 h-14 bg-gradient-to-br from-lavender-300 via-lavender-400 to-lavender-500 rounded-full opacity-40 animate-float-shape blur-md shadow-lg"></div>
      <div className="absolute bottom-1/3 right-[20%] w-10 h-10 bg-gradient-to-br from-sunshine-300 via-sunshine-400 to-sunshine-500 rounded-full opacity-40 animate-float-shape-reverse blur-md shadow-lg"></div>
      
      <div className="absolute top-1/2 right-[30%] w-8 h-8 bg-gradient-to-br from-coral-300 via-coral-400 to-coral-500 rounded-full opacity-30 animate-float-shape blur-sm shadow-lg"></div>
      <div className="absolute bottom-1/2 left-[40%] w-11 h-11 bg-gradient-to-br from-pink-300 via-pink-400 to-pink-500 rounded-full opacity-30 animate-float-shape-reverse blur-sm shadow-lg"></div>
      
      {/* Floating hearts - Enhanced */}
      <svg className="absolute top-1/4 right-[40%] w-8 h-8 text-red-300 opacity-50 animate-float-shape" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      
      <svg className="absolute bottom-1/4 left-[45%] w-6 h-6 text-pink-300 opacity-50 animate-float-shape-reverse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>

      <svg className="absolute top-1/3 left-[25%] w-7 h-7 text-red-400 opacity-40 animate-float-shape" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>

      {/* Decorative rainbows - Enhanced with multiple layers */}
      <div className="absolute bottom-0 left-[5%] w-40 h-40 border-t-4 border-l-4 border-r-4 border-sky-300 rounded-t-full opacity-30"></div>
      <div className="absolute bottom-0 left-[7%] w-36 h-36 border-t-4 border-l-4 border-r-4 border-mint-300 rounded-t-full opacity-30"></div>
      <div className="absolute bottom-0 left-[9%] w-32 h-32 border-t-4 border-l-4 border-r-4 border-lavender-300 rounded-t-full opacity-30"></div>
      <div className="absolute bottom-0 left-[11%] w-28 h-28 border-t-4 border-l-4 border-r-4 border-sunshine-300 rounded-t-full opacity-30"></div>
      
      <div className="absolute bottom-0 right-[5%] w-36 h-36 border-t-4 border-l-4 border-r-4 border-sunshine-300 rounded-t-full opacity-30"></div>
      <div className="absolute bottom-0 right-[7%] w-32 h-32 border-t-4 border-l-4 border-r-4 border-coral-300 rounded-t-full opacity-30"></div>
      <div className="absolute bottom-0 right-[9%] w-28 h-28 border-t-4 border-l-4 border-r-4 border-pink-300 rounded-t-full opacity-30"></div>

      {/* Floating flowers/decorative shapes */}
      <svg className="absolute top-20 left-[35%] w-10 h-10 text-orange-300 opacity-40 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="12" cy="20" r="2" />
        <circle cx="4" cy="12" r="2" />
        <circle cx="20" cy="12" r="2" />
      </svg>

      <svg className="absolute bottom-20 left-[30%] w-8 h-8 text-green-300 opacity-40 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="12" cy="20" r="2" />
        <circle cx="4" cy="12" r="2" />
        <circle cx="20" cy="12" r="2" />
      </svg>

      {/* Sparkles/diamonds */}
      <svg className="absolute top-1/4 left-[70%] w-6 h-6 text-cyan-300 opacity-50 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
      </svg>

      <svg className="absolute bottom-1/3 right-[45%] w-5 h-5 text-emerald-300 opacity-40 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
      </svg>

      {/* Musical notes for playfulness */}
      <svg className="absolute top-1/3 right-[20%] w-7 h-7 text-amber-300 opacity-40 animate-float-shape" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>

      {/* Butterflies */}
      <svg className="absolute top-1/2 right-[10%] w-9 h-9 text-fuchsia-300 opacity-40 animate-float-shape-reverse" fill="currentColor" viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="2" ry="8" />
        <ellipse cx="8" cy="8" rx="4" ry="3" transform="rotate(-30 8 8)" />
        <ellipse cx="16" cy="8" rx="4" ry="3" transform="rotate(30 16 8)" />
        <ellipse cx="8" cy="16" rx="4" ry="3" transform="rotate(30 8 16)" />
        <ellipse cx="16" cy="16" rx="4" ry="3" transform="rotate(-30 16 16)" />
      </svg>
    </div>
  )
}
