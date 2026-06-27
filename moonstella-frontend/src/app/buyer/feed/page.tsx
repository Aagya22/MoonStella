'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useBuyerContext } from '../BuyerContext'
import { useSnackbar } from '@/context/SnackbarContext'

export default function BuyerFeedPage() {
  const { user, wishlist, setWishlist, openChatWith, setTimelineOpen } = useBuyerContext()
  const { showSnackbar } = useSnackbar()
  
  // Feed Filters & Interaction States
  const [selectedCuration, setSelectedCuration] = useState('latest') // 'latest', 'following'
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [followedArtisans, setFollowedArtisans] = useState<string[]>([]) 
  const [posts, setPosts] = useState<any[]>([]) // Empty posts (no dummy data)
  const [suggestedSellers, setSuggestedSellers] = useState<any[]>([]) // Empty suggested sellers (no dummy data)

  // Share / Post inputs
  const [shareText, setShareText] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createPostText, setCreatePostText] = useState('')
  const [selectedMockImage, setSelectedMockImage] = useState('/recom_earrings.png')

  // Post detail modal for fullscreen inspection
  const [selectedInspectPost, setSelectedInspectPost] = useState<any>(null)

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
  const toggleLike = (postId: string) => {
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
  }

  // Submit new post from top bar
  const handleQuickPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareText.trim()) return
    
    const newPost = {
      id: `p-${Date.now()}`,
      artisanName: `${user.firstName} ${user.lastName}`,
      artisanTitle: 'CONNOISSEUR MEMBER',
      avatar: '/avatar_aastha.png',
      image: '/recom_earrings.png', // Fallback display image
      materials: selectedMaterial ? [selectedMaterial] : ['Ethical Gold'],
      likes: 0,
      liked: false,
      comments: [],
      time: 'Just now'
    }

    setPosts([newPost, ...posts])
    setShareText('')
    showSnackbar('Bespoke request posted successfully!', 'success')
  }

  // Submit new post from float modal
  const handleModalPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createPostText.trim()) return

    const newPost = {
      id: `p-${Date.now()}`,
      artisanName: `${user.firstName} ${user.lastName}`,
      artisanTitle: 'CONNOISSEUR MEMBER',
      avatar: '/avatar_aastha.png',
      image: selectedMockImage,
      materials: selectedMaterial ? [selectedMaterial] : ['Ethical Gold'],
      likes: 0,
      liked: false,
      comments: [],
      time: 'Just now'
    }

    setPosts([newPost, ...posts])
    setCreatePostText('')
    setShowCreateModal(false)
    showSnackbar('Bespoke request posted successfully!', 'success')
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
        
        {/* Share / Post Box */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-[#3D0C1F] text-white font-bold flex items-center justify-center flex-shrink-0">
            A
          </div>
          <form onSubmit={handleQuickPost} className="flex-1 flex gap-3">
            <input 
              type="text" 
              placeholder="Share a masterpiece..."
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              className="flex-1 bg-[#FAF8F5] border border-transparent rounded-full px-5 py-3 text-xs text-gray-705 focus:outline-none focus:bg-white focus:border-gray-200 transition-all duration-300"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            />
            <button 
              type="submit"
              className="bg-[#3D0C1F] hover:bg-[#2A0714] text-white text-[10px] font-bold tracking-widest px-5 py-3 rounded-full uppercase cursor-pointer transition-all active:scale-95 flex-shrink-0"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Post
            </button>
          </form>
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

                  {/* Post Image */}
                  <div 
                    className="relative w-full aspect-square bg-[#FAF8F5] overflow-hidden cursor-pointer group"
                    onDoubleClick={() => toggleLike(post.id)}
                    onClick={() => setSelectedInspectPost(post)}
                  >
                    <Image 
                      src={post.image} 
                      alt="Masterpiece Creation" 
                      fill
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-white/90 backdrop-blur text-[9px] font-bold tracking-widest text-[#3D0C1F] uppercase px-4 py-2.5 rounded shadow">
                        Double Click to Like · Click to Inspect
                      </span>
                    </div>
                  </div>

                  {/* Post Actions & Comments */}
                  <div className="p-5 flex flex-col gap-4">
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
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="bg-[#3D0C1F] text-white p-6 relative">
              <h3 className="text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>Share a Masterpiece</h3>
              <p className="text-[10px] text-[#E9D7C3] font-semibold uppercase tracking-widest mt-1">Publish to the MoonStella Showcase</p>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 text-white/70 hover:text-white cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleModalPost} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Post Content</label>
                <textarea 
                  placeholder="Describe your bespoke jewelry piece or gemstone inspiration..."
                  value={createPostText}
                  onChange={(e) => setCreatePostText(e.target.value)}
                  rows={3}
                  className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl p-4 text-xs text-gray-700 focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-[#3D0C1F]/20"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Select Design Illustration</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { path: '/recom_earrings.png', label: 'Earrings' },
                    { path: '/recom_emerald.png', label: 'Emerald Ring' },
                    { path: '/wish_choker.png', label: 'Choker' }
                  ].map((img) => (
                    <div 
                      key={img.path}
                      onClick={() => setSelectedMockImage(img.path)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedMockImage === img.path ? 'border-[#3D0C1F] scale-95 shadow' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.path} alt={img.label} fill className="object-cover object-center" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-4 mt-2">
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
                  Share Masterpiece
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
              <Image src={selectedInspectPost.image} alt="Bespoke Jewelry Piece" fill className="object-contain" />
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

                <span className="text-[9px] font-bold text-amber-600 tracking-widest uppercase block mb-1.5" style={{ fontFamily: 'var(--font-montserrat)' }}>Showcase Masterpiece</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Custom Design Blueprint</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-normal mb-6" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  A bespoke illustration utilizing certified natural gemstones, custom drawn for our selective jewelry patrons.
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

    </div>
  )
}
