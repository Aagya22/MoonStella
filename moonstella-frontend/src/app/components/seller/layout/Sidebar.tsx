import React from 'react'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  user: any
  sidebarOpen: boolean
  closeSidebar: () => void
  pathname: string
  setShowLogoutConfirm: (show: boolean) => void
}

export default function Sidebar({
  user,
  sidebarOpen,
  closeSidebar,
  pathname,
  setShowLogoutConfirm,
}: SidebarProps) {
  const router = useRouter()

  if (!user) return null

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-45 transition-all duration-300"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-60 bg-[#FAF0F3]/95 backdrop-blur-md border-r border-[#5F3041]/10 shadow-2xl z-50 flex flex-col justify-between py-8 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="px-6 mt-2" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
            <span
              className="text-xl font-extrabold tracking-[0.2em] text-[#5F3041] block text-center uppercase select-none"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              MOONSTELLA
            </span>
          </div>
          <nav className="flex flex-col gap-1 px-4">
            {[
              {
                id: 'dashboard',
                label: 'DASHBOARD',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                ),
                onClick: () => { router.push('/seller/dashboard'); closeSidebar(); }
              },
              {
                id: 'home',
                label: 'REQUESTS FEED',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
                onClick: () => { router.push('/seller/feed'); closeSidebar(); }
              },
              {
                id: 'messages',
                label: 'MESSAGES',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                ),
                onClick: () => { router.push('/seller/messages'); closeSidebar(); }
              },
              {
                id: 'saved',
                label: 'SAVED POSTS',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                onClick: () => { router.push('/seller/saved'); closeSidebar(); }
              },
              {
                id: 'orders',
                label: 'MY COMMISSIONS',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="14" x2="16" y2="14" />
                  </svg>
                ),
                onClick: () => { router.push('/seller/orders'); closeSidebar(); }
              },
              {
                id: 'profile',
                label: 'PROFILE',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
                onClick: () => { router.push('/seller/profile'); closeSidebar(); }
              }
            ].map((item) => {
              const isVisitingProfile = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('id')
              const isActive = (item.id === 'dashboard' && pathname === '/seller/dashboard') ||
                (item.id === 'home' && pathname === '/seller/feed') ||
                (item.id === 'messages' && pathname === '/seller/messages') ||
                (item.id === 'saved' && pathname === '/seller/saved') ||
                (item.id === 'orders' && pathname === '/seller/orders') ||
                (item.id === 'profile' && pathname === '/seller/profile' && !isVisitingProfile)
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-left text-[11px] font-semibold tracking-[0.15em] transition-all duration-205 cursor-pointer border-none ${isActive
                    ? 'text-[#FAF8F5] bg-[#5F3041] shadow-sm shadow-[#5F3041]/15 font-bold border border-[#5F3041]'
                    : 'text-gray-700 hover:text-[#5F3041] hover:bg-[#5F3041]/5'
                    }`}
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  <span className={isActive ? 'text-[#FAF8F5]' : 'text-gray-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="px-6 border-t border-[#5F3041]/10 pt-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-full bg-[#5F3041] flex items-center justify-center font-extrabold text-xs text-[#FAF8F5]">
              {user.firstName ? user.firstName[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] font-bold text-gray-800 truncate max-w-[120px] leading-none mb-0.5">{user.firstName} {user.lastName}</h4>
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Artisan Hub</span>
            </div>
          </div>

          <button
            onClick={() => { closeSidebar(); setShowLogoutConfirm(true); }}
            className="w-full bg-white border border-[#5F3041]/20 text-[#5F3041] hover:bg-[#5F3041] hover:text-white hover:border-[#5F3041] transition-all text-[9px] font-bold tracking-widest py-2.5 rounded-xl uppercase text-center cursor-pointer"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Log Out
          </button>
        </div>
      </aside>
    </>
  )
}
