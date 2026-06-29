'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { SellerContext } from './SellerContext'
import { updateProfileApi, changePasswordApi } from '@/lib/api/auth'
import { useSnackbar } from '@/context/SnackbarContext'
import { nepalLocations, districts } from '@/lib/nepal-locations/location'
import api from '@/lib/api/axios'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  
  // Settings Form States
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editLocality, setEditLocality] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editStudioName, setEditStudioName] = useState('')
  const [editStudioSpecialty, setEditStudioSpecialty] = useState('')
  const [editAverageResponseTime, setEditAverageResponseTime] = useState('')
  
  // Password States
  const [changePwOpen, setChangePwOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  
  // Avatar States
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null)
  const editAvatarInputRef = useRef<HTMLInputElement>(null)
  
  const { showSnackbar } = useSnackbar()

  // Sidebar & Tracker States
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<any>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, text: 'Welcome to your Artisan workspace! View active buyer requests below.', time: 'Just now', read: false },
  ])
  const [chatMessageInput, setChatMessageInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [buyersHistory, setBuyersHistory] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('ms_wishlist')
    if (saved) {
      setWishlist(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('ms_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    let storedUser = localStorage.getItem('ms_user')
    if (!storedUser) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role && parsed.role !== 'seller') {
      router.replace('/buyer/dashboard')
      return
    }
    setUser(parsed)
  }, [router, pathname])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat])

  // Hamburger Click: toggles sidebar state
  const handleHamburgerClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Open chat panel
  const openChatWith = (name: string) => {
    const chat = buyersHistory.find(s => s.name === name)
    if (chat) {
      setActiveChat(chat)
    } else {
      const newChat = {
        name,
        specialty: 'Connoisseur Buyer',
        initials: name.split(' ').map(n => n[0]).join(''),
        online: true,
        messages: [{ sender: 'buyer', text: `Hello! I saw your studio profile and I am interested in co-creating a jewelry piece with you.`, time: 'Just now' }]
      }
      setActiveChat(newChat)
      setBuyersHistory([...buyersHistory, newChat])
    }
    closeSidebar()
  }

  // Send Live Chat Message
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessageInput.trim() || !activeChat) return

    const userMsg = {
      sender: 'artisan',
      text: chatMessageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMsg]
    }

    setActiveChat(updatedChat)
    setBuyersHistory(buyersHistory.map(s => s.name === activeChat.name ? updatedChat : s))
    setChatMessageInput('')

    // Simulate response
    setTimeout(() => {
      const replyMsg = {
        sender: 'buyer',
        text: "Thank you for the prompt reply! I will prepare my design requirements brief and get back to you shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, replyMsg]
      }
      setActiveChat(finalChat)
      setBuyersHistory(buyersHistory.map(s => s.name === activeChat.name ? finalChat : s))
    }, 1500)
  }

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  // Sync profile details when edit opens
  useEffect(() => {
    if (editProfileOpen && user) {
      setEditFirstName(user.firstName || '')
      setEditLastName(user.lastName || '')
      setEditLocation(user.location || '')
      if (user.location) {
        const parts = user.location.split(', ')
        if (parts.length >= 2) {
          setEditLocality(parts[0] || '')
          setEditDistrict(parts[1] || '')
        } else {
          setEditLocality(user.location)
          setEditDistrict('')
        }
      } else {
        setEditLocality('')
        setEditDistrict('')
      }
      setEditEmail(user.email || '')
      setEditPhone(user.phoneNumber || '')
      setEditBio(user.bio || '')
      setEditStudioName(user.studioName || '')
      setEditStudioSpecialty(user.studioSpecialty || 'both')
      setEditAverageResponseTime(user.averageResponseTime || 'Within 24 Hours')
      setEditAvatarFile(null)
      setEditAvatarPreview(user.avatar || null)
      setChangePwOpen(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    }
  }, [editProfileOpen, user])

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditAvatarFile(file)
    setEditAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFirstName.trim() || !editLastName.trim()) {
      showSnackbar("First Name and Last Name are required.", "error")
      return
    }
    if (!editDistrict || !editLocality) {
      showSnackbar("Location is required. Please select your district and locality.", "error")
      return
    }
    try {
      const token = localStorage.getItem('ms_token')
      let avatarUrl = editAvatarPreview

      if (editAvatarFile && token && token !== 'mock_token_for_preview') {
        const formData = new FormData()
        formData.append('image', editAvatarFile)
        const uploadRes = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        avatarUrl = uploadRes.data?.data?.url
      } else if (editAvatarFile) {
        avatarUrl = URL.createObjectURL(editAvatarFile)
      }

      const finalLocation = `${editLocality}, ${editDistrict}, Nepal`
      const updateData = {
        firstName: editFirstName,
        lastName: editLastName,
        location: finalLocation,
        email: editEmail,
        phoneNumber: editPhone,
        bio: editBio,
        avatar: avatarUrl,
        studioName: editStudioName,
        studioSpecialty: editStudioSpecialty,
        averageResponseTime: editAverageResponseTime
      }

      if (token && token !== 'mock_token_for_preview') {
        const updatedUser = await updateProfileApi(updateData, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      } else {
        const updatedUser = { ...user, ...updateData }
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
      showSnackbar('Artisan profile updated successfully!', 'success')
      setEditProfileOpen(false)
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      showSnackbar(err?.response?.data?.message || 'Failed to update profile. Please try again.', 'error')
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword) {
      showSnackbar("Please enter your current password.", "error")
      return
    }
    if (newPassword.length < 8) {
      showSnackbar("New password must be at least 8 characters.", "error")
      return
    }
    if (newPassword !== confirmNewPassword) {
      showSnackbar("New passwords do not match.", "error")
      return
    }

    try {
      const token = localStorage.getItem('ms_token')
      if (token && token !== 'mock_token_for_preview') {
        await changePasswordApi({ oldPassword, newPassword }, token)
        showSnackbar("Password updated successfully!", "success")
      } else {
        showSnackbar("Password updated locally.", "success")
      }
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setChangePwOpen(false)
    } catch (err: any) {
      console.error('Failed to change password:', err)
      showSnackbar(err?.response?.data?.message || "Failed to change password. Ensure old password is correct.", "error")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_user')
    showSnackbar('Logged out successfully.', 'success')
    router.push('/login')
  }

  const toggleNotification = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length
  if (!user) return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs">Loading profile...</div>

  return (
    <SellerContext.Provider value={{ user, wishlist, setWishlist, openChatWith, triggerProfileEdit: () => setEditProfileOpen(true) }}>
      <div className="min-h-screen bg-[#FAF8F5] text-gray-900 flex flex-col font-sans antialiased relative">

        {/* 1. SHARED COMPACT TOP NAVBAR (h-14) */}
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
              onClick={() => { router.push('/seller/feed'); closeSidebar(); }}
            >
              MoonStella
            </span>
            <span className="text-[8px] font-extrabold tracking-widest text-[#3D0C1F]/60 bg-[#FAF8F5] border border-gray-200/80 px-2 py-0.5 rounded uppercase hidden sm:inline-block">
              Artisan Hub
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
              placeholder="Search for bespoke design briefs"
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

            {/* Profile Avatar */}
            <div
              title="User Initials"
              className="w-7.5 h-7.5 rounded-full bg-gradient-to-tr from-[#E9D7C3] to-white border border-gray-100 flex items-center justify-center font-bold text-xs text-[#3D0C1F] select-none"
            >
              {user.firstName ? user.firstName[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* 2. SIDEBAR NAVIGATION */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-45 transition-all duration-300"
            onClick={closeSidebar}
          />
        )}

        <aside
          className={`fixed top-0 left-0 h-screen w-60 bg-white border-r border-gray-100 shadow-2xl z-50 flex flex-col justify-between py-8 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div>
            <div className="px-6 mt-2" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
              <span
                className="text-xl font-extrabold tracking-[0.2em] text-[#3D0C1F] block text-center uppercase select-none"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                MOONSTELLA
              </span>
            </div>

            <nav className="flex flex-col gap-1 px-4">
              {[
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
                  id: 'profile',
                  label: 'MY PORTFOLIO',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                  onClick: () => { router.push('/seller/profile'); closeSidebar(); }
                }
              ].map((item) => {
                const isActive = (item.id === 'home' && pathname === '/seller/feed') ||
                  (item.id === 'profile' && pathname === '/seller/profile')
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-4 px-6 py-3 rounded-lg text-left text-[11px] font-semibold tracking-[0.15em] transition-all duration-205 cursor-pointer ${isActive
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

          <div className="px-6 border-t border-gray-50 pt-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8.5 h-8.5 rounded-full bg-[#FAF8F5] border border-gray-150 flex items-center justify-center font-extrabold text-xs text-[#3D0C1F]">
                {user.firstName ? user.firstName[0].toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-gray-855 truncate max-w-[120px] leading-none mb-0.5">{user.firstName} {user.lastName}</h4>
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Artisan Hub</span>
              </div>
            </div>

            <button
              onClick={() => { closeSidebar(); setShowLogoutConfirm(true); }}
              className="w-full bg-white border border-gray-255 text-gray-550 hover:text-red-700 hover:border-red-250 hover:bg-red-50/5 transition-all text-[9px] font-bold tracking-widest py-2 rounded uppercase text-center cursor-pointer"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Log Out
            </button>
          </div>
        </aside>

        {/* 3. MAIN CONTENT RENDER AREA */}
        <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:pl-60' : 'md:pl-0'}`}>
          <div className="w-full flex-1 flex justify-center">
            <div className="w-full max-w-7xl">
              {children}
            </div>
          </div>
        </div>

        {/* 4. FLOATING CHAT WIDGET */}
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
              <button onClick={() => setActiveChat(null)} className="text-white/70 hover:text-white cursor-pointer border-none bg-transparent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3.5 bg-[#FAF8F5]/50">
              {activeChat.messages.map((m: any, idx: number) => {
                const isUser = m.sender === 'artisan'
                return (
                  <div key={idx} className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${isUser
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
                placeholder="Type your reply to buyer..."
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                className="flex-1 border border-gray-100 bg-gray-50 rounded-full px-4 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-[#3D0C1F]/20"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              />
              <button
                type="submit"
                className="bg-[#3D0C1F] text-white p-2 rounded-full hover:bg-[#2A0714] transition-colors cursor-pointer flex items-center justify-center w-8 h-8 flex-shrink-0 shadow border-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform rotate-45 -translate-x-[1px] translate-y-[0.5px]">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* 5. LOGOUT CONFIRMATION DIALOG */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 animate-scale-up flex flex-col gap-6">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#3D0C1F]">
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
                  className="flex-1 py-2.5 rounded-full border border-gray-250 text-gray-500 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-50 cursor-pointer transition-all bg-white"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 bg-[#3D0C1F] hover:bg-[#2A0714] text-white text-[10px] font-bold tracking-widest py-2.5 rounded-full uppercase cursor-pointer transition-all border-none"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. EDIT ARTISAN PROFILE MODAL */}
        {editProfileOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-150 p-8 relative max-h-[92vh] overflow-y-auto animate-scale-up">
              
              {/* Close Cross Button */}
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-650 cursor-pointer border-none bg-transparent"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Form wrapper */}
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                
                {/* Header Row */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-5 pr-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-playfair" style={{ fontFamily: 'var(--font-playfair)' }}>Artisan Profile</h2>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-1.5" style={{ fontFamily: 'var(--font-montserrat)' }}>
                      Update your studio details and contact information.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest px-7 py-3 rounded-full uppercase cursor-pointer transition-all shadow border-none active:scale-95"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Save Changes
                  </button>
                </div>

                {/* Main Split Grid */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Left Column (Avatar & Change Password) */}
                  <div className="w-full md:w-1/3 flex flex-col items-center gap-4 text-center">
                    
                    {/* Avatar circle */}
                    <div 
                      onClick={() => editAvatarInputRef.current?.click()}
                      className="w-32 h-32 rounded-full overflow-hidden border border-gray-200 bg-[#3D0C1F] text-[#E9D7C3] flex items-center justify-center font-extrabold text-4xl select-none relative cursor-pointer group shadow-sm transition-transform active:scale-98"
                    >
                      {editAvatarPreview ? (
                        <Image src={editAvatarPreview} alt="Profile Preview" fill className="object-cover animate-fade-in" />
                      ) : (
                        <span>{editFirstName ? editFirstName[0].toUpperCase() : 'A'}</span>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={editAvatarInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditAvatarChange}
                    />

                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                      JPG, GIF or PNG. Max size of 800K
                    </span>

                    {/* Change Password Button */}
                    <button
                      type="button"
                      onClick={() => setChangePwOpen(!changePwOpen)}
                      className="w-full bg-white border border-[#E05D6E] text-[#E05D6E] hover:bg-[#E05D6E]/5 text-[9px] font-bold tracking-widest py-3 rounded uppercase cursor-pointer transition-all active:scale-95 text-center mt-3"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {changePwOpen ? "Hide Password Panel" : "Change Password"}
                    </button>

                    {/* Change Password Inline Fields */}
                    {changePwOpen && (
                      <div className="w-full flex flex-col gap-3 p-4 border border-gray-150 rounded-2xl bg-[#FAF8F5]/30 mt-2 text-left animate-fade-in">
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Current Password</label>
                          <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#FAF8F5] border border-gray-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200"
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 8 chars"
                            className="w-full bg-[#FAF8F5] border border-gray-155 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200"
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Confirm Password</label>
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#FAF8F5] border border-gray-155 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200"
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleSavePassword}
                          className="w-full bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[9px] font-bold tracking-widest py-2 rounded uppercase cursor-pointer transition-all border-none mt-1 active:scale-95 text-center"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        >
                          Update Password
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Right Column (Inputs) */}
                  <div className="flex-1 w-full flex flex-col gap-4">
                    
                    {/* Bio field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Studio Biography</label>
                      <textarea
                        value={editBio}
                        onChange={(e) => {
                          if (e.target.value.length <= 240) {
                            setEditBio(e.target.value)
                          }
                        }}
                        rows={2}
                        className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/10 resize-none font-medium leading-relaxed"
                        placeholder="Tell connoisseur buyers about your jewelry crafting philosophy, materials, and specialized styles..."
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      />
                      <span className="text-right text-[8px] font-semibold text-gray-400 uppercase tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        {editBio.length}/240 characters
                      </span>
                    </div>

                    {/* Studio specifics row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Studio Name</label>
                        <input
                          type="text"
                          value={editStudioName}
                          onChange={(e) => setEditStudioName(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F]"
                          placeholder="e.g. Julian Thorne Goldsmiths"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Response Time</label>
                        <select
                          value={editAverageResponseTime}
                          onChange={(e) => setEditAverageResponseTime(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] cursor-pointer"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        >
                          <option value="Within 1 Hour">Within 1 Hour</option>
                          <option value="Within 12 Hours">Within 12 Hours</option>
                          <option value="Within 24 Hours">Within 24 Hours</option>
                          <option value="Within 2 Days">Within 2 Days</option>
                        </select>
                      </div>
                    </div>

                    {/* Studio Specialty dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Studio Specialty</label>
                      <select
                        value={editStudioSpecialty}
                        onChange={(e) => setEditStudioSpecialty(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] cursor-pointer"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        <option value="custom">Bespoke Custom Jewelry Creation</option>
                        <option value="ready-made">Ready-Made Fine Collections</option>
                        <option value="both">Both Bespoke Custom & Ready-Made</option>
                      </select>
                    </div>

                    {/* Names row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>First Name</label>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F]"
                          placeholder="First Name"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Last Name</label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F]"
                          placeholder="Last Name"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                          required
                        />
                      </div>
                    </div>

                    {/* Email field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F]"
                        placeholder="email@example.com"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                        required
                      />
                    </div>

                    {/* Phone field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Phone Number</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F]"
                        placeholder="Phone Number"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      />
                    </div>

                    {/* Location Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>District</label>
                        <select
                          value={editDistrict}
                          onChange={(e) => {
                            setEditDistrict(e.target.value)
                            setEditLocality('')
                          }}
                          className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] cursor-pointer"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                          required
                        >
                          <option value="">Select District</option>
                          {districts.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Locality</label>
                        <select
                          value={editLocality}
                          onChange={(e) => setEditLocality(e.target.value)}
                          disabled={!editDistrict}
                          className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] cursor-pointer disabled:opacity-60"
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                          required
                        >
                          <option value="">Select Locality</option>
                          {(editDistrict ? nepalLocations[editDistrict] || [] : []).map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Divider Line */}
                <hr className="border-t border-gray-150 my-2" />

                {/* Danger Zone Panel */}
                <div className="border border-[#FFE5E5] rounded-3xl p-6 bg-[#FFF8F8] flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-bold text-[#D1475A]" style={{ fontFamily: 'var(--font-montserrat)' }}>Danger Zone</h4>
                    <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-1 leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                      Deleting your account is permanent. This will remove all your workshop data, products list, and customer history.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to permanently delete your artisan profile? This action cannot be undone.")) {
                        showSnackbar("Account deletion is restricted in the preview environment.", "error")
                      }
                    }}
                    className="bg-white border border-[#D1475A] hover:bg-[#D1475A]/5 text-[#D1475A] text-[9px] font-bold tracking-widest px-6 py-3 rounded uppercase cursor-pointer transition-all active:scale-95 text-center shrink-0"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Delete Account
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </SellerContext.Provider>
  )
}
