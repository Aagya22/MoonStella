'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  FileEdit, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

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

  useEffect(() => {
    // Check local storage for admin auth
    const token = localStorage.getItem('ms_token')
    const userStr = localStorage.getItem('ms_user')

    // Bypass check for the login page to avoid redirection loops
    if (pathname === '/admin/login') {
      setChecking(false)
      return
    }

    if (!token || !userStr) {
      router.replace('/admin/login')
      return
    }

    try {
      const user = JSON.parse(userStr)
      if (user.role !== 'admin') {
        localStorage.removeItem('ms_token')
        localStorage.removeItem('ms_user')
        router.replace('/admin/login')
      } else {
        setAdminUser(user)
        setChecking(false)
      }
    } catch (e) {
      localStorage.removeItem('ms_token')
      localStorage.removeItem('ms_user')
      router.replace('/admin/login')
    }
  }, [router, pathname])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out of the Admin panel?')) {
      localStorage.removeItem('ms_token')
      localStorage.removeItem('ms_user')
      router.replace('/admin/login')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs text-[#5F3041]/75 font-sans uppercase tracking-widest select-none">
        Verifying Credentials...
      </div>
    )
  }

  // If on login page, just render the child login panel directly
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Disputes Control', href: '/admin/disputes', icon: AlertTriangle },
    { name: 'Listing Moderation', href: '/admin/moderation', icon: FileEdit },
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row select-none font-sans text-gray-800">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-[#5F3041]/10 px-6 py-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 text-[#5F3041]">
          <Shield className="w-5 h-5" />
          <span className="font-serif font-bold text-sm tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
            Stella Admin
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 hover:bg-[#5F3041]/5 rounded border-none bg-transparent cursor-pointer text-[#5F3041]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-[#5F3041]/10 flex flex-col justify-between p-6 transition-transform duration-300 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col gap-8">
          
          {/* Brand header */}
          <div className="hidden md:flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="w-10 h-10 rounded-full bg-[#FAF0F3] border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041]">
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
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border-none ${
                    active
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
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-[#5F3041]/10 flex items-center justify-center text-[10px] font-bold text-[#5F3041] uppercase">
                {adminUser.firstName?.[0] || 'A'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-800 truncate">
                  {adminUser.firstName} {adminUser.lastName}
                </span>
                <span className="text-[8px] text-gray-400 font-semibold tracking-wider uppercase">
                  Superadmin
                </span>
              </div>
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

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-12 overflow-y-auto max-h-screen">
        {children}
      </main>

    </div>
  )
}
