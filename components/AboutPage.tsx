'use client'

import Logo from './Logo'
import AppHeader from './AppHeader'

export default function AboutPage() {
  const values = [
    {
      title: 'Compassion',
      description: 'We understand the challenges families face and design our platform with empathy and care.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to provide the best tools for early detection and care.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from user experience to data security.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      title: 'Collaboration',
      description: 'We believe in the power of collaboration between healthcare providers, families, and technology.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ]

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '50,000+', label: 'Records Managed' },
    { number: '500+', label: 'Healthcare Providers' },
    { number: '99.9%', label: 'Uptime' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2000" 
            alt="About Harmony Background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">About HARMONY</h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
              Empowering healthcare professionals and families with innovative tools for early
              detection and comprehensive care management.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                HARMONY was founded with a simple yet powerful mission: to empower healthcare
                professionals and families with the tools they need to detect developmental conditions
                early and provide the best possible care.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                We believe that early detection and intervention can significantly improve outcomes
                for individuals with developmental conditions. Our platform combines cutting-edge
                technology with evidence-based practices to create a comprehensive solution for care
                management.
              </p>
              <p className="text-lg text-gray-600">
                By providing intuitive tools for screening, tracking, and collaboration, we aim to
                bridge the gap between healthcare providers and families, ensuring that everyone
                involved in a patient&apos;s care has access to the information they need, when they
                need it.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=1000" 
                alt="Our Mission" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/10"></div>
              <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="flex items-center gap-4">
                  <Logo size="small" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">HARMONY</h3>
                    <p className="text-sm text-gray-600 font-medium">Empowering Early Detection & Care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-lg text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at HARMONY.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A dedicated group of healthcare professionals, technologists, and advocates working
              together to make a difference.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Healthcare Experts',
                description:
                  'Board-certified physicians and specialists with decades of experience in developmental medicine.',
              },
              {
                name: 'Technology Innovators',
                description:
                  'Software engineers and designers committed to creating intuitive, secure, and powerful solutions.',
              },
              {
                name: 'Patient Advocates',
                description:
                  'Dedicated professionals who ensure the patient and family perspective is at the heart of everything we build.',
              },
            ].map((team, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{team.name}</h3>
                <p className="text-gray-600">{team.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Join Us in Making a Difference
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of a community dedicated to improving outcomes through early detection and
            comprehensive care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

