'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/app/components/shared/navbar'
import { registerApi, updateProfileApi } from '@/lib/api/auth'
import { nepalLocations, districts } from '@/lib/nepal-locations/location'
import { useSnackbar } from '@/context/SnackbarContext'

export default function SellerRegisterStepTwo() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [studioName, setStudioName] = useState('')
  const [district, setDistrict] = useState('')
  const [locality, setLocality] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    const saved = sessionStorage.getItem('seller_step_one')
    if (!saved) router.push('/register/seller/step-one')
  }, [router])

  useEffect(() => {
    const saved = sessionStorage.getItem('seller_step_two')
    if (saved) {
      const parsed = JSON.parse(saved)
      setStudioName(parsed.studioName || '')
      setDistrict(parsed.district || '')
      setLocality(parsed.locality || '')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleBack = () => {
    sessionStorage.setItem('seller_step_two', JSON.stringify({ studioName, district, locality }))
    router.push('/register/seller/step-one?back=true')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!studioName.trim()) {
      setError('Studio name is required for sellers')
      return
    }
    if (!district || !locality) {
      setError('Please select your district and locality — location is required')
      return
    }

    setLoading(true)

    try {
      const stepOne = sessionStorage.getItem('seller_step_one')
      if (!stepOne) {
        router.push('/register/seller/step-one')
        return
      }
      const stepOneData = JSON.parse(stepOne)

      // Register
      const result = await registerApi(stepOneData)
      const token = result.token

      // Save token immediately
      localStorage.setItem('ms_token', token)
      localStorage.setItem('ms_user', JSON.stringify(result.user))

      // Upload avatar
      let avatarUrl: string | null = null
      if (file) {
        const formData = new FormData()
        formData.append('image', file)
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
          const data = await res.json()
          avatarUrl = data?.data?.url ?? null
        } catch {
          // continue without avatar
        }
      }

      // Update profile — pass token directly
      await updateProfileApi(
        {
          avatar: avatarUrl,
          studioName: studioName.trim(),
          location: `${locality}, ${district}, Nepal`,
        },
        token
      )

      sessionStorage.removeItem('seller_step_one')
      sessionStorage.removeItem('seller_step_two')
      showSnackbar('Welcome to MoonStella! Your artisan account has been registered.', 'success')
      router.push('/seller/feed')
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Something went wrong. Please try again.'
      setError(errMsg)
      showSnackbar(errMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const localities = district ? nepalLocations[district] || [] : []

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
              src="/sellersignupp.jpg"
              alt="Atelier Sanctuary"
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
            <div className="absolute bottom-0 left-0 p-8 z-20">
              <h2
                className="font-bold text-[#FDFBF7] leading-tight mb-2.5"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '28px',
                  letterSpacing: '-0.02em',
                }}
              >
                Define Your
                <br />
                Atelier
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
                Your studio profile is the digital window into your craft.
                Share where your pieces come to life and present your face
                to the world&apos;s most discerning collectors.
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
                  Atelier Details
                </h1>
                {/* Gold Accent Line */}
                <div
                  style={{
                    width: '32px',
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
                  Configure your digital showroom settings and upload your portrait.
                </p>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                
                {/* Portrait Upload Section */}
                <div className="flex flex-row gap-4 items-center justify-between p-3 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-2xl">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      Artisan Portrait
                    </span>
                    <p
                      className="text-[10px] text-gray-400 font-light max-w-[200px]"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      Square format, clear background.
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      onClick={!preview ? () => fileInputRef.current?.click() : undefined}
                      className="w-14 h-14 rounded-full border border-dashed border-[#B78A3C]/40 bg-[#FDFBF7] relative overflow-hidden flex items-center justify-center transition-all duration-300 hover:border-[#B78A3C]"
                      style={{ cursor: !preview ? 'pointer' : 'default' }}
                    >
                      {preview ? (
                        <Image src={preview} alt="Portrait Preview" fill className="object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 text-center">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#B78A3C" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <span
                            className="text-[6px] font-bold tracking-widest text-[#B78A3C] uppercase"
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                          >
                            Upload
                          </span>
                        </div>
                      )}
                    </div>

                    {preview && (
                      <div className="flex gap-1 mt-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-white border border-[#4B1325]/10 rounded text-gray-700 hover:bg-gray-50"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null)
                            setPreview(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-rose-50 border border-rose-200 rounded text-rose-700 hover:bg-rose-100"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        >
                          Remove
                        </button>
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

                {/* Studio Name Input */}
                <div className="flex flex-col gap-0.5">
                  <label
                    className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                  >
                    Official Studio Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. The Gilded Vault"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    required
                    className="w-full h-[42px] px-3.5 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  />
                </div>

                {/* District Select */}
                <div className="flex flex-col gap-0.5">
                  <label
                    className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                  >
                    District
                  </label>
                  <div className="relative">
                    <select
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value)
                        setLocality('')
                      }}
                      required
                      className="w-full h-[42px] px-3.5 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20 appearance-none cursor-pointer"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      <option value="">Select district</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="10" height="10" fill="none" stroke="#4B1325" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Locality Select */}
                <div className="flex flex-col gap-0.5">
                  <label
                    className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-montserrat)', marginBottom: '2px' }}
                  >
                    Area / Locality
                  </label>
                  <div className="relative">
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      required
                      disabled={!district}
                      className="w-full h-[42px] px-4 bg-[#FAF8F5] border border-[#4B1325]/10 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4B1325] focus:border-transparent transition-all duration-300 hover:border-[#4B1325]/20 appearance-none cursor-pointer disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      <option value="">
                        {district ? 'Select locality' : 'Select district first'}
                      </option>
                      {localities.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="10" height="10" fill="none" stroke="#4B1325" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {district && locality && (
                  <p
                    className="text-[10px] font-bold text-[#4B1325] tracking-wide"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    📍 {locality}, {district}, Nepal
                  </p>
                )}

                {/* Error Banner */}
                {error && (
                  <p
                    className="text-rose-600 text-[10px] font-semibold uppercase tracking-wide mt-0.5"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    {error}
                  </p>
                )}

                {/* Actions row */}
                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 h-[42px] text-xs font-bold uppercase tracking-widest rounded-xl border-2 border-[#4B1325] text-[#4B1325] bg-transparent hover:bg-[#4B1325]/5 focus:outline-none transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-[42px] text-xs font-bold uppercase tracking-widest rounded-xl text-[#E9D7C3] hover:text-[#FFFFFF] bg-gradient-to-r from-[#4B1325] to-[#7A2A46] hover:shadow-lg hover:shadow-[#4B1325]/10 focus:outline-none transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    {loading ? 'Submitting...' : 'Get Started'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}