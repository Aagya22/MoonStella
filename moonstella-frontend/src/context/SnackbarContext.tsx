'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type SnackbarType = 'success' | 'error' | 'info' | 'warning'

interface SnackbarMessage {
  id: string
  message: string
  type: SnackbarType
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([])

  const showSnackbar = useCallback((message: string, type: SnackbarType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setSnackbars((prev) => [...prev, { id, message, type }])
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setSnackbars((prev) => prev.filter((s) => s.id !== id))
    }, 4000)
  }, [])

  const removeSnackbar = useCallback((id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      
      {/* Snackbar Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {snackbars.map((s) => (
          <div
            key={s.id}
            className="pointer-events-auto flex items-center justify-between p-4 rounded shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in-right bg-white border"
            style={{
              borderColor:
                s.type === 'success'
                  ? '#D1FAE5'
                  : s.type === 'error'
                  ? '#FEE2E2'
                  : s.type === 'warning'
                  ? '#FEF3C7'
                  : '#E5E7EB',
              borderLeftWidth: '4px',
              borderLeftColor:
                s.type === 'success'
                  ? '#10B981'
                  : s.type === 'error'
                  ? '#EF4444'
                  : s.type === 'warning'
                  ? '#F59E0B'
                  : '#5F3041', // Maroon theme accent
            }}
          >
            <div className="flex items-center gap-3">
              {s.type === 'success' && (
                <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {s.type === 'error' && (
                <svg className="w-5 h-5 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {s.type === 'warning' && (
                <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {s.type === 'info' && (
                <svg className="w-5 h-5 text-[#5F3041]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span
                className="text-xs font-semibold text-gray-700 font-sans"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {s.message}
              </span>
            </div>
            
            <button
              onClick={() => removeSnackbar(s.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4 focus:outline-none"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}
