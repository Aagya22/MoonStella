'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import api from '@/lib/api/axios'
import { useSellerContext } from '../SellerContext'
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText,
  Edit3,
  ArrowLeft,
  History,
  Activity,
  Wallet
} from 'lucide-react'

interface TimelineEvent {
  stage: string
  note: string
  image?: string | null
  createdAt: string
}

interface Order {
  _id: string
  buyerId: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
    email?: string
    location?: string
  }
  sellerId: any
  postId?: any
  title: string
  description: string
  budget: number
  status: 'pending' | 'accepted' | 'crafting' | 'shipped' | 'completed' | 'cancelled'
  currentStage: string
  timeline: TimelineEvent[]
  createdAt: string
  updatedAt: string
}

const ORDERED_STAGES = [
  'Order Brief Submitted',
  'Design & Blueprint Approved',
  'Concept & Blueprinting',
  'Material Selection & Sourcing',
  'Handcrafting & Assembly',
  'Polishing & Quality Inspection',
  'Ready for Dispatch',
  'Dispatched & On the Way',
  'Delivered',
]

function getProgressPercent(order: Order): number {
  if (order.status === 'completed') return 100
  if (order.status === 'cancelled') return 0
  const latestStage = order.currentStage || order.timeline?.[order.timeline.length - 1]?.stage || ''
  const idx = ORDERED_STAGES.findIndex(s => s.toLowerCase() === latestStage.toLowerCase())
  if (idx < 0) return 5
  return Math.round(((idx + 1) / ORDERED_STAGES.length) * 100)
}

function getProgressLabel(order: Order): string {
  if (order.status === 'completed') return 'Delivered'
  if (order.status === 'cancelled') return 'Cancelled'
  return order.currentStage || 'Initialising'
}

const STAGES = [
  'Concept & Blueprinting',
  'Material Selection & Sourcing',
  'Handcrafting & Assembly',
  'Polishing & Quality Inspection',
  'Ready for Dispatch',
  'Dispatched & On the Way',
]

