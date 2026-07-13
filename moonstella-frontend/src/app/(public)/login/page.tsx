'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/app/components/shared/navbar'
import { loginApi } from '@/lib/api/auth'
import { useSnackbar } from '@/context/SnackbarContext'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { showSnackbar } = useSnackbar()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginApi({ email, password })
      localStorage.setItem('ms_token', result.token)
      localStorage.setItem('ms_user', JSON.stringify(result.user))

      showSnackbar(`Welcome back, ${result.user.firstName}!`, 'success')

      if (result.user.role === 'buyer') router.push('/buyer/feed')
      else if (result.user.role === 'seller') router.push('/seller/feed')
      else if (result.user.role === 'admin') router.push('/admin/dashboard')
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Invalid email or password.'
      setError(errMsg)
      showSnackbar(errMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Page content — centred vertically and horizontally */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">

        {/* Card container — CSS Grid, two equal columns */}
        <div
          className="login-card-grid w-full overflow-hidden bg-white border border-[#5F3041]/10 rounded-[2rem] shadow-2xl animate-scale-up"
          style={{
            maxWidth: '900px',
            minHeight: '500px',
            display: 'grid',
          }}
        >
          <style>{`
            @media (min-width: 768px) {
              .login-card-grid { grid-template-columns: 1fr 1fr !important; }
            }
          `}</style>

          {/* Left — image */}
          <div className="hidden md:block overflow-hidden">
            <img
              src="/artisan.png"
              alt="Artisan crafting jewellery"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Right — form */}
          <div
            className="flex flex-col items-center justify-center px-12 py-12 bg-white"
            style={{ gridColumn: 'span 1' }}
          >
            <div className="w-full" style={{ maxWidth: '340px' }}>

              {/* Title */}
              <h1
                className="font-serif font-bold text-gray-900 mb-2 leading-tight"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '28px',
                }}
              >
                Sign In to MoonStella
              </h1>
              <p
                className="text-gray-400 leading-relaxed text-xs"
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  marginBottom: '24px',
                }}
              >
                Enter your credentials to access your personal workspace.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Email */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="email123@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-xs bg-white border border-[#5F3041]/10 rounded-xl focus:outline-none focus:border-[#5F3041]/35 shadow-xs transition-all text-gray-800"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                    }}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                    }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-10 text-xs bg-white border border-[#5F3041]/10 rounded-xl focus:outline-none focus:border-[#5F3041]/35 shadow-xs transition-all text-gray-800"
                      style={{
                        fontFamily: 'var(--font-montserrat)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                    >
                      {showPassword ? (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.1 10.1 0 0112 20c-5.4 0-9-7-9-7a17.6 17.6 0 014.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c5.4 0 9 7 9 7a17.6 17.6 0 01-2.06 3.06M3 3l18 18"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <Link
                      href="/forgot-password"
                      className="text-gray-400 hover:text-[#5F3041] transition-colors text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        fontFamily: 'var(--font-montserrat)',
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p
                    className="text-rose-600 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                    }}
                  >
                    {error}
                  </p>
                )}

                {/* Sign in button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: 'var(--font-montserrat)',
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

              </form>

              {/* Join section */}
              <div className="flex flex-col items-center gap-3" style={{ marginTop: '28px' }}>
                <p
                  className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-montserrat)',
                  }}
                >
                  Are you new here and seeking to join us?
                </p>
                <Link
                  href="/get-started"
                  className="w-full py-3 bg-transparent hover:bg-gray-50 border border-[#5F3041]/35 text-[#5F3041] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center text-center leading-none"
                  style={{
                    fontFamily: 'var(--font-montserrat)',
                  }}
                >
                  Join the Circle
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}