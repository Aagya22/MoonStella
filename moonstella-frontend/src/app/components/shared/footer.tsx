import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#5F3041' }} className="py-12 px-8 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* <p
          className="text-xl font-bold text-white"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          MoonStella
        </p> */}

        {/* <div className="flex items-center gap-10">
          {['HOME', 'PRODUCT', 'ABOUT'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-xs font-semibold tracking-widest text-white/60 hover:text-white transition-colors"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              {item}
            </Link>
          ))}
        </div>

        <p
          className="text-xs text-white/40"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          © 2026 MoonStella. All rights reserved.
        </p> */}

      </div>
    </footer>
  )
}