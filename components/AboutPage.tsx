'use client'

import Logo from './Logo'
import AppHeader from './AppHeader'

export default function AboutPage() {
  const values = [
    {
      title: 'Love & Care',
      emoji: '❤️',
      description: 'We understand the challenges families face and design our platform with empathy and lots of love.',
      color: 'coral',
    },
    {
      title: 'Innovation',
      emoji: '🚀',
      description: 'We use the latest technology to create magical tools that help children grow and thrive.',
      color: 'sky',
    },
    {
      title: 'Excellence',
      emoji: '⭐',
      description: 'We strive to be the best in everything we do, creating a safe and wonderful experience for all.',
      color: 'sunshine',
    },
    {
      title: 'Togetherness',
      emoji: '🤝',
      description: 'We believe in teamwork between families, doctors, and our technology to support every child.',
      color: 'mint',
    },
  ]

  const stats = [
    { number: '10,000+', label: 'Happy Families', emoji: '👨‍👩‍👧' },
    { number: '50,000+', label: 'Milestones Celebrated', emoji: '🎉' },
    { number: '500+', label: 'Healthcare Heroes', emoji: '👩‍⚕️' },
    { number: '99.9%', label: 'Smiles Delivered', emoji: '😊' },
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
            <span className="text-6xl mb-6 block">🌈</span>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 drop-shadow-lg">About HARMONY</h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
              A friendly companion on your family's journey, helping every child reach their full potential with love and care.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-sky-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-mint-100 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span>🎯</span>
                Our Mission
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Helping Every Child Shine! ✨</h2>
              <p className="text-lg text-gray-600 mb-4">
                HARMONY was created with a big dream: to support families and healthcare heroes 
                with friendly tools that help children grow, learn, and reach their full potential.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                We believe every child is unique and special. Our platform celebrates each milestone, 
                big or small, because every step forward is worth celebrating! 🎉
              </p>
              <p className="text-lg text-gray-600">
                By bringing families, doctors, and technology together, we create a circle of care 
                that surrounds every child with love and support.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px] border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1000" 
                alt="Happy children" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-500/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-sky-400 to-mint-400 p-2 rounded-xl">
                    <Logo size="small" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">HARMONY</h3>
                    <p className="text-sm text-gray-600 font-medium">Growing Together, Step by Step</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-sky-50 to-mint-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50">
                <span className="text-4xl mb-2 block">{stat.emoji}</span>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-mint-500 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-lavender-100 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-coral-100 rounded-full blur-3xl -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-5xl mb-4 block">💫</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Makes Us Special</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The magic ingredients that make HARMONY a wonderful place for families.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className={`w-20 h-20 bg-${value.color}-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner`}>
                  {value.emoji}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-sky-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-5xl mb-4 block">👥</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Heroes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A wonderful team of caring people working together to make a difference.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: '👩‍⚕️',
                name: 'Healthcare Heroes',
                description:
                  'Caring doctors and specialists who bring years of experience and lots of love to help every child.',
              },
              {
                emoji: '👨‍💻',
                name: 'Tech Wizards',
                description:
                  'Creative engineers and designers who build magical tools to make the journey easier and fun!',
              },
              {
                emoji: '💚',
                name: 'Family Champions',
                description:
                  'Dedicated advocates who make sure every family voice is heard and valued in everything we create.',
              },
            ].map((team, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/50 hover:shadow-xl transition-all transform hover:-translate-y-1">
                <span className="text-5xl mb-4 block">{team.emoji}</span>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{team.name}</h3>
                <p className="text-gray-600">{team.description}</p>
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
          <svg className="absolute top-20 right-1/3 w-10 h-10 text-white/30 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="text-6xl mb-6 block">🌟</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Join Our Family!
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Be part of a caring community that celebrates every child's unique journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-sunshine-400 text-sunshine-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-sunshine-300 focus:outline-none focus:ring-4 focus:ring-sunshine-300/50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Your Journey 🚀
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

