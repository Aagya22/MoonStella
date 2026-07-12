'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import api from '@/lib/api/axios'
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft,
  FileText,
  DollarSign,
  Undo2,
  Lock
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
  }
  sellerId: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
    email?: string
    bio?: string
    location?: string
  }
  title: string
  description: string
  budget: number
  status: string
  currentStage: string
  timeline: TimelineEvent[]
  createdAt: string
  updatedAt: string
}

export default function AdminDisputesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const fetchDisputedOrders = async () => {
    try {
      const res = await api.get('/api/admin/orders/disputed')
      setOrders(res.data?.data || res.data)
    } catch (e) {
      console.error('Failed to load disputed orders:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDisputedOrders()
  }, [])

  const handleResolve = async (id: string, action: 'complete' | 'refund') => {
    const term = action === 'complete' ? 'force-complete and release payment' : 'cancel and refund'
    if (!window.confirm(`Are you sure you want to ${term} this order?`)) return

    try {
      await api.patch(`/api/admin/orders/${id}/resolve`, { action })
      alert(`Dispute resolved! Action: ${action} registered.`)
      setSelectedOrderId(null)
      fetchDisputedOrders()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve dispute')
    }
  }

  const selectedOrder = orders.find((o) => o._id === selectedOrderId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs text-[#5F3041]/75 font-sans uppercase tracking-widest">
        Loading Dispute Registry...
      </div>
    )
  }

  return (
    <div className="flex-1 w-full text-left select-none font-sans">
      
      {selectedOrder ? (
        /* DISPUTE DETAILED AUDIT PANEL */
        <div className="bg-white border border-[#5F3041]/10 p-8 sm:p-12 rounded-[2.5rem] flex flex-col gap-8 shadow-[0_20px_50px_rgba(61,12,31,0.03)] relative overflow-hidden">
          
          {/* Back trigger */}
          <button
            onClick={() => setSelectedOrderId(null)}
            className="self-start text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#5F3041] transition-colors flex items-center gap-1 border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dispute Board
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-100 pb-7 gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 tracking-wide font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Dispute Audit: {selectedOrder.title}
                </h2>
                <span className="text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase select-none">
                  <AlertCircle className="w-3 h-3" />
                  Disputed Delivery
                </span>
              </div>
              
              <div className="flex gap-2 bg-[#FAF8F5] border border-gray-100 p-4 rounded-2xl max-w-2xl">
                <FileText className="w-4 h-4 text-[#5F3041]/50 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                  {selectedOrder.description}
                </p>
              </div>
            </div>

            {/* Price Plaque */}
            <div className="flex flex-col md:items-end gap-1 shrink-0 bg-gradient-to-br from-[#FAF8F5] to-white border border-[#E9D7C3]/50 p-5 rounded-2xl min-w-[200px] shadow-2xs">
              <span className="text-[9px] font-extrabold text-gray-450 tracking-wider uppercase">
                Held Order Escrow
              </span>
              <span className="text-lg font-bold text-[#5F3041] font-serif">
                Rs. {selectedOrder.budget.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Resolve Dispute Action Banner */}
          <div className="bg-rose-50/50 border border-rose-150 p-6 rounded-[2rem] flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-left">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Administrative Resolution Options
              </h4>
              <p className="text-[10px] text-rose-800 leading-relaxed">
                As an administrator, audit the artisan's workbench timeline notes and progress timestamps below. You can force-complete the transaction (transferring budget to the artisan) or cancellation (refunding the buyer).
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleResolve(selectedOrder._id, 'complete')}
                className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all border-none flex items-center gap-1.5 shadow-xs"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm Delivery (Release Escrow)
              </button>
              <button
                onClick={() => handleResolve(selectedOrder._id, 'refund')}
                className="bg-white hover:bg-rose-50 border border-rose-250 text-rose-700 px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                <Undo2 className="w-3.5 h-3.5" />
                Refund Client (Cancel Order)
              </button>
            </div>
          </div>

          {/* Participant Plaque Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Buyer contact */}
            <div className="flex items-center gap-4 bg-[#FAF8F5]/30 border border-[#5F3041]/5 p-5 rounded-2xl">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-white shadow-2xs">
                <Image src={selectedOrder.buyerId?.avatar || '/buyersignup.png'} alt={selectedOrder.buyerId?.firstName} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Disputing Client
                </h4>
                <span className="text-xs font-bold text-gray-800 block mt-0.5 truncate">
                  {selectedOrder.buyerId?.firstName} {selectedOrder.buyerId?.lastName}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">
                  {selectedOrder.buyerId?.email}
                </span>
              </div>
            </div>

            {/* Seller contact */}
            <div className="flex items-center gap-4 bg-[#FAF8F5]/30 border border-[#5F3041]/5 p-5 rounded-2xl">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-white shadow-2xs">
                <Image src={selectedOrder.sellerId?.avatar || '/buyersignup.png'} alt={selectedOrder.sellerId?.firstName} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Artisan / Jeweler
                </h4>
                <span className="text-xs font-bold text-gray-800 block mt-0.5 truncate">
                  {selectedOrder.sellerId?.firstName} {selectedOrder.sellerId?.lastName}
                </span>
                <span className="text-[10px] text-gray-405 block truncate">
                  Studio Location: {selectedOrder.sellerId?.location || 'Kathmandu, Nepal'}
                </span>
              </div>
            </div>

          </div>

          {/* Audit Timeline */}
          <div className="flex flex-col gap-6 pt-2">
            <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100 pb-2.5">
              Artisan Workbench Audit Trail
            </h3>

            <div className="relative pl-7 border-l-2 border-dashed border-[#5F3041]/15 flex flex-col gap-7 ml-3 py-2">
              {selectedOrder.timeline.map((event, idx) => {
                const isLatest = idx === selectedOrder.timeline.length - 1
                return (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[37px] top-2 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shadow-xs transition-all ${
                      isLatest ? 'bg-rose-500 border-white ring-4 ring-rose-500/15' : 'bg-white border-[#C5A880] w-3.5 h-3.5 -left-[35px]'
                    }`}>
                    </span>

                    <div className="bg-[#FAF8F5]/30 border border-[#5F3041]/5 rounded-2xl p-5 shadow-2xs flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <h4 className="text-xs font-bold tracking-wider uppercase text-gray-800">
                          {event.stage}
                        </h4>
                        <span className="text-[9px] font-semibold text-gray-450 uppercase tracking-wider">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        {event.note}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      ) : (
        /* DISPUTES OVERVIEW BOARD */
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
              Disputes Control Board
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Mediate delivery disputes and auditing escrow payments
            </p>
          </div>

          <div className="bg-white border border-[#5F3041]/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_15px_45px_rgba(61,12,31,0.02)] min-h-[350px]">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase font-sans border-b border-gray-100 pb-3.5">
              Active Delivery Disputes ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                  Zero active dispute tickets reported.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                {orders.map((o) => (
                  <div 
                    key={o._id} 
                    onClick={() => setSelectedOrderId(o._id)}
                    className="border border-rose-200/40 hover:border-rose-400/80 p-6 rounded-3xl cursor-pointer hover:shadow-md transition-all duration-300 bg-rose-50/5 hover:bg-rose-50/15 flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-xs font-bold text-gray-800 tracking-wide truncate max-w-[170px]">
                          {o.title}
                        </h4>
                        <span className="text-[8px] font-extrabold bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          DISPUTE
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-450 line-clamp-2 leading-relaxed">
                        {o.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-rose-100/50 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest">
                          Client
                        </span>
                        <span className="text-[10px] text-[#5F3041] font-bold truncate max-w-[130px]">
                          {o.buyerId?.firstName} {o.buyerId?.lastName}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-800 font-serif">
                        Rs. {o.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}
