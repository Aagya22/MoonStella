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
import SuggestedSellers from '@/app/components/seller/feed/SuggestedSellers'
import CreatePostModal from '@/app/components/seller/feed/CreatePostModal'
import InspectPostModal from '@/app/components/seller/feed/InspectPostModal'

export default function SellerFeedPage() {
  const router = useRouter()
  const { user, wishlist = [], setWishlist, openChatWith } = useSellerContext()
  const [localUser, setLocalUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { showSnackbar } = useSnackbar()

  const toggleSave = (postId: string) => {
    if (wishlist.includes(postId)) {
      setWishlist(wishlist.filter((id) => id !== postId))
      showSnackbar('Removed from your private vault.', 'info')
    } else {
      setWishlist([...wishlist, postId])
      showSnackbar('Saved to your private vault!', 'success')
    }
  }

  // Feed Curation States
  const [selectedCuration, setSelectedCuration] = useState('latest') // 'latest', 'following', 'my-designs'
  const [posts, setPosts] = useState<any[]>([])
  const [suggestedSellers, setSuggestedSellers] = useState<any[]>([])
  const [followedClients, setFollowedClients] = useState<string[]>([])

  // Modal creation and zoom inspect states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedInspectPost, setSelectedInspectPost] = useState<any>(null)
  const [activeInspectIndex, setActiveInspectIndex] = useState(0)

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
          comments: p.comments || [],
          time: new Date(p.createdAt).toLocaleDateString(),
          rawDate: p.createdAt,
        }))
        setPosts(formatted)

        // Compile suggested active sellers (excluding ourselves)
        const sellersMap = new Map()
        response.data.forEach((p: any) => {
          if (p.userId && p.userId.role === 'seller') {
            if (String(p.userId._id) === String(user?.id || user?._id)) return
            const nameStr = `${p.userId.firstName} ${p.userId.lastName}`
            sellersMap.set(p.userId._id, {
              id: p.userId._id,
              name: nameStr,
              image: p.userId.avatar || null,
            })
          }
        })
        setSuggestedSellers(Array.from(sellersMap.values()))
      } catch (err) {
        console.error('Failed to load feed posts:', err)
      }
    }

    if (user) {
      fetchFeedPosts()
    }
  }, [user])

  // 3. Toggle Follow Client Action
  const toggleFollowClient = (clientName: string) => {
    let updatedList: string[] = []
    if (followedClients.includes(clientName)) {
      updatedList = followedClients.filter((name) => name !== clientName)
      showSnackbar(`Unfollowed client ${clientName}.`, 'info')
    } else {
      updatedList = [...followedClients, clientName]
      showSnackbar(`You followed client ${clientName}!`, 'success')
    }
    setFollowedClients(updatedList)
    localStorage.setItem('ms_followed_clients', JSON.stringify(updatedList))
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
      return followedClients.includes(post.artisanName)
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 md:px-12 md:py-8 grid grid-cols-1 lg:grid-cols-4 gap-10">
      
      {/* LEFT COLUMN: CURATION MENU */}
      <FeedHeader
        selectedCuration={selectedCuration}
        setSelectedCuration={setSelectedCuration}
        setShowCreateModal={setShowCreateModal}
      />

      {/* MIDDLE COLUMN: SHARE BOX & FEED POSTS */}
      <main className="lg:col-span-2 flex flex-col gap-6 relative">
        <div
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-white to-[#FAF8F5] p-5 rounded-3xl border border-gray-150 shadow-[0_12px_35px_rgba(61,12,31,0.025)] flex gap-4 items-center cursor-pointer hover:border-[#3D0C1F]/20 hover:shadow-[0_12px_40px_rgba(61,12,31,0.04)] transition-all duration-300 z-10"
        >
          <div className="w-10 h-10 rounded-full bg-[#3D0C1F] text-[#E9D7C3] font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm select-none">
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
            className="bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest px-6 py-3 rounded-full uppercase cursor-pointer transition-all active:scale-95 flex-shrink-0 border-none shadow-sm"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            DRAFT
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
              />
            ))}
          </div>
        )}
      </main>

      {/* RIGHT COLUMN: SUGGESTED SELLERS */}
      <SuggestedSellers
        suggestedSellers={suggestedSellers}
        openChatWith={openChatWith}
        setSelectedCuration={setSelectedCuration}
      />

      {/* Inspect zoom brief modal */}
      {selectedInspectPost && (
        <InspectPostModal
          selectedInspectPost={selectedInspectPost}
          onClose={() => setSelectedInspectPost(null)}
          openChatWith={openChatWith}
        />
      )}

      {/* Create Design Modal overlay */}
      {showCreateModal && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePostSubmit}
        />
      )}

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <SellerOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

    </div>
  )
}
