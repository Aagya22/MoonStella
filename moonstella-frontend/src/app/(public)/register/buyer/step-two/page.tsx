'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/app/components/navbar'
import { registerApi } from '@/lib/api/auth'
import api from '@/lib/api/axios'

export default function BuyerRegisterStepTwo() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Get step one data
      const stepOne = sessionStorage.getItem('buyer_step_one')
      if (!stepOne) {
        router.push('/register/buyer/step-one')
        return
      }
      const stepOneData = JSON.parse(stepOne)

      // Register user
      const result = await registerApi(stepOneData)

      // Save token
      localStorage.setItem('ms_token', result.token)
      localStorage.setItem('ms_user', JSON.stringify(result.user))

      // Update profile with avatar and location
      let avatarUrl = null
      if (file) {
        const formData = new FormData()
        formData.append('image', file)
        const uploadRes = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        avatarUrl = uploadRes.data.data.url
      }

      await api.patch('/api/auth/profile', {
        avatar: avatarUrl,
        location: location || null,
      })

      sessionStorage.removeItem('buyer_step_one')
      router.push('/buyer/feed')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF8F5' }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          className="w-full flex"
          style={{
            maxWidth: '960px',
            minHeight: '600px',
            borderRadius: '4px',
            boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
            background: 'white',
          }}
        >

          {/* Left — image with caption */}
          <div
            className="hidden md:flex relative flex-col justify-end overflow-hidden"
            style={{ width: '42%', flexShrink: 0, borderRadius: '4px 0 0 4px' }}
          >
            <Image
              src="/buyersignupp.png"
              alt="Jewellery"
              fill
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 50%)' }}
            />
            <div className="relative z-10 p-8">
              <p
                className="text-white/90 leading-relaxed"
                style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px' }}
              >
                Begin your exclusive access to the Vault and our bespoke artisan services.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="flex-1 flex flex-col px-10 py-10">

            {/* Title */}
            <h1
              className="font-bold text-gray-900 mb-1"
              style={{ fontFamily: 'var(--font-playfair)', fontSize: '28px' }}
            >
              Define Your Identity
            </h1>
            <p
              className="text-gray-500 mb-8"
              style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px' }}
            >
              Tell us where you are and how you wish to be seen by our artisans.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">

              {/* Section 1 — Profile Image */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: '#3D0C1F', fontFamily: 'var(--font-montserrat)' }}
                  >
                    1
                  </div>
                  <h2
                    className="font-semibold text-gray-900"
                    style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px' }}
                  >
                    Profile Image
                  </h2>
                </div>

                {/* Upload box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded cursor-pointer flex flex-col items-center justify-center transition-colors hover:bg-gray-50"
                  style={{
                    border: '1.5px dashed #D0C4C4',
                    minHeight: '160px',
                    backgroundColor: '#FAF8F8',
                  }}
                >
                  {preview ? (
                    <div className="relative w-full h-40 rounded overflow-hidden">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-10">
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#3D0C1F" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                      </svg>
                      <p
                        className="font-semibold uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-montserrat)', fontSize: '10px', color: '#3D0C1F' }}
                      >
                        Upload Profile Image
                      </p>
                      <p
                        className="text-gray-400 text-center"
                        style={{ fontFamily: 'var(--font-montserrat)', fontSize: '11px' }}
                      >
                        Recommended: 1200 x 800px. Minimal backgrounds preferred.
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Section 2 — Location */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: '#3D0C1F', fontFamily: 'var(--font-montserrat)' }}
                  >
                    2
                  </div>
                  <h2
                    className="font-semibold text-gray-900"
                    style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px' }}
                  >
                    Location
                  </h2>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="uppercase text-gray-500"
                    style={{ fontFamily: 'var(--font-montserrat)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em' }}
                  >
                    Official Studio Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Gilded Vault"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded focus:outline-none"
                    style={{ fontFamily: 'var(--font-montserrat)', backgroundColor: '#F5F2F2', border: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => router.push('/register/buyer/step-one')}
                  className="px-8 py-3.5 rounded border-2 uppercase transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: '#3D0C1F',
                    color: '#3D0C1F',
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                  }}
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3.5 text-white rounded uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{
                    backgroundColor: '#3D0C1F',
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                  }}
                >
                  {loading ? 'Creating...' : 'Get Started'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}