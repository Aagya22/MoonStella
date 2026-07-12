import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSnackbar } from '@/context/SnackbarContext'
import api from '@/lib/api/axios'
import InspectPostModal from '@/app/components/buyer/feed/InspectPostModal'

interface SearchPageContentProps {
  user: any
  setUser: (user: any) => void
  wishlist: string[]
  setWishlist: (wishlist: string[]) => void
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
  followedPeople: string[]
  toggleFollow: (id: string) => void
  role: 'buyer' | 'seller'
}

export default function SearchPageContent({
  user,
  setUser,
  wishlist,
  setWishlist,
  openChatWith,
  followedPeople,
  toggleFollow,
  role,
}: SearchPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showSnackbar } = useSnackbar()

  const [posts, setPosts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedGemstones, setSelectedGemstones] = useState<string[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  // Dynamic filter catalogs derived from database posts
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([])
  const [dynamicGemstones, setDynamicGemstones] = useState<string[]>([])
  const [dynamicMaterials, setDynamicMaterials] = useState<string[]>([])

  // Modal inspection states
  const [selectedInspectPost, setSelectedInspectPost] = useState<any>(null)

  // Load URL query search parameter
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearchQuery(q)
  }, [searchParams])

  // Reset pagination on filter or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategories, selectedGemstones, selectedMaterial, minPrice, maxPrice, sortBy])

  // Load all posts & compile categories, gemstones, and materials dynamically
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
          price: p.budget ? `$${p.budget.toLocaleString()}` : p.price || 'Contact for Quote',
          rawPrice: p.budget || 0,
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


        const relevantRawPosts = response.data.filter((p: any) => {
          const isSellerPost = p.userId?.role === 'seller'
          if (role === 'buyer') return isSellerPost
          if (role === 'seller') return !isSellerPost
          return true
        })

        // 1. Compile Unique Categories used in posts
        const uniqueCategories = Array.from(
          new Set(relevantRawPosts.map((p: any) => p.category).filter(Boolean))
        ) as string[]
        setDynamicCategories(uniqueCategories)

        // 2. Compile Unique Gemstones used in posts
        const gemstoneKeywords = ['Diamond', 'Sapphire', 'Emerald', 'Ruby', 'Pearl', 'Opal', 'Ruby', 'Topaz', 'Jade']
        const uniqueGemstones = Array.from(
          new Set(
            relevantRawPosts
              .flatMap((p: any) => p.materials || [])
              .map((m: string) => gemstoneKeywords.find(k => m.toLowerCase().includes(k.toLowerCase())))
              .filter(Boolean)
          )
        ) as string[]
        setDynamicGemstones(uniqueGemstones)

        // 3. Compile Unique Materials used in posts
        const materialKeywords = ['Rose Gold', 'Yellow Gold', 'Platinum', 'White Gold', 'Silver']
        const uniqueMaterials = Array.from(
          new Set(
            relevantRawPosts
              .flatMap((p: any) => p.materials || [])
              .map((m: string) => materialKeywords.find(k => m.toLowerCase().includes(k.toLowerCase())))
              .filter(Boolean)
          )
        ) as string[]
        setDynamicMaterials(uniqueMaterials)

      } catch (err) {
        console.error('Failed to load posts in search:', err)
      }
    }
    fetchPosts()
  }, [user])

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategories([])
    setSelectedGemstones([])
    setSelectedMaterial(null)
    setMinPrice('')
    setMaxPrice('')
    setSearchQuery('')
    router.replace(`/${role}/search`)
  }

  // Handle post updating from within inspect modal
  const handleUpdatePost = async (postId: string, newDesc: string, newBudget: string) => {
    try {
      const budgetNum = newBudget ? Number(newBudget) : null
      await api.patch(`/api/posts/${postId}`, {
        description: newDesc,
        budget: budgetNum,
        price: budgetNum ? `$${budgetNum.toLocaleString()}` : 'Contact for Quote',
      })

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              description: newDesc,
              budget: budgetNum,
              price: budgetNum ? `$${budgetNum.toLocaleString()}` : 'Contact for Quote',
            }
          }
          return p
        })
      )

      setSelectedInspectPost((prev: any) => ({
        ...prev,
        description: newDesc,
        price: budgetNum ? `$${budgetNum.toLocaleString()}` : 'Contact for Quote',
      }))
      showSnackbar('Changes saved successfully!', 'success')
    } catch (err) {
      console.error(err)
      showSnackbar('Failed to update request.', 'error')
    }
  }

  // Handle delete post from within inspect modal
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this request?')) return
    try {
      await api.delete(`/api/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setSelectedInspectPost(null)
      showSnackbar('Bespoke request deleted.', 'info')
    } catch (err) {
      console.error(err)
      showSnackbar('Failed to delete post.', 'error')
    }
  }

  // Parse title dynamically from description
  const getDerivedTitle = (post: any) => {
    const desc = post.description || ''
    const cleanDesc = desc.replace(/[#*]/g, '').trim()
    const sentences = cleanDesc.split(/[.!?]/)
    const firstSentence = sentences[0] || ''
    if (firstSentence && firstSentence.split(' ').length <= 6) {
      return firstSentence
    }
    const words = cleanDesc.split(' ').slice(0, 4).join(' ')
    return words ? words + '...' : post.category || 'Bespoke Request'
  }

  // Filter application
  const filteredPosts = posts.filter((post) => {
    // Cross-role filtering: Buyers only search Sellers, Sellers only search Buyers
    const isSellerPost = post.artisanTitle === 'MASTER ARTISAN'
    if (role === 'buyer' && !isSellerPost) return false
    if (role === 'seller' && isSellerPost) return false

    // Text search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesDesc = post.description?.toLowerCase().includes(q)
      const matchesCategory = post.category?.toLowerCase().includes(q)
      const matchesArtisan = post.artisanName?.toLowerCase().includes(q)
      const matchesMaterial = post.materials?.some((m: string) => m.toLowerCase().includes(q))
      if (!matchesDesc && !matchesCategory && !matchesArtisan && !matchesMaterial) {
        return false
      }
    }

    // Categories filter
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(post.category)) {
        return false
      }
    }

    // Gemstones filter
    if (selectedGemstones.length > 0) {
      const matchesAnyGemstone = post.materials?.some((m: string) =>
        selectedGemstones.some((g) => m.toLowerCase().includes(g.toLowerCase()))
      )
      if (!matchesAnyGemstone) return false
    }

    // Price filters
    if (minPrice !== '') {
      if (post.rawPrice < Number(minPrice)) return false
    }
    if (maxPrice !== '') {
      if (post.rawPrice > Number(maxPrice)) return false
    }

    // Material tags filter
    if (selectedMaterial) {
      const matchesMaterial = post.materials?.some((m: string) =>
        m.toLowerCase().includes(selectedMaterial.toLowerCase())
      )
      if (!matchesMaterial) return false
    }

    return true
  })

  // Sort application
  if (sortBy === 'newest') {
    filteredPosts.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
  } else if (sortBy === 'price-asc') {
    filteredPosts.sort((a, b) => a.rawPrice - b.rawPrice)
  } else if (sortBy === 'price-desc') {
    filteredPosts.sort((a, b) => b.rawPrice - a.rawPrice)
  } else if (sortBy === 'likes') {
    filteredPosts.sort((a, b) => b.likes - a.likes)
  }

  // Paginate filtered results
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="flex-1 w-full ml-0 mr-auto xl:pl-4 pl-8 pr-12 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 select-none max-w-[1440px]">

      {/* Refine By Sidebar Panel */}
      <aside className="w-full flex flex-col">
        <div className="bg-white border border-[#5F3041]/10 p-6 rounded-3xl sticky top-20 flex flex-col gap-7 shadow-[0_4px_20px_rgba(61,12,31,0.01)]">

          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3
              className="text-lg font-bold text-gray-805 font-serif leading-none"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Refine By
            </h3>
            <button
              onClick={handleClearAll}
              className="text-[9px] font-extrabold tracking-widest text-[#5F3041] hover:underline uppercase border-none bg-transparent cursor-pointer"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Clear All
            </button>
          </div>

          {/* Category checklist */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase font-sans">
              Category
            </h4>
            <div className="flex flex-col gap-3">
              {dynamicCategories.length === 0 ? (
                <span className="text-[10px] text-gray-405 italic">No categories posted yet</span>
              ) : (
                dynamicCategories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat)
                  return (
                    <label key={cat} className="flex items-center gap-3 text-xs text-gray-600 font-semibold cursor-pointer select-none font-sans">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedCategories(prev => prev.filter(c => c !== cat))
                          } else {
                            setSelectedCategories(prev => [...prev, cat])
                          }
                        }}
                        className="w-4 h-4 border border-[#5F3041]/20 rounded text-[#5F3041] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#5F3041] flex-shrink-0"
                      />
                      <span>{cat}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>

          {/* Gemstone Type Checklist */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase font-sans">
              Gemstone Type
            </h4>
            <div className="flex flex-col gap-3">
              {dynamicGemstones.length === 0 ? (
                <span className="text-[10px] text-gray-450 italic">No gemstones found in posts</span>
              ) : (
                dynamicGemstones.map((gem) => {
                  const isChecked = selectedGemstones.includes(gem)
                  return (
                    <label key={gem} className="flex items-center gap-3 text-xs text-gray-600 font-semibold cursor-pointer select-none font-sans">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedGemstones(prev => prev.filter(g => g !== gem))
                          } else {
                            setSelectedGemstones(prev => [...prev, gem])
                          }
                        }}
                        className="w-4 h-4 border border-[#5F3041]/20 rounded text-[#5F3041] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#5F3041] flex-shrink-0"
                      />
                      <span>{gem}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase font-sans">
              Price Range
            </h4>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min (Rs.)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans"
              />
              <span className="text-gray-455 text-xs flex-shrink-0">—</span>
              <input
                type="number"
                placeholder="Max (Rs.)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-455 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans"
              />
            </div>
          </div>

          {/* Materials Quick Buttons */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[9px] font-extrabold tracking-widest text-gray-400 uppercase font-sans">
              Material
            </h4>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {dynamicMaterials.length === 0 ? (
                <span className="text-[10px] text-gray-450 italic">No materials found in posts</span>
              ) : (
                dynamicMaterials.map((mat) => {
                  const isActive = selectedMaterial === mat
                  return (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(isActive ? null : mat)}
                      className={`text-[8px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase border transition-all duration-300 cursor-pointer flex-shrink-0 ${isActive
                          ? 'bg-[#5F3041] text-white border-[#5F3041]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {mat}
                    </button>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* Main Results Grid Container */}
      <main className="w-full flex flex-col gap-6">

        {/* Top toolbar */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-4">
          <span
            className="text-xs text-gray-400 font-medium tracking-wide font-sans"
          >
            Showing {filteredPosts.length} curated result{filteredPosts.length !== 1 ? 's' : ''}
          </span>

          {/* Sort selection */}
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-750 font-sans uppercase">
            <span className="text-gray-405 font-medium tracking-wider text-[9px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-[#5F3041] text-[10px] font-extrabold tracking-wider uppercase focus:outline-none cursor-pointer p-1"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Dynamic Gallery Stream */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-[#5F3041]/10 p-20 text-center flex flex-col items-center justify-center gap-4 min-h-[360px]">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#5F3041]/40 shadow-inner">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-805 font-sans">No matching creations found</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-normal font-sans">
                Adjust your filters or type search tags to discover alternative jewelry commissions.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {paginatedPosts.map((post) => {
                const derivedTitle = getDerivedTitle(post)
                const derivedPlaque = post.materials ? post.materials.map((m: string) => m.toUpperCase()).join(' & ') : 'BESPOKE PIECE'
                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedInspectPost(post)}
                    className="bg-white border border-[#5F3041]/10 rounded-none overflow-hidden flex flex-col shadow-none cursor-pointer group hover:border-[#5F3041]/30 transition-all duration-300 animate-scale-up"
                  >
                    {/* Photo area */}
                    {post.image ? (
                      <div className="relative w-full aspect-[4/5] bg-[#FAF8F5] overflow-hidden border-b border-[#5F3041]/10">
                        <Image
                          src={post.image}
                          alt={derivedTitle}
                          fill
                          className="object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/5] bg-[#FAF8F5] flex items-center justify-center text-[#5F3041]/30 border-b border-[#5F3041]/10">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}

                    {/* Captions beneath the image (museum-label style) */}
                    <div className="p-5 flex flex-col items-center text-center gap-2 bg-white">
                      <h4
                        className="text-sm font-bold text-gray-800 tracking-wide font-serif leading-snug group-hover:text-[#5F3041] transition-colors"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {derivedTitle}
                      </h4>
                      <div
                        className="text-[7.5px] font-extrabold text-gray-400 tracking-widest uppercase truncate max-w-full px-2"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        {derivedPlaque}
                      </div>
                      <div
                        className="text-xs font-bold text-[#5F3041] font-serif pt-1"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {post.price}
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

            {/* Premium Christie's Style Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 pt-6 border-t border-gray-100 select-none">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-full border border-[#5F3041]/10 flex items-center justify-center text-gray-500 hover:text-[#5F3041] hover:border-[#5F3041]/30 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer bg-white"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <div className="flex items-center gap-1.5 font-sans">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    const isActive = pageNum === currentPage
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-full text-xs font-bold transition-all border cursor-pointer ${isActive
                            ? 'bg-[#5F3041] text-white border-[#5F3041] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-150 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-full border border-[#5F3041]/10 flex items-center justify-center text-gray-500 hover:text-[#5F3041] hover:border-[#5F3041]/30 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer bg-white"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Inspect Modal */}
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

    </div>
  )
}
