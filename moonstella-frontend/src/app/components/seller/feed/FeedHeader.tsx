import React from 'react'
import { METALS, GEMSTONES } from '@/lib/materials/material'

interface FeedHeaderProps {
  selectedCuration: string
  setSelectedCuration: (curation: string) => void
  setShowCreateModal: (show: boolean) => void
  sortMode: 'trending' | 'latest'
  setSortMode: (mode: 'trending' | 'latest') => void
  selectedMaterial: string | null
  setSelectedMaterial: (material: string | null) => void
}

export default function FeedHeader({
  selectedCuration,
  setSelectedCuration,
  setShowCreateModal,
  sortMode,
  setSortMode,
  selectedMaterial,
  setSelectedMaterial,
}: FeedHeaderProps) {
  // Own designs are always newest-first
  const showSort = selectedCuration !== 'my-designs'

  return (
    <aside className="w-full">
      <div className="sticky top-20 h-fit surface rounded-2xl p-5 flex flex-col gap-5 select-none">

        {/* Curation List */}
        <div className="flex flex-col gap-3">
          <h3
            className="title-rule text-[9px] font-extrabold tracking-[0.25em] text-[var(--ms-ink-soft)] uppercase"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Curation
          </h3>
          <ul className="flex flex-col gap-1.5 text-xs font-semibold select-none">
            {[
              { id: 'latest', label: 'Latest Feed' },
              { id: 'following', label: 'Following Feed' },
              { id: 'my-designs', label: 'My Designs' }
            ].map((item) => {
              const isActive = selectedCuration === item.id
              return (
                <li
                  key={item.id}
                  onClick={() => setSelectedCuration(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${isActive
                    ? 'bg-[var(--ms-plum-tint)] text-[var(--ms-plum)] font-bold'
                    : 'text-[#6B665F] hover:bg-[#FAF7F6] hover:text-[var(--ms-plum)] font-medium'
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

        {/* Ordering */}
        {showSort && (
          <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
            <h3
              className="title-rule text-[9px] font-extrabold tracking-[0.25em] text-[var(--ms-ink-soft)] uppercase"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Order By
            </h3>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--ms-surface-alt)] rounded-xl">
              {[
                { id: 'trending' as const, label: 'Trending' },
                { id: 'latest' as const, label: 'Newest' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortMode(option.id)}
                  className={`text-[9px] font-bold tracking-widest uppercase py-2 rounded-lg cursor-pointer border-none transition-all duration-300 ${
                    sortMode === option.id
                      ? 'bg-white text-[var(--ms-plum)] shadow-sm'
                      : 'bg-transparent text-[var(--ms-ink-soft)] hover:text-[var(--ms-plum)]'
                  }`}
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Material filter */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between pl-1">
            <h3
              className="title-rule text-[9px] font-extrabold tracking-[0.25em] text-[var(--ms-ink-soft)] uppercase flex-1"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Material
            </h3>
            {selectedMaterial && (
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-[9px] font-bold uppercase tracking-wider text-[var(--ms-plum)] bg-transparent border-none cursor-pointer hover:underline"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Clear
              </button>
            )}
          </div>
          <select
            value={selectedMaterial || ''}
            onChange={(e) => setSelectedMaterial(e.target.value || null)}
            className="w-full bg-white border border-[var(--ms-line)] rounded-xl px-3 py-2.5 text-[11px] text-[#4A4642] cursor-pointer focus:outline-none focus:border-[var(--ms-plum)]/30 transition-all"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            <option value="">All Materials</option>
            <optgroup label="Metals">
              {METALS.map((metal) => (
                <option key={metal} value={metal}>{metal}</option>
              ))}
            </optgroup>
            <optgroup label="Gemstones">
              {GEMSTONES.map((gem) => (
                <option key={gem} value={gem}>{gem}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Outlined Action CTA */}
        <div className="border-t border-gray-100 pt-4 mt-1">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-[var(--ms-plum)] hover:bg-[var(--ms-plum-hover)] text-white border-none transition-all duration-300 text-[9px] font-bold tracking-widest py-3 rounded-full uppercase text-center cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
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
