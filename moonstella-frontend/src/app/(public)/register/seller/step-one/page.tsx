'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/app/components/shared/navbar'
import StepProgressBar from '@/app/components/shared/stepprogressbar'
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

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-montserrat)',
    backgroundColor: '#F5F2F2',
    border: 'none',
    fontSize: '13px',
    color: '#1a1a1a',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '4px',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-montserrat)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
  }

  const eyeIcon = (show: boolean) => (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      {show
        ? <><path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7" /><circle cx="12" cy="12" r="3" /></>
        : <><path d="M17.94 17.94A10.1 10.1 0 0112 20c-5.4 0-9-7-9-7a17.6 17.6 0 014.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c5.4 0 9 7 9 7a17.6 17.6 0 01-2.06 3.06M3 3l18 18" /></>
      }
    </svg>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF8F5' }}>
      <Navbar />

      {/* Centered card container container */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8 pt-0 md:px-10 md:pb-12 md:pt-0">

        {/* Card container */}
        <div
          className="w-full flex overflow-hidden bg-white"
          style={{
            maxWidth: '1200px',
            minHeight: '700px',
            borderRadius: '4px',
            boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
          }}
        >
          {/* Left image */}
          <div className="hidden md:block relative" style={{ width: '42%', flexShrink: 0 }}>
            <Image src="/sellersignup.png" alt="The Artisan's Vault" fill className="object-cover object-center" priority />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%)' }} />
            <div className="absolute bottom-0 left-0 p-10 z-10">
              <h2 className="font-bold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-playfair)', fontSize: '36px' }}>
                The Artisan's<br />Vault
              </h2>
              <p className="text-white/75 leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px', maxWidth: '260px' }}>
                Join an elite circle of master craftsmen. Step into a world where heritage meets contemporary luxury, and your artistry finds its true home.
              </p>
            </div>
          </div>

          {/* Right — form column */}
          <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 md:p-12">
            <div className="w-full flex flex-col gap-6" style={{ maxWidth: '480px' }}>

              {/* Progress bar inside aligned column */}
              <StepProgressBar currentStep={1} />

              <div>
                <h1 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px' }}>
                  Create Your Seller Profile
                </h1>
                <p className="text-gray-500 mb-6 leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px' }}>
                  Please provide your foundational information to begin your journey with MoonStella.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input name="firstName" placeholder="E.g. Asmi" value={form.firstName} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input name="lastName" placeholder="E.g. K.C" value={form.lastName} onChange={handleChange} required style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Email</label>
                    <input name="email" type="email" placeholder="E.g. asmi123@gmail.com" value={form.email} onChange={handleChange} required style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input name="phoneNumber" type="tel" placeholder="E.g. 9800000000" value={form.phoneNumber} onChange={handleChange} required style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Password</label>
                    <div className="relative">
                      <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange} required style={{ ...inputStyle, paddingRight: '44px' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{eyeIcon(showPassword)}</button>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Confirm Password</label>
                    <div className="relative">
                      <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required style={{ ...inputStyle, paddingRight: '44px' }} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{eyeIcon(showConfirm)}</button>
                    </div>
                  </div>

                  {error && <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '12px', color: '#EF4444' }}>{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 text-white rounded uppercase transition-opacity hover:opacity-90 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3D0C1F', fontFamily: 'var(--font-montserrat)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em' }}
                  >
                    {loading ? 'Checking...' : 'Continue'}
                  </button>

                  <p className="text-center" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '12px', color: '#6B7280' }}>
                    Already part of the Marketplace?{' '}
                    <Link href="/login" style={{ color: '#3D0C1F', fontWeight: 600 }}>Sign In</Link>
                  </p>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}