import Image from 'next/image'

interface LogoProps {
  size?: 'small' | 'large'
}

export default function Logo({ size = 'small' }: LogoProps) {
  const dimension = size === 'large' ? 64 : 40

  return (
    <div className={`relative overflow-hidden rounded-full bg-white`}>
      <Image
        src="/logo.png"
        alt="Harmony Logo"
        width={dimension}
        height={dimension}
        className="object-cover"
      />
    </div>
  )
}

