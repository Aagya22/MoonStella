'use client'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/app/components/shared/navbar'

export default function GetStartedPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Header */}
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <h1
            className="font-bold text-gray-900 mb-2"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '36px',
            }}
          >
            Begin Your Journey
          </h1>
          <p
            className="text-gray-500 max-w-lg mx-auto leading-relaxed"
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '13px',
            }}
          >
            Select your path within MoonStella ecosystem.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mb-6" style={{ maxWidth: '680px' }}>

          {/* Buyer card */}
          <div
            className="bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:shadow-lg"
            style={{ borderColor: 'transparent' }}
            onClick={() => window.location.href = '/register/buyer/step-one'}
          >
            <div className="p-5 pb-3">
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: '#5F3041' }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="white"
                    stroke="white"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              <h2
                className="font-bold text-gray-900 mb-1"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '21px',
                }}
              >
                Buyer
              </h2>
              <p
                className="text-gray-500 leading-relaxed mb-3"
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: '12px',
                }}
              >
                Access exclusive drops, curate your custom design, and connect
                directly with world-class artisans.
              </p>
            </div>

            {/* Image */}
            <div className="relative w-full" style={{ height: '140px' }}>
              <Image
                src="/get started.png"
                alt="Buyer"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Artisan card */}
          <div
            className="bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:shadow-lg"
            style={{ borderColor: 'transparent' }}
            onClick={() => window.location.href = '/register/seller/step-one'}
          >
            <div className="p-5 pb-3">
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: '#E8E0D0' }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#5F3041" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </div>

              <h2
                className="font-bold text-gray-900 mb-1"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '21px',
                }}
              >
                Artisan
              </h2>
              <p
                className="text-gray-500 leading-relaxed mb-3"
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: '12px',
                }}
              >
                Showcase your masterpiece, manage your digital atelier, and
                reach a global audience of discerning buyers.
              </p>
            </div>

            {/* Image */}
            <div className="relative w-full" style={{ height: '140px' }}>
              <Image
                src="/get startedd.png"
                alt="Artisan"
                fill
                className="object-cover"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}