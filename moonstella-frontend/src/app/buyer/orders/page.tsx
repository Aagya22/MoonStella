'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import api from '@/lib/api/axios'
import { useBuyerContext } from '../BuyerContext'
import OrderMilestoneSteps from '@/app/components/shared/OrderMilestoneSteps'
import {
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Activity,
  Wallet,
  Gem,
  Star,
  Plus
} from 'lucide-react'

interface TimelineEvent {
  stage: string
  note: string
  image?: string | null
  createdAt: string
}

interface Order {
  _id: string
  buyerId: any
  sellerId: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
    bio?: string
    location?: string
  }
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

export default function BuyerOrdersPage() {
  const { user } = useBuyerContext()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ongoing' | 'completed' | 'cancelled'>('ongoing')

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewImages, setReviewImages] = useState<string[]>([])
  const [uploadingReviewImage, setUploadingReviewImage] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [orderReview, setOrderReview] = useState<any | null>(null)

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders/buyer')
      if (res.data && res.data.success) {
        setOrders(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load buyer orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadOrders()
  }, [user])

  // Fetch the review for a completed order when its detail view opens
  useEffect(() => {
    setOrderReview(null)
    if (!selectedOrderId) return
    const order = orders.find(o => o._id === selectedOrderId)
    if (!order || order.status !== 'completed') return
    api.get(`/api/orders/${selectedOrderId}/review`)
      .then(res => { if (res.data?.success) setOrderReview(res.data.data) })
      .catch(() => {})
  }, [selectedOrderId, orders])

  const selectedOrder = orders.find((o) => o._id === selectedOrderId)

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    try {
      const res = await api.patch(`/api/orders/${orderId}/cancel`)
      if (res.data?.success) { alert('Order cancelled.'); loadOrders() }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  const handleConfirmReceipt = async (orderId: string, received: boolean) => {
    const msg = received
      ? 'Confirming receipt will mark this order as complete. Continue?'
      : 'Confirming you did not receive it will notify the artisan. Continue?'
    if (!window.confirm(msg)) return
    try {
      const res = await api.patch(`/api/orders/${orderId}/confirm-receipt`, { received })
      if (res.data?.success) {
        if (received) {
          setShowReviewModal(true)
        } else {
          alert('Delivery issue reported.')
        }
        loadOrders()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const input = e.target
    const selected = files.slice(0, 4 - reviewImages.length)
    setUploadingReviewImage(true)
    try {
      for (const file of selected) {
        const formData = new FormData()
        formData.append('image', file)
        const res = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (res.data?.success && res.data.data?.url) {
          setReviewImages(prev => [...prev, res.data.data.url])
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploadingReviewImage(false)
      input.value = ''
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedOrderId || reviewRating === 0) return
    setSubmittingReview(true)
    try {
      const res = await api.post(`/api/orders/${selectedOrderId}/review`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        images: reviewImages,
      })
      if (res.data?.success) {
        setOrderReview(res.data.data)
        setShowReviewModal(false)
        setReviewRating(0)
        setReviewComment('')
        setReviewImages([])
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const getStatusPill = (status: string) => {
    const map: Record<string, { cls: string; Icon: React.ElementType }> = {
      pending:   { cls: 'bg-amber-50 text-amber-800 border-amber-200/50',    Icon: Clock },
      accepted:  { cls: 'bg-sky-50 text-sky-800 border-sky-200/50',          Icon: Package },
      crafting:  { cls: 'bg-[#FAF0F3] text-[#5F3041] border-[#5F3041]/15',   Icon: Clock },
      shipped:   { cls: 'bg-violet-50 text-violet-800 border-violet-200/50', Icon: Package },
      completed: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200/50', Icon: CheckCircle2 },
      cancelled: { cls: 'bg-rose-50 text-rose-800 border-rose-200/50',       Icon: XCircle },
    }
    const { cls, Icon } = map[status] ?? map.pending
    return (
      <span className={`text-[9px] font-bold tracking-wider uppercase border px-2.5 py-1 rounded-full flex items-center gap-1 font-sans select-none shrink-0 ${cls}`}>
        <Icon className="w-2.5 h-2.5" />
        {status}
      </span>
    )
  }

  const activeOrders    = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
  const completedOrders = orders.filter(o => o.status === 'completed')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')
  const totalInvestment = orders
    .filter(o => o.status !== 'cancelled')
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
    const orderImage =
      selectedOrder.postId?.images?.[0] ||
      [...selectedOrder.timeline].reverse().find(e => e.image)?.image ||
      null
    return (
      <div className="flex-1 w-full mx-auto px-6 sm:px-10 py-6 max-w-6xl select-none">
        <div className="flex flex-col gap-4">

          {/* Back */}
          <button onClick={() => setSelectedOrderId(null)}
            className="self-start text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#5F3041] transition-colors flex items-center gap-1 border-none bg-transparent cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

            {/* Left: image + artisan */}
            <div className="lg:col-span-2 flex flex-col gap-5 lg:sticky lg:top-20">
              {orderImage ? (
                <div onClick={() => setActiveLightboxImage(orderImage)}
                  className="relative w-full aspect-square rounded-[2rem] overflow-hidden border border-[#C5A880]/30 shadow-[0_18px_45px_rgba(61,12,31,0.12)] cursor-zoom-in group bg-white">
                  <Image src={orderImage} alt={selectedOrder.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-[2rem] bg-gradient-to-br from-[#FAF8F5] to-[#FAF0F3] border border-[#C5A880]/20 flex flex-col items-center justify-center gap-2">
                  <Gem className="w-10 h-10 text-[#5F3041]/20" />
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest font-sans">No image yet</span>
                </div>
              )}

              {/* Artisan card */}
              <div className="bg-white border border-[#5F3041]/10 rounded-[1.75rem] p-5 flex items-center gap-4 shadow-[0_10px_30px_rgba(61,12,31,0.05)] text-left">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#C5A880]/40 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white">
                  <Image src={selectedOrder.sellerId.avatar || '/buyersignup.png'} alt={selectedOrder.sellerId.firstName} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest font-sans block">Artisan</span>
                  <h4 className="text-xs font-extrabold text-gray-800 tracking-wider uppercase font-sans truncate">
                    {selectedOrder.sellerId.firstName} {selectedOrder.sellerId.lastName}
                  </h4>
                  <p className="text-[10px] text-gray-400 italic mt-0.5 font-sans line-clamp-1">
                    {selectedOrder.sellerId.bio || 'Master Jeweler & Craftsperson'}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-[#5F3041] font-extrabold uppercase tracking-widest font-sans">
                    <MapPin className="w-3 h-3" />
                    {selectedOrder.sellerId.location || 'Kathmandu, Nepal'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: order details */}
            <div className="lg:col-span-3 bg-white border border-[#5F3041]/10 rounded-[2rem] p-6 sm:p-8 flex flex-col gap-5 shadow-[0_15px_45px_rgba(61,12,31,0.06)] text-left">

              {/* Status + date */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {getStatusPill(selectedOrder.status)}
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                  Placed {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Title + description */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-wide font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {selectedOrder.title}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed font-sans font-medium whitespace-pre-line mt-2">
                  {selectedOrder.description}
                </p>
              </div>

              {/* Value + actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FAF8F5]/70 border border-[#C5A880]/20 rounded-2xl p-5">
                <div>
                  <span className="text-[8px] font-extrabold text-[#C5A880] tracking-[0.25em] font-sans uppercase block">Order Value</span>
                  <span className="text-2xl font-bold text-[#5F3041] font-serif">Rs. {selectedOrder.budget.toLocaleString()}</span>
                </div>
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <button onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest font-sans bg-transparent cursor-pointer transition-all">
                    Cancel Order
                  </button>
                )}
              </div>

              {/* Order milestone tracker */}
              <div className="bg-[#FAF8F5]/50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-3">
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest font-sans">
                  Order Progress
                </span>
                <OrderMilestoneSteps status={selectedOrder.status} variant="detailed" />
              </div>

              {/* Review CTA — completed order, not yet reviewed */}
              {selectedOrder.status === 'completed' && !orderReview && (
                <div className="bg-[#FAF0F3]/40 border border-[#5F3041]/15 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide font-sans flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#C5A880]" /> How was your experience?
                    </h4>
                    <p className="text-[10px] text-gray-400 font-sans">
                      Share your thoughts and photos of the finished piece.
                    </p>
                  </div>
                  <button onClick={() => setShowReviewModal(true)}
                    className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] text-[9px] font-bold tracking-widest px-4 py-2.5 rounded-xl uppercase transition-all border-none cursor-pointer"
                    style={{ fontFamily: 'var(--font-montserrat)' }}>
                    Leave a Review
                  </button>
                </div>
              )}

              {/* Submitted review */}
              {orderReview && (
                <div className="bg-[#FAF8F5]/60 border border-[#C5A880]/25 p-5 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest font-sans">Your Review</h4>
                    <span className="text-[9px] text-gray-400 font-sans uppercase tracking-wider">
                      {new Date(orderReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= orderReview.rating ? 'text-[#C5A880] fill-[#C5A880]' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  {orderReview.comment && (
                    <p className="text-xs text-gray-600 leading-relaxed font-sans">{orderReview.comment}</p>
                  )}
                  {orderReview.images?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {orderReview.images.map((img: string, i: number) => (
                        <div key={i} onClick={() => setActiveLightboxImage(img)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#C5A880]/30 cursor-zoom-in">
                          <Image src={img} alt={`Review photo ${i + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

          {/* Delivery receipt confirmation */}
          {(selectedOrder.currentStage === 'Dispatched & On the Way' || selectedOrder.currentStage === 'Delivery Issue Reported') &&
            selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
            <div className="bg-[#FAF0F3]/40 border border-[#5F3041]/15 p-5 rounded-2xl flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5 font-sans">
                  <AlertCircle className="w-4 h-4 text-[#5F3041]" />
                  Have you received your order?
                </h4>
                <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                  The artisan has dispatched your order. Please confirm delivery below.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => handleConfirmReceipt(selectedOrder._id, true)}
                  className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all border-none shadow-xs"
                  style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Yes, I received it
                </button>
                <button onClick={() => handleConfirmReceipt(selectedOrder._id, false)}
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all"
                  style={{ fontFamily: 'var(--font-montserrat)' }}>
                  No, I did not
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="flex flex-col gap-4 w-full">
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
          </div>
        </div>

        {/* Review modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-[#3D0C1F]/45 backdrop-blur-md z-[200] flex items-center justify-center p-4 select-none">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-[0_25px_60px_rgba(61,12,31,0.18)] border border-[#5F3041]/10 flex flex-col overflow-hidden">
              <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-[#FAF8F5]/80">
                <div className="flex flex-col text-left">
                  <h2 className="text-base font-bold text-gray-900 font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Share Your Experience
                  </h2>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                    Review this bespoke piece
                  </p>
                </div>
                <button type="button" onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-[#5F3041] cursor-pointer p-2 hover:bg-[#5F3041]/5 rounded-full border-none bg-transparent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="p-7 flex flex-col gap-5 text-left">
                {/* Star rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">Rating *</label>
                  <div className="flex items-center gap-1" onMouseLeave={() => setReviewHover(0)}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)} onMouseEnter={() => setReviewHover(s)}
                        className="border-none bg-transparent cursor-pointer p-0.5">
                        <Star className={`w-7 h-7 transition-colors duration-150 ${
                          s <= (reviewHover || reviewRating) ? 'text-[#C5A880] fill-[#C5A880]' : 'text-gray-200'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">Your Review</label>
                  <textarea rows={4}
                    placeholder="Tell others about the craftsmanship, quality, and experience..."
                    value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#5F3041]/10 rounded-xl p-4 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5F3041]/35 resize-none font-sans" />
                </div>

                {/* Photos */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">
                    Photos ({reviewImages.length}/4)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {reviewImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#C5A880]/30">
                        <Image src={img} alt={`Upload ${i + 1}`} fill className="object-cover" />
                        <button type="button"
                          onClick={() => setReviewImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/85 text-white rounded-full w-5 h-5 flex items-center justify-center border-none cursor-pointer text-[10px] leading-none">
                          ×
                        </button>
                      </div>
                    ))}
                    {reviewImages.length < 4 && (
                      <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#C5A880]/40 hover:border-[#5F3041]/50 flex items-center justify-center cursor-pointer text-gray-400 hover:text-[#5F3041] transition-colors bg-[#FAF8F5]/50">
                        {uploadingReviewImage
                          ? <span className="text-[8px] font-bold uppercase tracking-wider animate-pulse">...</span>
                          : <Plus className="w-5 h-5" />
                        }
                        <input type="file" accept="image/*" multiple className="hidden"
                          onChange={handleReviewImageUpload} disabled={uploadingReviewImage} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2.5 border border-gray-200 text-[10px] font-bold tracking-widest rounded-xl uppercase cursor-pointer hover:bg-gray-50 text-gray-500 font-sans bg-transparent">
                    Maybe Later
                  </button>
                  <button type="button" onClick={handleSubmitReview}
                    disabled={submittingReview || uploadingReviewImage || reviewRating === 0}
                    className="bg-[#5F3041] text-[#E9D7C3] hover:text-white hover:bg-[#4A2231] text-[10px] font-bold tracking-widest px-5 py-2.5 rounded-xl uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans border-none">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {activeLightboxImage && (
          <div onClick={() => setActiveLightboxImage(null)}
            className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out select-none">
            <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
              <Image src={activeLightboxImage} alt="Fullscreen View" fill className="object-contain" />
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

  /* Shared bespoke order card — content left, vertical timeline right */
  const renderOrderCard = (o: Order) => (
    <div
      key={o._id}
      onClick={() => setSelectedOrderId(o._id)}
      className="group relative overflow-hidden bg-white border border-[#5F3041]/10 hover:border-[#C5A880]/60 rounded-[1.75rem] shadow-[0_10px_35px_rgba(61,12,31,0.06)] hover:shadow-[0_26px_55px_rgba(61,12,31,0.14)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex h-full min-h-[240px]"
    >
      {/* Left: content */}
      <div className="flex-1 min-w-0 p-6 flex flex-col text-left gap-3">
        <div className="flex items-center justify-between gap-2">
          {getStatusPill(o.status)}
          <ArrowRight className="w-4 h-4 text-[#5F3041] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
        </div>

        <div>
          <h4 className="text-xl font-bold text-gray-900 font-serif tracking-wide line-clamp-1" style={{ fontFamily: 'var(--font-playfair)' }}>
            {o.title}
          </h4>
          <p className="text-[10px] text-gray-400 line-clamp-2 font-sans leading-relaxed mt-1">
            {o.description}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div>
            <span className="text-[8px] font-extrabold text-[#C5A880] uppercase tracking-[0.25em] font-sans block">Order Value</span>
            <span className="text-2xl font-bold text-[#5F3041] font-serif">Rs. {o.budget.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-dashed border-[#C5A880]/25">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#C5A880]/40 shrink-0 bg-[#FAF8F5]">
              <Image src={o.sellerId.avatar || '/buyersignup.png'} alt={o.sellerId.firstName} fill className="object-cover" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[8px] text-gray-400 uppercase tracking-wider font-sans">Artisan</span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider font-sans truncate">
                {o.sellerId.firstName} {o.sellerId.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: vertical timeline rail */}
      <div className="w-[150px] shrink-0 bg-gradient-to-b from-[#FAF8F5] to-[#FAF0F3]/70 border-l border-dashed border-[#C5A880]/25 p-5 flex flex-col group-hover:from-[#FAF0F3]/60 group-hover:to-[#FAF0F3] transition-colors duration-300">
        <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-[0.2em] font-sans mb-3">Progress</span>
        <div className="flex-1 min-h-0">
          <OrderMilestoneSteps status={o.status} orientation="vertical" />
        </div>
      </div>
    </div>
  )

  /* ─────────────── ORDER LISTING VIEW ─────────────── */
  const filteredOrders =
    filter === 'ongoing' ? activeOrders : filter === 'completed' ? completedOrders : cancelledOrders

  return (
    <div className="flex-1 w-full mx-auto px-6 sm:px-10 py-6 max-w-[1500px] select-none">
      <div className="flex flex-col gap-6">

        {/* Header row: title left, stats right */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shrink-0">
          <div className="flex flex-col gap-1 text-left">
            <span className="flex items-center gap-2 text-[9px] font-extrabold text-[#C5A880] uppercase tracking-[0.35em] font-sans">
              <Gem className="w-3 h-3" /> Bespoke Atelier
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
              My Orders
            </h1>
            <p className="text-[10px] text-gray-400 font-sans tracking-wide">
              Track every commission from brief to delivery.
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-stretch gap-3">
            <div className="group bg-white border border-[#5F3041]/10 hover:border-[#C5A880]/60 rounded-2xl px-5 py-3.5 flex items-center gap-3.5 shadow-[0_8px_25px_rgba(61,12,31,0.05)] hover:shadow-[0_14px_35px_rgba(61,12,31,0.12)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-[#FAF0F3] border border-[#5F3041]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Activity className="w-5 h-5 text-[#5F3041]" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-2xl font-bold text-[#5F3041] font-serif">{activeOrders.length}</span>
                <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest font-sans mt-1">Active</span>
              </div>
            </div>

            <div className="group bg-white border border-[#5F3041]/10 hover:border-emerald-300/60 rounded-2xl px-5 py-3.5 flex items-center gap-3.5 shadow-[0_8px_25px_rgba(61,12,31,0.05)] hover:shadow-[0_14px_35px_rgba(61,12,31,0.12)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-2xl font-bold text-emerald-700 font-serif">{orders.filter(o => o.status === 'completed').length}</span>
                <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest font-sans mt-1">Completed</span>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-[#5F3041] to-[#3D0C1F] rounded-2xl px-5 py-3.5 flex items-center gap-3.5 shadow-[0_14px_35px_rgba(61,12,31,0.25)] hover:shadow-[0_20px_45px_rgba(61,12,31,0.35)] hover:-translate-y-0.5 transition-all duration-300">
              <Gem className="absolute -right-2 -bottom-2 w-14 h-14 text-white/5 rotate-12" />
              <div className="w-10 h-10 rounded-full bg-white/10 border border-[#E9D7C3]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Wallet className="w-5 h-5 text-[#E9D7C3]" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-xl font-bold text-[#E9D7C3] font-serif">Rs. {totalInvestment.toLocaleString()}</span>
                <span className="text-[8px] font-extrabold text-[#E9D7C3]/60 uppercase tracking-widest font-sans mt-1">Total Investment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter selection */}
        <div className="flex flex-wrap items-center gap-2.5">
          {([
            { key: 'ongoing' as const, label: 'Ongoing', Icon: Activity, count: activeOrders.length },
            { key: 'completed' as const, label: 'Completed', Icon: CheckCircle2, count: completedOrders.length },
            { key: 'cancelled' as const, label: 'Cancelled', Icon: XCircle, count: cancelledOrders.length },
          ]).map(({ key, label, Icon, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-sans cursor-pointer transition-all duration-300 flex items-center gap-2 border ${
                filter === key
                  ? 'bg-[#5F3041] text-[#E9D7C3] border-[#5F3041] shadow-[0_10px_25px_rgba(61,12,31,0.25)]'
                  : 'bg-white text-gray-400 border-[#5F3041]/10 hover:text-[#5F3041] hover:border-[#C5A880]/50 hover:shadow-[0_8px_20px_rgba(61,12,31,0.08)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                filter === key ? 'bg-white/15 text-[#E9D7C3]' : 'bg-[#FAF0F3] text-[#5F3041]'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white/60 border border-dashed border-[#C5A880]/40 rounded-[2rem] py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FAF0F3] flex items-center justify-center">
              <Gem className="w-6 h-6 text-[#5F3041]/40" />
            </div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest font-sans">
              {filter === 'ongoing'
                ? 'No ongoing orders at the moment.'
                : filter === 'completed'
                ? 'No completed orders yet.'
                : 'No cancelled orders.'}
            </p>
            {filter === 'ongoing' && (
              <p className="text-[10px] text-gray-400 font-sans italic">
                Commission a bespoke piece from an artisan's post to begin.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredOrders.map(renderOrderCard)}
          </div>
        )}

      </div>
    </div>
  )
}
