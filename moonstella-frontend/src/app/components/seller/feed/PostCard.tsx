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
    <article className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
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
              className="text-xs font-bold text-gray-800 tracking-wide truncate"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              {post.artisanName}
            </h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[8px] font-extrabold text-[#5F3041] bg-[#5F3041]/5 px-2 py-0.5 rounded tracking-widest uppercase inline-block select-none">
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
          className="relative w-full aspect-[4/3] bg-[#FAF8F5] overflow-hidden group select-none border-y border-gray-50 flex items-center justify-center"
          onDoubleClick={() => toggleLike(post.id)}
        >
          <Image
            src={imagesList[currentIndex]}
            alt="Client brief sketches"
            fill
            className="object-contain transition-all duration-500 ease-out cursor-pointer"
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

          <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pointer-events-none pb-8">
            <span
              className="bg-white/90 backdrop-blur text-[8px] font-bold tracking-widest text-[#5F3041] uppercase px-3 py-2 rounded shadow pointer-events-auto cursor-pointer"
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
              <p className="text-xs text-gray-600 leading-relaxed font-normal mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                {post.description}
              </p>

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
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {post.materials.map((mat: string) => (
                  <span
                    key={mat}
                    className="text-[9px] font-bold tracking-widest text-[#5F3041]/90 bg-[#FAF0F3]/50 border border-[#5F3041]/10 px-2.5 py-1 rounded-md uppercase select-none"
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
            <p className="text-xs text-gray-600 leading-relaxed font-normal mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
              {post.description}
            </p>

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
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {post.materials.map((mat: string) => (
                <span
                  key={mat}
                  className="text-[9px] font-bold tracking-widest text-[#5F3041]/90 bg-[#FAF0F3]/50 border border-[#5F3041]/10 px-2.5 py-1 rounded-md uppercase select-none"
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
