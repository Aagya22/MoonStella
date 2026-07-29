'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { io } from 'socket.io-client'
import { useBuyerContext } from '../BuyerContext'
import { useSnackbar } from '@/context/SnackbarContext'
import api from '@/lib/api/axios'
import FeedSkeleton from '@/app/components/feed/FeedSkeleton'

// Subcomponents
import FeedHeader from '@/app/components/buyer/feed/FeedHeader'
import PostCard from '@/app/components/buyer/feed/PostCard'
import SuggestedSellers from '@/app/components/buyer/feed/SuggestedSellers'
import CreatePostModal from '@/app/components/buyer/feed/CreatePostModal'
import InspectPostModal from '@/app/components/buyer/feed/InspectPostModal'
import FollowModal from '@/app/components/profile/FollowModal'

function BuyerFeedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postParam = searchParams.get('post')
  const {
    user,
    setUser,
    wishlist,
    setWishlist,
    openChatWith,
    followedArtisans = [],
    setFollowedArtisans,
  } = useBuyerContext()
  const { showSnackbar } = useSnackbar()

  // Feed States
  const [selectedCuration, setSelectedCuration] = useState('latest') // 'latest', 'following', 'my-requests'
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<'trending' | 'latest'>('trending')
  const [posts, setPosts] = useState<any[]>([])
  const [suggestedSellers, setSuggestedSellers] = useState<any[]>([])

  // Paging & fetch status
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  // New posts from others, held until asked for
  const [pendingPosts, setPendingPosts] = useState<any[]>([])
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedInspectPost, setSelectedInspectPost] = useState<any>(null)
  const [activeInspectIndex, setActiveInspectIndex] = useState(0)

  // Likes Modal States
  const [likesModalOpen, setLikesModalOpen] = useState(false)
  const [likesModalList, setLikesModalList] = useState<any[]>([])

  const handleShowLikes = (likesList: any[]) => {
    setLikesModalList(likesList)
    setLikesModalOpen(true)
  }

  const uid = String(user?.id || user?._id || '')

  const mapPost = useCallback((p: any) => ({
    id: p._id,
    userId: p.userId?._id || p.userId,
    role: p.userId?.role || 'buyer',
    artisanName: p.userId
      ? `${p.userId.firstName} ${p.userId.lastName}`
      : 'Connoisseur Member',
    artisanTitle: p.userId?.role === 'seller' ? 'MASTER ARTISAN' : 'CONNOISSEUR MEMBER',
    avatar: p.userId?.avatar || null,
    sellerLocation: p.userId?.location || null,
    image: p.images?.[0] || null,
    images: p.images || [],
    category: p.category,
    price: p.budget ? `Rs. ${p.budget.toLocaleString()}` : p.price || 'Contact for Quote',
    description: p.description,
    materials: p.materials || [],
    likes: p.likes?.length || 0,
    liked: p.likes?.some((like: any) => String(like._id || like) === uid),
    likesList: p.likes?.map((u: any) => ({
      id: u._id || u,
      firstName: u.firstName || 'Anonymous',
      lastName: u.lastName || '',
      avatar: u.avatar || null,
      role: u.role || 'buyer',
      location: u.location || 'Nepal'
    })) || [],
    reviewStats: p.reviewStats || { count: 0, average: 0 },
    time: new Date(p.createdAt).toLocaleDateString(),
    rawDate: p.createdAt,
  }), [uid])

  // The server does the curating now
  const feedParams = useCallback((page: number) => {
    const params: Record<string, string> = { page: String(page), limit: '8', sort: sortMode }

    if (selectedCuration === 'my-requests') {
      params.authorId = uid
      params.sort = 'latest'
    } else {
      params.authorRole = 'seller'
      params.excludeSelf = 'true'
      if (selectedCuration === 'following') params.following = 'true'
    }
    if (selectedMaterial) params.material = selectedMaterial

    return params
  }, [selectedCuration, selectedMaterial, sortMode, uid])

  const loadPage = useCallback(async (page: number) => {
    const isFirstPage = page === 1
    if (isFirstPage) setLoading(true)
    else setLoadingMore(true)
    setError('')

    try {
      const response = await api.get('/api/posts', { params: feedParams(page) })
      const payload = response.data?.data
      const batch = (payload?.docs || []).map(mapPost)

      setPosts((prev) => (isFirstPage ? batch : [...prev, ...batch]))
      setHasMore(Boolean(payload?.hasMore))
      setCurrentPage(page)
    } catch (err) {
      console.error('Error fetching posts from backend:', err)
      setError('We could not load the feed just now.')
      setHasMore(false)
      if (isFirstPage) setPosts([])
    } finally {
      if (isFirstPage) setLoading(false)
      else setLoadingMore(false)
    }
  }, [feedParams, mapPost])

  // Keyed on uid; the user object changes on every follow
  useEffect(() => {
    if (!uid) return
    setPendingPosts([])
    loadPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, selectedCuration, selectedMaterial, sortMode])

  // Infinite scroll
  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadPage(currentPage + 1)
      },
      { rootMargin: '400px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, currentPage])

  useEffect(() => {
    if (!uid) return
    api
      .get('/api/posts/authors', { params: { role: 'seller', limit: '6' } })
      .then((res) => {
        setSuggestedSellers(
          (res.data?.data || []).map((a: any) => ({
            id: a._id,
            name: `${a.firstName || ''} ${a.lastName || ''}`.trim(),
            piecesCount: 'Master Artisan',
            image: a.avatar || null,
          }))
        )
      })
      .catch(() => setSuggestedSellers([]))
  }, [uid])

  // Live arrivals wait behind a banner
  useEffect(() => {
    if (!uid) return
    const token = localStorage.getItem('ms_token')
    if (!token || token === 'mock_token_for_preview') return

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
    })

    socket.on('post:new', (p: any) => {
      const authorId = String(p?.userId?._id || p?.userId || '')
      if (!authorId || authorId === uid) return
      if (selectedCuration === 'my-requests') return
      if (p?.userId?.role !== 'seller') return
      if (selectedCuration === 'following' && !user?.following?.some((id: any) => String(id) === authorId)) return
      if (selectedMaterial && !(p.materials || []).includes(selectedMaterial)) return

      setPendingPosts((prev) =>
        prev.some((x) => x.id === p._id) ? prev : [mapPost(p), ...prev]
      )
    })

    return () => {
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, selectedCuration, selectedMaterial])

  const showPendingPosts = () => {
    setPosts((prev) => [...pendingPosts, ...prev])
    setPendingPosts([])
  }

  // Open a specific piece when linked here from the dashboard
  useEffect(() => {
    if (!postParam || !posts.length) return
    const target = posts.find((p: any) => String(p.id) === String(postParam))
    if (target) setSelectedInspectPost(target)
  }, [postParam, posts])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('newRequest') === 'true') {
        setShowCreateModal(true)
        router.replace('/buyer/feed')
      }
    }
  }, [router])

  // Toggle Follow
  const toggleFollow = async (targetId: string) => {
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
        showSnackbar('You followed this user!', 'success')
      } else {
        showSnackbar('You unfollowed this user.', 'info')
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err)
      showSnackbar('Failed to update follow status.', 'error')
    }
  }

  // Toggle Save
  const toggleSave = async (postId: string) => {
    const isCurrentlySaved = wishlist.includes(postId)

    // Optimistic Update
    if (isCurrentlySaved) {
      setWishlist(prev => prev.filter((id) => id !== postId))
      showSnackbar('Removed from saved collection.', 'info')
    } else {
      setWishlist(prev => [...prev, postId])
      showSnackbar('Saved to your bespoke collection!', 'success')
    }

    try {
      const res = await api.patch(`/api/posts/${postId}/save`)
      const updatedSavedList = res.data?.savedPosts || res.data?.data?.savedPosts || []

      // Update locally
      setWishlist(updatedSavedList)

      const updatedUser = { ...user, savedPosts: updatedSavedList }
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (err) {
      console.error('Failed to toggle save status on backend:', err)
      showSnackbar('Failed to sync save status with server.', 'error')

      // Revert optimistic update
      if (isCurrentlySaved) {
        setWishlist(prev => [...prev, postId])
      } else {
        setWishlist(prev => prev.filter((id) => id !== postId))
      }
    }
  }

  // Toggle Like
  const toggleLike = async (postId: string) => {
    try {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
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
      const p = response.data

      // Sync with server state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
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
            }
          }
          return post
        })
      )
    } catch (err) {
      console.error('Failed to toggle like on backend:', err)
    }
  }

  // Submit new custom request post
  const handleCreatePostSubmit = async (data: {
    description: string
    category: string
    budget: string
    materials: string[]
    imageFiles: File[]
  }) => {
    try {
      showSnackbar('Uploading sketches and publishing brief...', 'info')

      const uploadedUrls: string[] = []
      for (const file of data.imageFiles) {
        const formData = new FormData()
        formData.append('image', file)
        const uploadRes = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (uploadRes.data?.data?.url) {
          uploadedUrls.push(uploadRes.data.data.url)
        }
      }

      const postPayload = {
        description: data.description,
        category: data.category,
        budget: data.budget ? Number(data.budget) : null,
        materials: data.materials,
        images: uploadedUrls.length > 0 ? uploadedUrls : ['/recom_emerald.png'],
      }

      const response = await api.post('/api/posts', postPayload)
      const newPost = { ...mapPost(response.data), time: 'Just now' }

      // Only belongs on screen if the tab in view is My Requests
      if (selectedCuration === 'my-requests') {
        setPosts((prev) => [newPost, ...prev])
      }
      setShowCreateModal(false)
      showSnackbar('Bespoke request posted successfully!', 'success')
    } catch (err: any) {
      console.error('Failed to publish brief to backend:', err)
      showSnackbar('Failed to submit post to server.', 'error')
    }
  }

  // Delete post from within inspect modal
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this custom request?')) return
    try {
      await api.delete(`/api/posts/${postId}`)
      setPosts(posts.filter((p) => p.id !== postId))
      setSelectedInspectPost(null)
      showSnackbar('Your custom request has been deleted.', 'info')
    } catch (err) {
      console.error('Error deleting post:', err)
      showSnackbar('Failed to delete post.', 'error')
    }
  }

  // Update post description and budget from within inspect modal
  const handleUpdatePost = async (postId: string, newDesc: string, newBudget: string) => {
    try {
      const budgetNum = newBudget ? Number(newBudget) : null
      await api.patch(`/api/posts/${postId}`, {
        description: newDesc,
        budget: budgetNum,
        price: budgetNum ? `Rs. ${budgetNum.toLocaleString()}` : 'Contact for Quote',
      })

      const updatedPosts = posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            description: newDesc,
            budget: budgetNum,
            price: budgetNum ? `Rs. ${budgetNum.toLocaleString()}` : 'Contact for Quote',
          }
        }
        return p
      })
      setPosts(updatedPosts)

      setSelectedInspectPost((prev: any) => ({
        ...prev,
        description: newDesc,
        price: budgetNum ? `Rs. ${budgetNum.toLocaleString()}` : 'Contact for Quote',
      }))

      showSnackbar('Changes saved successfully!', 'success')
    } catch (err) {
      console.error('Error updating post:', err)
      showSnackbar('Failed to update post.', 'error')
    }
  }

  const emptyMessage = {
    'my-requests': {
      title: 'No Requests Yet',
      body: 'Share a commission brief and the artisans will come to you.',
    },
    following: {
      title: 'Nothing From Your Circle',
      body: 'Follow a few artisans and their newest pieces will gather here.',
    },
    latest: {
      title: 'Showcase Feed is Empty',
      body: 'There are no masterpieces posted yet. Be the first to share your jewelry inspiration!',
    },
  }[selectedCuration] || {
    title: 'Nothing to Show',
    body: 'Try another curation or clear the material filter.',
  }

  return (
    <div className="flex-1 w-full mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_3.5fr_1fr] gap-8">

      <div className="w-full">
        <FeedHeader
          selectedCuration={selectedCuration}
          setSelectedCuration={setSelectedCuration}
          setShowCreateModal={setShowCreateModal}
          sortMode={sortMode}
          setSortMode={setSortMode}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
        />
      </div>

      <main className="w-full flex flex-col gap-6 relative">
        <div
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-white to-[#FAF8F5] p-5 rounded-3xl border border-gray-100 shadow-[0_12px_35px_rgba(61,12,31,0.025)] flex gap-4 items-center cursor-pointer hover:border-[#5F3041]/20 hover:shadow-[0_12px_40px_rgba(61,12,31,0.04)] transition-all duration-300 z-10"
        >
          <div className="w-10 h-10 rounded-full bg-[#5F3041] text-[#E9D7C3] font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm select-none">
            {user?.firstName ? user.firstName[0].toUpperCase() : 'A'}
          </div>
          <div
            className="flex-1 bg-white border border-gray-100 rounded-full px-5 py-3 text-xs text-gray-405 select-none hover:bg-gray-50/50 transition-colors flex items-center gap-2"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-gray-400">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Start a custom commission brief...
          </div>
          <button
            type="button"
            className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest px-6 py-3 rounded-full uppercase cursor-pointer transition-all active:scale-95 flex-shrink-0 border-none shadow-sm"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Share
          </button>
        </div>

        {/* New pieces published while the feed has been open */}
        {pendingPosts.length > 0 && (
          <div className="sticky top-20 z-20 flex justify-center pointer-events-none">
            <button
              onClick={showPendingPosts}
              className="pointer-events-auto bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 rounded-full border-none cursor-pointer shadow-lg transition-all active:scale-95 flex items-center gap-2 animate-fade-in"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {pendingPosts.length} New {pendingPosts.length === 1 ? 'Piece' : 'Pieces'}
            </button>
          </div>
        )}

        {/* Feed Posts */}
        <div className="flex flex-col gap-8">
          {loading ? (
            <FeedSkeleton count={3} />
          ) : error ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center flex flex-col items-center justify-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] min-h-[320px]">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#5F3041]/40">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-855 mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>{error}</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Check your connection and try again.
                </p>
              </div>
              <button
                onClick={() => loadPage(1)}
                className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 rounded-full border-none cursor-pointer transition-all active:scale-95"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center flex flex-col items-center justify-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] min-h-[320px]">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#5F3041]/40">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-855 mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>{emptyMessage.title}</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  {emptyMessage.body}
                </p>
              </div>
              {selectedMaterial && (
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="text-[10px] font-bold tracking-widest uppercase text-[#5F3041] border border-[#5F3041]/20 bg-[#FAF6F0] px-6 py-2.5 rounded-full cursor-pointer transition-all active:scale-95"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Clear {selectedMaterial}
                </button>
              )}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  followedArtisans={followedArtisans}
                  wishlist={wishlist}
                  toggleFollow={toggleFollow}
                  toggleLike={toggleLike}
                  toggleSave={toggleSave}
                  openChatWith={openChatWith}
                  setSelectedInspectPost={setSelectedInspectPost}
                  setActiveInspectIndex={setActiveInspectIndex}
                  onShowLikes={handleShowLikes}
                />
              ))}

              {loadingMore && <FeedSkeleton count={1} />}

              {/* Tripped before it comes into view, so the next page is ready */}
              <div ref={sentinelRef} aria-hidden className="h-px" />

              {!hasMore && (
                <p className="text-center text-[10px] text-gray-400 tracking-widest uppercase py-6 select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  You have reached the end
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <div className="w-full">
        <SuggestedSellers
          suggestedSellers={suggestedSellers}
          openChatWith={openChatWith}
          setSelectedCuration={setSelectedCuration}
          setSelectedMaterial={setSelectedMaterial}
        />
      </div>

      {showCreateModal && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePostSubmit}
        />
      )}

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

      <FollowModal
        isOpen={likesModalOpen}
        title="Liked By"
        list={likesModalList}
        onClose={() => setLikesModalOpen(false)}
        roleContext="buyer"
      />

    </div>
  )
}

export default function BuyerFeedPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[400px] text-xs font-bold text-gray-400 tracking-widest uppercase">
        Loading Feed...
      </div>
    }>
      <BuyerFeedContent />
    </Suspense>
  )
}
