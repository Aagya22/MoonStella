'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SellerOnboardingProps {
  onComplete: (specialty: string, responseTime: string) => void
  onSkip: () => void
}

const SPECIALTIES = [
  {
    id: 'custom',
    name: 'Bespoke Co-Creation',
    subtext: 'Designing from scratch',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l.75-.75 2.122 2.122-.75.75a3.75 3.75 0 11-5.03-5.03l.75-.75 2.122 2.122-.75.75a1.5 1.5 0 102.036 2.036zM20.647 3.353a2.25 2.25 0 00-3.182 0l-5.34 5.34a.75.75 0 00-.22.53v2.12c0 .414.336.75.75.75h2.12a.75.75 0 00.53-.22l5.34-5.34a2.25 2.25 0 000-3.182z" />
      </svg>
    )
  },
  {
    id: 'ready-made',
    name: 'Collection Adaptation',
    subtext: 'Modifying signature lines',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    )
  },
  {
    id: 'both',
    name: 'Heirloom Restoration',
    subtext: 'Resetting legacy gems',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-1.208-1.425-2.73-2.25-4.5-2.25a4.5 4.5 0 000 9c1.77 0 3.292-.825 4.5-2.25 1.208 1.425 2.73 2.25 4.5 2.25a4.5 4.5 0 000-9c-1.77 0-3.292.825-4.5 2.25z" />
      </svg>
    )
  }
]

const RESPONSE_TIMES = [
  'Within 1 Hour',
  'Within 4 Hours',
  'Within 24 Hours',
  'Within 1-2 Days'
]

