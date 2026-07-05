import React from 'react'

interface FeedHeaderProps {
  selectedCuration: string
  setSelectedCuration: (curation: string) => void
  setShowCreateModal: (show: boolean) => void
}

export default function FeedHeader({ selectedCuration, setSelectedCuration, setShowCreateModal }: FeedHeaderProps) {
  return (
    <aside className="w-full">
      <div className="sticky top-20 h-fit bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgba(61,12,31,0.015)] flex flex-col gap-5 select-none">

        {/* Curation List */}
        <div className="flex flex-col gap-3">
          <h3
            className="text-[9px] font-extrabold tracking-[0.25em] text-gray-400 uppercase pl-1"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Curation
          </h3>
          <ul className="flex flex-col gap-1.5 text-xs font-semibold select-none">
            {[
              { id: 'latest', label: 'Latest Feed' },
              { id: 'following', label: 'Following Feed' },
              { id: 'my-requests', label: 'My Requests' }
            ].map((item) => {
              const isActive = selectedCuration === item.id
              return (
                <li
                  key={item.id}
                  onClick={() => setSelectedCuration(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${isActive
                    ? 'bg-[#5F3041] text-[#FAF8F5] shadow-md shadow-[#5F3041]/15 font-bold border border-[#5F3041]'
                    : 'text-gray-600 hover:bg-[#FAF6F0] hover:text-[#5F3041] border border-transparent font-medium'
                    }`}
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Outlined Action CTA */}
        <div className="border-t border-gray-100 pt-4 mt-1">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-[#FAF6F0] hover:bg-[#5F3041] hover:text-[#FAF8F5] text-[#5F3041] border border-[#5F3041]/25 transition-all duration-300 text-[9px] font-bold tracking-widest py-3 rounded-xl uppercase text-center cursor-pointer shadow-[0_2px_8px_rgba(61,12,31,0.02)] flex items-center justify-center gap-1.5 active:scale-95"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Post Request
          </button>
        </div>
      </div>
    </aside>
  )
}
