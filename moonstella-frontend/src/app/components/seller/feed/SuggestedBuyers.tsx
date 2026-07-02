import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface SuggestedBuyersProps {
  suggestedBuyers: any[]
  openChatWith: (name: string) => void
  setSelectedCuration: (curation: string) => void
}

export default function SuggestedBuyers({
  suggestedBuyers,
  openChatWith,
  setSelectedCuration,
}: SuggestedBuyersProps) {
  const router = useRouter()

  return (
    <aside className="w-full">
      <div className="sticky top-20 h-fit flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
          <h3
            className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-5"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Suggested Buyers
          </h3>

          {suggestedBuyers.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-3 bg-[#FAF8F5]/50 border border-dashed border-gray-100 rounded-xl">
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">No Suggested Buyers Available</span>
              <p className="text-[9px] text-gray-400 px-4 leading-normal select-none">
                All collectors and design patrons are currently co-creating pieces with other studios.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-gray-200">
              {suggestedBuyers.map((buyer) => (
                <div
                  key={buyer.id}
                  onClick={() => {
                    if (buyer.id) {
                      router.push(`/seller/profile?id=${buyer.id}`)
                    }
                  }}
                  className="flex items-center gap-3.5 group cursor-pointer p-1.5 rounded-xl hover:bg-[#FAF8F5] transition-all"
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#3D0C1F] text-[#E9D7C3] flex items-center justify-center font-extrabold text-xs flex-shrink-0 border border-gray-100 shadow-sm select-none">
                    {buyer.image ? (
                      <Image src={buyer.image} alt={buyer.name} fill className="object-cover object-center" />
                    ) : (
                      <span>{buyer.name ? buyer.name[0].toUpperCase() : 'B'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 select-none">
                    <h4 className="text-xs font-bold text-gray-855 truncate">{buyer.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setSelectedCuration('latest')
            }}
            className="w-full text-center text-[10px] font-bold tracking-widest text-[#3D0C1F] hover:bg-[#3D0C1F] hover:text-[#FAF8F5] transition-all duration-300 uppercase py-2.5 rounded-xl border border-[#3D0C1F]/20 cursor-pointer block bg-[#FAF6F0] shadow-sm active:scale-95 mt-4"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Explore All
          </button>
        </div>
      </div>
    </aside>
  )
}
