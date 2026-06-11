'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/app/components/navbar'

export default function SellerRegisterStepOne() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
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

    sessionStorage.setItem('seller_step_one', JSON.stringify({
      ...form,
      role: 'seller',
    }))

    router.push('/register/seller/step-two')
  }

  const inputStyle = {
    fontFamily: 'var(--font-montserrat)',
    backgroundColor: '#F5F2F2',
    border: 'none',
    fontSize: '13px',
    color: '#1a1a1a',
  }

  const labelStyle = {
    fontFamily: 'var(--font-montserrat)',
    fontSize: '10px',
    fontWeight: 600 as const,
    letterSpacing: '0.1em',
    color: '#3D0C1F',
  }

  const eyeIcon = (show: boolean) => (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {show
        ? <><path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.1 10.1 0 0112 20c-5.4 0-9-7-9-7a17.6 17.6 0 014.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c5.4 0 9 7 9 7a17.6 17.6 0 01-2.06 3.06M3 3l18 18"/></>
      }
    </svg>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF8F5' }}>
      <Navbar />

      <div className="flex-1 flex items-stretch">

        {/* Left — full bleed image */}
        <div className="hidden md:block relative" style={{ width: '42%', flexShrink: 0 }}>
          <Image
            src="/sellersignup.png"
            alt="The Artisan's Vault"
            fill
            className="object-cover object-center"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)' }}
          />
          <div className="absolute bottom-0 left-0 p-10 z-10">
            <h2
              className="font-bold text-white leading-tight mb-4"
              style={{ fontFamily: 'var(--font-playfair)', fontSize: '36px' }}
            >
              The Artisan's<br />Vault
            </h2>
            <p
              className="text-white/75 leading-relaxed"
              style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px', maxWidth: '260px' }}
            >
              Join an elite circle of master craftsmen. Step into a world where
              heritage meets contemporary luxury, and your artistry finds its true home.
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div
          className="flex-1 bg-white flex items-center justify-center px-10 py-12"
        >
          <div className="w-full" style={{ maxWidth: '460px' }}>

            <h1
              className="font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'var(--font-playfair)', fontSize: '32px' }}
            >
              Create Your Seller Profile
            </h1>
            <p
              className="text-gray-500 mb-7 leading-relaxed"
              style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px' }}
            >
              Please provide your foundational information to begin your journey
              with MoonStella.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* First + Last name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>First Name</label>
                  <input name="firstName" placeholder="E.g. Asmi" value={form.firstName} onChange={handleChange} required className="px-4 py-3 rounded focus:outline-none" style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Last Name</label>
                  <input name="lastName" placeholder="E.g. K.C" value={form.lastName} onChange={handleChange} required className="px-4 py-3 rounded focus:outline-none" style={inputStyle} />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" placeholder="E.g. asmi123@gmail.com" value={form.email} onChange={handleChange} required className="px-4 py-3 rounded focus:outline-none" style={inputStyle} />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Phone Number</label>
                <input name="phoneNumber" type="tel" placeholder="E.g. 9800000000" value={form.phoneNumber} onChange={handleChange} required className="px-4 py-3 rounded focus:outline-none" style={inputStyle} />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Password</label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange} required className="w-full px-4 py-3 rounded focus:outline-none pr-10" style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{eyeIcon(showPassword)}</button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Confirm Password</label>
                <div className="relative">
                  <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required className="w-full px-4 py-3 rounded focus:outline-none pr-10" style={inputStyle} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{eyeIcon(showConfirm)}</button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs" style={{ fontFamily: 'var(--font-montserrat)' }}>{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 text-white rounded uppercase transition-opacity hover:opacity-90 mt-1"
                style={{ backgroundColor: '#3D0C1F', fontFamily: 'var(--font-montserrat)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em' }}
              >
                Continue
              </button>

              <p className="text-center text-gray-500" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '12px' }}>
                Already part of the Marketplace?{' '}
                <Link href="/login" className="font-semibold" style={{ color: '#3D0C1F' }}>Sign In</Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}