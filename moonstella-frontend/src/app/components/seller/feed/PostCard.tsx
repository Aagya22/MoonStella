import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: any
  user: any
  followedClients: string[]
  toggleFollowClient: (clientName: string) => void
  toggleLike: (postId: string) => void
  wishlist: string[]
  toggleSave: (postId: string) => void
  openChatWith: (
    name: string,
    userId?: string,
    initialMsg?: string,
    postId?: string,
    postDesc?: string,
    postCategory?: string,
    postBudget?: string,
    postImage?: string
  ) => void
  setSelectedInspectPost: (post: any) => void
  setActiveInspectIndex: (index: number) => void
  onShowLikes?: (likesList: any[]) => void
}

export default function PostCard({
  post,
  user,
  followedClients = [],
  toggleFollowClient,
  toggleLike,
  wishlist = [],
  toggleSave,
  openChatWith,
  setSelectedInspectPost,
  setActiveInspectIndex,
  onShowLikes,
}: PostCardProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)

  const imagesList = post.images || (post.image ? [post.image] : [])
  const isFollowing = user?.following?.some((id: any) => String(id) === String(post.userId)) || false
  const isSaved = wishlist.includes(post.id)
  const savesCount = isSaved ? 1 : 0

  const reviewStats = post.reviewStats || { count: 0, average: 0 }
  const reviewSummary = reviewStats.count > 0 ? (
    <button
      onClick={() => { setSelectedInspectPost(post); setActiveInspectIndex(0) }}
      className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#C5A880] transition-colors cursor-pointer border-none bg-transparent"
      style={{ fontFamily: 'var(--font-montserrat)' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#C5A880" stroke="#C5A880" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span>{reviewStats.average} · {reviewStats.count} {reviewStats.count === 1 ? 'Review' : 'Reviews'}</span>
    </button>
  ) : null
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : ''
  const isMyPost = post.artisanName === currentUserName || String(post.userId?._id || post.userId) === String(user?.id || user?._id)

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1))
  }

  return (
    <article className="surface surface-raise rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5">
      {/* Post Header */}
      <div className="p-5 flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
          onClick={() => {
            if (post.userId) {
              router.push(`/seller/profile?id=${post.userId}`)
            }
          }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-100 bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center font-extrabold text-sm select-none flex-shrink-0">
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
          <div className="flex-1 min-w-0">
            <h4
              className="text-[17px] font-medium text-[#1B1613] leading-tight truncate"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {post.artisanName}
            </h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[8.5px] font-semibold text-[#8A6A38] tracking-[0.18em] uppercase inline-block select-none">
                {post.artisanTitle === 'MASTER ARTISAN' ? 'Master Artisan' : 'Client Brief'}
              </span>
              <span className="text-[8px] font-bold text-gray-400">· {post.time}</span>
            </div>
          </div>
        </div>

        {!isMyPost && (
          <button
            onClick={() => toggleFollowClient(post.userId)}
            className={`text-[9px] font-bold tracking-widest px-4 py-2 rounded-full uppercase transition-all duration-300 cursor-pointer border ${isFollowing
              ? 'bg-[#5F3041] text-white border-[#5F3041]'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Sketch Collage / Slider */}
      {imagesList.length > 0 && (
        <div
          className="relative w-full aspect-[4/3] max-h-[520px] bg-[#17120F] overflow-hidden group select-none"
          onDoubleClick={() => toggleLike(post.id)}
        >
          <Image
            src={imagesList[currentIndex]}
            alt="Client brief sketches"
            fill
            className="object-cover transition-transform duration-[900ms] ease-out cursor-pointer group-hover:scale-[1.04]"
            onClick={() => {
              setSelectedInspectPost(post)
              setActiveInspectIndex(currentIndex)
            }}
          />

          {/* Navigation Chevrons */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-[#5F3041]/80 text-white backdrop-blur-[2px] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 border-none cursor-pointer z-10 active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-[#5F3041]/80 text-white backdrop-blur-[2px] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 border-none cursor-pointer z-10 active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {imagesList.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {imagesList.map((_: any, idx: number) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40'
                    }`}
                />
              ))}
            </div>
          )}

          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          />
        </div>
      )}

      <div className="p-5 flex flex-col gap-4">
        {/* Category & Budget Indicator */}
        <div className="flex justify-between items-center text-[9px] font-extrabold tracking-widest uppercase mb-1">
          <span className="text-[#5F3041] bg-[#5F3041]/10 px-3 py-1 rounded-full select-none">
            {post.category || 'Bespoke Brief'}
          </span>
          <span className="text-amber-800 bg-amber-50 px-3 py-1 rounded-full normal-case tracking-normal select-none">
            {post.artisanTitle === 'MASTER ARTISAN' ? 'Price' : 'Est. Budget'}: {post.price || 'Contact'}
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed font-normal mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
          {post.description}
        </p>

        {!isMyPost && post.artisanTitle !== 'MASTER ARTISAN' ? (
          <div className="flex flex-col md:flex-row gap-5 justify-between items-start w-full">

            <div className="flex-1 min-w-0 flex flex-col gap-3 w-full">

              {/* Likes & Saves Interactive */}
              <div className="flex items-center gap-6 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center hover:scale-110 transition-transform cursor-pointer border-none bg-transparent ${post.liked ? 'text-rose-600' : 'text-gray-400 hover:text-rose-600'
                      }`}
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill={post.liked ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="2.2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <span
                    className="text-gray-500 select-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                  </span>
                </div>
                <button
                  onClick={() => toggleSave(post.id)}
                  className={`flex items-center gap-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer border-none bg-transparent ${isSaved ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'
                    }`}
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2.2"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{savesCount} {savesCount === 1 ? 'Save' : 'Saves'}</span>
                </button>
                {reviewSummary}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {post.materials.map((mat: string) => (
                  <span
                    key={mat}
                    className="text-[10px] font-normal text-[#6B625A] border border-[#8A6A38]/25 px-2.5 py-1 rounded-full select-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    {mat}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full md:w-36 shrink-0 flex flex-col gap-2 pt-2 select-none">
              <button
                onClick={() => {
                  const text = user?.role === 'seller' ? 'Can I know about this?' : 'Hi ! I am interested .'
                  const postImage = post.images && post.images.length > 0 ? post.images[0] : (post.image || '')
                  openChatWith(
                    post.artisanName || 'Bespoke Request Owner',
                    post.userId?._id || post.userId,
                    text,
                    post.id || post._id,
                    post.description,
                    post.category,
                    post.budget ? String(post.budget) : '',
                    postImage
                  )
                }}
                className="w-full bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest py-2.5 rounded-full uppercase cursor-pointer transition-all duration-300 border-none text-center shadow-[0_4px_12px_rgba(95,48,65,0.15)] hover:shadow-[0_6px_16px_rgba(95,48,65,0.25)] active:scale-95 transform hover:-translate-y-[1px]"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Inquire Now
              </button>
            </div>
          </div>
        ) : (
          /* Single-Column details layout for user's own posts or non-artisan briefs */
          <div className="flex flex-col gap-3 w-full">

            {/* Read-Only or standard likes and saves */}
            {isMyPost ? (
              <div className="flex items-center gap-6 pt-1">
                <div
                  onClick={() => onShowLikes && onShowLikes(post.likesList || [])}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer select-none"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="hover:underline">{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 tracking-wide select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.2"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{savesCount} {savesCount === 1 ? 'Save' : 'Saves'}</span>
                </div>
                {reviewSummary}
              </div>
            ) : (
              <div className="flex items-center gap-6 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center hover:scale-110 transition-transform cursor-pointer border-none bg-transparent ${post.liked ? 'text-rose-600' : 'text-gray-400 hover:text-rose-600'
                      }`}
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill={post.liked ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="2.2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <span className="text-gray-500 select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                  </span>
                </div>
                <button
                  onClick={() => toggleSave(post.id)}
                  className={`flex items-center gap-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer border-none bg-transparent ${isSaved ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'
                    }`}
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2.2"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{savesCount} {savesCount === 1 ? 'Save' : 'Saves'}</span>
                </button>
                {reviewSummary}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {post.materials.map((mat: string) => (
                <span
                  key={mat}
                  className="text-[10px] font-normal text-[#6B625A] border border-[#8A6A38]/25 px-2.5 py-1 rounded-full select-none"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {mat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
