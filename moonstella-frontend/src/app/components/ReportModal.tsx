'use client'

import React, { useState } from 'react'
import api from '@/lib/api/axios'
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'user' | 'post' | 'chat'
  reportedId: string
  title?: string
}

export default function ReportModal({
  isOpen,
  onClose,
  type,
  reportedId,
  title = 'Submit Report',
}: ReportModalProps) {
  const [reason, setReason] = useState<'harassment' | 'spam' | 'fraud' | 'inappropriate' | 'other'>('harassment')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.post('/api/reports', {
        type,
        reportedId,
        reason,
        explanation: explanation.trim(),
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setExplanation('')
        onClose()
      }, 1800)
    } catch (err: any) {
      console.error('Failed to submit report:', err)
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reasons = [
    { value: 'harassment', label: 'Harassment or abuse' },
    { value: 'spam', label: 'Spam, advertising, or repetitive content' },
    { value: 'fraud', label: 'Fraudulent activity, scam, or fake representation' },
    { value: 'inappropriate', label: 'Inappropriate media, text, or products' },
    { value: 'other', label: 'Other violation' },
  ]

  return (
    <div className="fixed inset-0 bg-[#3D0C1F]/45 backdrop-blur-md z-[300] flex items-center justify-center p-4 overflow-y-auto font-sans select-none animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_25px_60px_rgba(61,12,31,0.18)] border border-[#5F3041]/10 flex flex-col relative animate-scale-up">
        
        {/* Success view */}
        {success ? (
          <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-gray-900 font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
              Report Registered
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Our moderation team will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col text-left">
            
            {/* Header */}
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-[#FAF8F5]/80">
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {title}
                </h2>
                <p className="text-[8px] font-extrabold text-[#5F3041] uppercase tracking-widest mt-0.5">
                  Platform Moderation & Security
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-405 hover:text-[#5F3041] p-1.5 hover:bg-[#5F3041]/5 rounded-full transition-all border-none bg-transparent cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-7 flex flex-col gap-5">
              
              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Reasons options */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Why are you reporting? *
                </span>
                
                <div className="flex flex-col gap-2">
                  {reasons.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        reason === r.value
                          ? 'border-[#5F3041] bg-[#FAF0F3]/25 font-bold text-[#5F3041]'
                          : 'border-gray-150 hover:bg-[#FAF8F5]/30 text-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value as any)}
                        className="accent-[#5F3041] shrink-0"
                      />
                      <span className="text-xs">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Explanation note */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Explain the Issue *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide additional details or references so moderators can audit correctly..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-xl p-4 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 resize-none font-sans"
                />
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 justify-end p-6 border-t border-gray-100 bg-[#FAF8F5]/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-200 text-[10px] font-bold tracking-widest rounded-lg uppercase cursor-pointer hover:bg-gray-50 text-gray-500 font-sans bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !explanation.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold tracking-widest px-5 py-2.5 rounded-lg uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans border-none flex items-center gap-1.5 shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  )
}
