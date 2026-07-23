'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/axios'
import { useBuyerContext } from '../BuyerContext'
import { Gem, Wallet, Package, MessageCircle, ArrowRight, Plus } from 'lucide-react'

const GEM = {
  ruby: { from: '#F7E4E9', to: '#EED0D9', ink: '#7B2D45', muted: '#8A4A5E' },
  emerald: { from: '#E0F1E9', to: '#CBE7DA', ink: '#146049', muted: '#2E6B58' },
  sapphire: { from: '#E3EAF7', to: '#CFDCF0', ink: '#2F4A85', muted: '#465C8A' },
  topaz: { from: '#F8ECDA', to: '#F1DEC0', ink: '#8A5A16', muted: '#7E5A22' },
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#D2903C',
  accepted: '#3D5A9E',
  crafting: '#7B2D45',
  shipped: '#7C5BA6',
  completed: '#1F8A6D',
  cancelled: '#B0A79F',
}

// Darker variants for small text on white
const STATUS_TEXT: Record<string, string> = {
  pending: '#9A6516',
  accepted: '#2F4A85',
  crafting: '#7B2D45',
  shipped: '#63478A',
  completed: '#14684F',
  cancelled: '#6B635C',
}

const initials = (first?: string, last?: string) =>
  `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'U'

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

const compact = (n: number) => {
  if (n >= 100000) return `${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return String(Math.round(n))
}

