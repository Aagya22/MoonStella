import React from 'react'

interface CraftingTimelineModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CraftingTimelineModal({
  isOpen,
  onClose,
}: CraftingTimelineModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="bg-[#3D0C1F] text-white p-6 relative">
          <h3 className="text-xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>Bespoke Tracker</h3>
          <p className="text-[10px] text-[#E9D7C3] font-semibold uppercase tracking-widest mt-1">No Active Orders</p>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white cursor-pointer bg-transparent border-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center flex flex-col items-center justify-center gap-4 min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#3D0C1F]/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l-7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-850" style={{ fontFamily: 'var(--font-montserrat)' }}>No Crafting Progress Found</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs mt-1">
              Once you co-create a jewelry design brief and the artisan accepts, your live bench updates will appear here!
            </p>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#3D0C1F] text-white text-[10px] font-bold tracking-widest px-4 py-2.5 rounded uppercase cursor-pointer hover:bg-[#2A0714] border-none"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
