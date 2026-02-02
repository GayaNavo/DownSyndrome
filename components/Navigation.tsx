import Logo from './Logo'

export default function Navigation() {
  return (
    <nav className="w-full px-4 sm:px-6 lg:px-12 py-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Logo size="small" />
        <span className="text-xl font-bold text-gray-900">HARMONY</span>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <a href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
          Home
        </a>
        <a href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
          Features
        </a>
        <a href="/about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
          About
        </a>
        <a href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
          Contact
        </a>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <a
          href="/login"
          className="hidden sm:block text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Sign In
        </a>
        <a
          href="/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
        >
          Register
        </a>
      </div>
    </nav>
  )
}