export default function SellerOrdersPage() {
  const { user } = useSellerContext()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [listTab, setListTab] = useState<'active' | 'history'>('active')

  const [showProgressModal, setShowProgressModal] = useState(false)
  const [newStage, setNewStage] = useState('Concept & Blueprinting')
  const [newNote, setNewNote] = useState('')
  const [submittingProgress, setSubmittingProgress] = useState(false)
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders/seller')
      if (res.data?.success) setOrders(res.data.data)
    } catch (err) {
      console.error('Failed to load seller orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadOrders()
  }, [user])

  const selectedOrder = orders.find((o) => o._id === selectedOrderId)

  const handleAcceptOrder = async (orderId: string) => {
    if (!window.confirm('Accept this bespoke commission request?')) return
    try {
      const res = await api.patch(`/api/orders/${orderId}/accept`)
      if (res.data?.success) { alert('Commission accepted! Crafting timeline initialized.'); loadOrders() }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept order')
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    try {
      const res = await api.patch(`/api/orders/${orderId}/cancel`)
      if (res.data?.success) { alert('Order cancelled.'); loadOrders() }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  const handlePostProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrderId || !newNote.trim()) return
    setSubmittingProgress(true)
    try {
      const res = await api.patch(`/api/orders/${selectedOrderId}/progress`, {
        stage: newStage,
        note: newNote.trim(),
      })
      if (res.data?.success) {
        setShowProgressModal(false)
        setNewNote('')
        alert('Progress update posted!')
        loadOrders()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post progress')
    } finally {
      setSubmittingProgress(false)
    }
  }

  const getStatusPill = (status: string) => {
    const map: Record<string, { cls: string; Icon: React.ElementType }> = {
      pending:   { cls: 'bg-amber-50 text-amber-800 border-amber-200/50',       Icon: Clock },
      accepted:  { cls: 'bg-sky-50 text-sky-800 border-sky-200/50',             Icon: Package },
      crafting:  { cls: 'bg-[#FAF0F3] text-[#5F3041] border-[#5F3041]/15',      Icon: Clock },
      shipped:   { cls: 'bg-violet-50 text-violet-800 border-violet-200/50',    Icon: Package },
      completed: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200/50', Icon: CheckCircle2 },
      cancelled: { cls: 'bg-rose-50 text-rose-800 border-rose-200/50',          Icon: XCircle },
    }
    const { cls, Icon } = map[status] ?? map.pending
    return (
      <span className={`text-[9px] font-bold tracking-wider uppercase border px-2.5 py-1 rounded-full flex items-center gap-1 font-sans select-none shrink-0 ${cls}`}>
        <Icon className="w-2.5 h-2.5" />
        {status}
      </span>
    )
  }

  const activeOrders  = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
  const historyOrders = orders.filter(o => o.status === 'completed'  || o.status === 'cancelled')
  const totalEarned   = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.budget, 0)

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs text-[#5F3041]/70 font-sans uppercase tracking-widest">
        Loading Orders...
      </div>
    )
  }

  /* ─────────────── ORDER DETAIL VIEW ─────────────── */
  if (selectedOrder) {
    const pct = getProgressPercent(selectedOrder)
    return (
      <div className="flex-1 w-full mx-auto px-6 sm:px-14 py-10 max-w-5xl select-none">
        <div className="bg-white border border-[#5F3041]/10 p-8 sm:p-12 rounded-[2.5rem] flex flex-col gap-8 shadow-[0_20px_60px_rgba(61,12,31,0.04)] text-left">

          {/* Back */}
          <button onClick={() => setSelectedOrderId(null)}
            className="self-start text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#5F3041] transition-colors flex items-center gap-1 border-none bg-transparent cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </button>

          {/* Header row */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-100 pb-8 gap-6">
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 tracking-wide font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {selectedOrder.title}
                </h2>
                {getStatusPill(selectedOrder.status)}
              </div>

              <div className="flex gap-2 bg-[#FAF8F5] border border-gray-100 p-4 rounded-2xl max-w-2xl">
                <FileText className="w-4 h-4 text-[#5F3041]/40 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium whitespace-pre-line">
                  {selectedOrder.description}
                </p>
              </div>

              {/* Full progress bar in detail view */}
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest font-sans">Crafting Progress</span>
                  <span className="text-[9px] font-bold text-[#5F3041] font-sans uppercase tracking-wider">
                    {pct}% — {getProgressLabel(selectedOrder)}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      selectedOrder.status === 'completed' ? 'bg-emerald-500' :
                      selectedOrder.status === 'cancelled' ? 'bg-rose-400' :
                      'bg-gradient-to-r from-[#5F3041] to-[#C5A880]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Price plaque + actions */}
            <div className="flex flex-col md:items-end gap-2 shrink-0 bg-gradient-to-br from-[#FAF8F5] to-white border border-[#E9D7C3]/60 p-6 rounded-2xl min-w-[210px] shadow-sm">
              <span className="text-[9px] font-extrabold text-gray-400 tracking-widest font-sans uppercase">Commission Value</span>
              <span className="text-2xl font-bold text-[#5F3041] font-serif">Rs. {selectedOrder.budget.toLocaleString()}</span>

              <div className="flex flex-col gap-2 w-full mt-2">
                {selectedOrder.status === 'pending' && (
                  <button onClick={() => handleAcceptOrder(selectedOrder._id)}
                    className="w-full bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] text-[9.5px] font-bold tracking-widest py-2.5 rounded-xl uppercase transition-all border-none cursor-pointer"
                    style={{ fontFamily: 'var(--font-montserrat)' }}>
                    Accept Commission
                  </button>
                )}

                {(selectedOrder.status === 'accepted' || selectedOrder.status === 'crafting' || selectedOrder.status === 'shipped') && (
                  <>
                    <button onClick={() => setShowProgressModal(true)}
                      className="w-full bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] text-[9.5px] font-bold tracking-widest py-2.5 rounded-xl uppercase transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
                      style={{ fontFamily: 'var(--font-montserrat)' }}>
                      <Edit3 className="w-3.5 h-3.5" /> Post Update
                    </button>
                    {selectedOrder.currentStage === 'Dispatched & On the Way' && (
                      <p className="text-[9px] text-amber-700 font-semibold italic text-center mt-1 flex items-center gap-1 justify-center">
                        <AlertCircle className="w-3 h-3" /> Awaiting client confirmation...
                      </p>
                    )}
                  </>
                )}

                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <button onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="text-[9px] font-bold text-rose-600 hover:text-rose-800 tracking-widest uppercase border-none bg-transparent cursor-pointer font-sans mt-1 hover:underline text-center">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Buyer plaque */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-[#FAF8F5] via-white to-transparent border border-[#5F3041]/5 p-5 rounded-2xl">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white">
              <Image src={selectedOrder.buyerId.avatar || '/buyersignup.png'} alt={selectedOrder.buyerId.firstName} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-extrabold text-gray-800 tracking-wider uppercase font-sans">
                Client: {selectedOrder.buyerId.firstName} {selectedOrder.buyerId.lastName}
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5 font-sans">{selectedOrder.buyerId.email}</p>
              <div className="flex items-center gap-1 mt-1 text-[9px] text-[#5F3041] font-extrabold uppercase tracking-widest font-sans">
                <MapPin className="w-3 h-3" />
                Delivery: {selectedOrder.buyerId.location || 'Kathmandu, Nepal'}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase font-sans border-b border-gray-100 pb-2.5">
              Workbench Progress Timeline
            </h3>
            <div className="relative pl-7 border-l-2 border-dashed border-[#5F3041]/15 flex flex-col gap-6 ml-3 py-1">
              {selectedOrder.timeline.map((event, idx) => {
                const isLatest = idx === selectedOrder.timeline.length - 1
                return (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[37px] top-2 rounded-full border-2 flex items-center justify-center transition-all ${
                      isLatest
                        ? 'w-4 h-4 bg-[#5F3041] border-white ring-4 ring-[#5F3041]/15'
                        : 'w-3 h-3 -left-[35px] bg-white border-[#C5A880]'
                    }`}>
                      {isLatest && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    </span>
                    <div className="bg-[#FAF8F5]/30 hover:bg-[#FAF8F5]/65 border border-[#5F3041]/5 rounded-2xl p-5 transition-all duration-300 hover:shadow-xs flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <h4 className={`text-xs font-bold font-sans tracking-wider uppercase ${isLatest ? 'text-[#5F3041]' : 'text-gray-700'}`}>
                          {event.stage}
                        </h4>
                        <span className="text-[9px] font-semibold text-gray-400 font-sans uppercase tracking-wider">
                          {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-sans font-medium">{event.note}</p>
                      {event.image && (
                        <div onClick={() => setActiveLightboxImage(event.image || null)}
                          className="relative w-32 aspect-square rounded-2xl overflow-hidden border border-[#5F3041]/10 mt-2 cursor-zoom-in group">
                          <Image src={event.image} alt={event.stage} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Progress modal */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-[#3D0C1F]/45 backdrop-blur-md z-[200] flex items-center justify-center p-4 select-none">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-[0_25px_60px_rgba(61,12,31,0.18)] border border-[#5F3041]/10 flex flex-col">
              <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-[#FAF8F5]/80">
                <div className="flex flex-col text-left">
                  <h2 className="text-base font-bold text-gray-900 font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Post Workbench Update
                  </h2>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Bespoke bench log</p>
                </div>
                <button type="button" onClick={() => setShowProgressModal(false)}
                  className="text-gray-400 hover:text-[#5F3041] cursor-pointer p-2 hover:bg-[#5F3041]/5 rounded-full border-none bg-transparent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handlePostProgress} className="p-7 flex flex-col gap-5 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">Crafting Stage *</label>
                  <select required value={newStage} onChange={(e) => setNewStage(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#5F3041]/10 rounded-xl px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-[#5F3041]/35 font-sans cursor-pointer">
                    {STAGES.map(stg => <option key={stg} value={stg}>{stg}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">Progress Note *</label>
                  <textarea required rows={4}
                    placeholder="Describe current crafting status..."
                    value={newNote} onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#5F3041]/10 rounded-xl p-4 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5F3041]/35 resize-none font-sans" />
                </div>
                <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowProgressModal(false)}
                    className="px-4 py-2.5 border border-gray-200 text-[10px] font-bold tracking-widest rounded uppercase cursor-pointer hover:bg-gray-50 text-gray-500 font-sans bg-transparent">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingProgress}
                    className="bg-[#5F3041] text-[#E9D7C3] hover:text-white hover:bg-[#4A2231] text-[10px] font-bold tracking-widest px-5 py-2.5 rounded uppercase cursor-pointer disabled:opacity-50 font-sans border-none">
                    {submittingProgress ? 'Posting...' : 'Post Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {activeLightboxImage && (
          <div onClick={() => setActiveLightboxImage(null)}
            className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out select-none">
            <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
              <Image src={activeLightboxImage} alt="Fullscreen" fill className="object-contain" />
            </div>
            <button onClick={() => setActiveLightboxImage(null)}
              className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full border-none bg-transparent cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ─────────────── DASHBOARD / LIST VIEW ─────────────── */
  const displayedOrders = listTab === 'active' ? activeOrders : historyOrders

  return (
    <div className="flex-1 w-full mx-auto px-6 sm:px-14 py-10 max-w-5xl select-none">
      <div className="flex flex-col gap-8">

        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
            My Orders
          </h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans font-bold">
            Bespoke jewelry order workspace
          </p>
        </div>

        {/* 3-column stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-[#5F3041]/10 p-7 rounded-[2rem] shadow-[0_8px_30px_rgba(61,12,31,0.02)] flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest font-sans">Active Orders</span>
              <span className="text-3xl font-bold text-[#5F3041] font-serif">{activeOrders.length}</span>
              <span className="text-[9px] text-gray-400 font-sans">In progress or pending</span>
            </div>
            <Activity className="w-9 h-9 text-[#5F3041]/10" />
          </div>

          <div className="bg-white border border-[#5F3041]/10 p-7 rounded-[2rem] shadow-[0_8px_30px_rgba(61,12,31,0.02)] flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest font-sans">Completed</span>
              <span className="text-3xl font-bold text-emerald-700 font-serif">{orders.filter(o => o.status === 'completed').length}</span>
              <span className="text-[9px] text-gray-400 font-sans">Delivered & confirmed</span>
            </div>
            <CheckCircle2 className="w-9 h-9 text-emerald-500/10" />
          </div>

          <div className="bg-white border border-[#5F3041]/10 p-7 rounded-[2rem] shadow-[0_8px_30px_rgba(61,12,31,0.02)] flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest font-sans">Total Earned</span>
              <span className="text-2xl font-bold text-gray-800 font-serif">Rs. {totalEarned.toLocaleString()}</span>
              <span className="text-[9px] text-gray-400 font-sans">From completed commissions</span>
            </div>
            <Wallet className="w-9 h-9 text-gray-400/10" />
          </div>
        </div>

        {/* Toggle tab */}
        <div className="flex justify-center">
          <div className="inline-flex gap-1.5 bg-[#FAF8F5] border border-gray-100 p-1.5 rounded-full shadow-inner">
            <button
              onClick={() => setListTab('active')}
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                listTab === 'active'
                  ? 'bg-[#5F3041] text-[#E9D7C3] shadow-sm'
                  : 'bg-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Ongoing ({activeOrders.length})
            </button>
            <button
              onClick={() => setListTab('history')}
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                listTab === 'history'
                  ? 'bg-[#5F3041] text-[#E9D7C3] shadow-sm'
                  : 'bg-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History ({historyOrders.length})
            </button>
          </div>
        </div>

        {/* Orders list */}
        <div className="bg-white border border-[#5F3041]/10 p-8 sm:p-10 rounded-[2.5rem] flex flex-col gap-6 shadow-[0_15px_45px_rgba(61,12,31,0.02)]">
          <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase font-sans border-b border-gray-100 pb-4">
            {listTab === 'active' ? 'Ongoing Orders' : 'Order History'}
          </h3>

          {displayedOrders.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              {listTab === 'active'
                ? <Package className="w-9 h-9 text-[#5F3041]/20" />
                : <History className="w-9 h-9 text-[#5F3041]/20" />
              }
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest font-sans">
                {listTab === 'active' ? 'No active orders yet.' : 'No order history found.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayedOrders.map((o) => {
                const pct = getProgressPercent(o)
                const label = getProgressLabel(o)
                return (
                  <div
                    key={o._id}
                    onClick={() => setSelectedOrderId(o._id)}
                    className="border border-[#5F3041]/8 hover:border-[#5F3041]/25 p-6 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-300 bg-[#FAF8F5]/20 hover:bg-[#FAF8F5]/50 flex flex-col gap-4"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-800 font-sans tracking-wide truncate">
                          {o.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 line-clamp-1 font-sans leading-relaxed">
                          {o.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {getStatusPill(o.status)}
                        <span className="text-sm font-bold text-gray-800 font-serif">
                          Rs. {o.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Horizontal progress bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest font-sans">
                          {label}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 font-sans">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            o.status === 'completed'
                              ? 'bg-emerald-500'
                              : o.status === 'cancelled'
                              ? 'bg-rose-400'
                              : 'bg-gradient-to-r from-[#5F3041] to-[#C5A880]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom buyer row */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-[#FAF8F5]">
                        <Image src={o.buyerId.avatar || '/buyersignup.png'} alt={o.buyerId.firstName} fill className="object-cover" />
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider font-sans">
                        {o.buyerId.firstName} {o.buyerId.lastName}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
