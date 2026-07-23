'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBuyerContext } from '../BuyerContext'
import { useSnackbar } from '@/context/SnackbarContext'
import api from '@/lib/api/axios'

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
  const [posts, setPosts] = useState<any[]>([])
  const [suggestedSellers, setSuggestedSellers] = useState<any[]>([])

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

  // Load Posts & Compile Suggested Sellers
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/api/posts')
        const formatted = response.data.map((p: any) => ({
          id: p._id,
          userId: p.userId?._id || p.userId,
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
          reviewStats: p.reviewStats || { count: 0, average: 0 },
          time: new Date(p.createdAt).toLocaleDateString(),
          rawDate: p.createdAt,
        }))
        setPosts(formatted)

        // Compile suggested sellers dynamically based on posts' authors
        const sellersMap = new Map()
        const currentName = user ? `${user.firstName} ${user.lastName}` : ''
        response.data.forEach((p: any) => {
          if (p.userId) {
            const authorName = `${p.userId.firstName} ${p.userId.lastName}`
            if (authorName === currentName) return
            if (String(p.userId._id) === String(user?.id || user?._id)) return
            if (p.userId.role !== 'seller') return // Only show actual sellers/artisans

            sellersMap.set(p.userId._id, {
              id: p.userId._id,
              name: authorName,
              piecesCount: 'Master Artisan',
              image: p.userId.avatar || null,
            })
          }
        })
        setSuggestedSellers(Array.from(sellersMap.values()))
      } catch (err) {
        console.error('Error fetching posts from backend:', err)
      }
    }

    if (user) {
      fetchPosts()
    }
  }, [user])

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
      const p = response.data

      const newPost = {
        id: p._id,
        userId: p.userId?._id || p.userId || user?.id || user?._id,
        artisanName: p.userId
          ? `${p.userId.firstName} ${p.userId.lastName}`
          : user?.firstName
            ? `${user.firstName} ${user.lastName}`
            : 'Connoisseur Member',
        artisanTitle: p.userId?.role === 'seller' ? 'MASTER ARTISAN' : 'CONNOISSEUR MEMBER',
        avatar: p.userId?.avatar || user?.avatar || null,
        image: p.images?.[0] || '/recom_emerald.png',
        images: p.images?.length > 0 ? p.images : ['/recom_emerald.png'],
        category: p.category,
        price: p.budget ? `Rs. ${p.budget.toLocaleString()}` : p.price || 'Contact for Quote',
        description: p.description,
        materials: p.materials?.length > 0 ? p.materials : ['Bespoke Custom'],
        likes: p.likes?.length || 0,
        liked: false,
        comments: p.comments || [],
        time: 'Just now',
        rawDate: p.createdAt,
      }

      setPosts([newPost, ...posts])
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

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Connoisseur Member'
    const isMyPost =
      post.artisanName === currentUserName ||
      String(post.userId?._id || post.userId) === String(user?.id || user?._id)

    // 1. My Requests tab shows ONLY the buyer's own posts
    if (selectedCuration === 'my-requests') {
      if (!isMyPost) return false
    } else {
      // 2. All other curation feeds must EXCLUDE the buyer's own posts and show ONLY Sellers
      if (isMyPost) return false
      if (post.artisanTitle !== 'MASTER ARTISAN') return false
    }

    // 3. Following Feed filter logic shows ONLY following sellers
    if (selectedCuration === 'following') {
      const isFollowingArtisan = user?.following?.some((id: any) => String(id) === String(post.userId))
      if (!isFollowingArtisan) return false
    }

    // 4. Material tags filter
    if (selectedMaterial) {
      if (!post.materials.includes(selectedMaterial)) return false
    }
    return true
  })

  // Sort My Requests from latest to old posts
  if (selectedCuration === 'my-requests') {
    filteredPosts.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
  }

  return (
    <div className="flex-1 w-full mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_3.5fr_1fr] gap-8">

      <div className="w-full">
        <FeedHeader
          selectedCuration={selectedCuration}
          setSelectedCuration={setSelectedCuration}
          setShowCreateModal={setShowCreateModal}
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

        {/* Feed Posts */}
        <div className="flex flex-col gap-8">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center flex flex-col items-center justify-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] min-h-[320px]">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#5F3041]/40">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-855 mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Showcase Feed is Empty</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  There are no masterpieces posted yet. Be the first to share your jewelry inspiration!
                </p>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => (
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
            ))
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
