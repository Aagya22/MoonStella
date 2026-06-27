'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/app/components/navbar'
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

        {/* Card container */}
        <div
          className="w-full flex overflow-hidden"
          style={{
            maxWidth: '900px',
            minHeight: '580px',
            borderRadius: '4px',
            boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
          }}
        >

          {/* Left — image */}
          <div className="hidden md:block relative" style={{ width: '45%', flexShrink: 0 }}>
            <Image
              src="/artisan.png"
              alt="Artisan crafting jewellery"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Right — form */}
          <div
            className="flex-1 bg-white flex items-center justify-center px-10 py-12"
          >
            <div className="w-full" style={{ maxWidth: '340px' }}>

              {/* Title */}
              <h1
                className="font-bold text-gray-900 mb-2 leading-tight"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '28px',
                }}
              >
                Sign In to MoonStella
              </h1>
              <p
                className="text-gray-500 mb-8 leading-relaxed"
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  fontSize: '13px',
                }}
              >
                Enter your credentials to access your personal workspace.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="uppercase text-gray-700"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email123@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-sm rounded focus:outline-none transition-colors"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      backgroundColor: '#F5F2F2',
                      border: 'none',
                      color: '#1a1a1a',
                    }}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="uppercase text-gray-700"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
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
                      className="w-full px-4 py-3 text-sm rounded focus:outline-none transition-colors pr-10"
                      style={{
                        fontFamily: 'var(--font-montserrat)',
                        backgroundColor: '#F5F2F2',
                        border: 'none',
                        color: '#1a1a1a',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.1 10.1 0 0112 20c-5.4 0-9-7-9-7a17.6 17.6 0 014.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c5.4 0 9 7 9 7a17.6 17.6 0 01-2.06 3.06M3 3l18 18"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      style={{
                        fontFamily: 'var(--font-montserrat)',
                        fontSize: '11px',
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p
                    className="text-red-500 -mt-2"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      fontSize: '12px',
                    }}
                  >
                    {error}
                  </p>
                )}

                {/* Sign in button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-white rounded transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                  style={{
                    backgroundColor: '#3D0C1F',
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

              </form>

              {/* Join section */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <p
                  className="text-gray-500"
                  style={{
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: '12px',
                  }}
                >
                  Are you a new and seeking to join us?
                </p>
                <Link
                  href="/get-started"
                  className="w-full py-3.5 text-center rounded border-2 transition-colors hover:bg-gray-50 uppercase"
                  style={{
                    borderColor: '#3D0C1F',
                    color: '#3D0C1F',
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
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