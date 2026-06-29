'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSellerContext } from '../SellerContext'
import api from '@/lib/api/axios'
import { useSnackbar } from '@/context/SnackbarContext'
import { updateProfileApi } from '@/lib/api/auth'

export default function SellerProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs">Loading profile...</div>}>
      <SellerProfileContent />
    </Suspense>
  )
}

function SellerProfileContent() {
  const { user, openChatWith, triggerProfileEdit } = useSellerContext()
  const router = useRouter()
  const { showSnackbar } = useSnackbar()
  const searchParams = useSearchParams()
  const profileId = searchParams.get('id')

  const [profileUser, setProfileUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [selectedInspectPost, setSelectedInspectPost] = useState<any>(null)
  const [activeInspectIndex, setActiveInspectIndex] = useState(0)

  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editDesc, setEditDesc] = useState('')
  const [editBudget, setEditBudget] = useState('')

  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const isOwnProfile = !profileId || String(user?.id || user?._id) === String(profileId)
  const isFollowing = user?.following?.some((id: any) => String(id) === String(profileUser?.id || profileUser?._id)) || false

  const handleToggleFollow = async () => {
    try {
      const token = localStorage.getItem('ms_token')
      if (!token || token === 'mock_token_for_preview') {
        showSnackbar("Please log in to follow other users.", "error")
        return
      }
      const targetId = profileUser?.id || profileUser?._id
      const res = await api.post(`/api/auth/follow/${targetId}`)
      
      const updatedFollowing = res.data?.data?.following || res.data?.following || []
      const updatedUser = { ...user, following: updatedFollowing }
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      
      showSnackbar(isFollowing ? "Unfollowed successfully." : "Followed successfully!", "success")
      window.location.reload()
    } catch (err) {
      console.error('Failed to toggle follow status:', err)
      showSnackbar("Failed to update follow status.", "error")
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this portfolio piece?")) return
    try {
      await api.delete(`/api/posts/${postId}`)
      setPosts(posts.filter(p => p.id !== postId))
      setSelectedInspectPost(null)
      showSnackbar("Your portfolio piece has been removed.", "info")
    } catch (err) {
      console.error("Error deleting post:", err)
      showSnackbar("Failed to delete post. Please try again.", "error")
    }
  }

  const handleUpdatePost = async (postId: string) => {
    if (!editDesc.trim()) {
      showSnackbar("Description cannot be empty.", "error")
      return
    }
    try {
      const budgetNum = editBudget ? Number(editBudget) : null
      await api.patch(`/api/posts/${postId}`, {
        description: editDesc,
        budget: budgetNum,
        price: budgetNum ? `Rs. ${budgetNum.toLocaleString()}` : 'Contact for Quote'
      })
      const updatedPosts = posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            description: editDesc,
            budget: budgetNum,
            price: budgetNum ? `Rs. ${budgetNum.toLocaleString()}` : 'Contact for Quote'
          }
        }
        return p
      })
      setPosts(updatedPosts)
      setSelectedInspectPost((prev: any) => ({
        ...prev,
        description: editDesc,
        price: budgetNum ? `Rs. ${budgetNum.toLocaleString()}` : 'Contact for Quote'
      }))
      setIsEditing(false)
      showSnackbar("Changes saved successfully!", "success")
    } catch (err) {
      console.error("Error updating post:", err)
      showSnackbar("Failed to update post. Please try again.", "error")
    }
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveAvatar = async () => {
    if (!avatarFile) return
    setAvatarLoading(true)
    try {
      const token = localStorage.getItem('ms_token')
      let avatarUrl = ''

      if (token && token !== 'mock_token_for_preview') {
        const formData = new FormData()
        formData.append('image', avatarFile)

        const uploadRes = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        avatarUrl = uploadRes.data?.data?.url

        const updatedUser = await updateProfileApi({ avatar: avatarUrl }, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setProfileUser(updatedUser)
      } else {
        avatarUrl = URL.createObjectURL(avatarFile)
        const updatedUser = { ...user, avatar: avatarUrl }
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setProfileUser(updatedUser)
      }

      showSnackbar("Profile picture updated successfully!", "success")
      setAvatarModalOpen(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      window.location.reload()
    } catch (err: any) {
      console.error("Failed to update avatar:", err)
      showSnackbar("Failed to update profile picture.", "error")
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return
    setAvatarLoading(true)
    try {
      const token = localStorage.getItem('ms_token')
      if (token && token !== 'mock_token_for_preview') {
        const updatedUser = await updateProfileApi({ avatar: null }, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setProfileUser(updatedUser)
      } else {
        const updatedUser = { ...user, avatar: null }
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setProfileUser(updatedUser)
      }
      showSnackbar("Profile picture removed successfully.", "info")
      setAvatarModalOpen(false)
      window.location.reload()
    } catch (err: any) {
      console.error("Failed to delete avatar:", err)
      showSnackbar("Failed to remove profile picture.", "error")
    } finally {
      setAvatarLoading(false)
    }
  }

  // Load profile user details
  useEffect(() => {
    const loadProfileUser = async () => {
      try {
        const targetId = profileId || String(user?.id || user?._id)
        const res = await api.get(`/api/auth/profile/${targetId}`)
        setProfileUser(res.data?.data || res.data)
      } catch (err) {
        console.error('Failed to fetch profile user details:', err)
        showSnackbar('Failed to load user profile.', 'error')
      }
    }

    if (user) {
      loadProfileUser()
    }
  }, [user, profileId])

  // Fetch only posts created by this profile user
  useEffect(() => {
    const fetchProfilePosts = async () => {
      try {
        const response = await api.get('/api/posts')
        const targetUserId = profileUser?.id || profileUser?._id
        const targetUserName = profileUser ? `${profileUser.firstName} ${profileUser.lastName}` : ''

        const formatted = response.data
          .filter((p: any) => {
            const authorId = p.userId?._id || p.userId
            return String(authorId) === String(targetUserId)
          })
          .map((p: any) => ({
            id: p._id,
            userId: p.userId?._id || p.userId,
            artisanName: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : targetUserName,
            artisanTitle: p.userId?.role === 'seller' ? 'MASTER ARTISAN' : 'CONNOISSEUR MEMBER',
            avatar: p.userId?.avatar || profileUser?.avatar || null,
            image: p.images?.[0] || null,
            images: p.images || [],
            category: p.category,
            price: p.budget ? `Rs. ${p.budget.toLocaleString()}` : (p.price || 'Contact for Quote'),
            description: p.description,
            materials: p.materials?.length > 0 ? p.materials : ['Bespoke Custom'],
            likes: p.likes?.length || 0,
            liked: p.likes?.some((like: any) => String(like._id || like) === String(user?.id || user?._id || '')),
            comments: p.comments || [],
            time: new Date(p.createdAt).toLocaleDateString()
          }))
        setPosts(formatted)
      } catch (err) {
        console.error('Error fetching profile posts:', err)
      }
    }

    if (profileUser) {
      fetchProfilePosts()
    }
  }, [profileUser, user])

  // Helper formatting for Studio Specialty label
  const getSpecialtyLabel = (spec: string) => {
    if (spec === 'custom') return 'Bespoke Creator'
    if (spec === 'ready-made') return 'Fine Collections'
    return 'Master Atelier'
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 md:px-12 md:py-8 flex flex-col gap-8 animate-fade-in">

      {/* Unified Premium Profile Details Header */}
      <div className="relative flex flex-col w-full bg-gradient-to-b from-white to-[#FAF8F5] rounded-3xl p-8 border border-gray-150 border-t-4 border-t-[#3D0C1F] shadow-[0_15px_40px_rgba(61,12,31,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(61,12,31,0.035)] duration-500 animate-fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            {/* Avatar container */}
            <div 
              className={`relative ${isOwnProfile ? 'cursor-pointer group' : ''}`}
              onClick={isOwnProfile ? () => setAvatarModalOpen(true) : undefined}
            >
              <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-200 bg-[#3D0C1F] text-[#E9D7C3] flex items-center justify-center font-extrabold text-3xl select-none relative transition-transform duration-300 group-hover:scale-102 shadow-sm animate-scale-up">
                {profileUser?.avatar ? (
                  <Image
                    src={profileUser.avatar}
                    alt="Artisan Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{profileUser?.firstName ? profileUser.firstName[0].toUpperCase() : 'A'}</span>
                )}
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-[#3D0C1F] text-white p-1.5 rounded-full border-2 border-white flex items-center justify-center shadow-md select-none pointer-events-none">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-[#E9D7C3]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex flex-col gap-2.5 text-center md:text-left">
              <div className="flex flex-col gap-1">
                {profileUser?.role === 'seller' && profileUser?.studioName && (
                  <span className="text-[9px] font-extrabold tracking-[0.2em] text-[#3D0C1F] uppercase select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {profileUser.studioName}
                  </span>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 leading-none font-playfair animate-fade-in" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {profileUser?.firstName} {profileUser?.lastName}
                  </h2>
                  <span className="text-[8px] font-extrabold tracking-widest text-[#3D0C1F] bg-[#FAF8F5] border border-gray-200/80 px-2.5 py-0.5 rounded-full uppercase select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {profileUser?.role === 'seller' ? 'Artisan' : 'Buyer'}
                  </span>
                </div>
              </div>

              {/* Location and Date Chips */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2.5 items-center text-[9px] font-bold text-gray-405 uppercase tracking-widest select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                <span className="flex items-center gap-1.5 border border-gray-200/60 bg-white px-2.5 py-1 rounded-full text-gray-500 shadow-2xs">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#3D0C1F]">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {profileUser?.location || 'Kathmandu, Nepal'}
                </span>
                
                {profileUser?.role === 'seller' && profileUser?.averageResponseTime && (
                  <span className="flex items-center gap-1.5 border border-gray-200/60 bg-white px-2.5 py-1 rounded-full text-gray-500 shadow-2xs">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#3D0C1F]">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Responds: {profileUser.averageResponseTime}
                  </span>
                )}

                <span className="flex items-center gap-1.5 border border-gray-200/60 bg-white px-2.5 py-1 rounded-full text-gray-500 shadow-2xs">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#3D0C1F]">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Since {profileUser?.createdAt ? new Date(profileUser.createdAt).getFullYear() : 2026}
                </span>
              </div>

              {/* Bio styled as a quote */}
              {profileUser?.bio && (
                <div className="relative mt-2 pl-4 border-l-2 border-[#3D0C1F]/30 max-w-lg select-none animate-fade-in text-left">
                  <p className="text-[11px] text-gray-550 font-medium italic leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    "{profileUser.bio}"
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Part: Integrated Premium Stats & Action Buttons */}
          <div className="flex flex-col items-stretch gap-4 w-full md:w-96 shrink-0 select-none">
            
            {/* Stats Box (Abit Bigger) */}
            <div className="grid grid-cols-2 gap-4 bg-white border border-gray-150 p-5 rounded-2xl shadow-3xs">
              <div className="flex flex-col items-center justify-center text-center p-1.5 hover:bg-[#FAF8F5]/50 rounded-xl transition-all duration-300">
                <div className="text-2xl font-extrabold text-[#3D0C1F] font-playfair leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {profileUser?.followersCount || 0}
                </div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5" style={{ fontFamily: 'var(--font-montserrat)' }}>Followers</div>
              </div>
              
              <div className="flex flex-col items-center justify-center text-center p-1.5 hover:bg-[#FAF8F5]/50 rounded-xl transition-all duration-300 border-l border-gray-100">
                <div className="text-2xl font-extrabold text-[#3D0C1F] font-playfair leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {profileUser?.following?.length || 0}
                </div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5" style={{ fontFamily: 'var(--font-montserrat)' }}>Following</div>
              </div>
            </div>

            {/* Actions Row */}
            <div className="w-full">
              {isOwnProfile ? (
                <div className="flex flex-row gap-3">
                  <button
                    onClick={triggerProfileEdit}
                    className="flex-1 bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[9px] font-bold tracking-widest py-3.5 rounded-full uppercase cursor-pointer transition-all shadow-sm active:scale-98 border-none text-center transform hover:-translate-y-[1px]"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => router.push('/seller/feed')}
                    className="flex-1 bg-white border border-[#3D0C1F] text-[#3D0C1F] hover:bg-[#3D0C1F]/5 text-[9px] font-bold tracking-widest py-3.5 rounded-full uppercase cursor-pointer transition-all active:scale-98 text-center shadow-xs transform hover:-translate-y-[1px]"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Add Portfolio
                  </button>
                </div>
              ) : (
                <div className="flex flex-row gap-3">
                  <button
                    onClick={handleToggleFollow}
                    className={`flex-1 text-[9px] font-bold tracking-widest py-3.5 rounded-full uppercase cursor-pointer transition-all active:scale-98 border text-center ${
                      isFollowing
                        ? 'bg-[#3D0C1F] text-white border-[#3D0C1F] hover:bg-[#2A0714]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={() => openChatWith(`${profileUser?.firstName} ${profileUser?.lastName}`)}
                    className="flex-1 bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[9px] font-bold tracking-widest py-3.5 rounded-full uppercase cursor-pointer transition-all shadow-sm active:scale-98 border-none text-center transform hover:-translate-y-[1px]"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Message
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* 3. Portfolio Collection Grid Section (Full-Width) */}
      <div className="flex flex-col gap-6 w-full mt-6">
        <div className="border-b border-gray-100 pb-3 flex justify-between items-center select-none">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {isOwnProfile ? 'My Crafting Portfolio' : 'Bespoke Studio Collection'}
          </h3>
          <span className="text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-150 px-2.5 py-0.5 rounded">
            {posts.length} {posts.length === 1 ? 'Design' : 'Designs'}
          </span>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 md:gap-4 animate-scale-up">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  setSelectedInspectPost(post)
                  setActiveInspectIndex(0)
                }}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-[#FAF8F5] border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                {post.image ? (
                  <Image
                    src={post.image}
                    alt="Crafting piece"
                    fill
                    className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#FAF8F5] p-5 flex flex-col justify-between border border-gray-150 rounded-2xl select-none group-hover:bg-[#FAF8F5]/80 transition-colors">
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>{post.category}</span>
                    <p className="text-[10px] text-gray-650 font-medium leading-relaxed line-clamp-4 my-auto" style={{ fontFamily: 'var(--font-montserrat)' }}>{post.description}</p>
                    <span className="text-[9px] font-extrabold text-[#3D0C1F] tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>{post.price}</span>
                  </div>
                )}

                {post.images && post.images.length > 1 && (
                  <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-md p-1 rounded-lg text-white z-10">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="13" height="13" rx="1.5" />
                      <path d="M8 8H18V18" />
                    </svg>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#E9D7C3]">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#E9D7C3]">
                      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                    </svg>
                    {post.comments.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl flex flex-col items-center gap-4 shadow-sm select-none">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center text-gray-300 border border-gray-50 shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800" style={{ fontFamily: 'var(--font-montserrat)' }}>No Portfolio Items Shared</h4>
              <p className="text-[10px] text-gray-400 mt-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Your bespoke studio jewelry creations will appear in a grid format here.</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. DETAIL ZOOM MODAL OVERLAY */}
      {selectedInspectPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl md:h-[650px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row max-h-[90vh] animate-scale-up">

            <div className="w-full md:w-1/2 relative bg-[#FAF8F5] flex items-center justify-center overflow-hidden h-full">
              <Image
                src={(selectedInspectPost.images && selectedInspectPost.images[activeInspectIndex]) || selectedInspectPost.image}
                alt="Bespoke Jewelry Piece"
                fill
                className="object-contain"
              />

              {selectedInspectPost.images && selectedInspectPost.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl overflow-x-auto max-w-[90%] z-10">
                  {selectedInspectPost.images.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setActiveInspectIndex(idx)}
                      className={`relative w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${activeInspectIndex === idx ? 'border-white scale-95 shadow' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <Image src={img} alt="Bespoke design thumb" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setSelectedInspectPost(null)}
                className="absolute top-4 left-4 text-white bg-black/40 p-2.5 rounded-full hover:bg-black/60 cursor-pointer md:hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-white h-full overflow-y-auto">
              <div>
                <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-100 bg-[#3D0C1F] text-[#E9D7C3] flex items-center justify-center font-extrabold text-sm select-none">
                      {selectedInspectPost.avatar ? (
                        <Image src={selectedInspectPost.avatar} alt="Artisan" fill className="object-cover object-center" />
                      ) : (
                        <span>{selectedInspectPost.artisanName ? selectedInspectPost.artisanName[0].toUpperCase() : 'A'}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-855" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedInspectPost.artisanName}</h4>
                      {selectedInspectPost.artisanTitle === 'MASTER ARTISAN' && (
                        <p className="text-[9px] font-semibold text-[#3D0C1F] uppercase mt-0.5">{selectedInspectPost.artisanTitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isOwnProfile && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(!menuOpen)}
                          className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-full hover:bg-gray-50 border-none bg-transparent flex items-center justify-center"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>

                        {menuOpen && (
                          <div className="absolute right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 w-32 z-50 flex flex-col text-left">
                            <button
                              onClick={() => {
                                setIsEditing(true)
                                setMenuOpen(false)
                                setEditDesc(selectedInspectPost.description)
                                setEditBudget(selectedInspectPost.price?.replace('Rs. ', '')?.replace(/,/g, '') || '')
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black border-none bg-transparent cursor-pointer"
                            >
                              Edit Item
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpen(false)
                                handleDeletePost(selectedInspectPost.id)
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer"
                            >
                              Delete Item
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <button onClick={() => setSelectedInspectPost(null)} className="text-gray-450 hover:text-gray-650 cursor-pointer hidden md:block border-none bg-transparent">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Edit Description</label>
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          rows={4}
                          className="w-full bg-[#FAF8F5] border border-gray-150 rounded-xl p-3 text-xs focus:outline-none focus:bg-white focus:border-gray-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Price (Optional)</label>
                        <input
                          type="number"
                          value={editBudget}
                          onChange={(e) => setEditBudget(e.target.value)}
                          placeholder="e.g. 15000"
                          className="w-full bg-[#FAF8F5] border border-gray-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 rounded-full border border-gray-200 text-gray-500 text-[9px] font-bold tracking-widest uppercase hover:bg-gray-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdatePost(selectedInspectPost.id)}
                          className="px-4 py-2 rounded-full bg-[#3D0C1F] text-[#E9D7C3] text-[9px] font-bold tracking-widest uppercase hover:bg-[#2A0714] cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-150 px-2.5 py-0.5 rounded uppercase tracking-wider">{selectedInspectPost.category}</span>
                        {selectedInspectPost.materials.map((m: string, idx: number) => (
                          <span key={idx} className="text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-150 px-2.5 py-0.5 rounded uppercase tracking-wider">{m}</span>
                        ))}
                      </div>

                      <p className="text-xs text-gray-600 font-medium leading-relaxed font-sans">{selectedInspectPost.description}</p>
                    </>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block" style={{ fontFamily: 'var(--font-montserrat)' }}>Asking Price</span>
                    <span className="text-lg font-black text-[#3D0C1F] font-playfair" style={{ fontFamily: 'var(--font-playfair)' }}>{selectedInspectPost.price}</span>
                  </div>
                  {!isOwnProfile && (
                    <button
                      onClick={() => { setSelectedInspectPost(null); openChatWith(selectedInspectPost.artisanName); }}
                      className="bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest px-6 py-3.5 rounded-full uppercase cursor-pointer transition-all shadow border-none"
                    >
                      Inquire Customization
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. AVATAR OPTIONS DIALOG MODAL */}
      {avatarModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 animate-scale-up flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'var(--font-montserrat)' }}>Profile Picture</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Upload a clear avatar or representation for buyers to identify your studio.
              </p>
            </div>

            {/* Avatar Preview */}
            <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-250 bg-[#3D0C1F] text-[#E9D7C3] flex items-center justify-center font-extrabold text-3xl select-none mx-auto relative shadow-inner">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Preview Avatar" fill className="object-cover" />
              ) : profileUser?.avatar ? (
                <Image src={profileUser.avatar} alt="Current Avatar" fill className="object-cover" />
              ) : (
                <span>{profileUser?.firstName ? profileUser.firstName[0].toUpperCase() : 'A'}</span>
              )}
            </div>

            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="w-full bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest py-3 rounded-full uppercase cursor-pointer transition-all border-none"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {profileUser?.avatar ? "Update Picture" : "Add Picture"}
              </button>

              {profileUser?.avatar && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={avatarLoading}
                  className="w-full bg-white border border-red-250 text-red-650 hover:bg-red-50/10 text-[10px] font-bold tracking-widest py-3 rounded-full uppercase cursor-pointer transition-all disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Delete Picture
                </button>
              )}

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={avatarLoading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold tracking-widest py-3 rounded-full uppercase cursor-pointer transition-all disabled:opacity-50 mt-1 shadow"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {avatarLoading ? "Saving..." : "Done"}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAvatarModalOpen(false)
                  setAvatarPreview(null)
                  setAvatarFile(null)
                }}
                className="w-full bg-white border border-gray-250 text-gray-500 hover:bg-gray-50 text-[10px] font-bold tracking-widest py-3 rounded-full uppercase cursor-pointer transition-all mt-1"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
