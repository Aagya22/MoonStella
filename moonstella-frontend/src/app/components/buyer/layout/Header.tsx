import React from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  user: any
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  notifications: any[]
  toggleNotification: (id: number) => void
  markAllNotificationsRead: () => void
  unreadNotificationsCount: number
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  closeSidebar: () => void
}

export default function Header({
  user,
  notificationsOpen,
  setNotificationsOpen,
  notifications,
  toggleNotification,
  markAllNotificationsRead,
  unreadNotificationsCount,
  sidebarOpen,
  setSidebarOpen,
  closeSidebar,
}: HeaderProps) {
  const router = useRouter()

  if (!user) return null

  return (
    <header className="w-full bg-[#FAF0F3]/90 backdrop-blur-md border-b border-[#3D0C1F]/10 shadow-[0_2px_15px_rgba(61,12,31,0.025)] px-6 flex items-center justify-between sticky top-0 z-40 h-14 transition-all duration-300">

      <div className="flex items-center gap-4">
        {/* Hamburger Menu */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#3D0C1F]/70 hover:text-[#3D0C1F] transition-all cursor-pointer p-1.5 rounded hover:bg-[#3D0C1F]/5 flex items-center justify-center relative z-50 border-none bg-transparent"
          title="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Small Brand Logo */}
        <span
          className="text-lg font-black tracking-[0.2em] text-[#3D0C1F] cursor-pointer uppercase select-none"
          style={{ fontFamily: 'var(--font-playfair)' }}
          onClick={() => { router.push('/buyer/feed'); closeSidebar(); }}
        >
          MoonStella
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8 relative hidden sm:block">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#3D0C1F]/40">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search for a seller"
          className="w-full bg-[#FAF8F5]/85 border border-[#3D0C1F]/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-gray-700 placeholder-[#3D0C1F]/40 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] focus:outline-none focus:bg-white focus:border-[#3D0C1F]/25 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.01),_0_0_0_2px_rgba(61,12,31,0.03)] transition-all duration-300"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        />
      </div>

      {/* Right Actions - Grouped Control Panel */}
      <div className="flex items-center gap-1.5 bg-[#FAF8F5]/80 border border-[#3D0C1F]/10 px-2 py-1 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="text-[#3D0C1F]/70 hover:text-[#3D0C1F] relative p-1.5 rounded-full hover:bg-[#3D0C1F]/5 transition-all cursor-pointer border-none bg-transparent flex items-center justify-center"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#3D0C1F] rounded-full border border-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1.5 animate-fade-in text-xs">
              <div className="px-3.5 py-1.5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'var(--font-montserrat)' }}>Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[9px] text-[#3D0C1F] hover:underline font-bold cursor-pointer border-none bg-transparent"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-56 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => toggleNotification(n.id)}
                    className="px-3.5 py-2 border-b border-gray-50 text-[10px] hover:bg-gray-50 transition-colors cursor-pointer flex gap-1.5 items-start"
                  >
                    <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-[#3D0C1F]' : 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <p className="text-gray-700 leading-tight mb-0.5">{n.text}</p>
                      <span className="text-[8px] text-gray-400 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hairline visual separator */}
        <div className="w-[1px] h-4 bg-[#3D0C1F]/10" />

        {/* Profile Circle */}
        <div
          title="User Initials"
          className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E9D7C3] to-white border border-[#3D0C1F]/10 flex items-center justify-center font-bold text-xs text-[#3D0C1F] shadow-sm select-none cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
          onClick={() => { router.push('/buyer/profile'); closeSidebar(); }}
        >
          {user.firstName ? user.firstName[0].toUpperCase() : 'A'}
        </div>
      </div>
    </header>
  )
}
