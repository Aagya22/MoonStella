'use client'

import { useState } from 'react'
import Image from 'next/image'

interface BuyerOnboardingProps {
  onComplete: (interests: string[]) => void
  onSkip: () => void
}

const ONBOARDING_PURPOSES = [
  {
    id: 'self-expression',
    name: 'Self-Expression',
    description: 'Commissioning unique, personal pieces for self-styling and daily expression.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    )
  },
  {
    id: 'heritage-milestone',
    name: 'Heritage & Milestone',
    description: 'Crafting custom heirloom rings, celebratory gifts, and milestone commissions.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    )
  },
  {
    id: 'art-investment',
    name: 'Art & Investment',
    description: 'Collecting rare natural gemstones, signature masterworks, and fine investments.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" />
      </svg>
    )
  }
]

export default function BuyerOnboarding({ onComplete, onSkip }: BuyerOnboardingProps) {
  const [step, setStep] = useState(1)
  const [selectedGems, setSelectedGems] = useState<string[]>([])

  const handleNext = () => setStep((prev) => prev + 1)
  const handleBack = () => setStep((prev) => prev - 1)

  const toggleGem = (id: string) => {
    setSelectedGems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleLaunch = () => {
    onComplete(selectedGems)
  }

  const btnStyleMaroon = {
    backgroundColor: '#3D0C1F',
    color: 'white',
    border: 'none',
    fontFamily: 'var(--font-montserrat)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.15em',
    padding: '12px 36px',
    borderRadius: '4px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    transition: 'opacity 0.2s',
  }

  const btnStyleOutline = {
    backgroundColor: 'transparent',
    color: '#3D0C1F',
    border: '1.5px solid #3D0C1F',
    fontFamily: 'var(--font-montserrat)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.15em',
    padding: '11px 32px',
    borderRadius: '4px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    transition: 'background-color 0.2s, color 0.2s',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="w-full bg-white rounded-md shadow-2xl relative flex flex-col overflow-hidden animate-scale-up"
        style={{
          maxWidth: '1050px',
          height: '620px',
        }}
      >
        {/* Skip button in top right for step 1 & 2 */}
        {step < 3 && (
          <button
            type="button"
            onClick={onSkip}
            className="absolute top-6 right-8 z-30 px-5 py-2 rounded border border-gray-200 text-gray-400 hover:text-[#3D0C1F] hover:border-[#3D0C1F] transition-all font-semibold uppercase text-[10px] tracking-widest"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Skip
          </button>
        )}

        {/* Step 1: Landing Introduction */}
        {step === 1 && (
          <div className="flex-1 flex h-full">
            {/* Left Content */}
            <div className="w-1/2 p-12 md:p-16 flex flex-col justify-center">
              <span
                className="text-xs uppercase tracking-widest text-[#3D0C1F] font-bold mb-3"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                The Buyer's Journey
              </span>
              <h1
                className="text-gray-900 font-bold mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-playfair)', fontSize: '38px' }}
              >
                The World's<br />Finest Atelier
              </h1>
              <p
                className="text-gray-500 leading-relaxed mb-8 text-sm max-w-sm"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Discover a curated global marketplace where high-end jewelry meets heritage craftsmanship. Experience the pinnacle of bespoke elegance.
              </p>
              <div>
                <button
                  type="button"
                  onClick={handleNext}
                  style={btnStyleMaroon}
                  className="hover:opacity-90"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Right Side Image Layout with Offset Backdrop */}
            <div className="w-1/2 bg-[#FAF8F5] flex items-center justify-center relative p-8">
              <div className="relative w-[300px] h-[360px] max-w-full">
                {/* Dark Maroon Backdrop Card */}
                <div 
                  className="absolute top-0 left-0 w-[88%] h-[88%] rounded-sm"
                  style={{ backgroundColor: '#3D0C1F' }}
                />
                {/* Front Gemstone Image Card */}
                <div className="absolute bottom-0 right-0 w-[88%] h-[88%] bg-white rounded-sm overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center p-3">
                  <div className="relative w-full h-full">
                    <Image
                      src="/pink_gemstone.png"
                      alt="Finest Atelier Gemstone"
                      fill
                      priority
                      className="object-cover object-center rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Benefit Cards */}
        {step === 2 && (
          <div className="flex-1 flex flex-col p-12 md:p-16 justify-between h-full bg-[#FAF8F5]/30">
            <div className="text-center mt-2">
              <span
                className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Capabilities
              </span>
              <h2
                className="text-gray-900 font-bold text-3xl"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                The Buyer's Journey
              </h2>
              <div className="w-12 h-[1.5px] bg-[#3D0C1F] mx-auto mt-3 mb-1" />
            </div>

            {/* Benefit Grid */}
            <div className="grid grid-cols-3 gap-6 my-6">
              {/* Card 1 */}
              <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="relative w-full h-[130px] rounded overflow-hidden mb-4 bg-gray-50">
                  <Image src="/necklaces.png" alt="Discover" fill className="object-cover object-center" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5" style={{ fontFamily: 'var(--font-playfair)' }}>
                  01. Discover
                </h3>
                <p className="text-gray-500 text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Explore unique collections and art from the world's most talented independent artisans.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="relative w-full h-[130px] rounded overflow-hidden mb-4 bg-gray-50">
                  <Image src="/artisan.png" alt="Co-Create" fill className="object-cover object-center" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5" style={{ fontFamily: 'var(--font-playfair)' }}>
                  02. Co-Create
                </h3>
                <p className="text-gray-500 text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Work hand-in-hand to bring your personal vision to life with bespoke craftsmanship.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="relative w-full h-[130px] rounded overflow-hidden mb-4 bg-gray-50">
                  <Image src="/giftbox.png" alt="Secure" fill className="object-cover object-center" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5" style={{ fontFamily: 'var(--font-playfair)' }}>
                  03. Secure
                </h3>
                <p className="text-gray-500 text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Enjoy peace of mind with fully insured express delivery to your doorstep.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center mb-2">
              <button
                type="button"
                onClick={handleBack}
                style={btnStyleOutline}
                className="hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={btnStyleMaroon}
                className="hover:opacity-90"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Purpose & Intent Selection */}
        {step === 3 && (
          <div className="flex-1 flex flex-col p-12 md:p-16 justify-between h-full bg-[#FAF8F5]/30">
            <div className="text-center mt-2">
              <h2
                className="text-gray-900 font-bold text-3xl mb-2"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Bespoke Intent
              </h2>
              <p
                className="text-gray-500 text-[12px] leading-relaxed max-w-lg mx-auto"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Select your primary goals on MoonStella to personalize your discovery feed and match with specialized ateliers.
              </p>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-3 gap-6 my-6 px-4">
              {ONBOARDING_PURPOSES.map((purpose) => {
                const isSelected = selectedGems.includes(purpose.id)
                return (
                  <div
                    key={purpose.id}
                    onClick={() => toggleGem(purpose.id)}
                    className="bg-white rounded border p-6 flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:shadow-md"
                    style={{
                      height: '240px',
                      borderColor: isSelected ? '#3D0C1F' : '#E5E7EB',
                      borderWidth: isSelected ? '2px' : '1px',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                      boxShadow: isSelected ? '0 4px 20px rgba(61,12,31,0.08)' : 'none'
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all"
                      style={{ 
                        backgroundColor: isSelected ? '#3D0C1F' : '#FAF8F5', 
                        color: isSelected ? 'white' : '#3D0C1F' 
                      }}
                    >
                      {purpose.icon}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 
                        className="font-bold text-gray-900 text-sm mb-2" 
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {purpose.name}
                      </h3>
                      <p 
                        className="text-gray-500 text-[11px] leading-relaxed px-2" 
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        {purpose.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-3 text-[9px] font-bold tracking-widest text-[#3D0C1F] uppercase">
                        Selected
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center mb-2">
              <button
                type="button"
                onClick={handleBack}
                style={btnStyleOutline}
                className="hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleLaunch}
                style={btnStyleMaroon}
                className="hover:opacity-90"
              >
                Launch Your Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
