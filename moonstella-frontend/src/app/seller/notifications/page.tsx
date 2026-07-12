'use client'

import React from 'react'
import { useSellerContext } from '../SellerContext'
import { MessageCircle, Package, Heart, UserPlus, Star, Bell, Check, Trash2, CheckCheck } from 'lucide-react'

const typeMeta: Record<string, { Icon: React.ElementType; cls: string }> = {
  message: { Icon: MessageCircle, cls: 'bg-sky-50 text-sky-600 border-sky-200/50' },
  order:   { Icon: Package,       cls: 'bg-[#FAF0F3] text-[#5F3041] border-[#5F3041]/15' },
  like:    { Icon: Heart,         cls: 'bg-rose-50 text-rose-500 border-rose-200/50' },
  follow:  { Icon: UserPlus,      cls: 'bg-amber-50 text-amber-600 border-amber-200/50' },
  review:  { Icon: Star,          cls: 'bg-[#FAF8F5] text-[#C5A880] border-[#C5A880]/40' },
  system:  { Icon: Bell,          cls: 'bg-gray-50 text-gray-500 border-gray-200' },
}

export default function SellerNotificationsPage() {
  const {
    notifications,
    unreadNotificationsCount,
    toggleNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useSellerContext()

  const handleClearAll = () => {
    if (notifications.length === 0) return
    if (window.confirm('Clear all notifications? This cannot be undone.')) {
      clearAllNotifications()
    }
  }

  return (
    <div className="flex-1 w-full mx-auto px-6 sm:px-10 py-8 max-w-3xl select-none">
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
              Notifications
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em] font-sans font-bold">
              {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              disabled={unreadNotificationsCount === 0}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#5F3041] border border-[#5F3041]/15 hover:bg-[#5F3041]/5 px-3.5 py-2 rounded-full cursor-pointer bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-sans"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-600 border border-rose-200 hover:bg-rose-50 px-3.5 py-2 rounded-full cursor-pointer bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-sans"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="bg-white/60 border border-dashed border-[#C5A880]/40 rounded-[2rem] py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FAF0F3] flex items-center justify-center">
              <Bell className="w-6 h-6 text-[#5F3041]/40" />
            </div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest font-sans">
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {notifications.map((n) => {
              const meta = typeMeta[n.type] || typeMeta.system
              const Icon = meta.Icon
              return (
                <div
                  key={n.id}
                  onClick={() => toggleNotification(n.id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    n.read
                      ? 'bg-white border-gray-100 hover:border-[#C5A880]/50 hover:shadow-[0_10px_25px_rgba(61,12,31,0.05)]'
                      : 'bg-[#FAF0F3]/40 border-[#5F3041]/15 hover:border-[#5F3041]/30 hover:shadow-[0_10px_25px_rgba(61,12,31,0.06)]'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 ${meta.cls}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed font-sans ${n.read ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'}`}>
                      {n.text}
                    </p>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider font-sans">{n.time}</span>
                  </div>
                  {!n.read && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id) }}
                        title="Mark as read"
                        className="opacity-0 group-hover:opacity-100 shrink-0 w-8 h-8 rounded-full border border-[#5F3041]/15 hover:bg-[#5F3041]/5 flex items-center justify-center cursor-pointer bg-white transition-all text-[#5F3041]"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <span className="w-2 h-2 rounded-full bg-[#5F3041] shrink-0" />
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
