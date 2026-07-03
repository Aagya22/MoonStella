import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface InspectPostModalProps {
  selectedInspectPost: any
  onClose: () => void
  openChatWith: (name: string) => void
}

export default function InspectPostModal({
  selectedInspectPost,
  onClose,
  openChatWith,
}: InspectPostModalProps) {
  const router = useRouter()
  const [activeInspectIndex, setActiveInspectIndex] = useState(0)

  const imagesList = selectedInspectPost.images || (selectedInspectPost.image ? [selectedInspectPost.image] : [])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in animate-duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl md:h-[650px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row max-h-[90vh] animate-scale-up">
        {/* Left Half: Image & Carousel */}
        <div className="w-full md:w-1/2 relative bg-[#FAF8F5] flex items-center justify-center overflow-hidden h-full">
          {imagesList.length > 0 ? (
            <Image
              src={imagesList[activeInspectIndex]}
              alt="Bespoke Jewelry sketches"
              fill
              className="object-contain"
            />
          ) : (
            <div className="text-gray-400 font-semibold text-xs">No sketches attached</div>
          )}

          {imagesList.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl overflow-x-auto max-w-[90%] z-10">
              {imagesList.map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setActiveInspectIndex(idx)}
                  className={`relative w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${
                    activeInspectIndex === idx
                      ? 'border-white scale-95 shadow'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Bespoke design thumb" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white bg-black/40 p-2.5 rounded-full hover:bg-black/60 cursor-pointer md:hidden border-none flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Right Half: Details */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-white h-full overflow-y-auto">
          <div>
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (selectedInspectPost.userId) {
                    onClose()
                    router.push(`/seller/profile?id=${selectedInspectPost.userId}`)
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-100 bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center font-extrabold text-sm select-none flex-shrink-0">
                  {selectedInspectPost.avatar ? (
                    <Image
                      src={selectedInspectPost.avatar}
                      alt="Client"
                      fill
                      className="object-cover object-center"
                    />
                  ) : (
                    <span>{selectedInspectPost.artisanName ? selectedInspectPost.artisanName[0].toUpperCase() : 'A'}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-855" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {selectedInspectPost.artisanName}
                  </h4>
                  <span className="text-[8px] font-extrabold text-[#5F3041] bg-[#5F3041]/5 px-2.5 py-0.5 rounded tracking-widest uppercase mt-1 inline-block select-none">
                    Connoisseur Client
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-gray-405 hover:text-gray-655 cursor-pointer hidden md:block border-none bg-transparent"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex justify-between items-center mb-4 select-none">
              <span
                className="text-[9px] font-bold text-amber-600 tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {selectedInspectPost.category || 'Bespoke Request'}
              </span>
              <span className="text-[10px] font-extrabold text-[#5F3041] bg-[#FAF8F5] border border-gray-150 px-2.5 py-1 rounded uppercase">
                Est. Budget: {selectedInspectPost.price || 'Contact'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
              Bespoke Request Blueprint
            </h3>
            <p className="text-xs text-gray-505 leading-relaxed font-normal mb-6" style={{ fontFamily: 'var(--font-montserrat)' }}>
              {selectedInspectPost.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedInspectPost.materials.map((m: string) => (
                <span
                  key={m}
                  className="text-[9px] font-bold tracking-widest text-[#5F3041] bg-[#FAF8F5] border border-gray-100 px-2.5 py-1 rounded uppercase select-none"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 mt-auto">
            <button
              onClick={() => {
                openChatWith(selectedInspectPost.artisanName)
                onClose()
              }}
              className="w-full bg-[#5F3041] hover:bg-[#4A2231] text-white text-[10px] font-bold tracking-widest py-3.5 rounded-full uppercase cursor-pointer transition-all text-center shadow border-none active:scale-95"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Message Client
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
