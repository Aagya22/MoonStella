'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginApi } from '@/lib/api/auth'
import Image from 'next/image'
type Role = 'collector' | 'artisan'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('collector')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginApi({ email, password })

      // Save token to localStorage
      localStorage.setItem('ms_token', result.token)
      localStorage.setItem('ms_user', JSON.stringify(result.user))

      // Redirect based on role
      if (result.user.role === 'buyer') {
        router.push('/buyer/feed')
      } else if (result.user.role === 'seller') {
        router.push('/seller/feed')
      } else if (result.user.role === 'admin') {
        router.push('/admin/dashboard')
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex">

      {/* Left — image */}
      <div className="hidden md:block w-1/2 relative overflow-hidden">
        
          
          <Image src="/artisan.png" alt="Artisan crafting jewellery" fill className="object-cover" />
        *
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950" />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a0f0a 0%, #2c1810 50%, #0d0705 100%)',
          }}
        />
      </div>

      {/* Right — form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">

          {/* Title */}
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Sign In to MoonStella
          </h1>
          <p
            className="text-sm text-gray-500 mb-8"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Enter your credentials to access your personal workspace.
          </p>

          {/* Role toggle */}
          <div className="flex items-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setRole('collector')}
              className="px-6 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all"
              style={{
                fontFamily: 'var(--font-montserrat)',
                backgroundColor: role === 'collector' ? '#3D0C1F' : 'transparent',
                color: role === 'collector' ? '#fff' : '#3D0C1F',
                border: `1.5px solid ${role === 'collector' ? '#3D0C1F' : '#d1d5db'}`,
              }}
            >
              COLLECTOR
            </button>
            <button
              type="button"
              onClick={() => setRole('artisan')}
              className="px-6 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all"
              style={{
                fontFamily: 'var(--font-montserrat)',
                backgroundColor: role === 'artisan' ? '#3D0C1F' : 'transparent',
                color: role === 'artisan' ? '#fff' : '#3D0C1F',
                border: `1.5px solid ${role === 'artisan' ? '#3D0C1F' : '#d1d5db'}`,
              }}
            >
              ARTISAN
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold tracking-widest text-gray-700"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                EMAIL
              </label>
              <input
                type="email"
                placeholder="email123@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-stone-400 transition-colors"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold tracking-widest text-gray-700"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-stone-400 transition-colors"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p
                className="text-xs text-red-500"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {error}
              </p>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xs font-bold tracking-widest text-white rounded transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                backgroundColor: '#3D0C1F',
                fontFamily: 'var(--font-montserrat)',
              }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

          </form>

          {/* Join section */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Are you a new and seeking to join us?
            </p>
            <Link
              href="/register/buyer/step-one"
              className="w-full py-3.5 text-xs font-bold tracking-widest text-center rounded border-2 transition-colors hover:bg-gray-50"
              style={{
                borderColor: '#3D0C1F',
                color: '#3D0C1F',
                fontFamily: 'var(--font-montserrat)',
              }}
            >
              JOIN THE CIRCLE
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}