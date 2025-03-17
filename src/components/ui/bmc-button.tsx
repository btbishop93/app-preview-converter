import Image from 'next/image'
import Link from 'next/link'

interface BMCButtonProps {
  link: string
  className?: string
}

export function BMCButton({ link, className = '' }: BMCButtonProps) {
  return (
    <Link 
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block hover:opacity-90 transition-opacity ${className}`}
    >
      <Image
        src="/assets/bmc-button.svg"
        alt="Buy Me a Coffee"
        width={545}
        height={153}
        priority
      />
    </Link>
  )
}
