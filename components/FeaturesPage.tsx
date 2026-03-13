'use client'

import AppHeader from './AppHeader'

export default function FeaturesPage() {
  const features = [
    {
      image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800',
      emoji: '🔍',
      title: 'Smart Detection',
      description:
        'Friendly AI tools that help identify developmental markers early, so you can support your child every step of the way.',
      details: [
        'Gentle developmental screening',
        'Early marker identification',
        'Evidence-based assessments',
        'Real-time insights',
      ],
      color: 'sky',
    },
    {
      image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800',
      emoji: '📈',
      title: 'Milestone Tracker',
      description:
        'Celebrate every achievement! Track developmental milestones with colorful charts and joyful progress reports.',
      details: [
        'Visual milestone tracking',
        'Fun progress charts',
        'Growth comparisons',
        'Achievement celebrations',
      ],
      color: 'mint',
    },
    {
      image: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&q=80&w=800',
      emoji: '👨‍👩‍👧',
      title: 'Teamwork Hub',
      description:
        'Connect with doctors, therapists, and family members in one happy place. Everyone stays in the loop!',
      details: [
        'Family & doctor connections',
        'Secure messaging',
        'Shared care plans',
        'Team collaboration',
      ],
      color: 'lavender',
    },
    {
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800',
      emoji: '⭐',
      title: 'Special Plans',
      description:
        'Custom activities and goals designed just for your little superstar. Every child is unique!',
      details: [
        'Personalized goal setting',
        'Fun activity suggestions',
        'Adaptive planning',
        'Expert recommendations',
      ],
      color: 'sunshine',
    },
    {
      image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&q=80&w=800',
      emoji: '🔒',
      title: 'Safe & Secure',
      description:
        'Your precious memories and records are protected like treasure. We keep everything safe and private.',
      details: [
        'Bank-level security',
        'Private data storage',
        'Automatic backups',
        'Privacy protection',
      ],
      color: 'coral',
    },
    {
      image: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&q=80&w=800',
      emoji: '🔔',
      title: 'Happy Updates',
      description:
        'Get instant notifications for every new achievement, milestone, and important moment to celebrate!',
      details: [
        'Milestone celebrations',
        'Appointment reminders',
        'Achievement alerts',
        'Custom notifications',
      ],
      color: 'sky',
    },
    {
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
      emoji: '📊',
      title: 'Growth Insights',
      description:
        'Beautiful charts and reports that show your child\'s amazing journey. Watch them grow and thrive!',
      details: [
        'Colorful visual charts',
        'Growth trend tracking',
        'Progress reports',
        'Shareable summaries',
      ],
      color: 'mint',
    },
    {
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
      emoji: '📱',
      title: 'Always With You',
      description:
        'Access HARMONY anywhere, anytime! Track milestones on your phone, tablet, or computer.',
      details: [
        'Works on all devices',
        'Mobile-friendly design',
        'Offline access',
        'Sync across devices',
      ],
      color: 'lavender',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-mint-50">
      <AppHeader />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-400 via-sky-500 to-mint-400 text-white py-20 overflow-hidden">
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-sunshine-300/30 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-coral-300/30 rounded-full animate-float-slow"></div>
          <svg className="absolute top-20 right-1/3 w-10 h-10 text-white/30 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <span className="text-6xl mb-6 block">🎁</span>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 drop-shadow-lg">Amazing Features</h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
              Wonderful tools designed to support your child's journey and celebrate every milestone!
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-0 w-64 h-64 bg-lavender-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-64 h-64 bg-coral-100 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all group overflow-hidden border border-white/50 transform hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-500/20 to-transparent"></div>
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-2xl shadow-lg">
                    {feature.emoji}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`flex-shrink-0 w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
                      {feature.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-mint-500 flex-shrink-0">✓</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-400 via-lavender-400 to-coral-400 relative overflow-hidden">
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/20 rounded-full animate-float-delayed"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="text-6xl mb-6 block">🚀</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Ready to Start the Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of families celebrating their children's amazing journeys every day!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-sunshine-400 text-sunshine-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-sunshine-300 focus:outline-none focus:ring-4 focus:ring-sunshine-300/50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Free Trial 🌟
            </a>
            <a
              href="/contact"
              className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-lavender-600 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
            >
              Say Hello 👋
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

