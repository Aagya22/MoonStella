import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface FollowModalProps {
  isOpen: boolean
  title: string
  list: any[]
  onClose: () => void
  roleContext: 'buyer' | 'seller'
}

export default function FollowModal({
  isOpen,
  title,
  list = [],
  onClose,
  roleContext,
}: FollowModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleUserClick = (targetId: string) => {
    onClose()
    const path = roleContext === 'buyer' 
      ? `/buyer/profile?id=${targetId}` 
      : `/seller/profile?id=${targetId}`
    router.push(path)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-105 animate-scale-up flex flex-col overflow-hidden max-h-[80vh]">
        {/* Header */}
        <div className="bg-[#5F3041] text-white p-5 relative flex-shrink-0 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {title} ({list.length})
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white cursor-pointer bg-transparent border-none flex items-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {list.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-medium text-xs">
              No users found.
            </div>
          ) : (
            list.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-[#FAF8F5] cursor-pointer transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center font-extrabold text-sm flex-shrink-0 border border-gray-100 shadow-2xs">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="User avatar" fill className="object-cover object-center" />
                  ) : (
                    <span>{user.firstName ? user.firstName[0].toUpperCase() : 'U'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 truncate">
                    {user.firstName} {user.lastName}
                  </h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                    {user.role === 'seller' ? 'Artisan' : 'Buyer'}
                  </p>
                </div>
                <span className="text-[9px] font-semibold text-gray-400 tracking-wider">
                  {user.location || 'Nepal'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
