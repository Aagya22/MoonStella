'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden fade-in" style={{ height: '750px' }}>

      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/bracelet.png"
          alt="Diamond bracelet"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: 'center center' }}
        />
      </div>

      {/* Very subtle overlay just on bottom-left for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)',
        }}
      />

      {/* Content - bottom left */}
      <div className="relative z-10 h-full flex items-center
      ">
        <div className="pb-20">

          {/* Heading */}
          <h1
            className="font-bold text-[#2E0820] leading-tight"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '2.8rem',
            }}
          >
            Exquisite Artistry,
            <br />
            Defined by You
          </h1>

          {/* Description */}
          <p
            className="mt-3 text-[#3a3a3a] max-w-[420px] leading-6"
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '13.5px',
            }}
          >
            Discover a curated marketplace of high-end jewellery, where heritage
            craftsmanship meets contemporary feminine elegance.
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <Link
              href="/register/buyer/step-one"
              className="px-25 py-4 text-xs uppercase tracking-[0.2em] text-white hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: '#3D0C1F',
                fontFamily: 'var(--font-montserrat)',
                fontWeight: 700,
              }}
            >
              JOIN NOW
            </Link>

            <Link
              href="/login"
              className="px-25 py-4 text-xs uppercase tracking-[0.2em] border hover:bg-white/10 transition-colors"
              style={{
                borderColor: '#3D0C1F',
                color: '#3D0C1F',
                fontFamily: 'var(--font-montserrat)',
                fontWeight: 700,
                backgroundColor: 'rgba(255,255,255,0.4)',
              }}
            >
              SIGN IN
            </Link>
          </div>

        </div>
      </div>

    </section>
  )
}