'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/axios'
import { useSellerContext } from '../SellerContext'
import OrderMilestoneSteps from '@/app/components/shared/OrderMilestoneSteps'
import {
  Package, Wallet, Bell, MessageCircle, ArrowRight, Sparkles, Users, Gem, Inbox, Clock
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

export default function SellerDashboardPage() {
  const router = useRouter()
  const { user, unreadNotificationsCount } = useSellerContext()

  const [orders, setOrders] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const uid = String(user?.id || user?._id || '')

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('ms_token')
      if (!token || token === 'mock_token_for_preview') { setLoading(false); return }
      try {
        const [ordersRes, postsRes, threadsRes] = await Promise.allSettled([
          api.get('/api/orders/seller'),
          api.get('/api/posts'),
          api.get('/api/chat/threads'),
        ])
        if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.success) setOrders(ordersRes.value.data.data || [])
        if (postsRes.status === 'fulfilled') setPosts(postsRes.value.data || [])
        if (threadsRes.status === 'fulfilled' && threadsRes.value.data?.success) setThreads(threadsRes.value.data.data || [])
      } catch (err) {
        console.error('Seller dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const activeOrders = orders.filter(o => ['accepted', 'crafting', 'shipped'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalEarned = completedOrders.reduce((sum, o) => sum + (o.budget || 0), 0)

  // Client briefs (buyer posts) to bid on
  const clientBriefs = posts.filter(p => p.userId?.role === 'buyer' && String(p.userId?._id) !== uid)
  const briefs = clientBriefs.slice(0, 4)

  // Unique clients from briefs
  const clientMap = new Map<string, any>()
  clientBriefs.forEach(p => {
    if (!clientMap.has(String(p.userId._id))) {
      clientMap.set(String(p.userId._id), {
        id: p.userId._id,
        name: `${p.userId.firstName} ${p.userId.lastName}`,
        avatar: p.userId.avatar || null,
      })
    }
  })
  const suggestedClients = Array.from(clientMap.values()).slice(0, 4)

  // Seller's own portfolio posts
  const myPosts = posts.filter(p => String(p.userId?._id) === uid).slice(0, 4)

  const recentThreads = [...threads]
    .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
    .slice(0, 4)

  const stats = [
    { label: 'Active', value: activeOrders.length, Icon: Package, cls: 'text-[#5F3041] bg-[#FAF0F3]' },
    { label: 'Completed', value: completedOrders.length, Icon: Gem, cls: 'text-emerald-700 bg-emerald-50' },
    { label: 'Earned', value: `Rs. ${totalEarned.toLocaleString()}`, Icon: Wallet, cls: 'text-[#C5A880] bg-[#FAF8F5]' },
    { label: 'Unread', value: unreadNotificationsCount, Icon: Bell, cls: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 md:px-10 md:py-8 flex flex-col gap-7 animate-fade-in">

      {/* Greeting + stat chips */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-[9px] font-extrabold text-[#C5A880] uppercase tracking-[0.3em] font-sans">
            <Sparkles className="w-3 h-3" /> Artisan Workbench
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
            Welcome back, {user.firstName}
          </h1>
          <p className="text-[11px] text-gray-400 font-sans">Your studio at a glance — requests, commissions, and clients.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value, Icon, cls }) => (
            <div key={label} className="bg-white border border-[#5F3041]/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_6px_20px_rgba(61,12,31,0.04)]">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-base font-bold text-gray-900 font-serif truncate">{value}</span>
                <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest font-sans mt-0.5">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming requests banner */}
      {pendingOrders.length > 0 && (
        <section className="bg-gradient-to-r from-[#5F3041] to-[#3D0C1F] rounded-[1.75rem] p-6 shadow-[0_16px_40px_rgba(61,12,31,0.2)] relative overflow-hidden">
          <Inbox className="absolute -right-4 -bottom-4 w-28 h-28 text-white/5 rotate-12" />
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-[11px] font-extrabold text-[#E9D7C3] tracking-[0.2em] uppercase font-sans flex items-center gap-2">
              <Inbox className="w-4 h-4" /> Incoming Requests ({pendingOrders.length})
            </h3>
            <button onClick={() => router.push('/seller/orders')} className="text-[10px] font-bold text-[#E9D7C3]/80 hover:text-white uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
              Review all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingOrders.slice(0, 4).map(o => (
              <div key={o._id} onClick={() => router.push('/seller/orders')}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-[#E9D7C3]/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#E9D7C3]/40 shrink-0 bg-[#FAF8F5]">
                  <Image src={o.buyerId?.avatar || '/buyersignup.png'} alt={o.buyerId?.firstName || 'Client'} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white font-serif truncate">{o.title}</h4>
                  <p className="text-[9px] text-[#E9D7C3]/70 uppercase tracking-wider font-sans truncate">
                    {o.buyerId?.firstName} {o.buyerId?.lastName} · Rs. {o.budget?.toLocaleString()}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#E9D7C3] shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Active commissions */}
          <section className="bg-white border border-[#5F3041]/10 rounded-[1.75rem] p-6 shadow-[0_10px_30px_rgba(61,12,31,0.03)]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2">
                <Package className="w-4 h-4" /> Active Commissions
              </h3>
              <button onClick={() => router.push('/seller/orders')} className="text-[10px] font-bold text-[#C5A880] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <p className="py-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-sans">Loading…</p>
            ) : activeOrders.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF0F3] flex items-center justify-center"><Gem className="w-5 h-5 text-[#5F3041]/40" /></div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest font-sans">No commissions in progress</p>
                <button onClick={() => router.push('/seller/feed')} className="mt-1 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] text-[9px] font-bold tracking-widest px-4 py-2.5 rounded-full uppercase transition-all border-none cursor-pointer font-sans">
                  Browse Client Briefs
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeOrders.slice(0, 3).map(o => (
                  <div key={o._id} onClick={() => router.push('/seller/orders')}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-[#5F3041]/8 hover:border-[#C5A880]/60 hover:shadow-[0_10px_25px_rgba(61,12,31,0.06)] cursor-pointer transition-all bg-[#FAF8F5]/20">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#C5A880]/40 shrink-0 bg-[#FAF8F5]">
                      <Image src={o.buyerId?.avatar || '/buyersignup.png'} alt={o.buyerId?.firstName || 'Client'} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 font-serif truncate" style={{ fontFamily: 'var(--font-playfair)' }}>{o.title}</h4>
                        {statusPill(o.status)}
                      </div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-sans mt-0.5 truncate">
                        {o.buyerId?.firstName} {o.buyerId?.lastName} · Rs. {o.budget?.toLocaleString()}
                      </p>
                      <div className="mt-2 max-w-[240px]"><OrderMilestoneSteps status={o.status} /></div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#5F3041] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Client briefs */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Client Briefs
              </h3>
              <button onClick={() => router.push('/seller/feed')} className="text-[10px] font-bold text-[#C5A880] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
                Browse all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <p className="py-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-sans">Loading…</p>
            ) : briefs.length === 0 ? (
              <div className="bg-white border border-dashed border-[#C5A880]/40 rounded-[1.75rem] py-12 text-center text-xs text-gray-400 font-semibold uppercase tracking-widest font-sans">
                No open client briefs
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {briefs.map(p => (
                  <div key={p._id} onClick={() => router.push(`/seller/profile?id=${p.userId._id}`)}
                    className="group bg-white border border-[#5F3041]/10 hover:border-[#C5A880]/60 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all hover:shadow-[0_12px_30px_rgba(61,12,31,0.07)]">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF8F5] border border-gray-100 shrink-0">
                      {p.images?.[0]
                        ? <Image src={p.images[0]} alt={p.category || 'Brief'} fill className="object-cover" />
                        : <div className="absolute inset-0 flex items-center justify-center text-[#5F3041]/20"><Gem className="w-6 h-6" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-extrabold text-[#C5A880] uppercase tracking-widest font-sans truncate block">{p.category || 'Bespoke Brief'}</span>
                      <p className="text-[11px] text-gray-600 font-sans line-clamp-1 mt-0.5">{p.description}</p>
                      <span className="text-[10px] font-bold text-[#5F3041] font-serif">
                        {p.budget ? `Rs. ${p.budget.toLocaleString()}` : (p.price || 'Open budget')}
                      </span>
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
              <button onClick={() => router.push('/seller/messages')} className="text-[10px] font-bold text-[#C5A880] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
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
                    <div key={t._id} onClick={() => router.push('/seller/messages')}
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

          {/* Suggested clients */}
          <section className="bg-white border border-[#5F3041]/10 rounded-[1.75rem] p-5 shadow-[0_10px_30px_rgba(61,12,31,0.03)]">
            <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
              <Users className="w-4 h-4" /> Potential Clients
            </h3>
            {suggestedClients.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-sans">None yet</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {suggestedClients.map(c => (
                  <div key={c.id} onClick={() => router.push(`/seller/profile?id=${c.id}`)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F5]/60 cursor-pointer transition-colors group">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C5A880]/30 shrink-0 bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center text-[11px] font-bold">
                      {c.avatar ? <Image src={c.avatar} alt={c.name} fill className="object-cover" /> : <span>{c.name?.[0]?.toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-gray-800 font-sans truncate block">{c.name}</span>
                      <span className="text-[8px] text-[#C5A880] uppercase tracking-widest font-sans">Connoisseur</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5F3041] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My portfolio */}
          <section className="bg-white border border-[#5F3041]/10 rounded-[1.75rem] p-5 shadow-[0_10px_30px_rgba(61,12,31,0.03)]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="text-[11px] font-extrabold text-[#5F3041] tracking-[0.2em] uppercase font-sans flex items-center gap-2">
                <Gem className="w-4 h-4" /> My Portfolio
              </h3>
              <button onClick={() => router.push('/seller/profile')} className="text-[10px] font-bold text-[#C5A880] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors">
                Manage <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {myPosts.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest font-sans flex flex-col items-center gap-2">
                <Clock className="w-5 h-5 text-gray-300" /> No pieces posted yet
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {myPosts.map(p => (
                  <div key={p._id} onClick={() => router.push('/seller/profile')}
                    className="relative aspect-square rounded-lg overflow-hidden bg-[#FAF8F5] border border-gray-100 cursor-pointer group">
                    {p.images?.[0]
                      ? <Image src={p.images[0]} alt={p.category || 'Piece'} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="absolute inset-0 flex items-center justify-center text-[#5F3041]/20"><Gem className="w-4 h-4" /></div>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
