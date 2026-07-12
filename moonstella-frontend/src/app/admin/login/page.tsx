'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api/axios'
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If already logged in as admin, auto-redirect
    const token = localStorage.getItem('ms_token')
    const userStr = localStorage.getItem('ms_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === 'admin') {
          router.replace('/admin/dashboard')
        }
      } catch (e) {
        // Clear corrupt state
        localStorage.removeItem('ms_token')
        localStorage.removeItem('ms_user')
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/api/auth/login', { email, password })
      const { token, user } = res.data?.data || res.data

      if (user.role !== 'admin') {
        setError('Access denied. Administrator privileges required.')
        setLoading(false)
        return
      }

      localStorage.setItem('ms_token', token)
      localStorage.setItem('ms_user', JSON.stringify(user))

      router.replace('/admin/dashboard')
    } catch (err: any) {
      console.error('Admin login error:', err)
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 select-none font-sans">
      <div className="bg-white border border-[#5F3041]/10 rounded-[2.5rem] w-full max-w-md p-8 sm:p-12 shadow-[0_20px_50px_rgba(61,12,31,0.03)] flex flex-col gap-8 text-center animate-scale-up">
        
        {/* Shield Logo Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#FAF0F3] border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-serif text-gray-900 tracking-wide mt-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            MoonStella Admin
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Control Panel Authentication
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-2.5 text-left text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5 text-left">
          
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="admin@moonstella.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-xl pl-11 pr-4 py-3 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-xl pl-11 pr-4 py-3 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white py-3.5 mt-2 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all border-none shadow-xs disabled:opacity-50 disabled:cursor-not-allowed text-center"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            {loading ? 'Authenticating...' : 'Sign In To Panel'}
          </button>

        </form>

        {/* Back Link */}
        <div className="border-t border-gray-150 pt-5">
          <Link href="/" className="text-[9px] font-bold text-[#5F3041] hover:underline uppercase tracking-wider">
            Return to Marketplace Homepage
          </Link>
        </div>

      </div>
    </div>
  )
}
