import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface InspectPostModalProps {
  selectedInspectPost: any
  onClose: () => void
  user: any
  wishlist: string[]
  openChatWith: (name: string) => void
  handleDeletePost: (postId: string) => Promise<void>
  handleUpdatePost: (postId: string, newDesc: string, newBudget: string) => Promise<void>
  hideMessageButton?: boolean
}

export default function InspectPostModal({
  selectedInspectPost,
  onClose,
  user,
  wishlist,
  openChatWith,
  handleDeletePost,
  handleUpdatePost,
  hideMessageButton = false,
}: InspectPostModalProps) {
  const router = useRouter()
  const [activeInspectIndex, setActiveInspectIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editDesc, setEditDesc] = useState('')
  const [editBudget, setEditBudget] = useState('')

  // Sync state with incoming post info
  useEffect(() => {
    if (selectedInspectPost) {
      setEditDesc(selectedInspectPost.description || '')
      setEditBudget(selectedInspectPost.price?.replace('Rs. ', '')?.replace(/,/g, '') || '')
    }
  }, [selectedInspectPost])

  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Connoisseur Member'
  const isMyPost =
    selectedInspectPost.artisanName === currentUserName ||
    String(selectedInspectPost.userId?._id || selectedInspectPost.userId) === String(user?.id || user?._id)

  const onSaveChanges = async () => {
    await handleUpdatePost(selectedInspectPost.id, editDesc, editBudget)
    setIsEditing(false)
  }

  const onDelete = async () => {
    await handleDeletePost(selectedInspectPost.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl md:h-[650px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row max-h-[90vh] animate-scale-up">
        {/* Left Half: Image & Carousel */}
        <div className="w-full md:w-1/2 relative bg-[#FAF8F5] flex items-center justify-center overflow-hidden h-full">
          <Image
            src={
              (selectedInspectPost.images && selectedInspectPost.images[activeInspectIndex]) ||
              selectedInspectPost.image
            }
            alt="Bespoke Jewelry Piece"
            fill
            className="object-contain"
          />

          {/* Image Carousel Selection Row */}
          {selectedInspectPost.images && selectedInspectPost.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl overflow-x-auto max-w-[90%] z-10">
              {selectedInspectPost.images.map((img: string, idx: number) => (
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

        {/* Right Half: Details & Comments */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-white h-full overflow-y-auto">
          <div>
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (selectedInspectPost.userId) {
                    onClose()
                    router.push(`/buyer/profile?id=${selectedInspectPost.userId}`)
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-100 bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center font-extrabold text-sm select-none flex-shrink-0">
                  {selectedInspectPost.avatar ? (
                    <Image
                      src={selectedInspectPost.avatar}
                      alt="Artisan"
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
                  {selectedInspectPost.artisanTitle === 'MASTER ARTISAN' && (
                    <p className="text-[9px] font-semibold text-[#5F3041] uppercase mt-0.5">
                      {selectedInspectPost.artisanTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Three Dots Menu for Own Post */}
                {isMyPost && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-full hover:bg-gray-50 border-none bg-transparent flex items-center justify-center"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                      </svg>
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 w-32 z-55 flex flex-col text-left">
                        <button
                          onClick={() => {
                            setIsEditing(true)
                            setMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-707 hover:bg-gray-50 hover:text-black border-none bg-transparent cursor-pointer"
                        >
                          Edit Post
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false)
                            onDelete()
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-650 hover:bg-red-55 border-none bg-transparent cursor-pointer"
                        >
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                )}

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
            </div>

            <div className="flex justify-between items-center mb-4">
              <span
                className="text-[9px] font-bold text-amber-600 tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {selectedInspectPost.category || 'Bespoke Brief'}
              </span>
              <span className="text-[10px] font-extrabold text-[#5F3041] bg-[#FAF8F5] border border-gray-150 px-2.5 py-1 rounded uppercase">
                Est. Budget: {selectedInspectPost.price || 'Contact'}
              </span>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-3 mb-4">
                <label
                  className="text-[9px] font-bold text-gray-400 uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Edit Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full text-xs text-gray-700 border border-gray-200 rounded-xl p-3 bg-[#FAF8F5] focus:outline-none focus:border-[#5F3041] resize-none h-24"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                />
                <label
                  className="text-[9px] font-bold text-gray-400 uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Edit Budget (Rs.)
                </label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full text-xs text-gray-707 border border-gray-200 rounded-xl px-3 py-2 bg-[#FAF8F5] focus:outline-none focus:border-[#5F3041]"
                  placeholder="e.g. 50000"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                />
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer bg-white"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveChanges}
                    className="px-4 py-2 rounded-full bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] text-xs font-semibold cursor-pointer border-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-505 leading-relaxed font-normal mb-6" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {selectedInspectPost.description}
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedInspectPost.materials.map((m: string) => (
                <span
                  key={m}
                  className="text-[9px] font-bold tracking-widest text-[#5F3041] bg-[#FAF8F5] border border-gray-100 px-2.5 py-1 rounded uppercase"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {(() => {
            if (isMyPost || hideMessageButton) {
              return (
                <div className="border-t border-gray-150 pt-5 mt-auto flex justify-between items-center text-xs font-semibold text-gray-500 pb-2">
                  <div className="flex items-center gap-2 select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-gray-405">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>
                      {Array.isArray(selectedInspectPost.likes) ? selectedInspectPost.likes.length : (selectedInspectPost.likes || 0)} { (Array.isArray(selectedInspectPost.likes) ? selectedInspectPost.likes.length : (selectedInspectPost.likes || 0)) === 1 ? 'Like' : 'Likes' }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-gray-405">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{wishlist.includes(selectedInspectPost.id) ? 1 : 0} Saves</span>
                  </div>
                </div>
              )
            }
            return (
              <div className="border-t border-gray-100 pt-5 mt-auto">
                <button
                  onClick={() => {
                    openChatWith(selectedInspectPost.artisanName)
                    onClose()
                  }}
                  className="w-full bg-[#5F3041] hover:bg-[#4A2231] text-white text-[10px] font-bold tracking-widest py-3.5 rounded uppercase cursor-pointer transition-all text-center shadow border-none"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Inquire Custom Commission
                </button>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
