'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/axios'
import { useBuyerContext } from '../BuyerContext'
import OrderMilestoneSteps from '@/app/components/shared/OrderMilestoneSteps'
import {
  Package, Heart, Bell, MessageCircle, ArrowRight, Sparkles, Users, Gem, Clock
} from 'lucide-react'

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200/50',
    accepted: 'bg-sky-50 text-sky-800 border-sky-200/50',
    crafting: 'bg-[#FAF0F3] text-[#5F3041] border-[#5F3041]/15',
    shipped: 'bg-violet-50 text-violet-800 border-violet-200/50',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
    cancelled: 'bg-rose-50 text-rose-800 border-rose-200/50',
  }
  return (
    <span className={`text-[8px] font-bold tracking-wider uppercase border px-2 py-0.5 rounded-full font-sans select-none shrink-0 ${map[status] || map.pending}`}>
      {status}
    </span>
  )
}

const relTime = (dateStr: string) => {
  if (!dateStr) return ''
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}

export default function BuyerDashboardPage() {
  const router = useRouter()
  const { user, wishlist, unreadNotificationsCount } = useBuyerContext()

  const [orders, setOrders] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [threads, setThreads] = useState<any[]>([])
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const uid = String(user?.id || user?._id || '')

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('ms_token')
      if (!token || token === 'mock_token_for_preview') { setLoading(false); return }
      try {
        const [ordersRes, postsRes, threadsRes, savedRes] = await Promise.allSettled([
          api.get('/api/orders/buyer'),
          api.get('/api/posts'),
          api.get('/api/chat/threads'),
          api.get('/api/posts/saved'),
        ])
        if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.success) setOrders(ordersRes.value.data.data || [])
        if (postsRes.status === 'fulfilled') setPosts(postsRes.value.data || [])
        if (threadsRes.status === 'fulfilled' && threadsRes.value.data?.success) setThreads(threadsRes.value.data.data || [])
        if (savedRes.status === 'fulfilled') setSavedPosts(savedRes.value.data || [])
      } catch (err) {
        console.error('Dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user, wishlist])

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
  const completedCount = orders.filter(o => o.status === 'completed').length

  // Suggested artisan posts (from sellers, excluding self)
  const artisanPosts = posts.filter(p => p.userId?.role === 'seller' && String(p.userId?._id) !== uid)
  const suggestedPosts = artisanPosts.slice(0, 4)

  // Suggested artisans (unique sellers)
  const sellerMap = new Map<string, any>()
  artisanPosts.forEach(p => {
    if (!sellerMap.has(String(p.userId._id))) {
      sellerMap.set(String(p.userId._id), {
        id: p.userId._id,
        name: `${p.userId.firstName} ${p.userId.lastName}`,
        avatar: p.userId.avatar || null,
      })
    }
  })
  const suggestedArtisans = Array.from(sellerMap.values()).slice(0, 4)

  const recentThreads = [...threads]
    .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
    .slice(0, 4)

  const stats = [
    { label: 'Active Orders', value: activeOrders.length, Icon: Package, cls: 'text-[#5F3041] bg-[#FAF0F3]' },
    { label: 'Completed', value: completedCount, Icon: Gem, cls: 'text-emerald-700 bg-emerald-50' },
    { label: 'Vault', value: wishlist.length, Icon: Heart, cls: 'text-rose-500 bg-rose-50' },
    { label: 'Unread', value: unreadNotificationsCount, Icon: Bell, cls: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 md:px-10 md:py-8 flex flex-col gap-7 animate-fade-in">

      {/* Greeting + stat chips */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-[9px] font-extrabold text-[#C5A880] uppercase tracking-[0.3em] font-sans">
            <Sparkles className="w-3 h-3" /> Bespoke Workspace
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
            Welcome back, {user.firstName}
          </h1>
          <p className="text-[11px] text-gray-400 font-sans">Here's what's happening across your commissions.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value, Icon, cls }) => (
            <div key={label} className="bg-white border border-[#5F3041]/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_6px_20px_rgba(61,12,31,0.04)]">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-gray-900 font-serif">{value}</span>
                <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest font-sans mt-0.5">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Ongoing Orders */}
          <section className="bg-white border border-[#5F3041]/10 rounded-[1.75rem] p-6 shadow-[0_10px_30px_rgba(61,12,31,0.03)]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2">
                <Package className="w-4 h-4" /> Ongoing Orders
              </h3>
              <button onClick={() => router.push('/buyer/orders')} className="text-[10px] font-bold text-[#C5A880] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <p className="py-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-sans">Loading…</p>
            ) : activeOrders.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF0F3] flex items-center justify-center"><Gem className="w-5 h-5 text-[#5F3041]/40" /></div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest font-sans">No active commissions</p>
                <button onClick={() => router.push('/buyer/feed')} className="mt-1 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] text-[9px] font-bold tracking-widest px-4 py-2.5 rounded-full uppercase transition-all border-none cursor-pointer font-sans">
                  Explore Artisans
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeOrders.slice(0, 3).map(o => (
                  <div key={o._id} onClick={() => router.push('/buyer/orders')}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-[#5F3041]/8 hover:border-[#C5A880]/60 hover:shadow-[0_10px_25px_rgba(61,12,31,0.06)] cursor-pointer transition-all bg-[#FAF8F5]/20">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#C5A880]/40 shrink-0 bg-[#FAF8F5]">
                      <Image src={o.sellerId?.avatar || '/buyersignup.png'} alt={o.sellerId?.firstName || 'Artisan'} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 font-serif truncate" style={{ fontFamily: 'var(--font-playfair)' }}>{o.title}</h4>
                        {statusPill(o.status)}
                      </div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-sans mt-0.5 truncate">
                        {o.sellerId?.firstName} {o.sellerId?.lastName} · Rs. {o.budget?.toLocaleString()}
                      </p>
                      <div className="mt-2 max-w-[240px]"><OrderMilestoneSteps status={o.status} /></div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#5F3041] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Suggested posts */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recommended Pieces
              </h3>
              <button onClick={() => router.push('/buyer/feed')} className="text-[10px] font-bold text-[#C5A880] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
                Explore feed <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <p className="py-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-sans">Loading…</p>
            ) : suggestedPosts.length === 0 ? (
              <div className="bg-white border border-dashed border-[#C5A880]/40 rounded-[1.75rem] py-12 text-center text-xs text-gray-400 font-semibold uppercase tracking-widest font-sans">
                No recommendations yet
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {suggestedPosts.map(p => (
                  <div key={p._id} onClick={() => router.push(`/buyer/profile?id=${p.userId._id}`)}
                    className="group bg-white border border-[#5F3041]/10 hover:border-[#C5A880]/60 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-[0_12px_30px_rgba(61,12,31,0.08)] hover:-translate-y-1">
                    <div className="relative w-full aspect-square bg-[#FAF8F5]">
                      {p.images?.[0]
                        ? <Image src={p.images[0]} alt={p.category || 'Piece'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="absolute inset-0 flex items-center justify-center text-[#5F3041]/20"><Gem className="w-7 h-7" /></div>}
                    </div>
                    <div className="p-3 flex flex-col gap-0.5">
                      <span className="text-[8px] font-extrabold text-[#C5A880] uppercase tracking-widest font-sans truncate">{p.category || 'Bespoke'}</span>
                      <span className="text-[11px] font-bold text-[#5F3041] font-serif">
                        {p.budget ? `Rs. ${p.budget.toLocaleString()}` : (p.price || 'Contact')}
                      </span>
                      <span className="text-[9px] text-gray-400 font-sans truncate">{p.userId.firstName} {p.userId.lastName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 w-full">

          {/* Recent messages */}
          <section className="bg-white border border-[#5F3041]/10 rounded-[1.75rem] p-5 shadow-[0_10px_30px_rgba(61,12,31,0.03)]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Messages
              </h3>
              <button onClick={() => router.push('/buyer/messages')} className="text-[10px] font-bold text-[#C5A880] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
                Inbox <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {recentThreads.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-sans">No conversations yet</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {recentThreads.map(t => {
                  const other = t.participants?.find((p: any) => String(p._id) !== uid) || t.participants?.[0]
                  return (
                    <div key={t._id} onClick={() => router.push('/buyer/messages')}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF8F5]/60 cursor-pointer transition-colors">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C5A880]/30 shrink-0 bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center text-[11px] font-bold">
                        {other?.avatar ? <Image src={other.avatar} alt={other.firstName || ''} fill className="object-cover" /> : <span>{other?.firstName?.[0]?.toUpperCase() || 'U'}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-gray-800 font-sans truncate">{other?.firstName} {other?.lastName}</span>
                          <span className="text-[8px] text-gray-400 font-sans shrink-0">{relTime(t.lastMessageAt)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-sans truncate">{t.lastMessageText || 'No messages yet'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Suggested artisans */}
          <section className="bg-white border border-[#5F3041]/10 rounded-[1.75rem] p-5 shadow-[0_10px_30px_rgba(61,12,31,0.03)]">
            <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
              <Users className="w-4 h-4" /> Suggested Artisans
            </h3>
            {suggestedArtisans.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-sans">None yet</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {suggestedArtisans.map(a => (
                  <div key={a.id} onClick={() => router.push(`/buyer/profile?id=${a.id}`)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F5]/60 cursor-pointer transition-colors group">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C5A880]/30 shrink-0 bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center text-[11px] font-bold">
                      {a.avatar ? <Image src={a.avatar} alt={a.name} fill className="object-cover" /> : <span>{a.name?.[0]?.toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-gray-800 font-sans truncate block">{a.name}</span>
                      <span className="text-[8px] text-[#C5A880] uppercase tracking-widest font-sans">Master Artisan</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5F3041] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bespoke Vault */}
          <section className="bg-white border border-[#5F3041]/10 rounded-[1.75rem] p-5 shadow-[0_10px_30px_rgba(61,12,31,0.03)]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2">
                <Heart className="w-4 h-4" /> Bespoke Vault
              </h3>
              <button onClick={() => router.push('/buyer/wishlist')} className="text-[10px] font-bold text-[#C5A880] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {savedPosts.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-sans flex flex-col items-center gap-2">
                <Clock className="w-5 h-5 text-gray-300" /> Your vault is empty
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                {savedPosts.slice(0, 5).map((post: any) => {
                  const id = post._id || post.id
                  return (
                    <div key={id} onClick={() => post.userId && router.push(`/buyer/profile?id=${post.userId?._id || post.userId}`)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F5]/60 cursor-pointer transition-colors">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#FAF8F5] border border-gray-100 shrink-0">
                        {post.images?.[0]
                          ? <Image src={post.images[0]} alt={post.description || 'Saved'} fill className="object-cover" sizes="40px" />
                          : <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Gem className="w-4 h-4" /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[9px] font-bold text-gray-600 uppercase tracking-wider truncate">{post.category || 'Bespoke'}</h4>
                        <span className="text-[10px] font-extrabold text-[#5F3041]">
                          {post.price || (post.budget ? `Rs. ${post.budget.toLocaleString()}` : 'Contact')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
