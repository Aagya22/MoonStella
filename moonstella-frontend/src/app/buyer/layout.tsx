'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import BuyerOnboarding from '@/app/components/buyer-onboarding'
import { BuyerContext } from './BuyerContext'
import { updateProfileApi } from '@/lib/api/auth'
import { useSnackbar } from '@/context/SnackbarContext'

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { showSnackbar } = useSnackbar()
  
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false) 
  
  // Tracker and Chat States
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<any>(null)
  const [wishlist, setWishlist] = useState<any[]>([])
  
  // Dropdown States
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, text: 'Welcome to MoonStella! Your private vault is active.', time: 'Just now', read: false },
  ])

  // Live Chat messaging states
  const [chatMessageInput, setChatMessageInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [sellersHistory, setSellersHistory] = useState<any[]>([])

  useEffect(() => {
    let storedUser = localStorage.getItem('ms_user')
    if (!storedUser) {
      const mockUser = {
        firstName: 'Anya',
        lastName: 'Stella',
        email: 'anya@moonstella.com',
        onboarded: true,
        interests: ['Emerald', 'Sapphire', 'Diamond']
      }
      localStorage.setItem('ms_user', JSON.stringify(mockUser))
      localStorage.setItem('ms_token', 'mock_token_for_preview')
      storedUser = JSON.stringify(mockUser)
    }
    const parsed = JSON.parse(storedUser)
    setUser(parsed)
    if (!parsed.onboarded) {
      setShowOnboarding(true)
    }
  }, [router])

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat])

  const handleOnboardingComplete = async (interests: string[]) => {
    try {
      const token = localStorage.getItem('ms_token')
      if (token && token !== 'mock_token_for_preview') {
        const updatedUser = await updateProfileApi({
          onboarded: true,
          interests
        }, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      } else {
        const updatedUser = { ...user, onboarded: true, interests }
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
      showSnackbar('Profile launched successfully!', 'success')
    } catch (err) {
      console.error('Failed to update buyer onboarding in database:', err)
      const updatedUser = { ...user, onboarded: true, interests }
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      showSnackbar('Profile updated locally, but failed to sync online.', 'warning')
    } finally {
      setShowOnboarding(false)
    }
  }

  const handleOnboardingSkip = async () => {
    try {
      const token = localStorage.getItem('ms_token')
      if (token && token !== 'mock_token_for_preview') {
        const updatedUser = await updateProfileApi({
          onboarded: true,
          interests: []
        }, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      } else {
        const updatedUser = { ...user, onboarded: true, interests: [] }
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
      showSnackbar('Onboarding skipped.', 'info')
    } catch (err) {
      console.error('Failed to skip buyer onboarding in database:', err)
      const updatedUser = { ...user, onboarded: true, interests: [] }
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      showSnackbar('Onboarding skipped locally.', 'info')
    } finally {
      setShowOnboarding(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_user')
    showSnackbar('Logged out successfully.', 'success')
    router.push('/login')
  }

  // Hamburger Click: toggles sidebar state
  const handleHamburgerClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Open chat panel with artisan
  const openChatWith = (name: string) => {
    const chat = sellersHistory.find(s => s.name === name)
    if (chat) {
      setActiveChat(chat)
    } else {
      const newChat = {
        name,
        specialty: 'Master Jeweler',
        initials: name.split(' ').map(n => n[0]).join(''),
        online: true,
        messages: [{ sender: 'artisan', text: `Hello Anya! Thank you for reaching out to my studio. How can I help you?`, time: 'Just now' }]
      }
      setActiveChat(newChat)
      setSellersHistory([...sellersHistory, newChat])
    }
    closeSidebar()
  }

  // Send Live Chat Message
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessageInput.trim() || !activeChat) return

    const userMsg = {
      sender: 'user',
      text: chatMessageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMsg]
    }

    setActiveChat(updatedChat)
    setSellersHistory(sellersHistory.map(s => s.name === activeChat.name ? updatedChat : s))
    setChatMessageInput('')

    // Simulate response
    setTimeout(() => {
      const replyMsg = {
        sender: 'artisan',
        text: "Thank you for the message. I am currently at my workbench polishing a bespoke setting, but I will review your inquiry shortly!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, replyMsg]
      }
      setActiveChat(finalChat)
      setSellersHistory(sellersHistory.map(s => s.name === activeChat.name ? finalChat : s))
    }, 1500)
  }

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const toggleNotification = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  if (!user) return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs">Loading profile...</div>

  return (
    <BuyerContext.Provider value={{ user, wishlist, setWishlist, openChatWith, setTimelineOpen, timelineOpen }}>
      <div className="min-h-screen bg-[#FAF8F5] text-gray-900 flex flex-col font-sans antialiased overflow-x-hidden relative">
        


        {/* ========================================================================= */}
        {/* 1. SHARED COMPACT TOP NAVBAR (h-14) */}
        {/* ========================================================================= */}
        <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] px-6 flex items-center justify-between sticky top-0 z-40 h-14 transition-all duration-300">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <button 
              onClick={handleHamburgerClick}
              className="text-gray-700 hover:text-[#3D0C1F] transition-all cursor-pointer p-1.5 rounded hover:bg-gray-50 flex items-center justify-center relative z-50"
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
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search for a seller"
              className="w-full bg-[#FAF8F5] border border-transparent rounded-full py-1.5 pl-10 pr-4 text-xs text-gray-755 focus:outline-none focus:bg-white focus:border-gray-200 transition-all duration-300"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="text-gray-600 hover:text-[#3D0C1F] relative p-1.5 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#3D0C1F] rounded-full border border-white" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1.5 animate-fade-in">
                  <div className="px-3.5 py-1.5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'var(--font-montserrat)' }}>Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[9px] text-[#3D0C1F] hover:underline font-bold cursor-pointer"
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

            {/* Profile / Logout Button */}
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="w-7.5 h-7.5 rounded-full bg-gradient-to-tr from-[#E9D7C3] to-white border border-gray-100 flex items-center justify-center font-bold text-xs text-[#3D0C1F] hover:border-[#3D0C1F] transition-all cursor-pointer"
            >
              A
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. REFINED SLIDE-OUT LEFT SIDEBAR PANEL (SHARED BY ALL PAGES) */}
        {/* ========================================================================= */}
        {/* FIXED: Removed onMouseEnter from backdrop overlay to allow sidebar to close cleanly on hover-out */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-45 transition-all duration-300"
            onClick={closeSidebar}
          />
        )}

        <aside 
          className={`fixed top-0 left-0 h-screen w-60 bg-white border-r border-gray-100 shadow-2xl z-50 flex flex-col justify-between py-8 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Elegant padding and spacing after brand title */}
            <div className="px-6 mt-2" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
              <span 
                className="text-xl font-extrabold tracking-[0.2em] text-[#3D0C1F] block text-center uppercase select-none"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                MOONSTELLA
              </span>
            </div>

            {/* Outlined Icon Links matching user mockup exactly */}
            <nav className="flex flex-col gap-1 px-4">
              {[
                {
                  id: 'home',
                  label: 'HOME',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  ),
                  onClick: () => { router.push('/buyer/dashboard'); closeSidebar(); }
                },
                {
                  id: 'discovery',
                  label: 'DISCOVERY',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                  ),
                  onClick: () => { router.push('/buyer/feed'); closeSidebar(); }
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
                  onClick: () => { openChatWith('Julian Thorne'); }
                },
                {
                  id: 'wishlist',
                  label: 'WISHLIST',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  onClick: () => { router.push('/buyer/dashboard'); closeSidebar(); }
                },
                {
                  id: 'myorder',
                  label: 'MY ORDER',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="14" x2="16" y2="14" />
                    </svg>
                  ),
                  onClick: () => { setTimelineOpen(true); closeSidebar(); }
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
                  onClick: () => { handleLogout(); }
                }
              ].map((item) => {
                const isActive = (item.id === 'home' && pathname === '/buyer/dashboard') || 
                                 (item.id === 'discovery' && pathname === '/buyer/feed')
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-4 px-6 py-3 rounded-lg text-left text-[11px] font-semibold tracking-[0.15em] transition-all duration-205 cursor-pointer ${
                      isActive 
                        ? 'text-[#3D0C1F] bg-[#FAF8F5]' 
                        : 'text-[#5A5A5A] hover:text-[#3D0C1F] hover:bg-[#FAF8F5]/50'
                    }`}
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    <span className={isActive ? 'text-[#3D0C1F]' : 'text-[#8A8A8A]'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Footer details */}
          <div className="px-6 border-t border-gray-50 pt-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8.5 h-8.5 rounded-full bg-[#FAF8F5] border border-gray-150 flex items-center justify-center font-extrabold text-xs text-[#3D0C1F]">
                A
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-gray-855 truncate max-w-[120px] leading-none mb-0.5">{user.firstName} {user.lastName}</h4>
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Buyer Hub</span>
              </div>
            </div>
            <button 
              onClick={() => { closeSidebar(); router.push('/seller/feed') }}
              className="w-full bg-[#3D0C1F] text-white hover:bg-[#2A0714] transition-all text-[9px] font-bold tracking-widest py-2 rounded uppercase text-center cursor-pointer shadow-sm"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Switch to Seller
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 3. MAIN CONTENT RENDER AREA */}
        {/* ========================================================================= */}
        <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:pl-60' : 'md:pl-0'}`}>
          <div className="w-full flex-1 flex justify-center">
            <div className="w-full max-w-7xl">
              {children}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. FLOATING ARTISAN CHAT WIDGET */}
        {/* ========================================================================= */}
        {activeChat && (
          <div className="fixed bottom-0 right-4 sm:right-10 w-[340px] sm:w-[380px] bg-white rounded-t-3xl shadow-2xl border-t border-x border-gray-100 z-50 overflow-hidden flex flex-col animate-slide-up">
            <div className="bg-[#3D0C1F] text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center font-bold text-xs relative flex-shrink-0">
                  {activeChat.initials}
                  {activeChat.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#3D0C1F]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{activeChat.name}</h4>
                  <p className="text-[9px] text-[#E9D7C3] tracking-wide truncate max-w-[200px]">{activeChat.specialty}</p>
                </div>
              </div>
              <button onClick={() => setActiveChat(null)} className="text-white/70 hover:text-white cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3.5 bg-[#FAF8F5]/50">
              {activeChat.messages.map((m: any, idx: number) => {
                const isUser = m.sender === 'user'
                return (
                  <div key={idx} className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <div 
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser 
                          ? 'bg-[#3D0C1F] text-white rounded-br-none' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[8px] text-gray-400 mt-1 font-medium px-1 uppercase tracking-wide">{m.time}</span>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendChatMessage} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
              <input 
                type="text" 
                placeholder="Type your design inquiry..."
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                className="flex-1 border border-gray-100 bg-gray-50 rounded-full px-4 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-[#3D0C1F]/20"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              />
              <button 
                type="submit"
                className="bg-[#3D0C1F] text-white p-2 rounded-full hover:bg-[#2A0714] transition-colors cursor-pointer flex items-center justify-center w-8 h-8 flex-shrink-0 shadow"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform rotate-45 -translate-x-[1px] translate-y-[0.5px]">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE CRAFTING TIMELINE MODAL */}
        {/* ========================================================================= */}
        {timelineOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100">
              <div className="bg-[#3D0C1F] text-white p-6 relative">
                <h3 className="text-xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>Bespoke Tracker</h3>
                <p className="text-[10px] text-[#E9D7C3] font-semibold uppercase tracking-widest mt-1">No Active Orders</p>
                <button 
                  onClick={() => setTimelineOpen(false)}
                  className="absolute top-6 right-6 text-white/70 hover:text-white cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="p-8 text-center flex flex-col items-center justify-center gap-4 min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#3D0C1F]/40">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l-7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-850" style={{ fontFamily: 'var(--font-montserrat)' }}>No Crafting Progress Found</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs mt-1">
                    Once you co-create a jewelry design brief and the artisan accepts, your live bench updates will appear here!
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setTimelineOpen(false)}
                  className="bg-[#3D0C1F] text-white text-[10px] font-bold tracking-widest px-4 py-2.5 rounded uppercase cursor-pointer hover:bg-[#2A0714]"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. ONBOARDING OVERLAY */}
        {showOnboarding && (
          <BuyerOnboarding
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}

      </div>
    </BuyerContext.Provider>
  )
}