export default function SellerOnboarding({ onComplete, onSkip }: SellerOnboardingProps) {
  const [step, setStep] = useState(1)
  const [selectedSpecialty, setSelectedSpecialty] = useState('custom')
  const [responseTime, setResponseTime] = useState('Within 24 Hours')

  const handleNext = () => setStep((prev) => prev + 1)
  const handleBack = () => setStep((prev) => prev - 1)

  const handleLaunch = () => {
    onComplete(selectedSpecialty, responseTime)
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
        {/* Step 1: Digital Studio Cover Introduction */}
        {step === 1 && (
          <div className="flex-1 flex h-full">
            {/* Left Cover Image */}
            <div className="w-1/2 relative bg-[#2A1E1E]">
              <Image
                src="/seller_onboarding_1.png"
                alt="Your Global Digital Studio"
                fill
                priority
                className="object-cover object-center opacity-90"
              />
              <div 
                className="absolute bottom-10 left-10 z-10 text-[10px] tracking-[0.2em] font-bold text-[#E9D7C3] uppercase"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                The Artisan Journey
              </div>
            </div>

            {/* Right Content */}
            <div className="w-1/2 p-12 md:p-16 flex flex-col justify-center bg-white">
              <h1
                className="text-gray-900 font-bold mb-5 leading-tight"
                style={{ fontFamily: 'var(--font-playfair)', fontSize: '38px' }}
              >
                Your Global Digital<br />Studio
              </h1>
              <p
                className="text-gray-500 leading-relaxed mb-8 text-sm max-w-sm"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Showcase your craftsmanship to a world of discerning buyers. MoonStella provides the tools to manage bespoke commissions and high-value sales.
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleNext}
                  style={btnStyleMaroon}
                  className="hover:opacity-90"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  style={btnStyleOutline}
                  className="hover:bg-gray-50"
                >
                  Skip the Introduction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Capabilities Cards Layout */}
        {step === 2 && (
          <div className="flex-1 flex flex-col p-12 md:p-14 justify-between h-full bg-[#FAF8F5]/20">
            {/* Top row: split layout */}
            <div className="flex justify-between items-start gap-12 mt-2">
              {/* Top Left text */}
              <div className="w-3/5">
                <h2
                  className="text-[#3D0C1F] font-bold text-3xl mb-4 leading-tight"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  Crafting Without Borders
                </h2>
                <p
                  className="text-gray-500 text-xs leading-relaxed max-w-lg"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Empowering the world's most talented jewelry artisans to connect with global collectors through a seamless, prestige digital workflow.
                </p>
              </div>
              {/* Top Right rounded image */}
              <div className="w-2/5 relative h-[120px] rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <Image
                  src="/seller_onboarding_2.png"
                  alt="Crafting without borders"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Bottom Row: 3 Capabilities cards */}
            <div className="grid grid-cols-3 gap-6 my-6">
              {/* Card 1 */}
              <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-start text-left">
                <div className="w-9 h-9 rounded-full bg-[#FAF8F5] flex items-center justify-center mb-4 border border-[#3D0C1F]/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D0C1F" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                  1. Curate
                </h3>
                <p className="text-gray-500 text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Upload your portfolio of masterpieces. Our high-resolution gallery tools ensure your craftsmanship is showcased in its most editorial light.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-start text-left">
                <div className="w-9 h-9 rounded-full bg-[#FAF8F5] flex items-center justify-center mb-4 border border-[#3D0C1F]/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D0C1F" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                  2. Collaborate
                </h3>
                <p className="text-gray-500 text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Receive and manage design briefs from global collectors. Use our integrated suite to refine sketches, stone selections, and technical specs.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-start text-left">
                <div className="w-9 h-9 rounded-full bg-[#FAF8F5] flex items-center justify-center mb-4 border border-[#3D0C1F]/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D0C1F" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                  3. Deliver
                </h3>
                <p className="text-gray-500 text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Once finished, deliver your products and track the timeline.
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

        {/* Step 3: Define Your Studio selection & response time */}
        {step === 3 && (
          <div className="flex-1 flex h-full">
            {/* Left Cover Image with Quote */}
            <div className="w-1/2 relative bg-[#2A1E1E]">
              <Image
                src="/seller_onboarding_3.png"
                alt="Define Your Studio"
                fill
                priority
                className="object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-10 right-10 z-10">
                <p
                  className="text-white text-lg italic leading-relaxed mb-4"
                  style={{ fontFamily: 'var(--font-playfair)', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
                >
                  "Craftsmanship is the visible expression of the soul."
                </p>
                <div className="w-14 h-[1.5px] bg-[#E9D7C3] opacity-80" />
              </div>
            </div>

            {/* Right Form Side */}
            <div className="w-1/2 p-12 md:p-14 flex flex-col justify-between bg-white h-full">
              <div>
                <h2
                  className="text-gray-900 font-bold text-3xl mb-2"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  Define Your Studio
                </h2>
                <p
                  className="text-gray-500 text-xs leading-relaxed mb-6"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Position your expertise within the Lumire ecosystem. Tell us about the nature of your craft and availability.
                </p>

                {/* Studio Specialty Row */}
                <div className="mb-6">
                  <label
                    className="block text-[9px] font-bold tracking-widest text-[#3D0C1F] uppercase mb-3"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Studio Specialty
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {SPECIALTIES.map((spec) => {
                      const isSelected = selectedSpecialty === spec.id
                      return (
                        <div
                          key={spec.id}
                          onClick={() => setSelectedSpecialty(spec.id)}
                          className="rounded border p-3 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md text-center"
                          style={{
                            height: '110px',
                            backgroundColor: isSelected ? '#3D0C1F' : 'white',
                            borderColor: isSelected ? '#3D0C1F' : '#E5E7EB',
                            color: isSelected ? 'white' : '#374151',
                            boxShadow: isSelected ? '0 4px 12px rgba(61,12,31,0.2)' : 'none'
                          }}
                        >
                          <div className={`mb-2 ${isSelected ? 'text-[#E9D7C3]' : 'text-[#3D0C1F]'}`}>
                            {spec.svg}
                          </div>
                          <span
                            className="text-[10px] font-bold tracking-wide block mb-0.5"
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                          >
                            {spec.name}
                          </span>
                          <span
                            className={`text-[8px] ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                          >
                            {spec.subtext}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Response Time Custom Grid Selection */}
                <div>
                  <label
                    className="block text-[9px] font-bold tracking-widest text-[#3D0C1F] uppercase mb-3"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Average Response Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESPONSE_TIMES.map((time) => {
                      const isSelected = responseTime === time
                      return (
                        <div
                          key={time}
                          onClick={() => setResponseTime(time)}
                          className="rounded border px-3 py-2 flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 text-center"
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-montserrat)',
                            letterSpacing: '0.02em',
                            backgroundColor: isSelected ? '#3D0C1F' : '#FAF8F5',
                            borderColor: isSelected ? '#3D0C1F' : '#E5E7EB',
                            color: isSelected ? 'white' : '#4B5563',
                            boxShadow: isSelected ? '0 4px 10px rgba(61,12,31,0.15)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {time}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-between items-center mt-4">
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
          </div>
        )}
      </div>
    </div>
  )
}
