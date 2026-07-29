'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/app/components/shared/navbar'
import { resetPasswordApi } from '@/lib/api/auth'
import { useSnackbar } from '@/context/SnackbarContext'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { showSnackbar } = useSnackbar()

  // Password strength
  const getStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = getStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength] || ''
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'][strength] || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    setLoading(true)

    try {
      await resetPasswordApi({ token, password, confirmPassword })
      setSuccess(true)
      showSnackbar('Password reset successfully!', 'success')
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || 'Failed to reset password. The link may have expired.'
      setError(errMsg)
      showSnackbar(errMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const EyeOpen = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const EyeClosed = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.1 10.1 0 0112 20c-5.4 0-9-7-9-7a17.6 17.6 0 014.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c5.4 0 9 7 9 7a17.6 17.6 0 01-2.06 3.06M3 3l18 18" />
    </svg>
  )

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          className="reset-card-grid w-full overflow-hidden bg-white border border-[#5F3041]/10 rounded-[2rem] shadow-2xl"
          style={{
            maxWidth: '900px',
            minHeight: '500px',
            display: 'grid',
            animation: 'resetScaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <style>{`
            @media (min-width: 768px) {
              .reset-card-grid { grid-template-columns: 1fr 1fr !important; }
            }
            @keyframes resetScaleUp {
              from { opacity: 0; transform: scale(0.96) translateY(12px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes resetCheckPop {
              0%   { opacity: 0; transform: scale(0.5); }
              60%  { transform: scale(1.15); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes resetFadeUp {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes resetStrengthPulse {
              0%, 100% { opacity: 1; }
              50%      { opacity: 0.7; }
            }
          `}</style>

          {/* Left — image */}
          <div className="hidden md:block overflow-hidden">
            <img
              src="/rings.png"
              alt="Elegant rings"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Right — form */}
          <div
            className="flex flex-col items-center justify-center px-12 py-12 bg-white"
            style={{ gridColumn: 'span 1' }}
          >
            <div className="w-full" style={{ maxWidth: '340px' }}>
              {!success ? (
                <>
                  {/* Shield icon */}
                  <div
                    className="flex items-center justify-center mb-6"
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #5F3041 0%, #8B4A60 100%)',
                      boxShadow: '0 8px 24px rgba(95, 48, 65, 0.25)',
                    }}
                  >
                    <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </div>

                  {/* Title */}
                  <h1
                    className="font-serif font-bold text-gray-900 mb-2 leading-tight"
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: '28px',
                    }}
                  >
                    Reset Password
                  </h1>
                  <p
                    className="text-gray-400 leading-relaxed text-xs"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      marginBottom: '28px',
                    }}
                  >
                    Create a strong new password for your MoonStella account.
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* New Password */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label
                        className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-4 py-3 pr-10 text-xs bg-white border border-[#5F3041]/10 rounded-xl focus:outline-none focus:border-[#5F3041]/35 shadow-xs transition-all text-gray-800"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                        >
                          {showPassword ? <EyeOpen /> : <EyeClosed />}
                        </button>
                      </div>

                      {/* Strength indicator */}
                      {password.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          <div
                            className="flex gap-1"
                            style={{ height: '3px' }}
                          >
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                style={{
                                  flex: 1,
                                  borderRadius: '2px',
                                  backgroundColor:
                                    i <= strength ? strengthColor : '#E5E7EB',
                                  transition: 'background-color 0.3s ease',
                                }}
                              />
                            ))}
                          </div>
                          <span
                            className="text-[9px] font-bold uppercase tracking-widest"
                            style={{
                              fontFamily: 'var(--font-montserrat)',
                              color: strengthColor,
                            }}
                          >
                            {strengthLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label
                        className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full px-4 py-3 pr-10 text-xs bg-white border border-[#5F3041]/10 rounded-xl focus:outline-none focus:border-[#5F3041]/35 shadow-xs transition-all text-gray-800"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                        >
                          {showConfirm ? <EyeOpen /> : <EyeClosed />}
                        </button>
                      </div>

                      {/* Match indicator */}
                      {confirmPassword.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {password === confirmPassword ? (
                            <>
                              <svg width="12" height="12" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span
                                className="text-[9px] font-bold uppercase tracking-widest text-emerald-500"
                                style={{ fontFamily: 'var(--font-montserrat)' }}
                              >
                                Passwords match
                              </span>
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span
                                className="text-[9px] font-bold uppercase tracking-widest text-rose-500"
                                style={{ fontFamily: 'var(--font-montserrat)' }}
                              >
                                Passwords do not match
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Error */}
                    {error && (
                      <p
                        className="text-rose-600 text-[10px] font-bold uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        {error}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                </>
              ) : (
                /* Success state */
                <div className="flex flex-col items-center text-center">
                  {/* Animated check circle */}
                  <div
                    className="flex items-center justify-center mb-6"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                      animation: 'resetCheckPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    }}
                  >
                    <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h2
                    className="font-serif font-bold text-gray-900 mb-2 leading-tight"
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: '24px',
                      animation: 'resetFadeUp 0.4s 0.15s ease-out both',
                    }}
                  >
                    Password Updated!
                  </h2>
                  <p
                    className="text-gray-400 leading-relaxed text-xs"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      marginBottom: '28px',
                      animation: 'resetFadeUp 0.4s 0.25s ease-out both',
                    }}
                  >
                    Your password has been changed successfully. You can now sign in with your new password.
                  </p>

                  <Link
                    href="/login"
                    className="w-full py-3.5 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all shadow-xs flex items-center justify-center text-center leading-none no-underline"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      animation: 'resetFadeUp 0.4s 0.35s ease-out both',
                    }}
                  >
                    Go to Sign In
                  </Link>
                </div>
              )}

              {/* Back to login (only show in form state) */}
              {!success && (
                <div
                  className="flex items-center justify-center gap-2 mt-8"
                  style={{ animation: 'resetFadeUp 0.4s 0.45s ease-out both' }}
                >
                  <svg width="14" height="14" fill="none" stroke="#5F3041" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
                  </svg>
                  <Link
                    href="/login"
                    className="text-[#5F3041] hover:text-[#4A2231] text-[10px] font-bold uppercase tracking-wider transition-colors"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Back to Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#FAF8F5' }}
        >
          <div
            className="text-xs font-bold uppercase tracking-wider text-gray-400"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Loading...
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
