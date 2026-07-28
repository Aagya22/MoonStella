import Link from 'next/link'

const LINKS: { heading: string; items: { label: string; href: string }[] }[] = [
  {
    heading: 'Explore',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Product', href: '/product' },
      { label: 'About', href: '/about' },
    ],
  },
  {
    heading: 'Collections',
    items: [
      { label: 'Rings', href: '/product' },
      { label: 'Necklaces', href: '/product' },
      { label: 'Gemstones', href: '/product' },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Sign In', href: '/login' },
      { label: 'Get Started', href: '/get-started' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#5F3041' }} className="text-white">
      <div className="w-full px-8 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 md:gap-8">

          {/* Brand */}
          <div className="max-w-xs">
            <p
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              MoonStella
            </p>
            <p
              className="text-sm text-white/60 leading-relaxed"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              A curated marketplace of high-end jewellery, where heritage craftsmanship
              meets the person it is made for.
            </p>
          </div>

          {/* Link columns */}
          {LINKS.map((col) => (
            <div key={col.heading}>
              <h4
                className="text-[10px] font-bold tracking-widest uppercase text-[#E9D7C3] mb-5"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom rule */}
        <div className="mt-14 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40" style={{ fontFamily: 'var(--font-montserrat)' }}>
            © 2026 MoonStella. All rights reserved.
          </p>
          <p className="text-xs text-white/40" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Exquisite Artistry, Defined by You.
          </p>
        </div>
      </div>
    </footer>
  )
}
