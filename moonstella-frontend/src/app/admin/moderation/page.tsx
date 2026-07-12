'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import api from '@/lib/api/axios'
import { 
  ShoppingBag, 
  Trash2, 
  Tag, 
  AlertTriangle, 
  ExternalLink 
} from 'lucide-react'
import Pagination from '@/app/components/Pagination'

export default function AdminModerationPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/admin/posts?page=${page}&limit=9`)
      const data = res.data?.data || res.data
      setPosts(data?.docs || [])
      setTotalPages(data?.totalPages || 1)
      setTotalDocs(data?.totalDocs || 0)
    } catch (e) {
      console.error('Failed to load posts for moderation:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [page])

  const handleDeletePost = async (id: string, category: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete this listing post under "${category}"?`)) return
    try {
      await api.delete(`/api/admin/posts/${id}`)
      alert('Listing deleted successfully! Notification sent to the seller.')
      fetchPosts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete listing')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs text-[#5F3041]/75 font-sans uppercase tracking-widest">
        Loading Product Catalog...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 text-left select-none font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
          Listing Moderation
        </h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          Moderate active designs, flag violations, and delete inappropriate content
        </p>
      </div>

      {/* Grid List */}
      <div className="bg-white border border-[#5F3041]/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_15px_45px_rgba(61,12,31,0.02)] min-h-[400px]">
        <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase font-sans border-b border-gray-100 pb-3.5 flex justify-between items-center">
          <span>Active Post Listings ({totalDocs})</span>
        </h3>

        {posts.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#5F3041]/5 flex items-center justify-center text-gray-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
              No active listings posted on the platform.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {posts.map((p) => (
              <div 
                key={p._id}
                className="border border-[#5F3041]/10 rounded-[2rem] overflow-hidden bg-white shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col h-full"
              >
                {/* Post image */}
                <div className="relative w-full aspect-[4/3] bg-[#FAF8F5] border-b border-[#5F3041]/5">
                  {p.images && p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.category}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-[8px] font-extrabold text-[#5F3041] border border-[#5F3041]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                  <div className="flex flex-col gap-2">
                    {/* Seller attribution */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#5F3041]/10 flex items-center justify-center text-[9px] font-bold text-[#5F3041] uppercase">
                        {p.userId?.firstName?.[0] || 'A'}
                      </div>
                      <span className="text-[9px] font-bold text-gray-450 uppercase tracking-wider">
                        {p.userId?.firstName} {p.userId?.lastName} ({p.userId?.role})
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mt-1">
                      {p.description}
                    </p>
                  </div>

                  {/* Budget & Actions footer */}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-1">
                    <span className="text-xs font-bold text-[#5F3041] font-serif">
                      Rs. {p.budget || p.price || 'Bespoke'}
                    </span>

                    {/* Delete moderate action */}
                    <button
                      onClick={() => handleDeletePost(p._id, p.category)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 hover:border-rose-300 p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                      title="Delete / Moderated Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

    </div>
  )
}
