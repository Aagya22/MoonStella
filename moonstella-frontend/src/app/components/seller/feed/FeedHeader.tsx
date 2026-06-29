import React from 'react'

interface FeedHeaderProps {
  selectedCuration: string
  setSelectedCuration: (curation: string) => void
  setShowCreateModal: (show: boolean) => void
}

export default function FeedHeader({ selectedCuration, setSelectedCuration, setShowCreateModal }: FeedHeaderProps) {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-20 h-fit bg-white rounded-3xl p-6 border border-gray-150 shadow-[0_8px_30px_rgba(61,12,31,0.015)] flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h3
            className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Curation
          </h3>
          <ul className="flex flex-col gap-3 text-sm font-semibold text-gray-700 select-none">
            <li
              onClick={() => setSelectedCuration('latest')}
              className={`flex items-center gap-2 cursor-pointer hover:text-[#3D0C1F] transition-colors ${selectedCuration === 'latest' ? 'text-[#3D0C1F] font-extrabold' : ''
                }`}
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Latest Feed
              {selectedCuration === 'latest' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D0C1F]" />
              )}
            </li>
            <li
              onClick={() => setSelectedCuration('following')}
              className={`flex items-center gap-2 cursor-pointer hover:text-[#3D0C1F] transition-colors ${selectedCuration === 'following' ? 'text-[#3D0C1F] font-extrabold' : ''
                }`}
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Following Feed
              {selectedCuration === 'following' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D0C1F]" />
              )}
            </li>
            <li
              onClick={() => setSelectedCuration('my-designs')}
              className={`flex items-center gap-2 cursor-pointer hover:text-[#3D0C1F] transition-colors ${selectedCuration === 'my-designs' ? 'text-[#3D0C1F] font-extrabold' : ''
                }`}
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              My Designs
              {selectedCuration === 'my-designs' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D0C1F]" />
              )}
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-[#3D0C1F] hover:bg-[#2A0714] text-white transition-all text-[9px] font-bold tracking-widest py-2.5 rounded-lg uppercase text-center cursor-pointer shadow-sm flex items-center justify-center gap-1.5 border-none active:scale-95"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Post Design
          </button>
        </div>
      </div>
    </aside>
  )
}
