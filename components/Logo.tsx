interface LogoProps {
  size?: 'small' | 'large'
}

export default function Logo({ size = 'small' }: LogoProps) {
  const circleSize = size === 'large' ? 'w-16 h-16' : 'w-10 h-10'
  const shieldSize = size === 'large' ? 'w-10 h-10' : 'w-6 h-6'

  return (
    <div className={`${circleSize} rounded-full bg-blue-200 flex items-center justify-center`}>
      {/* Shield with Cross */}
      <div className={`${shieldSize} relative`}>
        <svg
          viewBox="0 0 24 24"
          fill="white"
          className="w-full h-full"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
        {/* Cross overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={`${shieldSize} text-blue-600`}
          >
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  )
}

