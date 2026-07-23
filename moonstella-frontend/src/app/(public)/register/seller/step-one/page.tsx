'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/app/components/shared/navbar'
import { checkUniqueApi } from '@/lib/api/auth'

export default function SellerRegisterStepOne() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isBack = params.get('back') === 'true'

    if (isBack) {
      const saved = sessionStorage.getItem('seller_step_one')
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm({
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || '',
          phoneNumber: parsed.phoneNumber || '',
          password: parsed.password || '',
          confirmPassword: parsed.confirmPassword || '',
        })
      }
    } else {
      sessionStorage.removeItem('seller_step_one')
      sessionStorage.removeItem('seller_step_two')
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await checkUniqueApi({
        email: form.email,
        phoneNumber: form.phoneNumber,
      })

      sessionStorage.setItem('seller_step_one', JSON.stringify({ ...form, role: 'seller' }))
      router.push('/register/seller/step-two')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Email or phone number is already registered')
    } finally {
      setLoading(false)
    }
  }

  const eyeIcon = (show: boolean) => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {show ? (
        <>
          <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.1 10.1 0 0112 20c-5.4 0-9-7-9-7a17.6 17.6 0 014.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c5.4 0 9 7 9 7a17.6 17.6 0 01-2.06 3.06M3 3l18 18" />
        </>
      )}
    </svg>
  )

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      <Navbar />

      {/* Floating Premium Card Wrapper */}
      <div className="flex-1 flex items-center justify-center px-4 py-3 md:px-8 md:py-4">
        <div
          className="w-full flex flex-col md:flex-row bg-[#FDFBF7] overflow-hidden"
          style={{
            maxWidth: '980px',
            borderRadius: '2rem',
            boxShadow: '0 24px 60px rgba(75, 19, 37, 0.04)',
            border: '1px solid rgba(75, 19, 37, 0.05)',
          }}
        >
          {/* Left panel - 40% Width Image with subtle divider */}
          <div
            className="hidden md:block relative border-r border-[#E6DFD5]/40"
            style={{ width: '40%', flexShrink: 0 }}
          >
            <Image
              src="/sellersignup.png"
              alt="The Artisan's Vault"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Dark Gradient Overlay */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: 'linear-gradient(to top, rgba(15, 5, 8, 0.85) 0%, rgba(15, 5, 8, 0.15) 100%)',
              }}
            />
            {/* Elegant bottom typography */}
            <div className="absolute bottom-0 left-0 p-6 z-20">
              <h2
                className="font-bold text-[#FDFBF7] leading-tight mb-2.5"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '28px',
                  letterSpacing: '-0.02em',
                }}
              >
                The Artisan&apos;s
                <br />
                Vault
              </h2>
              <div
                style={{
                  width: '32px',
                  height: '2px',
                  backgroundColor: '#B78A3C',
                  marginBottom: '10px',
                }}
              />
              <p
                className="text-[#FAF8F5]/80 leading-relaxed font-light"
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: '11px',
                  maxWidth: '240px',
                  letterSpacing: '0.01em',
                }}
              >
                Join an elite circle of master craftsmen. Step into a world where
                heritage meets luxury, and your artistry finds its true home.
              </p>
            </div>
          </div>

          {/* Right panel - 60% Width Form vertically centered */}
          <div className="flex-1 flex flex-col justify-center px-6 py-6 md:px-14 md:py-8 bg-[#FDFBF7]">
            <div className="w-full mx-auto" style={{ maxWidth: '420px' }}>
              
              {/* Title Section */}
              <div className="mb-5">
                <h1
                  className="font-bold text-gray-900 leading-tight"
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '24px',
                  }}
                >
                  Create Your Profile
                </h1>
                {/* Gold Accent Line */}
                <div
                  style={{
                    width: '28px',
                    height: '2px',
                    backgroundColor: '#B78A3C',
                    marginTop: '6px',
                    marginBottom: '8px',
                  }}
                />
                <p
                  className="text-gray-400 font-light leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: '11px',
                  }}
                >
                  Provide your foundational details to begin your onboarding journey.
                </p>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                
                {/* First & Last Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <label
                      className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                      style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                    >
                      First Name
                    </label>
                    <input
                      name="firstName"
                      placeholder="E.g. Asmi"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className="w-full h-[42px] px-3.5 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label
                      className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                      style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                    >
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      placeholder="E.g. K.C"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className="w-full h-[42px] px-3.5 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="flex flex-col gap-0.5">
                  <label
                    className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                  >
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="E.g. asmi123@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full h-[42px] px-3.5 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  />
                </div>

                {/* Phone Number field */}
                <div className="flex flex-col gap-0.5">
                  <label
                    className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                  >
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    placeholder="E.g. 9800000000"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full h-[42px] px-3.5 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  />
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-0.5">
                  <label
                    className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full h-[42px] px-3.5 pr-10 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100/50 hover:text-[#4B1325] transition-all duration-300 focus:outline-none"
                    >
                      {eyeIcon(showPassword)}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                <div className="flex flex-col gap-0.5">
                  <label
                    className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full h-[42px] px-3.5 pr-10 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100/50 hover:text-[#4B1325] transition-all duration-300 focus:outline-none"
                    >
                      {eyeIcon(showConfirm)}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <p
                    className="text-rose-600 text-[9px] font-semibold uppercase tracking-wide mt-0.5"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    {error}
                  </p>
                )}

                {/* Continue button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[42px] mt-1.5 text-xs font-bold uppercase tracking-widest rounded-xl text-[#E9D7C3] hover:text-[#FFFFFF] bg-gradient-to-r from-[#4B1325] to-[#7A2A46] hover:shadow-lg hover:shadow-[#4B1325]/10 focus:outline-none transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {loading ? 'Validating...' : 'Continue'}
                </button>

                {/* Sign In Link */}
                <p
                  className="text-center text-xs text-gray-400 font-light mt-1.5"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Already part of the Marketplace?{' '}
                  <Link
                    href="/login"
                    className="text-[#4B1325] font-bold hover:underline ml-1"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}