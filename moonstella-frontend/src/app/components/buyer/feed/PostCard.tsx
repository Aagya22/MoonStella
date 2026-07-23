import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import BespokeOrderModal from '../orders/BespokeOrderModal'

// Content-area type scale
const chipClass =
  'self-start text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--ms-ink-soft)] bg-[var(--ms-surface-alt)] px-2.5 py-1 rounded-full select-none'
const titleClass =
  'text-[18px] font-semibold text-[var(--ms-ink)] leading-snug line-clamp-2'
const materialsClass =
  'text-[11px] tracking-[0.12em] uppercase text-[var(--ms-ink-soft)] select-none'
const priceClass =
  'text-[24px] leading-none font-medium text-[var(--ms-plum)]'
const iconBtnClass =
  'h-10 px-1.5 min-w-10 rounded-full flex items-center justify-center gap-1.5 border-none bg-transparent cursor-pointer transition-colors duration-300'

// One grey for every resting icon
const MUTED = '#8A8A8A'

// Below this the icon stands alone
const COUNT_THRESHOLD = 5

interface PostCardProps {
  post: any
  user: any
  followedArtisans: string[]
  wishlist: string[]
  toggleFollow: (artisanName: string) => void
  toggleLike: (postId: string) => void
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
  followedArtisans,
  wishlist,
  toggleFollow,
  toggleLike,
  toggleSave,
  openChatWith,
  setSelectedInspectPost,
  setActiveInspectIndex,
  onShowLikes,
}: PostCardProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const imagesList = post.images || (post.image ? [post.image] : [])
  const isFollowing = user?.following?.some((id: any) => String(id) === String(post.userId)) || false
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Connoisseur Member'
  const isMyPost = post.artisanName === currentUserName || String(post.userId?._id || post.userId) === String(user?.id || user?._id)
  const isSaved = wishlist.includes(post.id)
  const savesCount = isSaved ? 1 : 0

  const reviewStats = post.reviewStats || { count: 0, average: 0 }

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
              router.push(`/buyer/profile?id=${post.userId}`)
            }
          }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[var(--ms-line)] bg-[var(--ms-plum)] text-white flex items-center justify-center font-extrabold text-sm select-none flex-shrink-0">
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
              className="text-[17px] font-medium text-[var(--ms-ink)] leading-tight truncate"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {post.artisanName}
            </h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {post.artisanTitle === 'MASTER ARTISAN' ? (
                <span className="text-[8.5px] font-semibold text-[var(--ms-ink-soft)] tracking-[0.18em] uppercase inline-block select-none">
                  {post.artisanTitle}
                </span>
              ) : (
                <span className="text-[8.5px] font-semibold text-[var(--ms-ink-soft)] tracking-[0.18em] uppercase inline-block select-none">
                  Client Brief
                </span>
              )}
              <span className="text-[8px] font-bold text-gray-400">· {post.time}</span>
            </div>
          </div>
        </div>

        {!isMyPost && post.artisanTitle === 'MASTER ARTISAN' && (
          <button
            onClick={() => toggleFollow(post.userId)}
            className={`text-[9px] font-semibold tracking-[0.18em] px-4 py-2 rounded-full uppercase transition-all duration-300 cursor-pointer active:scale-95 hover:bg-[var(--ms-plum)] hover:text-white hover:border-[var(--ms-plum)] ${isFollowing
              ? 'bg-transparent border border-[var(--ms-line)] text-[var(--ms-ink-soft)]'
              : 'bg-[var(--ms-quiet)] border border-transparent text-[var(--ms-plum)]'
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
          className="relative w-full aspect-square max-h-[560px] bg-[var(--ms-surface-alt)] overflow-hidden group select-none"
          onDoubleClick={() => toggleLike(post.id)}
        >
          <Image
            src={imagesList[currentIndex]}
            alt="Bespoke jewelry design"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-[2px] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 border-none cursor-pointer z-10 active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-[2px] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 border-none cursor-pointer z-10 active:scale-95"
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

      <div className="p-6 flex flex-col gap-4">
        {!isMyPost && post.artisanTitle === 'MASTER ARTISAN' ? (
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start w-full">

            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <span className={chipClass}>{post.category || 'Bespoke Request'}</span>

              <h3 className={titleClass} style={{ fontFamily: 'var(--font-montserrat)' }}>
                {post.description}
              </h3>

              {post.materials.length > 0 && (
                <p className={materialsClass} style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {post.materials.join('  ·  ')}
                </p>
              )}

              <div className="flex items-center gap-3 pt-0.5">
                {reviewStats.count > 0 && (
                  <span
                    className="flex items-center gap-1.5 text-[12px] text-[var(--ms-ink)] select-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={MUTED} stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="font-semibold">{reviewStats.average}</span>
                    <span className="text-[var(--ms-ink-soft)]">
                      ({reviewStats.count})
                    </span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  aria-label={post.liked ? 'Unlike' : 'Like'}
                  aria-pressed={Boolean(post.liked)}
                  className={`${iconBtnClass} ${post.liked ? 'text-[var(--ms-plum)]' : 'text-[#8A8A8A] hover:text-[var(--ms-plum)]'}`}
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill={post.liked ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="1.8"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {post.likes >= COUNT_THRESHOLD && (
                    <span className="text-[12px] font-medium tabular-nums">{post.likes}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSave(post.id)}
                  aria-label={isSaved ? 'Remove from saved' : 'Save'}
                  aria-pressed={isSaved}
                  className={`${iconBtnClass} ${isSaved ? 'text-[var(--ms-plum)]' : 'text-[#8A8A8A] hover:text-[var(--ms-plum)]'}`}
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="1.8"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {savesCount >= COUNT_THRESHOLD && (
                    <span className="text-[12px] font-medium tabular-nums">{savesCount}</span>
                  )}
                </button>
              </div>
            </div>

            <div className="w-full md:w-44 shrink-0 flex flex-col gap-3.5 select-none">
              {/* centred over the button below */}
              <span className={`${priceClass} text-center`} style={{ fontFamily: 'var(--font-playfair)' }}>
                {post.price || 'Contact'}
              </span>

              <button
                onClick={() => {
                  setShowOrderModal(true)
                }}
                className="w-full bg-[var(--ms-plum)] hover:bg-[var(--ms-plum-hover)] text-white text-[10px] font-bold tracking-widest py-3 rounded-full uppercase cursor-pointer transition-all duration-300 border-none text-center active:scale-95"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Order Now
              </button>

              <button
                onClick={() => {
                  const text = user?.role === 'seller' ? 'Can I know about this?' : 'Hi ! I am interested .'
                  const postImage = post.images && post.images.length > 0 ? post.images[0] : (post.image || '')
                  openChatWith(
                    post.artisanName,
                    post.userId,
                    text,
                    post.id || post._id,
                    post.description,
                    post.category,
                    post.budget ? String(post.budget) : '',
                    postImage
                  )
                }}
                className="w-full text-center text-[11px] font-semibold text-[var(--ms-plum)] underline underline-offset-4 decoration-[var(--ms-plum)]/35 hover:decoration-[var(--ms-plum)] bg-transparent border-none cursor-pointer transition-all duration-300"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Inquire Now
              </button>
            </div>
          </div>
        ) : (
          /* Single-Column details layout for user's own posts or non-artisan briefs */
          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <span className={chipClass}>{post.category || 'Bespoke Request'}</span>
                <h3 className={titleClass} style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {post.description}
                </h3>
              </div>
              <span className={`${priceClass} text-right`} style={{ fontFamily: 'var(--font-playfair)' }}>
                {post.price || 'Contact'}
              </span>
            </div>

            {/* Read-Only or standard likes and saves */}
            {isMyPost ? (
              <div className="flex items-center gap-3 pt-0.5">
                {reviewStats.count > 0 && (
                  <span
                    className="flex items-center gap-1.5 text-[12px] text-[var(--ms-ink)] select-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={MUTED} stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="font-semibold">{reviewStats.average}</span>
                    <span className="text-[var(--ms-ink-soft)]">
                      ({reviewStats.count})
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onShowLikes && onShowLikes(post.likesList || [])}
                  aria-label="View who liked this"
                  className={`${iconBtnClass} text-[#8A8A8A] hover:text-[var(--ms-plum)]`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {post.likes >= COUNT_THRESHOLD && (
                    <span className="text-[12px] font-medium tabular-nums">{post.likes}</span>
                  )}
                </button>

                <span className={`${iconBtnClass} text-[#8A8A8A] cursor-default`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {savesCount >= COUNT_THRESHOLD && (
                    <span className="text-[12px] font-medium tabular-nums">{savesCount}</span>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-0.5">
                {reviewStats.count > 0 && (
                  <span
                    className="flex items-center gap-1.5 text-[12px] text-[var(--ms-ink)] select-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={MUTED} stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="font-semibold">{reviewStats.average}</span>
                    <span className="text-[var(--ms-ink-soft)]">
                      ({reviewStats.count})
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  aria-label={post.liked ? 'Unlike' : 'Like'}
                  aria-pressed={Boolean(post.liked)}
                  className={`${iconBtnClass} ${post.liked ? 'text-[var(--ms-plum)]' : 'text-[#8A8A8A] hover:text-[var(--ms-plum)]'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {post.likes >= COUNT_THRESHOLD && (
                    <span className="text-[12px] font-medium tabular-nums">{post.likes}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSave(post.id)}
                  aria-label={isSaved ? 'Remove from saved' : 'Save'}
                  aria-pressed={isSaved}
                  className={`${iconBtnClass} ${isSaved ? 'text-[var(--ms-plum)]' : 'text-[#8A8A8A] hover:text-[var(--ms-plum)]'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {savesCount >= COUNT_THRESHOLD && (
                    <span className="text-[12px] font-medium tabular-nums">{savesCount}</span>
                  )}
                </button>
              </div>
            )}

            {post.materials.length > 0 && (
              <p className={materialsClass} style={{ fontFamily: 'var(--font-montserrat)' }}>
                {post.materials.join('  ·  ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bespoke Order Modal Overlay */}
      <BespokeOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        sellerId={post.userId}
        sellerName={post.artisanName}
        postId={post.id || post._id}
        postCategory={post.category}
        postBudget={post.budget}
        postDescription={post.description}
        postImage={post.images && post.images.length > 0 ? post.images[0] : (post.image || '')}
        buyerLocation={user?.location || ''}
        sellerLocation={post.sellerLocation || ''}
        postPrice={post.price || post.budget}
      />
    </article>
  )
}
