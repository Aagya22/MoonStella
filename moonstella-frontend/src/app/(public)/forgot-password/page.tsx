'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/app/components/shared/navbar'
import { forgotPasswordApi } from '@/lib/api/auth'
import { useSnackbar } from '@/context/SnackbarContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { showSnackbar } = useSnackbar()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await forgotPasswordApi({ email })
      setSent(true)
      showSnackbar('Password reset link sent to your email.', 'success')
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || 'Something went wrong. Please try again.'
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
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          className="forgot-card-grid w-full overflow-hidden bg-white border border-[#5F3041]/10 rounded-[2rem] shadow-2xl"
          style={{
            maxWidth: '900px',
            minHeight: '500px',
            display: 'grid',
            animation: 'forgotScaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <style>{`
            @media (min-width: 768px) {
              .forgot-card-grid { grid-template-columns: 1fr 1fr !important; }
            }
            @keyframes forgotScaleUp {
              from { opacity: 0; transform: scale(0.96) translateY(12px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes forgotCheckPop {
              0%   { opacity: 0; transform: scale(0.5); }
              60%  { transform: scale(1.15); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes forgotFadeUp {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Left — image */}
          <div className="hidden md:block overflow-hidden">
            <img
              src="/gemstones.png"
              alt="Precious gemstones"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Right — form */}
          <div
            className="flex flex-col items-center justify-center px-12 py-12 bg-white"
            style={{ gridColumn: 'span 1' }}
          >
            <div className="w-full" style={{ maxWidth: '340px' }}>
              {!sent ? (
                <>
                  {/* Lock icon */}
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
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
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
                    Forgot Password?
                  </h1>
                  <p
                    className="text-gray-400 leading-relaxed text-xs"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      marginBottom: '28px',
                    }}
                  >
                    No worries. Enter the email linked to your account and we&apos;ll send you a reset link.
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label
                        className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
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
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
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
                      animation: 'forgotCheckPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
                      animation: 'forgotFadeUp 0.4s 0.15s ease-out both',
                    }}
                  >
                    Check Your Email
                  </h2>
                  <p
                    className="text-gray-400 leading-relaxed text-xs"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      marginBottom: '28px',
                      animation: 'forgotFadeUp 0.4s 0.25s ease-out both',
                    }}
                  >
                    We sent a password reset link to{' '}
                    <span className="font-bold text-gray-600">{email}</span>.
                    Please check your inbox and spam folder.
                  </p>

                  <button
                    onClick={() => setSent(false)}
                    className="w-full py-3.5 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all shadow-xs"
                    style={{
                      fontFamily: 'var(--font-montserrat)',
                      animation: 'forgotFadeUp 0.4s 0.35s ease-out both',
                    }}
                  >
                    Resend Link
                  </button>
                </div>
              )}

              {/* Back to login */}
              <div
                className="flex items-center justify-center gap-2 mt-8"
                style={{ animation: 'forgotFadeUp 0.4s 0.45s ease-out both' }}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
