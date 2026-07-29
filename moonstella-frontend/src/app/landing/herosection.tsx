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
      {/* Scoped animations & hover styles */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroScaleIn {
          from { opacity: 0; transform: scale(1.08); }
          to   { opacity: 1; transform: scale(1); }
        }
        .hero-heading {
          animation: heroFadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }
        .hero-desc {
          animation: heroFadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both;
        }
        .hero-buttons {
          animation: heroFadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.65s both;
        }
        .hero-bg-img {
          animation: heroScaleIn 1.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .hero-btn-primary {
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }
        .hero-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .hero-btn-primary:hover {
          background-color: #4A2231 !important;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 25px rgba(95, 48, 65, 0.35);
        }
        .hero-btn-primary:hover::after {
          opacity: 1;
        }
        .hero-btn-primary:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(95, 48, 65, 0.2);
        }
        .hero-btn-outline {
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          backdrop-filter: blur(8px);
        }
        .hero-btn-outline:hover {
          background-color: #5F3041 !important;
          color: #FFFFFF !important;
          border-color: #5F3041 !important;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 25px rgba(95, 48, 65, 0.25);
        }
        .hero-btn-outline:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(95, 48, 65, 0.15);
        }
      `}</style>

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
          className="object-cover hero-bg-img"
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
              className="hero-heading"
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
              className="hero-desc"
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
              className="hero-buttons"
              style={{
                display: 'flex',
                gap: '20px',
                marginTop: '36px',
              }}
            >
              <Link
                href="/get-started"
                className="hero-btn-primary"
                style={{
                  backgroundColor: '#5F3041',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '12px 32px',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                Join Now
              </Link>

              <Link
                href="/login"
                className="hero-btn-outline"
                style={{
                  border: '1px solid #5F3041',
                  color: '#5F3041',
                  backgroundColor: 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '12px 32px',
                  textDecoration: 'none',
                  borderRadius: '4px',
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