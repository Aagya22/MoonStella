'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SellerOnboarding from '@/app/components/seller/seller-onboarding'
import { updateProfileApi } from '@/lib/api/auth'
import { useSnackbar } from '@/context/SnackbarContext'
import { useSellerContext } from '../SellerContext'
import api from '@/lib/api/axios'

// Subcomponents
import FeedHeader from '@/app/components/seller/feed/FeedHeader'
import PostCard from '@/app/components/seller/feed/PostCard'
import SuggestedBuyers from '@/app/components/seller/feed/SuggestedBuyers'
import CreatePostModal from '@/app/components/seller/feed/CreatePostModal'
import InspectPostModal from '@/app/components/seller/feed/InspectPostModal'
import FollowModal from '@/app/components/profile/FollowModal'

export default function SellerFeedPage() {
  const router = useRouter()
  const { user, setUser, wishlist = [], setWishlist, openChatWith } = useSellerContext()
  const [localUser, setLocalUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { showSnackbar } = useSnackbar()

  const toggleSave = async (postId: string) => {
    const isCurrentlySaved = wishlist.includes(postId)

    // Optimistic Update
    if (isCurrentlySaved) {
      setWishlist(prev => prev.filter((id) => id !== postId))
      showSnackbar('Removed from saved posts.', 'info')
    } else {
      setWishlist(prev => [...prev, postId])
      showSnackbar('Saved to your saved posts collection.', 'success')
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

  // Feed Curation States
  const [selectedCuration, setSelectedCuration] = useState('latest') // 'latest', 'following', 'my-designs'
  const [posts, setPosts] = useState<any[]>([])
  const [suggestedBuyers, setSuggestedBuyers] = useState<any[]>([])
  const [followedClients, setFollowedClients] = useState<string[]>([])

  // Modal creation and zoom inspect states
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

  // 1. Initial Authentication & Onboarding Checks
  useEffect(() => {
    const storedUser = localStorage.getItem('ms_user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setLocalUser(parsed)
      if (!parsed.onboarded) {
        setShowOnboarding(true)
      }
    } else {
      router.push('/login')
    }

    // Load followed clients list from local storage
    const storedFollowed = localStorage.getItem('ms_followed_clients')
    if (storedFollowed) {
      setFollowedClients(JSON.parse(storedFollowed))
    }
  }, [router])

  // 2. Fetch all feed posts (client requests + artisan designs)
  useEffect(() => {
    const fetchFeedPosts = async () => {
      try {
        const response = await api.get('/api/posts')

        const formatted = response.data.map((p: any) => ({
          id: p._id,
          userId: p.userId?._id || p.userId,
          artisanName: p.userId
            ? `${p.userId.firstName} ${p.userId.lastName}`
            : 'Anonymous Member',
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
          rawDate: p.createdAt,
        }))
        setPosts(formatted)

        // Compile suggested active buyers/clients (excluding ourselves and already followed clients)
        const buyersMap = new Map()
        const followingList = user?.following || []
        const latestPostAuthorId = response.data[0]?.userId?._id || response.data[0]?.userId

        response.data.forEach((p: any) => {
          if (p.userId && p.userId.role === 'buyer') {
            const buyerIdStr = String(p.userId._id)
            if (buyerIdStr === String(user?.id || user?._id)) return
            // Exclude already followed buyers
            if (followingList.some((f: any) => String(f._id || f) === buyerIdStr || String(f) === buyerIdStr)) return

            const nameStr = `${p.userId.firstName} ${p.userId.lastName}`
            const avatarUrl = p.userId.avatar || null
            // If the user's avatar is one of the post's images, fallback to initial letter avatar
            const isPostImage = p.images?.includes(avatarUrl)

            buyersMap.set(p.userId._id, {
              id: p.userId._id,
              name: nameStr,
              image: isPostImage ? null : avatarUrl,
            })
          }
        })
        let compiledBuyers = Array.from(buyersMap.values())

        // Fallback: If all active buyers in the feed are already followed, show them as suggested anyway instead of showing an empty sidebar
        if (compiledBuyers.length === 0) {
          response.data.forEach((p: any) => {
            if (p.userId && p.userId.role === 'buyer') {
              const buyerIdStr = String(p.userId._id)
              if (buyerIdStr === String(user?.id || user?._id)) return

              const nameStr = `${p.userId.firstName} ${p.userId.lastName}`
              const avatarUrl = p.userId.avatar || null
              const isPostImage = p.images?.includes(avatarUrl)

              buyersMap.set(p.userId._id, {
                id: p.userId._id,
                name: nameStr,
                image: isPostImage ? null : avatarUrl,
              })
            }
          })
          compiledBuyers = Array.from(buyersMap.values())
        }

        // Filter out the author of the latest post if we have other suggestions to avoid duplicate names in the viewport
        if (compiledBuyers.length > 1 && latestPostAuthorId) {
          compiledBuyers = compiledBuyers.filter(b => String(b.id) !== String(latestPostAuthorId))
        }
        setSuggestedBuyers(compiledBuyers)
      } catch (err) {
        console.error('Failed to load feed posts:', err)
      }
    }

    if (user) {
      fetchFeedPosts()
    }
  }, [user])

  // 3. Toggle Follow Client Action
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

  // 4. Toggle Like Action
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

      // Sync server state
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
      console.error('Failed to toggle like on brief:', err)
    }
  }

  // 5. Submit new portfolio design sketch
  const handleCreatePostSubmit = async (data: {
    description: string
    category: string
    budget: string
    materials: string[]
    imageFiles: File[]
  }) => {
    try {
      showSnackbar('Uploading sketches and publishing design...', 'info')

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
        artisanName: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Master Artisan',
        artisanTitle: 'MASTER ARTISAN',
        avatar: user?.avatar || null,
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
      showSnackbar('Design sketches shared successfully!', 'success')
    } catch (err: any) {
      console.error('Failed to publish design sketch to backend:', err)
      showSnackbar('Failed to submit design to server.', 'error')
    }
  }

  const handleOnboardingComplete = async (specialty: string, responseTime: string) => {
    try {
      const token = localStorage.getItem('ms_token')
      if (token && user) {
        const updatedUser = await updateProfileApi({
          onboarded: true,
          studioSpecialty: specialty,
          averageResponseTime: responseTime
        }, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setLocalUser(updatedUser)
        showSnackbar('Artisan profile launched successfully!', 'success')
      }
    } catch (err) {
      console.error('Failed to complete seller onboarding', err)
      showSnackbar('Failed to launch profile in database.', 'error')
    } finally {
      setShowOnboarding(false)
    }
  }

  const handleOnboardingSkip = async () => {
    try {
      const token = localStorage.getItem('ms_token')
      if (token && user) {
        const updatedUser = await updateProfileApi({
          onboarded: true,
          studioSpecialty: 'both',
          averageResponseTime: 'Within 24 Hours'
        }, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setLocalUser(updatedUser)
        showSnackbar('Onboarding skipped.', 'info')
      }
    } catch (err) {
      console.error('Failed to skip seller onboarding', err)
      showSnackbar('Failed to update onboarding settings.', 'error')
    } finally {
      setShowOnboarding(false)
    }
  }

  // Filter posts based on selected curation filter
  const filteredPosts = posts.filter((post) => {
    const currentUserName = user ? `${user.firstName} ${user.lastName}` : ''
    const isMyPost = post.artisanName === currentUserName || String(post.userId?._id || post.userId) === String(user?.id || user?._id)

    // 1. My Designs tab shows ONLY the seller's own designs
    if (selectedCuration === 'my-designs') {
      return isMyPost
    }

    // 2. Following Feed shows only clients followed by this seller
    if (selectedCuration === 'following') {
      if (isMyPost) return false
      return user?.following?.some((id: any) => String(id) === String(post.userId)) || false
    }

    // 3. Latest Feed curation shows all client requests (non-seller posts)
    if (selectedCuration === 'latest') {
      if (isMyPost) return false
      return post.artisanTitle !== 'MASTER ARTISAN'
    }

    return true
  })

  // Sort My Designs from latest to old posts
  if (selectedCuration === 'my-designs') {
    filteredPosts.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
  }

  if (!localUser) return null

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
            Share a new bespoke jewelry design...
          </div>
          <button
            type="button"
            className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest px-6 py-3 rounded-full uppercase cursor-pointer transition-all active:scale-95 flex-shrink-0 border-none shadow-sm"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Share
          </button>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl flex flex-col items-center gap-4 shadow-sm select-none">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center text-gray-305 border border-gray-50 shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800" style={{ fontFamily: 'var(--font-montserrat)' }}>
                {selectedCuration === 'my-designs' ? 'No Designs Shared' : 'No Client Briefs Posted'}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                {selectedCuration === 'my-designs'
                  ? 'Your shared bespoke sketches and portfolio collection will appear here.'
                  : 'There are no client custom briefs matching this curation.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 animate-scale-up">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                followedClients={followedClients}
                toggleFollowClient={toggleFollowClient}
                toggleLike={toggleLike}
                wishlist={wishlist}
                toggleSave={toggleSave}
                openChatWith={openChatWith}
                setSelectedInspectPost={setSelectedInspectPost}
                setActiveInspectIndex={setActiveInspectIndex}
                onShowLikes={handleShowLikes}
              />
            ))}
          </div>
        )}
      </main>

      <div className="w-full">
        <SuggestedBuyers
          suggestedBuyers={suggestedBuyers}
          openChatWith={openChatWith}
          setSelectedCuration={setSelectedCuration}
        />
      </div>

      {selectedInspectPost && (
        <InspectPostModal
          selectedInspectPost={selectedInspectPost}
          onClose={() => setSelectedInspectPost(null)}
          openChatWith={openChatWith}
        />
      )}

      {showCreateModal && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePostSubmit}
        />
      )}

      {showOnboarding && (
        <SellerOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <FollowModal
        isOpen={likesModalOpen}
        title="Liked By"
        list={likesModalList}
        onClose={() => setLikesModalOpen(false)}
        roleContext="seller"
      />

    </div>
  )
}
