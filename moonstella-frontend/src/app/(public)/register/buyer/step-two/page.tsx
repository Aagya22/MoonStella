'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/app/components/navbar'
import StepProgressBar from '@/app/components/stepprogressbar'
import { registerApi, updateProfileApi } from '@/lib/api/auth'
import { nepalLocations, districts } from '@/lib/nepal-locations/location'
import { useSnackbar } from '@/context/SnackbarContext'

export default function BuyerRegisterStepTwo() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [district, setDistrict] = useState('')
  const [locality, setLocality] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    const saved = sessionStorage.getItem('buyer_step_one')
    if (!saved) router.push('/register/buyer/step-one')
  }, [router])

  useEffect(() => {
    const saved = sessionStorage.getItem('buyer_step_two')
    if (saved) {
      const parsed = JSON.parse(saved)
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
    sessionStorage.setItem('buyer_step_two', JSON.stringify({ district, locality }))
    router.push('/register/buyer/step-one?back=true')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!district || !locality) {
      setError('Please select your district and locality — location is required')
      return
    }

    setLoading(true)

    try {
      const stepOne = sessionStorage.getItem('buyer_step_one')
      if (!stepOne) { router.push('/register/buyer/step-one'); return }
      const stepOneData = JSON.parse(stepOne)

      // Step 1 — register user
      const result = await registerApi(stepOneData)
      const token = result.token

      // Step 2 — save token immediately so axios can use it
      localStorage.setItem('ms_token', token)
      localStorage.setItem('ms_user', JSON.stringify(result.user))

      // Step 3 — upload avatar if provided
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
          // avatar upload failed — continue without it
        }
      }

      // Step 4 — update profile with token passed directly
      await updateProfileApi({
        avatar: avatarUrl,
        location: `${locality}, ${district}, Nepal`,
      }, token)

      sessionStorage.removeItem('buyer_step_one')
      sessionStorage.removeItem('buyer_step_two')
      showSnackbar('Welcome to MoonStella! Your account has been registered.', 'success')
      router.push('/buyer/feed')
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Something went wrong. Please try again.'
      setError(errMsg)
      showSnackbar(errMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const selectStyle: React.CSSProperties = {
    fontFamily: 'var(--font-montserrat)',
    backgroundColor: '#F5F2F2',
    border: 'none',
    fontSize: '13px',
    color: '#1a1a1a',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '4px',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
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

  const localities = district ? nepalLocations[district] || [] : []

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
          <div className="hidden md:flex relative flex-col justify-end overflow-hidden" style={{ width: '42%', flexShrink: 0 }}>
            <Image src="/buyersignupp.png" alt="Jewellery" fill className="object-cover object-center" priority />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 50%)' }} />
            <div className="relative z-10 p-8">
              <p className="text-white/90 leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px' }}>
                Begin your exclusive access to the Vault and our bespoke artisan services.
              </p>
            </div>
          </div>

          {/* Right — form column */}
          <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 md:p-12">
            <div className="w-full flex flex-col gap-6" style={{ maxWidth: '480px' }}>

              {/* Progress bar inside aligned column */}
              <StepProgressBar currentStep={2} />

              <div>
                <h1 className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px' }}>
                  Define Your Identity
                </h1>
                <p className="text-gray-500 mb-7" style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px' }}>
                  Tell us where you are and how you wish to be seen by our artisans.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-7">

                  {/* Section 1 — Profile Image */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#3D0C1F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-montserrat)', flexShrink: 0 }}>1</div>
                      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '17px', fontWeight: 600, color: '#111827' }}>Profile Image</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div
                        onClick={!preview ? () => fileInputRef.current?.click() : undefined}
                        style={{
                          width: '140px',
                          height: '140px',
                          borderRadius: '50%',
                          border: '1.5px dashed #D1C4C4',
                          backgroundColor: '#FAF8F8',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: !preview ? 'pointer' : 'default',
                        }}
                      >
                        {preview ? (
                          <Image src={preview} alt="Preview" fill className="object-cover" />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center', padding: '10px' }}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#3D0C1F" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: '#3D0C1F', textTransform: 'uppercase' }}>Upload</p>
                          </div>
                        )}
                      </div>
                      {!preview && (
                        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '11px', color: '#9CA3AF', marginTop: '8px', textAlign: 'center' }}>
                          Recommended: square portrait, clean background.
                        </p>
                      )}
                    </div>
                    {preview && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-montserrat)',
                            fontWeight: 600,
                            backgroundColor: '#FAF8F5',
                            border: '1px solid #D1C4C4',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#374151'
                          }}
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null)
                            setPreview(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-montserrat)',
                            fontWeight: 600,
                            backgroundColor: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#991B1B'
                          }}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>

                  {/* Section 2 — Location */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#3D0C1F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-montserrat)', flexShrink: 0 }}>2</div>
                      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '17px', fontWeight: 600, color: '#111827' }}>Location <span style={{ color: '#EF4444', fontSize: '13px' }}>*</span></h2>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <label style={labelStyle}>District *</label>
                        <div className="relative">
                          <select value={district} onChange={(e) => { setDistrict(e.target.value); setLocality('') }} required style={selectStyle}>
                            <option value="">Select district</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="13" height="13" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Area / Locality *</label>
                        <div className="relative">
                          <select value={locality} onChange={(e) => setLocality(e.target.value)} required disabled={!district} style={{ ...selectStyle, opacity: district ? 1 : 0.5 }}>
                            <option value="">{district ? 'Select locality' : 'Select district first'}</option>
                            {localities.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="13" height="13" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>

                      {district && locality && (
                        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '12px', color: '#3D0C1F' }}>
                          📍 {locality}, {district}, Nepal
                        </p>
                      )}
                    </div>
                  </div>

                  {error && <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '12px', color: '#EF4444' }}>{error}</p>}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={handleBack} style={{ padding: '12px 28px', borderRadius: '4px', border: '2px solid #3D0C1F', color: '#3D0C1F', backgroundColor: 'transparent', fontFamily: 'var(--font-montserrat)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                      Go Back
                    </button>
                    <button type="submit" disabled={loading} style={{ padding: '12px 32px', borderRadius: '4px', backgroundColor: '#3D0C1F', color: 'white', fontFamily: 'var(--font-montserrat)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, border: 'none' }}>
                      {loading ? 'Creating account...' : 'Get Started'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}