'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api/axios'
import { io } from 'socket.io-client'
import {
  Shield,
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileEdit,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Edit,
  Camera,
  Loader2,
  Lock,
  Bell
} from 'lucide-react'

export const AdminContext = React.createContext<{
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void
} | null>(null)

export const useAdmin = () => {
  const context = React.useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used inside AdminContext')
  return context
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'error' | 'info' }[]>([])

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  useEffect(() => {
    if (adminUser) {
      setEditFirstName(adminUser.firstName || '')
      setEditLastName(adminUser.lastName || '')
      setEditAvatar(adminUser.avatar || '')
    }
  }, [adminUser])

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      alert('Please fill out all password fields')
      return
    }
    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match')
      return
    }
    setUpdatingPassword(true)
    try {
      await api.patch('/api/auth/change-password', {
        oldPassword,
        newPassword
      })
      alert('Password updated successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change password. Make sure your old password is correct.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifSocketRef = useRef<any>(null)

  const mapNotification = (n: any) => ({
    id: n._id,
    text: n.text,
    read: n.read || false,
    createdAt: n.createdAt,
    link: n.link,
    type: n.type,
  })

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('ms_token')
      if (!token) return
      const res = await api.get('/api/notifications')
      if (res.data?.success) {
        setNotifications((res.data.data.notifications || []).map(mapNotification))
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('ms_token')
    const adminId = adminUser?._id || adminUser?.id
    if (!adminId || !token) return

    fetchNotifications()

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const socket = io(socketUrl, { auth: { token } })
    notifSocketRef.current = socket
    socket.on('notification', (n: any) => {
      setNotifications(prev => [mapNotification(n), ...prev])
      showToast(n.text, 'info')
    })

    const onFocus = () => fetchNotifications()
    window.addEventListener('focus', onFocus)

    return () => {
      socket.disconnect()
      window.removeEventListener('focus', onFocus)
    }
  }, [adminUser])

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try { await api.patch('/api/notifications/read') } catch { /* ignore */ }
  }

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
    try { await api.patch(`/api/notifications/${id}/read`) } catch { /* ignore */ }
  }

  const clearAllNotifications = async () => {
    setNotifications([])
    try { await api.delete('/api/notifications') } catch { /* ignore */ }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data?.success && res.data.data?.url) {
        setEditAvatar(res.data.data.url)
      }
    } catch (err) {
      alert('Failed to upload image')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      alert('Name fields cannot be empty')
      return
    }
    try {
      const res = await api.patch('/api/auth/profile', {
        firstName: editFirstName,
        lastName: editLastName,
        avatar: editAvatar || undefined
      })
      const updatedUser = res.data?.data || res.data
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      setAdminUser(updatedUser)
      setEditProfileOpen(false)
      alert('Profile updated successfully!')
    } catch (err) {
      alert('Failed to update profile')
    }
  }

  useEffect(() => {
    // Check local storage for admin auth
    const token = localStorage.getItem('ms_token')
    const userStr = localStorage.getItem('ms_user')

    if (!token || !userStr) {
      router.replace('/login')
      return
    }

    try {
      const user = JSON.parse(userStr)
      if (user.role !== 'admin') {
        localStorage.removeItem('ms_token')
        localStorage.removeItem('ms_user')
        router.replace('/login')
      } else {
        setAdminUser(user)
        setChecking(false)
      }
    } catch (e) {
      localStorage.removeItem('ms_token')
      localStorage.removeItem('ms_user')
      router.replace('/login')
    }
  }, [router, pathname])

  const renderNotificationsDropdown = (alignClass: string = 'right-0') => {
    return notificationsOpen && (
      <div className={`absolute top-10 ${alignClass} w-80 bg-white border border-[#5F3041]/10 rounded-2xl shadow-2xl p-4 z-[200] flex flex-col gap-3 text-left font-sans`}>
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h4 className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">
            Notifications ({notifications.filter(n => !n.read).length})
          </h4>
          <div className="flex gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-[9px] font-bold text-[#5F3041] hover:underline bg-transparent border-none cursor-pointer"
            >
              Read All
            </button>
            <span className="text-gray-300 text-[10px]">|</span>
            <button
              onClick={clearAllNotifications}
              className="text-[9px] font-bold text-rose-600 hover:underline bg-transparent border-none cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id)
                  setNotificationsOpen(false)
                  if (n.link) router.push(n.link)
                }}
                className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer text-[10px] leading-relaxed flex flex-col gap-1 border ${n.read
                    ? 'bg-transparent text-gray-400 border-transparent hover:bg-gray-50'
                    : 'bg-[#FAF0F3]/30 text-gray-805 border-[#5F3041]/5 hover:bg-[#FAF0F3]/50'
                  }`}
              >
                <p className="m-0">{n.text}</p>
                <span className="text-[8px] text-gray-400 self-end">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out of the Admin panel?')) {
      localStorage.removeItem('ms_token')
      localStorage.removeItem('ms_user')
      router.replace('/login')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs text-[#5F3041]/75 font-sans uppercase tracking-widest select-none">
        Verifying Credentials...
      </div>
    )
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Disputes Control', href: '/admin/disputes', icon: AlertTriangle },
    { name: 'Listing Moderation', href: '/admin/moderation', icon: FileEdit },
    { name: 'Reported Issues', href: '/admin/reports', icon: Shield },
  ]

  return (
    <AdminContext.Provider value={{ showToast }}>
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row select-none font-sans text-gray-800">

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-[#5F3041]/10 px-6 py-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 text-[#5F3041]">
          <Shield className="w-5 h-5" />
          <span className="font-serif font-bold text-sm tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
            Stella Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1.5 hover:bg-[#5F3041]/5 rounded border-none bg-transparent cursor-pointer text-[#5F3041] transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-600 rounded-full border border-white" />
              )}
            </button>
            {renderNotificationsDropdown('right-0 mt-2')}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 hover:bg-[#5F3041]/5 rounded border-none bg-transparent cursor-pointer text-[#5F3041]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-[#5F3041]/10 flex flex-col justify-between p-6 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col gap-8">

          {/* Brand header */}
          <div className="hidden md:flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="w-10 h-10 rounded-full bg-[#FAF0F3] border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-base tracking-wide text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                MoonStella
              </span>
              <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest mt-0.5">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 text-left">
            {menuItems.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border-none ${active
                      ? 'bg-[#FAF0F3]/45 text-[#5F3041] border-l-4 border-l-[#5F3041]'
                      : 'text-gray-400 hover:text-[#5F3041] hover:bg-[#FAF8F5]/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#5F3041]' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="border-t border-gray-100 pt-5 flex flex-col gap-4">
          {adminUser && (
            <div
              onClick={() => setEditProfileOpen(true)}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 cursor-pointer group transition-all duration-200"
              title="Edit Profile Settings"
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-white">
                  {adminUser.avatar ? (
                    <Image src={adminUser.avatar} alt="Admin" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#5F3041] bg-[#5F3041]/10 uppercase">
                      {adminUser.firstName?.[0] || 'A'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-800 truncate group-hover:text-[#5F3041] transition-colors">
                    {adminUser.firstName} {adminUser.lastName}
                  </span>
                  <span className="text-[8px] text-gray-400 font-semibold tracking-wider uppercase">
                    Superadmin
                  </span>
                </div>
              </div>
              <Edit className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#5F3041] opacity-0 group-hover:opacity-100 transition-all duration-200" />
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-transparent hover:bg-rose-50 text-rose-600 border border-rose-200/50 hover:border-rose-300 py-2.5 rounded-xl text-[9px] font-extrabold tracking-widest uppercase cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">

        {/* Desktop Top Navbar */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-[#5F3041]/10 px-6 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-[#C5A880] uppercase tracking-[0.2em] font-sans">
              Admin Console Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-[#FAF0F3] rounded-full border-none bg-transparent cursor-pointer text-[#5F3041] transition-colors flex items-center justify-center"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border border-white" />
                )}
              </button>
              {renderNotificationsDropdown('right-0 mt-2')}
            </div>

            {/* Profile settings button */}
            {adminUser && (
              <button
                onClick={() => setEditProfileOpen(true)}
                className="relative w-8 h-8 rounded-full overflow-hidden border border-[#5F3041]/10 bg-white shrink-0 cursor-pointer hover:border-[#5F3041]/30 transition-colors"
                title="Edit Profile Settings"
              >
                {adminUser.avatar ? (
                  <Image src={adminUser.avatar} alt="Admin" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#5F3041] bg-[#5F3041]/10 uppercase">
                    {adminUser.firstName?.[0] || 'A'}
                  </div>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Children scrollable area */}
        <main className="flex-1 p-6 sm:p-12 overflow-y-auto bg-[#FAF8F5]">
          {children}
        </main>
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#5F3041]/10 w-full max-w-md rounded-[2rem] p-8 sm:p-10 shadow-2xl flex flex-col gap-6 text-left">
            <div className="flex justify-between items-center border-b border-gray-150 pb-4">
              <h3 className="font-serif text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                Edit Admin Profile
              </h3>
              <button
                onClick={() => setEditProfileOpen(false)}
                className="text-gray-400 hover:text-[#5F3041] p-1 bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar Selection */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#5F3041]/10 bg-gray-50 flex items-center justify-center group">
                {editAvatar ? (
                  <Image src={editAvatar} alt="Avatar Preview" fill className="object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[#5F3041] uppercase">
                    {editFirstName?.[0] || 'A'}
                  </span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="bg-transparent hover:bg-gray-50 border border-[#5F3041]/10 text-gray-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                Change Picture
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                  First Name
                </label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full bg-white border border-[#5F3041]/10 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#5F3041]/35 shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full bg-white border border-[#5F3041]/10 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#5F3041]/35 shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Email (Account Access)
                </label>
                <input
                  type="text"
                  disabled
                  value={adminUser?.email || ''}
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs text-gray-400 focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* Change Password Block */}
              <div className="border-t border-gray-150 pt-4 mt-2 flex flex-col gap-3">
                <h4 className="text-[10px] font-extrabold text-[#5F3041] uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Security & Password
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-white border border-[#5F3041]/10 rounded-xl px-4 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#5F3041]/35 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full bg-white border border-[#5F3041]/10 rounded-xl px-4 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#5F3041]/35 shadow-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-white border border-[#5F3041]/10 rounded-xl px-4 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#5F3041]/35 shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={updatingPassword}
                  className="mt-1 self-end bg-transparent hover:bg-[#5F3041]/5 border border-[#5F3041]/25 text-[#5F3041] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
                >
                  {updatingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150 mt-2">
              <button
                onClick={() => setEditProfileOpen(false)}
                className="bg-transparent hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white px-5 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase cursor-pointer border-none transition-all shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 max-w-sm pointer-events-none select-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 border text-[10px] font-bold uppercase tracking-wider pointer-events-auto transition-all duration-300 ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-250'
                : toast.type === 'info'
                ? 'bg-amber-50 text-amber-800 border-amber-250'
                : 'bg-emerald-50 text-emerald-800 border-emerald-250'
            }`}
          >
            <span>{toast.text}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="bg-transparent border-none text-current hover:opacity-75 cursor-pointer font-bold ml-2 text-[11px]"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

    </div>
    </AdminContext.Provider>
  )
}
