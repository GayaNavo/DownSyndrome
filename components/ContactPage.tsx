'use client'

import { useState } from 'react'
import AppHeader from './AppHeader'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    })
  }

  const contactMethods = [
    {
      emoji: '📧',
      title: 'Email',
      details: ['hello@harmony.care', 'support@harmony.care'],
      color: 'sky',
    },
    {
      emoji: '📞',
      title: 'Phone',
      details: ['+1 (555) 123-4567', 'Mon-Fri 9am-5pm EST'],
      color: 'mint',
    },
    {
      emoji: '📍',
      title: 'Address',
      details: ['123 Care Avenue', 'Family District, NY 10001', 'United States'],
      color: 'coral',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50 via-white to-sky-50">
      <AppHeader />
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-lavender-400 via-sky-400 to-mint-400">
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-16 h-16 bg-white/20 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-12 h-12 bg-sunshine-300/30 rounded-full animate-float-delayed"></div>
          <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-coral-300/30 rounded-full animate-float-slow"></div>
          <svg className="absolute top-32 left-1/3 w-10 h-10 text-white/30 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="text-6xl mb-6 block">💌</span>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 drop-shadow-lg">Get in Touch</h1>
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto font-medium">
            We'd love to hear from you! Send us a message and we'll get back to you soon.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="mb-8 rounded-3xl overflow-hidden shadow-lg h-48 sm:h-64 relative group border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&q=80&w=1000" 
                  alt="Happy family" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-500/20 to-transparent"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-3xl">👋</span>
                Say Hello!
              </h2>
              <p className="text-gray-600 mb-8">
                Have questions about HARMONY? Want to share your story? Our friendly team is here to help!
              </p>

              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-white/50">
                    <div className={`flex-shrink-0 w-12 h-12 bg-${method.color}-100 rounded-xl flex items-center justify-center text-2xl`}>
                      {method.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{method.title}</h3>
                      {method.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-sky-100 to-mint-100 rounded-2xl border border-white/50">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span>⏰</span>
                  When We're Here
                </h3>
                <p className="text-sm text-gray-600 mb-1">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-sm text-gray-600">Weekends: Family time! 👨‍👩‍👧</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/50">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-3xl">✏️</span>
                  Send a Message
                </h2>
                <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible!</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent focus:bg-white transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent focus:bg-white transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent focus:bg-white transition-all"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        What is this about? *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent focus:bg-white transition-all"
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Question</option>
                        <option value="support">Need Help</option>
                        <option value="feedback">Share Feedback</option>
                        <option value="story">Share Your Story</option>
                        <option value="other">Something Else</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent focus:bg-white transition-all"
                      placeholder="Tell us what's on your mind..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-sky-500 to-mint-500 text-white py-3 px-6 rounded-xl font-bold hover:from-sky-600 hover:to-mint-600 focus:outline-none focus:ring-4 focus:ring-sky-300/50 transition-all shadow-lg shadow-sky-200 transform hover:scale-[1.02]"
                  >
                    Send Message 🚀
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-sky-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-5xl mb-4 block">❓</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Common Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to help you get started</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'How do I start using HARMONY?',
                answer:
                  'Just click "Get Started" and create your free account. It only takes a minute, and you can begin tracking your child\'s journey right away!',
                emoji: '🚀',
              },
              {
                question: 'Is my family\'s information safe?',
                answer:
                  'Absolutely! We use the best security to protect your data. Your information is safe with us, just like a treasure chest! 🔒',
                emoji: '🔒',
              },
              {
                question: 'Can I use HARMONY on my phone?',
                answer:
                  'Yes! HARMONY works great on phones and tablets, so you can track milestones wherever you are.',
                emoji: '📱',
              },
              {
                question: 'What if I need help?',
                answer:
                  'We\'re here for you! Send us a message or email, and our friendly team will help you out.',
                emoji: '💚',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-white/50 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span>{faq.emoji}</span>
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

