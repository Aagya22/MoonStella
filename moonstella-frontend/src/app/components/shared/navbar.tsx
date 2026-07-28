'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="w-full bg-white/60 backdrop-blur-md border-b border-gray-200/50 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
  <div className="w-full px-8 h-16 flex items-center justify-between">

    {/* Left - Logo */}
    <Link href="/" style={{ color: '#320729', fontFamily: 'var(--font-playfair)' }} className="text-2xl font-bold tracking-tight">
      MoonStella
    </Link>

    {/* Middle - Nav links */}
    <div className="hidden md:flex items-center gap-12">
      {[
        { label: 'HOME', href: '/' },
        { label: 'PRODUCT', href: '/product' },
        { label: 'ABOUT', href: '/about' },
      ].map((item) => {
        const active = isActive(item.href)
        return (
          <Link key={item.label} href={item.href}
            className={`relative text-xs font-semibold tracking-widest transition-colors after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:bg-[#5F3041] after:transition-all after:duration-300 ${
              active
                ? 'text-[#320729] after:w-full'
                : 'text-gray-600 hover:text-[#320729] after:w-0 hover:after:w-full'
            }`}
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            {item.label}
          </Link>
        )
      })}
    </div>

    {/* Right - Button */}
    <div className="hidden md:block">
      <Link href="/get-started" className="btn-primary">GET STARTED</Link>
    </div>

    {/* Mobile toggle */}
    <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
      <span className="w-5 h-0.5 bg-gray-800 block" />
      <span className="w-5 h-0.5 bg-gray-800 block" />
      <span className="w-5 h-0.5 bg-gray-800 block" />
    </button>
        

        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/60 backdrop-blur-md border-t border-white/40 px-8 py-6 flex flex-col gap-5">
            {[
              { label: 'HOME', href: '/' },
              { label: 'PRODUCT', href: '/product' },
              { label: 'ABOUT', href: '/about' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-xs font-semibold tracking-widest ${isActive(item.href) ? 'text-[#320729]' : 'text-gray-600'}`}
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/get-started"
              className="btn-primary text-center"
            >
              GET STARTED
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}