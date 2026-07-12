'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api/axios'
import { 
  Users, 
  Package, 
  Activity, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Calendar 
} from 'lucide-react'

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/admin/analytics')
      setData(res.data?.data || res.data)
    } catch (e) {
      console.error('Failed to load analytics:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs text-[#5F3041]/75 font-sans uppercase tracking-widest">
        Aggregating Analytics...
      </div>
    )
  }

  const stats = data?.stats || { buyersCount: 0, sellersCount: 0, ordersCount: 0, totalVolume: 0 }
  const activities = data?.activities || { recentOrders: [], recentPosts: [], recentUsers: [] }

  return (
    <div className="flex flex-col gap-10 text-left select-none font-sans">
      
      {/* Welcome header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
          Console Overview
        </h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          System statistics & live platform audits
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Buyers */}
        <div className="bg-white border border-[#5F3041]/10 p-6 rounded-[2.5rem] shadow-[0_12px_30px_rgba(61,12,31,0.015)] flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">
              Total Clients
            </span>
            <span className="text-3xl font-bold text-[#5F3041] font-serif">
              {stats.buyersCount}
            </span>
            <span className="text-[9px] text-gray-400 mt-1 font-medium">
              Registered buyer profiles
            </span>
          </div>
          <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Sellers */}
        <div className="bg-white border border-[#5F3041]/10 p-6 rounded-[2.5rem] shadow-[0_12px_30px_rgba(61,12,31,0.015)] flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">
              Active Artisans
            </span>
            <span className="text-3xl font-bold text-[#5F3041] font-serif">
              {stats.sellersCount}
            </span>
            <span className="text-[9px] text-gray-400 mt-1 font-medium">
              Registered jewelers
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#5F3041]/10 p-6 rounded-[2.5rem] shadow-[0_12px_30px_rgba(61,12,31,0.015)] flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">
              Total Commissions
            </span>
            <span className="text-3xl font-bold text-[#5F3041] font-serif">
              {stats.ordersCount}
            </span>
            <span className="text-[9px] text-gray-400 mt-1 font-medium">
              Bespoke commissions log
            </span>
          </div>
          <div className="w-12 h-12 bg-[#FAF0F3] border border-[#5F3041]/10 rounded-2xl flex items-center justify-center text-[#5F3041]">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Total GMV */}
        <div className="bg-white border border-[#5F3041]/10 p-6 rounded-[2.5rem] shadow-[0_12px_30px_rgba(61,12,31,0.015)] flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">
              Delivered GMV
            </span>
            <span className="text-xl font-bold text-gray-800 font-serif">
              Rs. {stats.totalVolume.toLocaleString()}
            </span>
            <span className="text-[9px] text-gray-400 mt-2.5 font-medium">
              Funds cleared to artisans
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Activity Streams Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Registrations List (Switched from Recent Orders) */}
        <div className="bg-white border border-[#5F3041]/10 p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(61,12,31,0.02)] flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              Recent Registrations
            </h3>
            <Link 
              href="/admin/users" 
              className="text-[9px] font-bold text-[#5F3041] hover:underline uppercase tracking-wider transition-colors"
            >
              Show All
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {activities.recentUsers.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-6 text-center">No registrations yet</p>
            ) : (
              activities.recentUsers.slice(0, 5).map((u: any) => (
                <div key={u._id} className="flex justify-between items-center gap-4 bg-[#FAF8F5]/30 border border-[#5F3041]/5 p-4 rounded-2xl hover:bg-[#FAF8F5]/70 transition-all">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 truncate">{u.firstName} {u.lastName}</span>
                    <span className="text-[9px] text-gray-455 font-medium truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#FAF0F3] text-[#5F3041]">
                      {u.role}
                    </span>
                    {u.isSuspended ? (
                      <span className="text-[8px] font-extrabold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full uppercase">Suspended</span>
                    ) : u.role === 'seller' && !u.isApproved ? (
                      <span className="text-[8px] font-extrabold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full uppercase">Pending</span>
                    ) : (
                      <span className="text-[8px] font-extrabold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full uppercase">Active</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Listing Posts */}
        <div className="bg-white border border-[#5F3041]/10 p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(61,12,31,0.02)] flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              Recent Listing Additions
            </h3>
            <Link 
              href="/admin/moderation" 
              className="text-[9px] font-bold text-[#5F3041] hover:underline uppercase tracking-wider transition-colors"
            >
              Show All
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {activities.recentPosts.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-6 text-center">No catalog posts created yet</p>
            ) : (
              activities.recentPosts.slice(0, 5).map((p: any) => (
                <div key={p._id} className="flex justify-between items-center gap-4 bg-[#FAF8F5]/30 border border-[#5F3041]/5 p-4 rounded-2xl hover:bg-[#FAF8F5]/70 transition-all">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide truncate">{p.category}</span>
                    <span className="text-[10px] text-gray-500 line-clamp-1">{p.description}</span>
                    <span className="text-[9px] text-gray-450 font-bold uppercase tracking-wider mt-0.5">
                      By: {p.userId?.firstName} {p.userId?.lastName}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-[#5F3041] font-serif shrink-0 bg-[#FAF0F3] px-3 py-1.5 rounded-full">
                    Rs. {p.budget || p.price || 'Bespoke'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
