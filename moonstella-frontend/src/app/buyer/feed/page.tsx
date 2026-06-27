'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useBuyerContext } from '../BuyerContext'
import { useSnackbar } from '@/context/SnackbarContext'
import api from '@/lib/api/axios'

import { METALS, GEMSTONES } from '@/lib/materials/material'

export default function BuyerFeedPage() {
  const { user, wishlist, setWishlist, openChatWith, setTimelineOpen } = useBuyerContext()
  const { showSnackbar } = useSnackbar()
  
  // Feed Filters & Interaction States
  const [selectedCuration, setSelectedCuration] = useState('latest') // 'latest', 'following'
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [followedArtisans, setFollowedArtisans] = useState<string[]>([]) 
  const [posts, setPosts] = useState<any[]>([]) // Empty posts (no dummy data)
  const [suggestedSellers, setSuggestedSellers] = useState<any[]>([]) // Empty suggested sellers (no dummy data)

  // Form States for creating a post
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Rings')
  const [budget, setBudget] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [uploadedImageFiles, setUploadedImageFiles] = useState<File[]>([])
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState<string[]>([])
  const [activeInspectIndex, setActiveInspectIndex] = useState(0)
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/api/posts')
        const formatted = response.data.map((p: any) => ({
          id: p._id,
          artisanName: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : 'Connoisseur Member',
          artisanTitle: p.userId?.role === 'seller' ? 'MASTER ARTISAN' : 'CONNOISSEUR MEMBER',
          avatar: p.userId?.avatar || '/avatar_aastha.png',
          image: p.images?.[0] || '/recom_emerald.png',
          images: p.images?.length > 0 ? p.images : ['/recom_emerald.png'],
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
        console.error('Error fetching posts from backend:', err)
      }
    }

    fetchPosts()
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setUploadedImageFiles(prev => [...prev, ...files])
    setUploadedImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setUploadedImageFiles(prev => prev.filter((_, i) => i !== index))
    setUploadedImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const renderPostCollage = (post: any) => {
    const imagesList = post.images || (post.image ? [post.image] : [])
    if (imagesList.length === 0) return null

    return (
      <div 
        className="relative w-full aspect-square bg-[#FAF8F5] overflow-hidden cursor-pointer group"
        onDoubleClick={() => toggleLike(post.id)}
        onClick={() => {
          setSelectedInspectPost(post)
          setActiveInspectIndex(0)
        }}
      >
        {imagesList.length === 1 && (
          <div className="relative w-full h-full">
            <Image src={imagesList[0]} alt="Bespoke jewelry design" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          </div>
        )}
        {imagesList.length === 2 && (
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            <div className="relative h-full"><Image src={imagesList[0]} alt="Bespoke design 1" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" /></div>
            <div className="relative h-full"><Image src={imagesList[1]} alt="Bespoke design 2" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" /></div>
          </div>
        )}
        {imagesList.length === 3 && (
          <div className="grid grid-cols-3 gap-1 w-full h-full">
            <div className="relative col-span-2 h-full"><Image src={imagesList[0]} alt="Bespoke design 1" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" /></div>
            <div className="flex flex-col gap-1 h-full col-span-1">
              <div className="relative flex-1"><Image src={imagesList[1]} alt="Bespoke design 2" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" /></div>
              <div className="relative flex-1"><Image src={imagesList[2]} alt="Bespoke design 3" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" /></div>
            </div>
          </div>
        )}
        {imagesList.length >= 4 && (
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            <div className="relative h-full"><Image src={imagesList[0]} alt="Bespoke design 1" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" /></div>
            <div className="relative h-full"><Image src={imagesList[1]} alt="Bespoke design 2" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" /></div>
            <div className="relative h-full"><Image src={imagesList[2]} alt="Bespoke design 3" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" /></div>
            <div className="relative h-full">
              <Image src={imagesList[3]} alt="Bespoke design 4" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              {imagesList.length > 4 && (
                <div className="absolute inset-0 bg-black/55 text-white font-extrabold flex items-center justify-center text-sm z-10">
                  +{imagesList.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/90 backdrop-blur text-[9px] font-bold tracking-widest text-[#3D0C1F] uppercase px-4 py-2.5 rounded shadow">
            Double Click to Like · Click to Inspect
          </span>
        </div>
      </div>
    )
  }

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedInspectPost, setSelectedInspectPost] = useState<any>(null)

  const [metalsDropdownOpen, setMetalsDropdownOpen] = useState(false)
  const [gemsDropdownOpen, setGemsDropdownOpen] = useState(false)

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    )
  }

  // Toggle Follow
  const toggleFollow = (artisanName: string) => {
    if (followedArtisans.includes(artisanName)) {
      setFollowedArtisans(followedArtisans.filter(name => name !== artisanName))
      showSnackbar(`Unfollowed ${artisanName}.`, 'info')
    } else {
      setFollowedArtisans([...followedArtisans, artisanName])
      showSnackbar(`You followed ${artisanName}!`, 'success')
    }
  }

  // Toggle Like
  const toggleLike = async (postId: string) => {
    try {
      // Toggle locally first for instant feedback (Optimistic Update)
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          }
        }
        return post
      }))

      // Send to backend
      const response = await api.patch(`/api/posts/${postId}/like`)
      const p = response.data
      
      // Update with server state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: p.likes?.length || 0,
            liked: p.likes?.some((like: any) => String(like._id || like) === String(user?.id || user?._id || ''))
          }
        }
        return post
      }))
    } catch (err) {
      console.error('Failed to toggle like on backend:', err)
    }
  }

  // Submit new post from float modal
  const handleModalPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    try {
      showSnackbar('Uploading sketches and publishing brief...', 'info')

      // 1. Upload each image to backend Cloudinary endpoint
      const uploadedUrls: string[] = []
      for (const file of uploadedImageFiles) {
        const formData = new FormData()
        formData.append('image', file)
        const uploadRes = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (uploadRes.data?.data?.url) {
          uploadedUrls.push(uploadRes.data.data.url)
        }
      }

      // 2. Prepare payload matching createPostDto
      const postPayload = {
        description,
        category,
        budget: budget ? Number(budget) : null,
        materials: selectedMaterials,
        images: uploadedUrls.length > 0 ? uploadedUrls : ['/recom_emerald.png']
      }

      // 3. Post to the real backend
      const response = await api.post('/api/posts', postPayload)
      const p = response.data

      // 4. Map the newly created backend post to match the client UI structure
      const newPost = {
        id: p._id,
        artisanName: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : (user?.firstName ? `${user.firstName} ${user.lastName}` : 'Connoisseur Member'),
        artisanTitle: p.userId?.role === 'seller' ? 'MASTER ARTISAN' : 'CONNOISSEUR MEMBER',
        avatar: p.userId?.avatar || user?.avatar || '/avatar_aastha.png',
        image: p.images?.[0] || '/recom_emerald.png',
        images: p.images?.length > 0 ? p.images : ['/recom_emerald.png'],
        category: p.category,
        price: p.budget ? `Rs. ${p.budget.toLocaleString()}` : (p.price || 'Contact for Quote'),
        description: p.description,
        materials: p.materials?.length > 0 ? p.materials : ['Bespoke Custom'],
        likes: p.likes?.length || 0,
        liked: false,
        comments: p.comments || [],
        time: 'Just now'
      }

      setPosts([newPost, ...posts])
      
      // Reset form states
      setDescription('')
      setCategory('Rings')
      setBudget('')
      setSelectedMaterials([])
      setUploadedImageFiles([])
      setUploadedImagePreviews([])
      setShowCreateModal(false)
      showSnackbar('Bespoke request posted successfully!', 'success')
    } catch (err: any) {
      console.error('Failed to publish brief to backend:', err)
      showSnackbar(err?.response?.data?.message || 'Failed to submit post to server. Saving locally.', 'warning')
      
      // Fallback local save if offline
      const mockPost = {
        id: `p-${Date.now()}`,
        artisanName: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Connoisseur Member',
        artisanTitle: 'CONNOISSEUR MEMBER',
        avatar: user?.avatar || '/avatar_aastha.png',
        image: uploadedImagePreviews[0] || '/recom_emerald.png',
        images: uploadedImagePreviews.length > 0 ? uploadedImagePreviews : ['/recom_emerald.png'],
        category,
        price: budget ? `Rs. ${Number(budget).toLocaleString()}` : 'Contact for Quote',
        description,
        materials: selectedMaterials.length > 0 ? selectedMaterials : ['Bespoke Custom'],
        likes: 0,
        liked: false,
        comments: [],
        time: 'Just now'
      }
      setPosts([mockPost, ...posts])
      setShowCreateModal(false)
    }
  }

  // Filter posts based on Curation selection and Material selection
  const filteredPosts = posts.filter(post => {
    if (selectedCuration === 'following') {
      if (!followedArtisans.includes(post.artisanName)) return false
    }
    if (selectedMaterial) {
      if (!post.materials.includes(selectedMaterial)) return false
    }
    return true
  })

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 md:px-12 md:py-8 grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
      
      {/* LEFT COLUMN: CURATION & MATERIALS FILTER (1/4 width) */}
      <aside className="lg:col-span-1 flex flex-col gap-8 sticky top-20">
        {/* Curation Box */}
        <div className="flex flex-col gap-4">
          <h3 
            className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Curation
          </h3>
          <ul className="flex flex-col gap-3 text-sm font-semibold text-gray-700">
            <li 
              onClick={() => setSelectedCuration('latest')}
              className={`flex items-center gap-2 cursor-pointer hover:text-[#3D0C1F] transition-colors ${
                selectedCuration === 'latest' ? 'text-[#3D0C1F] font-extrabold' : ''
              }`}
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Latest Feed
              {selectedCuration === 'latest' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D0C1F]" />
              )}
            </li>
            <li 
              onClick={() => setSelectedCuration('following')}
              className={`flex items-center gap-2 cursor-pointer hover:text-[#3D0C1F] transition-colors ${
                selectedCuration === 'following' ? 'text-[#3D0C1F] font-extrabold' : ''
              }`}
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Following Feed
              {selectedCuration === 'following' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D0C1F]" />
              )}
            </li>
          </ul>
        </div>

        {/* Materials Section */}
        <div className="flex flex-col gap-4">
          <h3 
            className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Materials
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {['Ethical Gold', 'Moonstone', 'Pavé', 'Bespoke Diamond'].map((material) => {
              const isActive = selectedMaterial === material
              return (
                <button
                  key={material}
                  onClick={() => setSelectedMaterial(isActive ? null : material)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    isActive 
                      ? 'bg-[#3D0C1F] text-white border-[#3D0C1F] shadow' 
                      : 'bg-white text-gray-600 border-gray-150 hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {material}
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* MIDDLE COLUMN: SHARE INPUT & MAIN FEED POSTS (2/4 width) */}
      <main className="lg:col-span-2 flex flex-col gap-6 relative">
        
        {/* Share / Post Box - Sticky and click triggers full modal */}
        <div 
          onClick={() => setShowCreateModal(true)}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex gap-4 items-center cursor-pointer hover:border-gray-200 transition-all sticky top-4 z-20"
        >
          <div className="w-10 h-10 rounded-full bg-[#3D0C1F] text-white font-bold flex items-center justify-center flex-shrink-0">
            {user?.firstName ? user.firstName[0].toUpperCase() : 'A'}
          </div>
          <div className="flex-1 bg-[#FAF8F5] rounded-full px-5 py-3 text-xs text-gray-400 select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Describe a custom request, set a price, and co-create a masterpiece...
          </div>
          <button 
            type="button"
            className="bg-[#3D0C1F] hover:bg-[#2A0714] text-white text-[10px] font-bold tracking-widest px-5 py-3 rounded-full uppercase cursor-pointer transition-all active:scale-95 flex-shrink-0"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Post Request
          </button>
        </div>

        {/* Feed Posts Grid */}
        <div className="flex flex-col gap-8">
          {filteredPosts.length === 0 ? (
            /* Clean Empty Feed State */
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center flex flex-col items-center justify-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] min-h-[320px]">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#3D0C1F]/40">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-855 mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Showcase Feed is Empty</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  There are no masterpieces posted yet. Be the first to share your bespoke jewelry inspiration using the input above or the "+" button below!
                </p>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isFollowing = followedArtisans.includes(post.artisanName)
              return (
                <article 
                  key={post.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]"
                >
                  {/* Post Header */}
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-100 bg-[#FAF8F5] flex-shrink-0">
                        <Image 
                          src={post.avatar} 
                          alt={post.artisanName} 
                          fill 
                          className="object-cover object-center"
                        />
                      </div>
                      <div>
                        <h4 
                          className="text-xs font-bold text-gray-800 tracking-wide"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        >
                          {post.artisanName}
                        </h4>
                        <p 
                          className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase mt-0.5"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        >
                          {post.artisanTitle}
                        </p>
                      </div>
                    </div>

                    {/* Follow Button */}
                    <button 
                      onClick={() => toggleFollow(post.artisanName)}
                      className={`text-[9px] font-bold tracking-widest px-4 py-2 rounded-full uppercase transition-all duration-300 cursor-pointer border ${
                        isFollowing 
                          ? 'bg-[#3D0C1F] text-white border-[#3D0C1F]' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  {/* Post Image Collage */}
                  {renderPostCollage(post)}

                  {/* Post Actions & Comments */}
                  <div className="p-5 flex flex-col gap-4">
                    
                    {/* Category & Budget Indicator */}
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-[#3D0C1F] uppercase mb-1">
                      <span>{post.category || 'Bespoke Request'}</span>
                      <span className="bg-[#FAF8F5] px-2.5 py-1 rounded border border-gray-150 text-gray-600 font-extrabold text-[9px] tracking-normal normal-case">
                        Est. Budget: {post.price || 'Contact'}
                      </span>
                    </div>

                    {/* Post Description */}
                    <p className="text-xs text-gray-600 leading-relaxed font-normal mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
                      {post.description}
                    </p>

                    <div className="flex items-center gap-6 border-b border-gray-50 pb-4">
                      <button 
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                          post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        <svg 
                          width="18" height="18" viewBox="0 0 24 24" 
                          fill={post.liked ? 'currentColor' : 'none'} 
                          stroke="currentColor" strokeWidth="2.2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                        <span>{post.likes}</span>
                      </button>
                    </div>

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
                  </div>
                </article>
              )
            })
          )}
        </div>

        {/* FLOATING ACTION PLUS BUTTON */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 right-8 lg:bottom-10 lg:right-[32%] w-14 h-14 bg-[#3D0C1F] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-white active:scale-95 hover:bg-[#2A0714] z-30 group"
          title="Share a Masterpiece"
        >
          <svg 
            className="transform group-hover:rotate-90 transition-transform duration-300"
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

      </main>

      {/* RIGHT COLUMN: SUGGESTED SELLERS (1/4 width) */}
      <aside className="lg:col-span-1 flex flex-col gap-6 sticky top-20">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
          <h3 
            className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-5"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Suggested Sellers
          </h3>

          {suggestedSellers.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-3 bg-[#FAF8F5]/50 border border-dashed border-gray-100 rounded-xl">
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">No Suggested Sellers Available</span>
              <p className="text-[9px] text-gray-400 px-4 leading-normal">
                All master gold and silversmiths are currently busy crafting bespoke pieces at their workbenches.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {suggestedSellers.map((seller) => (
                <div 
                  key={seller.id} 
                  onClick={() => openChatWith(seller.name)}
                  className="flex items-center gap-3.5 group cursor-pointer p-1.5 rounded-xl hover:bg-[#FAF8F5] transition-all"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm">
                    <Image src={seller.image} alt={seller.name} fill className="object-cover object-center" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{seller.name}</h4>
                    <p className="text-[9px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">{seller.piecesCount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={() => { setSelectedCuration('latest'); setSelectedMaterial(null) }}
            className="w-full text-center text-[10px] font-extrabold tracking-widest text-[#3D0C1F] hover:text-[#8A2B49] transition-colors uppercase pt-5 mt-4 border-t border-gray-50 cursor-pointer block"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Explore All
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 4. POST CREATION OVERLAY MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 animate-scale-up flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#3D0C1F] text-white p-6 relative flex-shrink-0">
              <h3 className="text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>Create Bespoke Request</h3>
              <p className="text-[10px] text-[#E9D7C3] font-semibold uppercase tracking-widest mt-1">Publish a design brief for master artisans</p>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 text-white/70 hover:text-white cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Form - 2 Columns Side-by-Side (No scrolling container) */}
            <form onSubmit={handleModalPost} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
              
              {/* Left Column: Description & Sketch */}
              <div className="flex flex-col gap-5">
                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Description / Design Details</label>
                  <textarea 
                    placeholder="Describe your design vision, stone preferences, metal finishing, and story..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl p-4 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-[#3D0C1F]/20"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                    required
                  />
                </div>                {/* Design Image Source Option */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Design Sketch or Illustration</label>
                  
                  {uploadedImagePreviews.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {/* Facebook-style collage display with inline delete buttons & zoom triggers */}
                      <div className="relative w-full h-[180px] rounded-2xl overflow-hidden border border-gray-200 bg-[#FAF8F5]">
                        {uploadedImagePreviews.length === 1 && (
                          <div 
                            onClick={() => setPreviewZoomImage(uploadedImagePreviews[0])}
                            className="relative w-full h-full group animate-fade-in cursor-pointer hover:opacity-95 transition-opacity"
                          >
                            <Image src={uploadedImagePreviews[0]} alt="Sketch" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(0);
                              }}
                              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 cursor-pointer shadow-md z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                              title="Remove image"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {uploadedImagePreviews.length === 2 && (
                          <div className="grid grid-cols-2 gap-1 w-full h-full animate-fade-in">
                            <div 
                              onClick={() => setPreviewZoomImage(uploadedImagePreviews[0])}
                              className="relative h-full group cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              <Image src={uploadedImagePreviews[0]} alt="Sketch 1" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(0);
                                }}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                                title="Remove image"
                              >
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                            <div 
                              onClick={() => setPreviewZoomImage(uploadedImagePreviews[1])}
                              className="relative h-full group cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              <Image src={uploadedImagePreviews[1]} alt="Sketch 2" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(1);
                                }}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                                title="Remove image"
                              >
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {uploadedImagePreviews.length === 3 && (
                          <div className="grid grid-cols-3 gap-1 w-full h-full animate-fade-in">
                            <div 
                              onClick={() => setPreviewZoomImage(uploadedImagePreviews[0])}
                              className="relative col-span-2 h-full group cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              <Image src={uploadedImagePreviews[0]} alt="Sketch 1" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(0);
                                }}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                                title="Remove image"
                              >
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex flex-col gap-1 h-full col-span-1">
                              <div 
                                onClick={() => setPreviewZoomImage(uploadedImagePreviews[1])}
                                className="relative flex-1 group cursor-pointer hover:opacity-95 transition-opacity"
                              >
                                <Image src={uploadedImagePreviews[1]} alt="Sketch 2" fill className="object-cover" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(1);
                                  }}
                                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                                  title="Remove image"
                                >
                                  <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                              <div 
                                onClick={() => setPreviewZoomImage(uploadedImagePreviews[2])}
                                className="relative flex-1 group cursor-pointer hover:opacity-95 transition-opacity"
                              >
                                <Image src={uploadedImagePreviews[2]} alt="Sketch 3" fill className="object-cover" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(2);
                                  }}
                                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                                  title="Remove image"
                                >
                                  <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {uploadedImagePreviews.length >= 4 && (
                          <div className="grid grid-cols-2 gap-1 w-full h-full animate-fade-in">
                            {[0, 1, 2, 3].map((idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setPreviewZoomImage(uploadedImagePreviews[idx])}
                                className="relative h-full group cursor-pointer hover:opacity-95 transition-opacity"
                              >
                                <Image src={uploadedImagePreviews[idx]} alt={`Sketch ${idx + 1}`} fill className="object-cover" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(idx);
                                  }}
                                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                                  title="Remove image"
                                >
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                                {idx === 3 && uploadedImagePreviews.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 text-white font-extrabold flex items-center justify-center text-xs z-10 select-none">
                                    +{uploadedImagePreviews.length - 3}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Thumbnails row to delete/add individual ones */}
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {uploadedImagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            <Image src={preview} alt="Thumb" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-1 -right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black cursor-pointer shadow z-10"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        {/* Add more photo card */}
                        <label className="w-12 h-12 rounded-lg border border-dashed border-gray-300 hover:border-[#3D0C1F] flex items-center justify-center cursor-pointer flex-shrink-0 bg-gray-50/50">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full flex items-center justify-center border-2 border-dashed border-gray-250 hover:border-[#3D0C1F] rounded-2xl p-6 cursor-pointer transition-all bg-[#FAF8F5]/30 h-[160px] text-center flex-col gap-2 group">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 group-hover:text-[#3D0C1F] transition-colors">
                        <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5A2.25 2.25 0 006.75 19.5z" />
                      </svg>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 tracking-widest uppercase transition-colors" style={{ fontFamily: 'var(--font-montserrat)' }}>Upload Design Sketches</span>
                      <span className="text-[9px] text-gray-400" style={{ fontFamily: 'var(--font-montserrat)' }}>Select multiple images (PNG, JPG, WEBP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Right Column: Category, Budget, Materials */}
              <div className="flex flex-col gap-5">
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Category</label>
                  <div className="flex flex-wrap gap-2">
                    {['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Complete Set', 'Others'].map((cat) => {
                      const isSelected = category === cat
                      return (
                        <div
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className="rounded-full border px-3 py-1.5 flex items-center justify-center cursor-pointer transition-all hover:bg-[#FAF8F5] text-center text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            fontFamily: 'var(--font-montserrat)',
                            backgroundColor: isSelected ? '#3D0C1F' : 'white',
                            borderColor: isSelected ? '#3D0C1F' : '#E5E7EB',
                            color: isSelected ? 'white' : '#4B5563',
                          }}
                        >
                          {cat}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Target Budget (Rs)</label>
                  <div className="relative">
                    <span className="absolute left-4 inset-y-0 flex items-center text-xs text-gray-400 font-bold">Rs.</span>
                    <input
                      type="number"
                      placeholder="Enter estimated budget in Nepalese Rupees (e.g. 50000)"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-gray-200"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>
                </div>                {/* Materials & Gemstones Selection & Custom Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Materials & Gemstones</label>
                  
                  {/* Metals Dropdown */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        setMetalsDropdownOpen(!metalsDropdownOpen)
                        setGemsDropdownOpen(false)
                      }}
                      className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl px-4 py-3 text-xs text-gray-700 flex justify-between items-center cursor-pointer select-none"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      <span className="truncate">
                        {selectedMaterials.filter(m => METALS.includes(m)).length > 0
                          ? selectedMaterials.filter(m => METALS.includes(m)).join(', ')
                          : 'Select Metals / Base Materials'}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 3.5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {metalsDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-[160px] overflow-y-auto p-2.5 flex flex-col gap-1 text-xs">
                        {METALS.map((metal) => {
                          const isChecked = selectedMaterials.includes(metal)
                          return (
                            <label key={metal} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF8F5] rounded-xl cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMaterial(metal)}
                                className="accent-[#3D0C1F] cursor-pointer"
                              />
                              <span className="text-gray-700 font-semibold">{metal}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Gemstones Dropdown */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        setGemsDropdownOpen(!gemsDropdownOpen)
                        setMetalsDropdownOpen(false)
                      }}
                      className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl px-4 py-3 text-xs text-gray-707 flex justify-between items-center cursor-pointer select-none"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      <span className="truncate">
                        {selectedMaterials.filter(m => GEMSTONES.includes(m)).length > 0
                          ? selectedMaterials.filter(m => GEMSTONES.includes(m)).join(', ')
                          : 'Select Gemstones'}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 3.5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {gemsDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-[160px] overflow-y-auto p-2.5 flex flex-col gap-1 text-xs">
                        {GEMSTONES.map((gem) => {
                          const isChecked = selectedMaterials.includes(gem)
                          return (
                            <label key={gem} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF8F5] rounded-xl cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMaterial(gem)}
                                className="accent-[#3D0C1F] cursor-pointer"
                              />
                              <span className="text-gray-700 font-semibold">{gem}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>

              {/* Bottom Actions - Spanning both columns */}
              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-4 mt-2 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-500 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-50 transition-all cursor-pointer"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#3D0C1F] hover:bg-[#2A0714] text-white text-[10px] font-bold tracking-widest px-5 py-2.5 rounded-full uppercase cursor-pointer transition-all shadow"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Publish Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. POST INSPECTION / DETAIL ZOOM MODAL */}
      {/* ========================================================================= */}
      {selectedInspectPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row max-h-[85vh] animate-scale-up">
            
            <div className="w-full md:w-3/5 relative aspect-square md:aspect-auto md:h-auto bg-black flex items-center justify-center overflow-hidden">
              <Image 
                src={(selectedInspectPost.images && selectedInspectPost.images[activeInspectIndex]) || selectedInspectPost.image} 
                alt="Bespoke Jewelry Piece" 
                fill 
                className="object-contain" 
              />
              
              {/* Image Carousel Selection Row */}
              {selectedInspectPost.images && selectedInspectPost.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl overflow-x-auto max-w-[90%] z-10">
                  {selectedInspectPost.images.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setActiveInspectIndex(idx)}
                      className={`relative w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${
                        activeInspectIndex === idx ? 'border-white scale-95 shadow' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
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

            <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between bg-white max-h-[50vh] md:max-h-none overflow-y-auto">
              <div>
                <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-100 bg-[#FAF8F5]">
                      <Image src={selectedInspectPost.avatar} alt="Artisan" fill className="object-cover object-center" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-855" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedInspectPost.artisanName}</h4>
                      <p className="text-[9px] font-semibold text-[#3D0C1F] uppercase mt-0.5">{selectedInspectPost.artisanTitle}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedInspectPost(null)} className="text-gray-405 hover:text-gray-650 cursor-pointer hidden md:block">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-bold text-amber-600 tracking-widest uppercase" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {selectedInspectPost.category || 'Bespoke Brief'}
                  </span>
                  <span className="text-[10px] font-extrabold text-[#3D0C1F] bg-[#FAF8F5] border border-gray-150 px-2.5 py-1 rounded uppercase">
                    Est. Budget: {selectedInspectPost.price || 'Contact'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Bespoke Request Blueprint</h3>
                <p className="text-xs text-gray-505 leading-relaxed font-normal mb-6" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {selectedInspectPost.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedInspectPost.materials.map((m: string) => (
                    <span 
                      key={m}
                      className="text-[9px] font-bold tracking-widest text-[#3D0C1F] bg-[#FAF8F5] border border-gray-100 px-2.5 py-1 rounded uppercase"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-auto">
                <button 
                  onClick={() => {
                    setSelectedInspectPost(null)
                    openChatWith(selectedInspectPost.artisanName)
                  }}
                  className="w-full bg-[#3D0C1F] hover:bg-[#2A0714] text-white text-[10px] font-bold tracking-widest py-3.5 rounded uppercase cursor-pointer transition-all text-center shadow"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Inquire Custom Commission
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. SKETCH UPLOAD LIGHTBOX PREVIEW */}
      {previewZoomImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
          <button 
            onClick={() => setPreviewZoomImage(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 cursor-pointer bg-black/40 p-3 rounded-full border-none transition-all active:scale-95 z-20"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full aspect-square md:aspect-auto md:h-[80vh] flex items-center justify-center">
            <Image src={previewZoomImage} alt="Zoom Preview" fill className="object-contain" />
          </div>
        </div>
      )}

    </div>
  )
}