// Smooth curve through the points
const smoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`
  }
  return d
}

interface StatCardProps {
  label: string
  value: string
  prefix?: string
  Icon: React.ElementType
  gem: { from: string; to: string; ink: string; muted: string }
  rows: { label: string; value: string }[]
  onClick: () => void
}

const StatCard = ({ label, value, prefix, Icon, gem, rows, onClick }: StatCardProps) => (
  <button
    onClick={onClick}
    style={{ backgroundImage: `linear-gradient(145deg, ${gem.from}, ${gem.to})` }}
    className="group relative overflow-hidden rounded-[1.5rem] p-5 text-left cursor-pointer border-none transition-all duration-300 hover:-translate-y-1 shadow-[0_6px_18px_-10px_rgba(61,12,31,0.22)] hover:shadow-[0_16px_32px_-12px_rgba(61,12,31,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
  >
    {/* light catching the top edge */}
    <span
      aria-hidden
      className="pointer-events-none absolute -top-12 -right-10 w-36 h-36 rounded-full blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.85), transparent 70%)' }}
    />

    <span className="relative flex flex-col gap-4">
      <span className="flex items-start justify-between gap-3">
        <span className="flex flex-col gap-2 min-w-0">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em] font-sans"
            style={{ color: gem.muted }}
          >
            {label}
          </span>
          <span className="flex items-baseline gap-1">
            {prefix && (
              <span className="text-[13px] font-semibold font-sans" style={{ color: gem.muted }}>
                {prefix}
              </span>
            )}
            <span
              className="text-[2.1rem] leading-none font-bold tabular-nums"
              style={{ fontFamily: 'var(--font-playfair)', color: gem.ink }}
            >
              {value}
            </span>
          </span>
        </span>

        <span
          className="w-11 h-11 rounded-2xl bg-white/65 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
        >
          <Icon className="w-5 h-5" style={{ color: gem.ink }} />
        </span>
      </span>

      <span className="block h-px" style={{ backgroundColor: gem.ink, opacity: 0.15 }} />

      <span className="flex flex-col gap-1">
        {rows.map(r => (
          <span key={r.label} className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-sans truncate" style={{ color: gem.muted }}>{r.label}</span>
            <span
              className="text-[11px] font-bold font-sans tabular-nums shrink-0"
              style={{ color: gem.ink }}
            >
              {r.value}
            </span>
          </span>
        ))}
      </span>
    </span>
  </button>
)

export default function BuyerDashboardPage() {
  const router = useRouter()
  const { user } = useBuyerContext()

  const [orders, setOrders] = useState<any[]>([])
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<Date | null>(null)

  const uid = String(user?.id || user?._id || '')

  // Set after mount so the server markup can't disagree with the client clock
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [ordersRes, threadsRes] = await Promise.allSettled([
        api.get('/api/orders/buyer'),
        api.get('/api/chat/threads'),
      ])
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.success) setOrders(ordersRes.value.data.data || [])
      if (threadsRes.status === 'fulfilled' && threadsRes.value.data?.success) setThreads(threadsRes.value.data.data || [])
      setLoading(false)
    }
    load()
  }, [uid])

  const greeting = useMemo(() => {
    if (!now) return 'Hello'
    const h = now.getHours()
    return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening'
  }, [now])

  const byStatus = useMemo(() => {
    const c: Record<string, number> = {}
    orders.forEach(o => { c[o.status] = (c[o.status] || 0) + 1 })
    return c
  }, [orders])

  const ongoing = useMemo(
    () => orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled'),
    [orders]
  )
  const completed = useMemo(() => orders.filter(o => o.status === 'completed'), [orders])
  const invested = useMemo(() => completed.reduce((s, o) => s + (o.budget || 0), 0), [completed])
  const avgPiece = completed.length ? invested / completed.length : 0

  const awaitingReply = useMemo(
    () => threads.filter(t => t.lastMessageSenderId && String(t.lastMessageSenderId) !== uid).length,
    [threads, uid]
  )

  const recentThreads = useMemo(
    () =>
      [...threads]
        .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
        .slice(0, 5),
    [threads]
  )

  const monthly = useMemo(() => {
    const base = new Date()
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth() - (5 - i), 1)
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString(undefined, { month: 'short' }),
        value: 0,
      }
    })
    orders.forEach(o => {
      if (!o.createdAt) return
      const d = new Date(o.createdAt)
      const b = buckets.find(x => x.key === `${d.getFullYear()}-${d.getMonth()}`)
      if (b) b.value += o.budget || 0
    })
    return buckets
  }, [orders])

  const chart = useMemo(() => {
    const W = 300, H = 110, PAD = 6
    const max = Math.max(...monthly.map(m => m.value), 1)
    const pts = monthly.map((m, i) => ({
      x: PAD + (i * (W - PAD * 2)) / (monthly.length - 1),
      y: H - PAD - (m.value / max) * (H - PAD * 2),
    }))
    return { W, H, max, pts, line: smoothPath(pts), area: `${smoothPath(pts)} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z` }
  }, [monthly])

  const hasSpend = monthly.some(m => m.value > 0)

  const donut = useMemo(() => {
    const entries = Object.entries(byStatus).filter(([, v]) => v > 0)
    const total = entries.reduce((s, [, v]) => s + v, 0)
    const R = 54, C = 2 * Math.PI * R
    let acc = 0
    const arcs = entries.map(([status, value]) => {
      const len = (value / total) * C
      const arc = { status, value, len, offset: -acc, pct: Math.round((value / total) * 100) }
      acc += len
      return arc
    })
    return { arcs, total, R, C }
  }, [byStatus])

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-5 py-7 md:px-8 md:py-9 flex flex-col gap-6">

      {/* Greeting */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1
            className="text-2xl md:text-[2rem] leading-tight font-bold text-gray-900 flex items-center gap-2.5"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {greeting}, {user.firstName}!
            <span className="text-xl md:text-2xl" role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-[11px] text-gray-400 font-sans tracking-wide tabular-nums">
            {now
              ? `${now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} · ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
              : ' '}
          </p>
        </div>

        <button
          onClick={() => router.push('/buyer/feed?newRequest=true')}
          className="self-start sm:self-auto shrink-0 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest px-5 py-3 rounded-full uppercase transition-all duration-300 border-none cursor-pointer font-sans flex items-center gap-2 hover:-translate-y-px hover:shadow-[0_10px_22px_-8px_rgba(95,48,65,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2"
        >
          <Plus className="w-3.5 h-3.5" /> New Post
        </button>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          [0, 1, 2, 3].map(i => <div key={i} className="skeleton rounded-[1.5rem] h-[172px]" />)
        ) : (
          <>
            <StatCard
              label="Total Orders"
              value={String(orders.length)}
              Icon={Gem}
              gem={GEM.ruby}
              onClick={() => router.push('/buyer/orders')}
              rows={[
                { label: 'Ongoing', value: String(ongoing.length) },
                { label: 'Completed', value: String(completed.length) },
              ]}
            />
            <StatCard
              label="Total Invested"
              value={invested > 0 ? compact(invested) : '0'}
              prefix="Rs."
              Icon={Wallet}
              gem={GEM.emerald}
              onClick={() => router.push('/buyer/orders')}
              rows={[
                { label: 'Avg per piece', value: avgPiece > 0 ? `Rs. ${compact(avgPiece)}` : '—' },
                { label: 'Pieces owned', value: String(completed.length) },
              ]}
            />
            <StatCard
              label="In The Workshop"
              value={String(ongoing.length)}
              Icon={Package}
              gem={GEM.sapphire}
              onClick={() => router.push('/buyer/orders')}
              rows={[
                { label: 'Awaiting artisan', value: String(byStatus.pending || 0) },
                { label: 'Crafting', value: String(byStatus.crafting || 0) },
                { label: 'Dispatched', value: String(byStatus.shipped || 0) },
              ]}
            />
            <StatCard
              label="Conversations"
              value={String(threads.length)}
              Icon={MessageCircle}
              gem={GEM.topaz}
              onClick={() => router.push('/buyer/messages')}
              rows={[
                { label: 'Awaiting your reply', value: String(awaitingReply) },
              ]}
            />
          </>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ongoing orders */}
        <div className="lg:col-span-2 bg-white border border-[#5F3041]/10 rounded-[1.5rem] p-5 shadow-[0_8px_24px_-14px_rgba(61,12,31,0.2)]">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Ongoing Orders
            </h2>
            <button
              onClick={() => router.push('/buyer/orders')}
              className="group/act shrink-0 text-[10px] font-bold text-[#8A6538] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
            >
              Show all <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover/act:translate-x-0.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="skeleton h-2.5 w-1/3 rounded" />
                    <div className="skeleton h-2 w-1/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : ongoing.length === 0 ? (
            <p className="text-[11px] text-gray-400 font-sans py-10 text-center">
              No ongoing orders.
            </p>
          ) : (
            <div className="flex flex-col">
              {ongoing.slice(0, 5).map(o => (
                <button
                  key={o._id}
                  onClick={() => router.push(`/buyer/orders?order=${o._id}`)}
                  className="group flex items-center gap-3.5 p-2.5 rounded-xl text-left cursor-pointer bg-transparent border-none transition-colors hover:bg-[#FAF8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
                >
                  <span className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#FAF0F3] flex items-center justify-center">
                    {o.postId?.images?.[0]
                      ? <Image src={o.postId.images[0]} alt="" fill className="object-cover" sizes="44px" />
                      : <Gem className="w-4 h-4 text-[#5F3041]/40" />}
                  </span>

                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[13px] font-bold text-gray-900 truncate font-sans">{o.title}</span>
                    <span className="text-[10px] text-gray-400 truncate font-sans">
                      {o.sellerId?.firstName} {o.sellerId?.lastName}
                    </span>
                  </span>

                  <span className="hidden sm:block text-[12px] font-bold text-gray-700 font-sans tabular-nums shrink-0">
                    {typeof o.budget === 'number' ? `Rs. ${o.budget.toLocaleString()}` : '—'}
                  </span>

                  <span
                    className="text-[10px] font-bold capitalize font-sans shrink-0 w-20 text-right"
                    style={{ color: STATUS_TEXT[o.status] || '#6B635C' }}
                  >
                    {o.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* spend trend */}
        <div className="bg-white border border-[#5F3041]/10 rounded-[1.5rem] p-5 shadow-[0_8px_24px_-14px_rgba(61,12,31,0.2)]">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Total Spend
            </h2>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans shrink-0">6 mo</span>
          </div>

          {loading ? (
            <div className="skeleton h-[150px] rounded-xl mt-3" />
          ) : !hasSpend ? (
            <p className="text-[11px] text-gray-400 font-sans py-14 text-center">No spend recorded yet.</p>
          ) : (
            <>
              <p className="text-[1.6rem] font-bold text-gray-900 tabular-nums leading-none mt-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                <span className="text-[13px] font-semibold text-gray-400 font-sans mr-1">Rs.</span>
                {compact(monthly.reduce((s, m) => s + m.value, 0))}
              </p>

              <svg
                viewBox={`0 0 ${chart.W} ${chart.H}`}
                className="w-full h-auto mt-3 overflow-visible"
                role="img"
                aria-label={`Total spend over the last six months: ${monthly.map(m => `${m.label} Rs. ${m.value}`).join(', ')}`}
              >
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B2D45" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#7B2D45" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0.25, 0.5, 0.75].map(f => (
                  <line
                    key={f}
                    x1="0" x2={chart.W}
                    y1={chart.H * f} y2={chart.H * f}
                    stroke="#5F3041" strokeOpacity="0.07" strokeDasharray="3 4"
                  />
                ))}

                <path d={chart.area} fill="url(#spendFill)" />
                <path d={chart.line} fill="none" stroke="#7B2D45" strokeWidth="2.2" strokeLinecap="round" />

                {chart.pts.map((p, i) => (
                  monthly[i].value > 0 ? (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#7B2D45" strokeWidth="2" />
                  ) : null
                ))}
              </svg>

              <div className="flex justify-between mt-1.5">
                {monthly.map(m => (
                  <span key={m.key} className="text-[9px] font-bold text-gray-400 font-sans">{m.label}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* messages */}
        <div className="lg:col-span-2 bg-white border border-[#5F3041]/10 rounded-[1.5rem] p-5 shadow-[0_8px_24px_-14px_rgba(61,12,31,0.2)]">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Recent Messages
            </h2>
            <button
              onClick={() => router.push('/buyer/messages')}
              className="group/act text-[10px] font-bold text-[#8A6538] hover:text-[#5F3041] uppercase tracking-widest font-sans border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
            >
              Inbox <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover/act:translate-x-0.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="skeleton h-2.5 w-1/3 rounded" />
                    <div className="skeleton h-2 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentThreads.length === 0 ? (
            <p className="text-[11px] text-gray-400 font-sans py-10 text-center">No conversations yet.</p>
          ) : (
            <div className="flex flex-col">
              {recentThreads.map(t => {
                const other = t.participants?.find((p: any) => String(p._id) !== uid) || t.participants?.[0]
                const name = `${other?.firstName || ''} ${other?.lastName || ''}`.trim()
                const theirTurn = t.lastMessageSenderId && String(t.lastMessageSenderId) !== uid
                return (
                  <button
                    key={t._id}
                    onClick={() => router.push(`/buyer/messages?chatWith=${encodeURIComponent(name)}&userId=${other?._id || ''}`)}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl text-left cursor-pointer bg-transparent border-none transition-colors hover:bg-[#FAF8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
                  >
                    <span className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center text-[11px] font-bold ring-1 ring-[#C5A880]/30">
                      {other?.avatar
                        ? <Image src={other.avatar} alt="" fill className="object-cover" sizes="40px" />
                        : <span>{initials(other?.firstName, other?.lastName)}</span>}
                    </span>

                    <span className="flex-1 min-w-0 flex flex-col">
                      <span className={`text-[12.5px] truncate font-sans ${theirTurn ? 'font-extrabold text-gray-900' : 'font-bold text-gray-700'}`}>
                        {name}
                      </span>
                      <span className={`text-[10.5px] truncate font-sans ${theirTurn ? 'text-gray-600' : 'text-gray-400'}`}>
                        {t.lastMessageText || 'No messages yet'}
                      </span>
                    </span>

                    <span className="text-[9.5px] text-gray-400 font-sans tabular-nums shrink-0">
                      {relTime(t.lastMessageAt)}
                    </span>

                    {theirTurn && <span className="w-1.5 h-1.5 rounded-full bg-[#5F3041] shrink-0" aria-label="Awaiting your reply" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* status breakdown */}
        <div className="bg-white border border-[#5F3041]/10 rounded-[1.5rem] p-5 shadow-[0_8px_24px_-14px_rgba(61,12,31,0.2)]">
          <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
            Order Breakdown
          </h2>

          {loading ? (
            <div className="skeleton h-[150px] rounded-xl" />
          ) : donut.total === 0 ? (
            <p className="text-[11px] text-gray-400 font-sans py-14 text-center">No orders to break down.</p>
          ) : (
            <div className="flex items-center gap-5">
              <svg
                viewBox="0 0 140 140"
                className="w-[124px] h-[124px] shrink-0 -rotate-90"
                role="img"
                aria-label={`Orders by status: ${donut.arcs.map(a => `${a.status} ${a.value}`).join(', ')}`}
              >
                {donut.arcs.map(a => (
                  <circle
                    key={a.status}
                    cx="70" cy="70" r={donut.R}
                    fill="none"
                    stroke={STATUS_COLOR[a.status] || '#B0A79F'}
                    strokeWidth="16"
                    strokeDasharray={`${a.len} ${donut.C - a.len}`}
                    strokeDashoffset={a.offset}
                    strokeLinecap="butt"
                  />
                ))}
                <text
                  x="70" y="70"
                  textAnchor="middle" dominantBaseline="central"
                  transform="rotate(90 70 70)"
                  className="fill-gray-900"
                  style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: 700 }}
                >
                  {donut.total}
                </text>
              </svg>

              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                {donut.arcs.map(a => (
                  <div key={a.status} className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLOR[a.status] || '#B0A79F' }}
                    />
                    <span className="text-[10.5px] text-gray-600 font-sans capitalize truncate flex-1">{a.status}</span>
                    <span className="text-[10.5px] font-bold text-gray-900 font-sans tabular-nums shrink-0">{a.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
