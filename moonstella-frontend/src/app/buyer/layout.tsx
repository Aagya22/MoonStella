'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'
import BuyerOnboarding from '@/app/components/buyer/buyer-onboarding'
import { BuyerContext } from './BuyerContext'
import { useSnackbar } from '@/context/SnackbarContext'
import api from '@/lib/api/axios'

// Sub-components
import Header from '@/app/components/buyer/layout/Header'
import Sidebar from '@/app/components/buyer/layout/Sidebar'
import ChatDrawer from '@/app/components/buyer/layout/ChatDrawer'
import EditProfileModal from '@/app/components/buyer/layout/EditProfileModal'
import CraftingTimelineModal from '@/app/components/buyer/layout/CraftingTimelineModal'

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const { showSnackbar } = useSnackbar()

  // Sidebar collapsible state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Timeline and Wishlist
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [wishlist, setWishlist] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('ms_wishlist')
    if (saved) {
      setWishlist(JSON.parse(saved))
    }

    const syncProfile = async () => {
      try {
        const token = localStorage.getItem('ms_token')
        if (token && token !== 'mock_token_for_preview') {
          const res = await api.get('/api/auth/me')
          const freshUser = res.data?.data || res.data
          if (freshUser) {
            setUser(freshUser)
            localStorage.setItem('ms_user', JSON.stringify(freshUser))
            if (freshUser.savedPosts) {
              setWishlist(freshUser.savedPosts)
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync profile from backend:', err)
      }
    }
    syncProfile()
  }, [])

  useEffect(() => {
    localStorage.setItem('ms_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const [followedArtisans, setFollowedArtisans] = useState<string[]>([])

  // Notifications dropdown
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const notifSocketRef = useRef<Socket | null>(null)

  // Live Chat drawer states
  const [activeChat, setActiveChat] = useState<any>(null)
  const [chatMessageInput, setChatMessageInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [sellersHistory, setSellersHistory] = useState<any[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem('ms_user')
    const storedToken = localStorage.getItem('ms_token')
    if (!storedUser || !storedToken || storedToken === 'mock_token_for_preview') {
      localStorage.removeItem('ms_token')
      localStorage.removeItem('ms_user')
      router.push('/login')
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role && parsed.role !== 'buyer') {
      router.replace('/seller/feed')
      return
    }
    setUser(parsed)
    if (!parsed.onboarded) {
      setShowOnboarding(true)
    }
  }, [router, pathname])

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat])

  const handleOnboardingComplete = async (interests: string[]) => {
    try {
      const token = localStorage.getItem('ms_token')
      const { updateProfileApi } = require('@/lib/api/auth')
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
      const { updateProfileApi } = require('@/lib/api/auth')
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

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Open chat panel with artisan
  const openChatWith = (
    name: string,
    userId?: string,
    initialMsg?: string,
    postId?: string,
    postDesc?: string,
    postCategory?: string,
    postBudget?: string,
    postImage?: string
  ) => {
    let query = `?chatWith=${encodeURIComponent(name)}`
    if (userId) query += `&userId=${userId}`
    if (initialMsg) query += `&initialMsg=${encodeURIComponent(initialMsg)}`
    if (postId) query += `&postId=${postId}`
    if (postDesc) query += `&postDesc=${encodeURIComponent(postDesc)}`
    if (postCategory) query += `&postCategory=${encodeURIComponent(postCategory)}`
    if (postBudget) query += `&postBudget=${postBudget}`
    if (postImage) query += `&postImage=${encodeURIComponent(postImage)}`
    
    router.push(`/buyer/messages${query}`)
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

  const formatNotifTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const mins = Math.floor((Date.now() - d.getTime()) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  const mapNotification = (n: any) => ({
    id: n._id,
    text: n.text,
    time: formatNotifTime(n.createdAt),
    read: n.read,
    link: n.link,
    type: n.type,
  })

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('ms_token')
      if (!token || token === 'mock_token_for_preview') return
      const res = await api.get('/api/notifications')
      if (res.data?.success) {
        setNotifications((res.data.data.notifications || []).map(mapNotification))
      }
    } catch {
      // ignore notification fetch errors
    }
  }

  // Load notifications + subscribe to real-time updates
  const notifUserId = user?._id || user?.id
  useEffect(() => {
    const token = localStorage.getItem('ms_token')
    if (!notifUserId || !token || token === 'mock_token_for_preview') return

    fetchNotifications()

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const socket = io(socketUrl, { auth: { token } })
    notifSocketRef.current = socket
    socket.on('notification', (n: any) => {
      setNotifications(prev => [mapNotification(n), ...prev])
    })

    const onFocus = () => fetchNotifications()
    window.addEventListener('focus', onFocus)

    return () => {
      socket.disconnect()
      window.removeEventListener('focus', onFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifUserId])

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try { await api.patch('/api/notifications/read') } catch { /* ignore */ }
  }

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
    try { await api.patch(`/api/notifications/${id}/read`) } catch { /* ignore */ }
  }

  const toggleNotification = async (id: string) => {
    const notif = notifications.find(n => n.id === id)
    markNotificationRead(id)
    setNotificationsOpen(false)
    if (notif?.link) router.push(`/buyer/${notif.link}`)
  }

  const clearAllNotifications = async () => {
    setNotifications([])
    try { await api.delete('/api/notifications') } catch { /* ignore */ }
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  if (!user) return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs">Loading profile...</div>

  return (
    <BuyerContext.Provider value={{ user, setUser, wishlist, setWishlist, openChatWith, setTimelineOpen, timelineOpen, triggerProfileEdit: () => setEditProfileOpen(true), followedArtisans, setFollowedArtisans, notifications, unreadNotificationsCount, toggleNotification, markNotificationRead, markAllNotificationsRead, clearAllNotifications }}>
      <div className="min-h-screen bg-[#FAF8F5] text-gray-900 flex flex-col font-sans antialiased relative">

        {/* 1. Header (Navbar) */}
        <Header
          user={user}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          notifications={notifications}
          toggleNotification={toggleNotification}
          markAllNotificationsRead={markAllNotificationsRead}
          unreadNotificationsCount={unreadNotificationsCount}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          closeSidebar={closeSidebar}
        />

        {/* 2. Navigation Sidebar */}
        <Sidebar
          user={user}
          sidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
          pathname={pathname}
          openChatWith={openChatWith}
          setTimelineOpen={setTimelineOpen}
          setShowLogoutConfirm={setShowLogoutConfirm}
        />

        {/* 3. Main content area */}
        <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:pl-60' : 'md:pl-0'} ${pathname.includes('messages') ? 'h-[calc(100vh-3.5rem)] overflow-hidden' : ''}`}>
          <div className={`w-full flex-1 flex justify-center ${pathname.includes('messages') ? 'h-full overflow-hidden' : ''}`}>
            <div className={`w-full ${pathname.includes('messages') ? 'h-full' : 'max-w-7xl'}`}>
              {children}
            </div>
          </div>
        </div>

        {/* 4. Chat Drawer */}
        <ChatDrawer
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          chatMessageInput={chatMessageInput}
          setChatMessageInput={setChatMessageInput}
          sendChatMessage={sendChatMessage}
          chatEndRef={chatEndRef}
        />

        {/* 5. Interactive Crafting Timeline Modal */}
        <CraftingTimelineModal
          isOpen={timelineOpen}
          onClose={() => setTimelineOpen(false)}
        />

        {/* 6. Edit Profile Settings Modal */}
        <EditProfileModal
          isOpen={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          user={user}
          setUser={setUser}
          showSnackbar={showSnackbar}
        />

        {/* 7. Onboarding Overlay */}
        {showOnboarding && (
          <BuyerOnboarding
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}

        {/* 8. Logout Confirmation Dialog */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in select-none">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 animate-scale-up flex flex-col gap-6">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#5F3041]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: 'var(--font-montserrat)' }}>Confirm Sign Out</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-1.5" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Are you sure you want to log out of your MoonStella account?
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-500 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-50 cursor-pointer transition-all bg-white"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-full bg-[#E05D6E] text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[#d84b5c] cursor-pointer transition-all border-none"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </BuyerContext.Provider>
  )
}
