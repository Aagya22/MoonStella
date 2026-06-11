'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/app/components/navbar'
import { registerApi } from '@/lib/api/auth'
import api from '@/lib/api/axios'

export default function SellerRegisterStepTwo() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [studioName, setStudioName] = useState('')
  const [cityCountry, setCityCountry] = useState('')
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
      const stepOne = sessionStorage.getItem('seller_step_one')
      if (!stepOne) {
        router.push('/register/seller/step-one')
        return
      }
      const stepOneData = JSON.parse(stepOne)

      const result = await registerApi(stepOneData)

      localStorage.setItem('ms_token', result.token)
      localStorage.setItem('ms_user', JSON.stringify(result.user))

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
        studioName: studioName || null,
        location: cityCountry || null,
      })

      sessionStorage.removeItem('seller_step_one')
      router.push('/seller/feed')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    fontFamily: 'var(--font-montserrat)',
    backgroundColor: '#F5F2F2',
    border: 'none',
    fontSize: '13px',
    color: '#1a1a1a',
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

          {/* Left — text and image */}
          <div
            className="hidden md:flex flex-col p-10 justify-between"
            style={{ width: '42%', flexShrink: 0, backgroundColor: '#FAF8F5' }}
          >
            <div>
              <h2
                className="font-bold text-gray-900 leading-tight mb-4"
                style={{ fontFamily: 'var(--font-playfair)', fontSize: '32px' }}
              >
                Define Your<br />Creative<br />Sanctuary
              </h2>
              <p
                className="text-gray-500 leading-relaxed"
                style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px' }}
              >
                Your studio profile is the digital window into your craft. Share
                where your pieces come to life and present the face of your atelier
                to the world's most discerning collectors.
              </p>
            </div>
            {/* Ring image */}
            <div className="relative w-full rounded overflow-hidden" style={{ height: '260px' }}>
              <Image
                src="/sellersignupp.jpg"
                alt="Jewellery ring"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Right — form */}
          <div className="flex-1 flex flex-col px-10 py-10">

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 h-full">

              {/* Section 1 — Seller Portrait */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: '#FCE8F0', color: '#3D0C1F', fontFamily: 'var(--font-montserrat)' }}
                  >
                    1
                  </div>
                  <h2
                    className="font-semibold text-gray-900"
                    style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px' }}
                  >
                    Seller Portrait
                  </h2>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded cursor-pointer flex flex-col items-center justify-center transition-colors hover:bg-gray-50"
                  style={{ border: '1.5px dashed #D0C4C4', minHeight: '150px', backgroundColor: '#FAF8F8' }}
                >
                  {preview ? (
                    <div className="relative w-full h-36 rounded overflow-hidden">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                      </svg>
                      <p className="font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '10px', color: '#6B7280' }}>
                        Upload Profile Image
                      </p>
                      <p className="text-gray-400 text-center" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '11px' }}>
                        Recommended: 1200 x 800px. Minimal backgrounds preferred.
                      </p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Section 2 — Seller Location */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: '#FCE8F0', color: '#3D0C1F', fontFamily: 'var(--font-montserrat)' }}
                  >
                    2
                  </div>
                  <h2
                    className="font-semibold text-gray-900"
                    style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px' }}
                  >
                    Seller Location
                  </h2>
                </div>

                <div className="flex flex-col gap-4">
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
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      className="w-full px-4 py-3 rounded focus:outline-none"
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="uppercase text-gray-500"
                      style={{ fontFamily: 'var(--font-montserrat)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em' }}
                    >
                      City & Country
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Paris, France"
                        value={cityCountry}
                        onChange={(e) => setCityCountry(e.target.value)}
                        className="w-full px-4 py-3 rounded focus:outline-none pr-10"
                        style={inputStyle}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs" style={{ fontFamily: 'var(--font-montserrat)' }}>{error}</p>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-4 mt-auto">
                <button
                  type="button"
                  onClick={() => router.push('/register/seller/step-one')}
                  className="px-8 py-3.5 rounded border-2 uppercase transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#3D0C1F', color: '#3D0C1F', fontFamily: 'var(--font-montserrat)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3.5 text-white rounded uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#3D0C1F', fontFamily: 'var(--font-montserrat)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em' }}
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