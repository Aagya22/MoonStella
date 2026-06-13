'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
  className="bg-[#F5F5F5] fade-in"
  style={{
    paddingLeft: '16px',
    paddingRight: '16px',
  }}
>
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '750px',
        }}
      >
        {/* Background Image */}
        <Image
          src="/bracelet.png"
          alt="Diamond bracelet"
          fill
          sizes="100vw"
          priority
          className="object-cover"
          style={{
            objectPosition: 'center center',
          }}
        />

        {/* Soft left-side overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 35%, rgba(255,255,255,0.10) 60%, transparent 80%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div
            style={{
              marginLeft: '80px',
              maxWidth: '650px',
            }}
          >
            {/* Heading */}
            <h1
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 600,
                lineHeight: '1.05',
                color: '#2E0820',
              }}
            >
              Exquisite Artistry,
              <br />
              Defined by You
            </h1>

            {/* Description */}
            <p
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: '18px',
                lineHeight: '1.8',
                color: '#4B4B4B',
                maxWidth: '600px',
                marginTop: '20px',
              }}
            >
              Discover a curated marketplace of high-end jewellery, where
              heritage craftsmanship meets contemporary feminine elegance.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginTop: '36px',
              }}
            >
              <Link
                href="/register/buyer/step-one"
                style={{
                  backgroundColor: '#3D0C1F',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '18px 50px',
                  textDecoration: 'none',
                }}
              >
                Join Now
              </Link>

              <Link
                href="/login"
                style={{
                  border: '1px solid #3D0C1F',
                  color: '#3D0C1F',
                  backgroundColor: 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '18px 50px',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}