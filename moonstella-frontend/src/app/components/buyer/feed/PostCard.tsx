import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: any
  user: any
  followedArtisans: string[]
  wishlist: string[]
  toggleFollow: (artisanName: string) => void
  toggleLike: (postId: string) => void
  toggleSave: (postId: string) => void
  openChatWith: (name: string) => void
  setSelectedInspectPost: (post: any) => void
  setActiveInspectIndex: (index: number) => void
}

export default function PostCard({
  post,
  user,
  followedArtisans,
  wishlist,
  toggleFollow,
  toggleLike,
  toggleSave,
  openChatWith,
  setSelectedInspectPost,
  setActiveInspectIndex,
}: PostCardProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)

  const imagesList = post.images || (post.image ? [post.image] : [])
  const isFollowing = user?.following?.some((id: any) => String(id) === String(post.userId)) || false
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Connoisseur Member'
  const isMyPost = post.artisanName === currentUserName || String(post.userId?._id || post.userId) === String(user?.id || user?._id)
  const isSaved = wishlist.includes(post.id)
  const savesCount = isSaved ? 1 : 0

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1))
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      {/* Post Header */}
      <div className="p-5 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            if (post.userId) {
              router.push(`/buyer/profile?id=${post.userId}`)
            }
          }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-100 bg-[#3D0C1F] text-[#E9D7C3] flex items-center justify-center font-extrabold text-sm select-none flex-shrink-0">
            {post.avatar ? (
              <Image
                src={post.avatar}
                alt={post.artisanName}
                fill
                className="object-cover object-center"
              />
            ) : (
              <span>{post.artisanName ? post.artisanName[0].toUpperCase() : 'A'}</span>
            )}
          </div>
          <div>
            <h4
              className="text-xs font-bold text-gray-800 tracking-wide"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              {post.artisanName}
            </h4>
            {post.artisanTitle === 'MASTER ARTISAN' ? (
              <span className="text-[8px] font-extrabold text-[#3D0C1F] bg-[#3D0C1F]/5 px-2.5 py-0.5 rounded tracking-widest uppercase mt-1 inline-block select-none">
                {post.artisanTitle}
              </span>
            ) : (
              <span className="text-[8px] font-extrabold text-[#3D0C1F] bg-[#3D0C1F]/5 px-2.5 py-0.5 rounded tracking-widest uppercase mt-1 inline-block select-none">
                Client Brief
              </span>
            )}
          </div>
        </div>

        {/* Follow Button */}
        {!isMyPost && post.artisanTitle === 'MASTER ARTISAN' && (
          <button
            onClick={() => toggleFollow(post.userId)}
            className={`text-[9px] font-bold tracking-widest px-4 py-2 rounded-full uppercase transition-all duration-300 cursor-pointer border ${
              isFollowing
                ? 'bg-[#3D0C1F] text-white border-[#3D0C1F]'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Post Image Collage / Slider */}
      {imagesList.length > 0 && (
        <div
          className="relative w-full aspect-[4/3] bg-[#FAF8F5] overflow-hidden group select-none border-y border-gray-50 flex items-center justify-center"
          onDoubleClick={() => toggleLike(post.id)}
        >
          <Image
            src={imagesList[currentIndex]}
            alt="Bespoke jewelry design"
            fill
            className="object-contain transition-all duration-500 ease-out cursor-pointer"
            onClick={() => {
              setSelectedInspectPost(post)
              setActiveInspectIndex(currentIndex)
            }}
          />

          {/* Image Index Indicator (e.g. 1/3) */}
          {imagesList.length > 1 && (
            <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full z-10 tracking-widest select-none">
              {currentIndex + 1}/{imagesList.length}
            </span>
          )}

          {/* Navigation Chevrons */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 hover:text-black flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 border-none cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 hover:text-black flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 border-none cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Slider Pagination Dots Indicator */}
          {imagesList.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {imagesList.map((_: any, idx: number) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pointer-events-none pb-8">
            <span
              className="bg-white/90 backdrop-blur text-[8px] font-bold tracking-widest text-[#3D0C1F] uppercase px-3 py-2 rounded shadow pointer-events-auto cursor-pointer"
              onClick={() => {
                setSelectedInspectPost(post)
                setActiveInspectIndex(currentIndex)
              }}
            >
              Double Click to Like · Click to Inspect
            </span>
          </div>
        </div>
      )}

      {/* Post Actions & Comments */}
      <div className="p-5 flex flex-col gap-4">
        {/* Category & Budget Indicator */}
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-1">
          <span className="text-[#3D0C1F] bg-[#3D0C1F]/[0.02] border border-[#3D0C1F]/10 px-2.5 py-1 rounded">
            {post.category || 'Bespoke Request'}
          </span>
          <span className="bg-[#FAF8F5] border border-amber-250/70 text-amber-800 font-extrabold text-[9px] px-3 py-1 rounded-full normal-case tracking-normal select-none">
            {post.artisanTitle === 'MASTER ARTISAN' ? 'Price' : 'Est. Budget'}: {post.price || 'Contact'}
          </span>
        </div>

        {/* Post Description */}
        <p className="text-xs text-gray-600 leading-relaxed font-normal mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
          {post.description}
        </p>

        {isMyPost ? (
          /* Read-Only Stats for User's Own Post */
          <div className="flex items-center gap-6 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 tracking-wide select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 tracking-wide select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{savesCount} {savesCount === 1 ? 'Save' : 'Saves'}</span>
            </div>
          </div>
        ) : (
          /* Interactive Toggle Actions for Other Sellers' Posts */
          <div className="flex items-center gap-6 border-b border-gray-50 pb-4">
            <button
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer border-none bg-transparent ${
                post.liked ? 'text-red-500 hover:text-red-650' : 'text-gray-500 hover:text-red-500'
              }`}
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill={post.liked ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2.2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
            </button>
            <button
              onClick={() => toggleSave(post.id)}
              className={`flex items-center gap-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer border-none bg-transparent ${
                isSaved ? 'text-amber-600 hover:text-amber-700' : 'text-gray-500 hover:text-amber-600'
              }`}
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2.2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{savesCount} {savesCount === 1 ? 'Save' : 'Saves'}</span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {post.materials.map((mat: string) => (
            <span
              key={mat}
              className="text-[9px] font-bold tracking-widest text-[#3D0C1F] bg-[#FAF8F5] border border-gray-100 px-2 py-0.5 rounded uppercase"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              {mat}
            </span>
          ))}
          <span className="text-[10px] text-gray-400 font-semibold ml-auto">{post.time}</span>
        </div>

        {/* Order Now & Inquire Now for Seller Posts viewed by Buyers */}
        {!isMyPost && post.artisanTitle === 'MASTER ARTISAN' && (
          <div className="flex gap-3 mt-4 border-t border-gray-50 pt-4 select-none">
            <button
              onClick={() => openChatWith(post.artisanName)}
              className="flex-1 bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest py-3 rounded-full uppercase cursor-pointer transition-all border-none text-center shadow-xs"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Order Now
            </button>
            <button
              onClick={() => openChatWith(post.artisanName)}
              className="flex-1 bg-white border border-[#3D0C1F] text-[#3D0C1F] hover:bg-[#3D0C1F]/5 text-[10px] font-bold tracking-widest py-3 rounded-full uppercase cursor-pointer transition-all text-center shadow-2xs"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Inquire Now
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
