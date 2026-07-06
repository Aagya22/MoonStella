'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api/axios'
import { useBuyerContext } from '../BuyerContext'

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

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders/buyer')
      if (res.data && res.data.success) {
        setOrders(res.data.data)
        if (res.data.data.length > 0 && !selectedOrderId) {
          setSelectedOrderId(res.data.data[0]._id)
        }
      }
    } catch (err) {
      console.error('Failed to load buyer orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const selectedOrder = orders.find((o) => o._id === selectedOrderId)

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm('Are you sure you want to cancel this bespoke commission order?')
    if (!confirmed) return

    try {
      const res = await api.patch(`/api/orders/${orderId}/cancel`)
      if (res.data && res.data.success) {
        alert('Order cancelled successfully.')
        loadOrders()
      }
    } catch (err: any) {
      console.error('Failed to cancel order:', err)
      alert(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  const handleConfirmReceipt = async (orderId: string, received: boolean) => {
    try {
      const msg = received
        ? 'Confirming receipt will mark this order as complete. Continue?'
        : 'Confirming you did not receive it will notify the artisan. Continue?'
      if (!window.confirm(msg)) return

      const res = await api.patch(`/api/orders/${orderId}/confirm-receipt`, { received })
      if (res.data && res.data.success) {
        if (received) {
          alert('Receipt confirmed! Order marked as complete.')
        } else {
          alert('Delivery issue reported to the artisan.')
        }
        loadOrders()
      }
    } catch (err: any) {
      console.error('Failed to confirm receipt:', err)
      alert(err.response?.data?.message || 'Failed to update order status')
    }
  }

  const getStatusPill = (status: string) => {
    let styles = 'bg-amber-50 text-amber-700 border-amber-200/60'
    if (status === 'crafting') styles = 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
    if (status === 'completed') styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
    if (status === 'accepted') styles = 'bg-blue-50 text-blue-700 border-blue-200/60'
    if (status === 'cancelled') styles = 'bg-rose-50 text-rose-700 border-rose-200/60'
    return (
      <span className={`text-[9px] font-extrabold tracking-widest uppercase border px-3 py-1 rounded-full ${styles}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs text-gray-500 font-sans uppercase tracking-widest">
        Loading Bespoke Tracker...
      </div>
    )
  }

  return (
    <div className="flex-1 w-full ml-0 mr-auto xl:pl-4 pl-8 pr-12 py-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 select-none max-w-[1440px]">
      
      {/* Sidebar List of Orders */}
      <aside className="w-full flex flex-col gap-5">
        <div className="bg-white border border-[#5F3041]/10 p-6 rounded-3xl flex flex-col gap-6 shadow-[0_4px_20px_rgba(61,12,31,0.01)] min-h-[500px]">
          <h3 className="text-lg font-bold text-gray-805 font-serif border-b border-gray-100 pb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
            My Orders
          </h3>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
            {orders.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#5F3041]/40 border border-[#5F3041]/5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-400 font-sans leading-relaxed max-w-[200px]">
                  No active orders. Navigate to Messages to initiate a bespoke commission with an artisan.
                </p>
              </div>
            ) : (
              orders.map((o) => {
                const isActive = o._id === selectedOrderId
                return (
                  <div
                    key={o._id}
                    onClick={() => setSelectedOrderId(o._id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col gap-2 ${
                      isActive
                        ? 'border-[#5F3041] bg-[#FAF0F3]/30 shadow-xs'
                        : 'border-[#5F3041]/10 bg-white hover:border-[#5F3041]/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-gray-800 tracking-wide line-clamp-1 font-sans">
                        {o.title}
                      </h4>
                      <span className="text-[10px] font-bold text-[#5F3041] font-serif shrink-0">
                        Rs. {o.budget.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-gray-450 font-bold uppercase tracking-wider font-sans">
                        {o.sellerId.firstName} {o.sellerId.lastName}
                      </span>
                      {getStatusPill(o.status)}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </aside>

      {/* Detailed Order view */}
      <main className="w-full">
        {selectedOrder ? (
          <div className="bg-white border border-[#5F3041]/10 p-8 rounded-3xl flex flex-col gap-8 shadow-[0_4px_20px_rgba(61,12,31,0.01)] text-left min-h-[500px]">
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-100 pb-6 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-850 font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {selectedOrder.title}
                  </h2>
                  {getStatusPill(selectedOrder.status)}
                </div>
                <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                  {selectedOrder.description}
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-1.5 shrink-0 bg-[#FAF8F5]/50 border border-gray-100 p-4 rounded-2xl min-w-[200px]">
                <span className="text-[9px] font-extrabold text-gray-450 tracking-wider font-sans uppercase">
                  Agreed Commission Price
                </span>
                <span className="text-lg font-bold text-[#5F3041] font-serif">
                  Rs. {selectedOrder.budget.toLocaleString()}
                </span>
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="text-[9px] font-bold text-rose-600 hover:text-rose-800 hover:underline border-none bg-transparent cursor-pointer font-sans tracking-wider uppercase mt-2"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Seller profile plaque */}
            <div className="flex items-center gap-4 bg-[#FAF0F3]/10 border border-[#5F3041]/5 p-5 rounded-2xl">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white">
                <Image
                  src={selectedOrder.sellerId.avatar || '/buyersignup.png'}
                  alt={selectedOrder.sellerId.firstName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-800 tracking-wide uppercase font-sans">
                  Artisan: {selectedOrder.sellerId.firstName} {selectedOrder.sellerId.lastName}
                </h4>
                <p className="text-[10px] text-gray-450 italic mt-0.5 line-clamp-1 font-sans">
                  {selectedOrder.sellerId.bio || 'Master Jeweler & Craftsperson'}
                </p>
                <p className="text-[9px] text-[#5F3041] font-extrabold uppercase tracking-widest mt-1 font-sans">
                  Location: {selectedOrder.sellerId.location || 'Kathmandu, Nepal'}
                </p>
              </div>
            </div>

            {/* Delivery Receipt Confirmation Banner */}
            {(selectedOrder.currentStage === 'Dispatched & On the Way' || selectedOrder.currentStage === 'Delivery Issue Reported') && 
             selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
              <div className="bg-[#FAF8F5] border border-[#5F3041]/10 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-xs">
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-gray-800 font-sans tracking-wide uppercase">
                    Have you received your bespoke product?
                  </h4>
                  <p className="text-[10px] text-gray-450 leading-relaxed font-sans">
                    The artisan has dispatched your custom commission jewelry item. Please confirm whether it has successfully arrived at your delivery address.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirmReceipt(selectedOrder._id, true)}
                    className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all border-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Yes, I got the product
                  </button>
                  <button
                    onClick={() => handleConfirmReceipt(selectedOrder._id, false)}
                    className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    No, I did not
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Timeline Progress */}
            <div className="flex flex-col gap-6 pt-2">
              <h3 className="text-sm font-extrabold text-gray-450 tracking-widest uppercase font-sans border-b border-gray-50 pb-2">
                Live Workbench Progress Tracker
              </h3>

              <div className="relative pl-6 border-l-2 border-[#5F3041]/10 flex flex-col gap-8 ml-3 py-2 text-left">
                {selectedOrder.timeline.map((event, idx) => {
                  const isLatest = idx === selectedOrder.timeline.length - 1
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline Dot Indicator */}
                      <span
                        className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-3 flex items-center justify-center shadow-xs transition-all ${
                          isLatest
                            ? 'bg-[#5F3041] border-white ring-4 ring-[#5F3041]/15 scale-110'
                            : 'bg-white border-[#5F3041]/30'
                        }`}
                      >
                        {isLatest && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                      </span>

                      {/* Content Card */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <h4 className={`text-xs font-bold font-sans tracking-wide uppercase ${isLatest ? 'text-[#5F3041]' : 'text-gray-700'}`}>
                            {event.stage}
                          </h4>
                          <span className="text-[9px] font-semibold text-gray-400 font-sans">
                            {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed max-w-xl font-sans mt-0.5">
                          {event.note}
                        </p>

                        {/* Progress picture */}
                        {event.image && (
                          <div
                            onClick={() => setActiveLightboxImage(event.image || null)}
                            className="relative w-36 aspect-square rounded-2xl overflow-hidden border border-[#5F3041]/10 bg-[#FAF8F5] mt-2 cursor-zoom-in hover:border-[#5F3041]/30 hover:shadow-sm transition-all duration-300 group"
                          >
                            <Image
                              src={event.image}
                              alt={event.stage}
                              fill
                              className="object-cover group-hover:scale-103 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-[#5F3041]/10 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(61,12,31,0.01)] min-h-[500px]">
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041]/30 mb-3 shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: 'var(--font-montserrat)' }}>No Active Workspace Selection</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed font-sans">
              Choose an order from the list panel to monitor live bench crafting progress updates and artisan status.
            </p>
          </div>
        )}
      </main>

      {/* Lightbox Progress Photo Overlay */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out select-none animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <Image src={activeLightboxImage} alt="Fullscreen View" fill className="object-contain" />
          </div>
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-6 right-6 text-[#E9D7C3] hover:text-white cursor-pointer p-3.5 hover:bg-white/10 rounded-full transition-all border-none bg-transparent flex items-center justify-center"
            title="Close Overlay"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

    </div>
  )
}
