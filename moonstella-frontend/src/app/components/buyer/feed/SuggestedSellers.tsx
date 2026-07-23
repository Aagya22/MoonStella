import React from 'react'
import Image from 'next/image'

interface SuggestedSellersProps {
  suggestedSellers: any[]
  openChatWith: (name: string) => void
  setSelectedCuration: (curation: string) => void
  setSelectedMaterial: (material: string | null) => void
}

export default function SuggestedSellers({
  suggestedSellers,
  openChatWith,
  setSelectedCuration,
  setSelectedMaterial,
}: SuggestedSellersProps) {
  return (
    <aside className="w-full">
      <div className="sticky top-20 h-fit flex flex-col gap-6">
        <div className="surface-alt rounded-2xl p-6">
          <h3
            className="title-rule text-[10px] font-bold tracking-[0.2em] text-[var(--ms-ink-soft)] uppercase mb-5"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Suggested Sellers
          </h3>

          {suggestedSellers.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-3 bg-[#FAF8F5]/50 border border-dashed border-gray-100 rounded-xl">
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">No Suggested Sellers Available</span>
              <p className="text-[9px] text-gray-400 px-4 leading-normal">
                All master gold and silversmiths are currently busy crafting bespoke pieces at their workbenches.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {suggestedSellers.map((seller) => (
                <div
                  key={seller.id}
                  onClick={() => openChatWith(seller.name)}
                  className="flex items-center gap-3.5 group cursor-pointer p-1.5 rounded-xl hover:bg-[#FAF8F5] transition-all"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center font-extrabold text-xs flex-shrink-0 border border-gray-100 shadow-sm select-none">
                    {seller.image ? (
                      <Image src={seller.image} alt={seller.name} fill className="object-cover object-center" />
                    ) : (
                      <span>{seller.name ? seller.name[0].toUpperCase() : 'S'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{seller.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setSelectedCuration('latest')
              setSelectedMaterial(null)
            }}
            className="w-full text-center text-[10px] font-bold tracking-widest text-[var(--ms-plum)] hover:text-[var(--ms-plum-hover)] transition-all duration-300 uppercase pt-4 pb-1 cursor-pointer block bg-transparent border-0 border-t border-[var(--ms-line)] active:scale-95 mt-4"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Explore All
          </button>
        </div>
      </div>
    </aside>
  )
}
