'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import api from '@/lib/api/axios'
import { useSellerContext } from '../SellerContext'
import { useSnackbar } from '@/context/SnackbarContext'

// Subcomponents
import PostCard from '@/app/components/seller/feed/PostCard'
import InspectPostModal from '@/app/components/buyer/feed/InspectPostModal'
import FollowModal from '@/app/components/profile/FollowModal'

export default function SellerSavedPage() {
  const router = useRouter()
  const {
    user,
    setUser,
    wishlist = [],
    setWishlist,
    openChatWith,
  } = useSellerContext()
  const { showSnackbar } = useSnackbar()

  // States
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedInspectPost, setSelectedInspectPost] = useState<any>(null)
  const [activeInspectIndex, setActiveInspectIndex] = useState(0)

  // Likes Modal States
  const [likesModalOpen, setLikesModalOpen] = useState(false)
  const [likesModalList, setLikesModalList] = useState<any[]>([])

  const handleShowLikes = (likesList: any[]) => {
    setLikesModalList(likesList)
    setLikesModalOpen(true)
  }

  // Load Saved Posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('ms_token')
        if (token && token !== 'mock_token_for_preview') {
          const response = await api.get('/api/posts/saved')
          const formatted = response.data.map((p: any) => ({
            id: p._id,
            userId: p.userId?._id || p.userId,
            artisanName: p.userId
              ? `${p.userId.firstName} ${p.userId.lastName}`
              : 'Connoisseur Member',
            artisanTitle: p.userId?.role === 'seller' ? 'MASTER ARTISAN' : 'CONNOISSEUR MEMBER',
            avatar: p.userId?.avatar || null,
            image: p.images?.[0] || null,
            images: p.images || [],
            category: p.category,
            price: p.budget ? `Rs. ${p.budget.toLocaleString()}` : p.price || 'Contact for Quote',
            description: p.description,
            materials: p.materials?.length > 0 ? p.materials : ['Bespoke Custom'],
            likes: p.likes?.length || 0,
            liked: p.likes?.some(
              (like: any) => String(like._id || like) === String(user?.id || user?._id || '')
            ),
            likesList: p.likes?.map((u: any) => ({
              id: u._id || u,
              firstName: u.firstName || 'Anonymous',
              lastName: u.lastName || '',
              avatar: u.avatar || null,
              role: u.role || 'buyer',
              location: u.location || 'Nepal'
            })) || [],
            comments: p.comments || [],
            time: new Date(p.createdAt).toLocaleDateString(),
          }))
          setPosts(formatted)
        }
      } catch (err) {
        console.error('Failed to load saved posts:', err)
        showSnackbar('Failed to load saved posts.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchSavedPosts()
  }, [wishlist, user])

  // Toggle Save (unsaving will dynamically remove it from this list view)
  const toggleSave = async (postId: string) => {
    const isCurrentlySaved = wishlist.includes(postId)
    
    // Optimistic Update
    if (isCurrentlySaved) {
      setWishlist(prev => prev.filter((id) => id !== postId))
      setPosts(prev => prev.filter((post) => post.id !== postId))
      showSnackbar('Removed from saved posts.', 'info')
    } else {
      setWishlist(prev => [...prev, postId])
      showSnackbar('Saved to your saved posts collection.', 'success')
    }

    try {
      const res = await api.patch(`/api/posts/${postId}/save`)
      const updatedSavedList = res.data?.savedPosts || res.data?.data?.savedPosts || []
      
      setWishlist(updatedSavedList)
      
      const updatedUser = { ...user, savedPosts: updatedSavedList }
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (err) {
      console.error('Failed to update saved posts status:', err)
      showSnackbar('Failed to update saved posts status on server.', 'error')
      
      // Revert
      window.location.reload()
    }
  }

  // Toggle Like
  const toggleLike = async (postId: string) => {
    try {
      setPosts(prev =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          }
          return post
        })
      )
      
      const response = await api.patch(`/api/posts/${postId}/like`)
      const rawPost = response.data
      
      setPosts(prev =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: rawPost.likes?.length || 0,
              liked: rawPost.likes?.some(
                (like: any) => String(like._id || like) === String(user?.id || user?._id || '')
              ),
              likesList: rawPost.likes?.map((u: any) => ({
                id: u._id || u,
                firstName: u.firstName || 'Anonymous',
                lastName: u.lastName || '',
                avatar: u.avatar || null,
                role: u.role || 'buyer',
                location: u.location || 'Nepal'
              })) || [],
            }
          }
          return post
        })
      )
    } catch (err) {
      console.error('Failed to toggle like status:', err)
    }
  }

  // Toggle Follow
  const toggleFollowClient = async (targetId: string) => {
    try {
      const token = localStorage.getItem('ms_token')
      if (!token || token === 'mock_token_for_preview') {
        showSnackbar("Please log in to follow other users.", "error")
        return
      }

      const res = await api.post(`/api/auth/follow/${targetId}`)
      const following = res.data?.data?.following || res.data?.following || []

      const updatedUser = { ...user, following }
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      const isNowFollowing = following.includes(targetId)
      if (isNowFollowing) {
        showSnackbar('You followed this client!', 'success')
      } else {
        showSnackbar('You unfollowed this client.', 'info')
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err)
      showSnackbar('Failed to update follow status.', 'error')
    }
  }

  // Sync state for updated comments from detail modal
  const handleCommentAdded = (updatedPost: any) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === updatedPost._id || post.id === updatedPost.id) {
          return { ...post, comments: updatedPost.comments || [] }
        }
        return post
      })
    )
    setSelectedInspectPost((prev: any) => {
      if (prev && (prev.id === updatedPost._id || prev.id === updatedPost.id)) {
        return { ...prev, comments: updatedPost.comments || [] }
      }
      return prev
    })
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/api/posts/${postId}`)
      setPosts(prev => prev.filter(p => p.id !== postId))
      setWishlist(prev => prev.filter(id => id !== postId))
      setSelectedInspectPost(null)
      showSnackbar("Post deleted.", "info")
    } catch (err) {
      console.error(err)
      showSnackbar("Failed to delete post.", "error")
    }
  }

  const handleUpdatePost = async (postId: string, newDesc: string, newBudget: string) => {
    try {
      const budgetNum = newBudget ? Number(newBudget) : null
      await api.patch(`/api/posts/${postId}`, {
        description: newDesc,
        budget: budgetNum,
        price: budgetNum ? `Rs. ${budgetNum.toLocaleString()}` : 'Contact for Quote'
      })
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            description: newDesc,
            price: budgetNum ? `Rs. ${budgetNum.toLocaleString()}` : 'Contact for Quote'
          }
        }
        return p
      }))
      showSnackbar("Post updated.", "success")
    } catch (err) {
      console.error(err)
      showSnackbar("Failed to update post.", "error")
    }
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 md:px-12 md:py-8 flex flex-col gap-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#5F3041]/10 pb-6">
        <div>
          <p
            className="text-[10px] font-bold tracking-[0.24em] text-[#8A6538] uppercase mb-3"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            The Studio Reference
          </p>
          <h1
            className="text-3xl md:text-[2.6rem] font-bold text-gray-900 leading-[1.05]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Saved Posts
          </h1>
          <div aria-hidden className="h-px w-14 mt-4 mb-3" style={{ backgroundColor: '#B78A3C' }} />
          <p
            className="text-xs text-gray-500 font-medium tracking-wide"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Curated and saved client briefs and designs.
          </p>
        </div>
        <div className="flex items-baseline gap-2.5 bg-white px-6 py-4 rounded-2xl border border-[#5F3041]/10 shadow-[0_8px_24px_-16px_rgba(61,12,31,0.35)] select-none self-start md:self-auto">
          <span className="text-[2rem] leading-none font-bold text-[#5F3041]" style={{ fontFamily: 'var(--font-playfair)' }}>
            {posts.length}
          </span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Posts<br />Saved
          </span>
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px] text-xs font-semibold text-gray-400">
          Loading saved posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="flex-1 flex justify-center">
        <div className="flex flex-col items-center justify-center py-20 px-8 bg-white border border-dashed border-gray-100 rounded-3xl gap-4 max-w-lg w-full select-none animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-gray-300 border border-gray-50 shadow-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#5F3041] font-playfair mb-1">No Saved Posts</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Explore the Requests Feed and save client briefs or artisan designs to track them here.
            </p>
          </div>
          <button
            onClick={() => router.push('/seller/feed')}
            className="mt-2 bg-[#5F3041] text-white hover:bg-[#4A2231] text-[10px] font-bold tracking-widest px-5 py-3 rounded uppercase transition-all duration-200 cursor-pointer shadow active:scale-95"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Explore Feed
          </button>
        </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full mx-auto">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => {
                setSelectedInspectPost(post)
                setActiveInspectIndex(0)
              }}
              className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer shadow-sm transition-all duration-300 group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-gray-200 hover:-translate-y-0.5"
            >
              {/* Standardized image container */}
              <div className="relative aspect-[16/10] bg-[#FAF8F5] overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.category}
                    fill
                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#5F3041]/10">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}

                {/* Floating Save/Bookmark Button at Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSave(post.id)
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#5F3041] backdrop-blur-sm shadow flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer z-20 border-none"
                  title="Unsave design"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>

                {/* Photo count indicator */}
                {post.images && post.images.length > 1 && (
                  <div
                    title={`${post.images.length} photos attached`}
                    className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white z-10 flex items-center gap-1 select-none"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="13" height="13" rx="1.5" />
                      <path d="M8 8H19a1 1 0 0 1 1 1V19" />
                    </svg>
                    <span className="text-[8px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>{post.images.length}</span>
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="p-5 flex-1 flex flex-col gap-2.5">
                {/* Category pill */}
                <div className="flex items-center">
                  {(() => {
                    return (
                      <span
                        className="text-[8.5px] font-extrabold tracking-widest uppercase text-[#5F3041] bg-[#FAF0F3] border border-[#5F3041]/10 px-3 py-1 rounded-full"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        {post.category || 'Bespoke Request'}
                      </span>
                    )
                  })()}
                </div>

                {/* Brief text or custom title dynamically parsed */}
                {(() => {
                  const limit = 90
                  let cardTitle = 'Custom Jewelry Request'
                  let cardBody = ''

                  if (post.description) {
                    const cleaned = post.description.replace(/^Title:\s*/i, '')
                    if (cleaned.length <= limit) {
                      cardTitle = cleaned
                    } else {
                      const sentences = cleaned.split(/(?<=[.!?])\s+/)
                      if (sentences[0].length <= limit) {
                        cardTitle = sentences[0]
                        cardBody = sentences.slice(1).join(' ')
                      } else {
                        cardTitle = cleaned.substring(0, limit) + '...'
                        cardBody = cleaned.substring(limit)
                      }
                    }
                  }

                  return (
                    <>
                      <h4 className="text-sm font-bold text-[#5F3041] line-clamp-1 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {cardTitle}
                      </h4>
                      {cardBody && (
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                          {cardBody}
                        </p>
                      )}
                    </>
                  )
                })()}

                {/* Footer — date (muted gray left), price (bold dark right) */}
                <div className="border-t border-gray-100 pt-3 mt-auto flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {post.time}
                  </span>
                  <span className="text-[11px] font-bold text-[#5F3041]" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {post.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect / Zoom Post Modal */}
      {selectedInspectPost && (
        <InspectPostModal
          selectedInspectPost={selectedInspectPost}
          onClose={() => setSelectedInspectPost(null)}
          user={user}
          wishlist={wishlist}
          openChatWith={openChatWith}
          handleDeletePost={handleDeletePost}
          handleUpdatePost={handleUpdatePost}
        />
      )}

      {/* Likes Modal */}
      {likesModalOpen && (
        <FollowModal
          title="Likes"
          isOpen={likesModalOpen}
          onClose={() => setLikesModalOpen(false)}
          list={likesModalList}
          roleContext="seller"
        />
      )}

    </div>
  )
}
