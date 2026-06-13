'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BuyerFeedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('ms_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/login')
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ms_token')}`
        }
      })
    } catch (e) {
      // ignore logout errors on client
    }
    
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_user')
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F5] p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-100 text-center">
        <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Buyer Vault Feed
        </h1>
        <p
          className="text-sm text-gray-500 mb-6"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Your curated collection feed is coming soon.
        </p>

        {/* User Details */}
        <div className="bg-[#FAF8F5] p-4 rounded text-left mb-6 text-sm flex flex-col gap-2">
          <div>
            <span className="font-semibold text-gray-700">Role:</span> {user.role}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Name:</span> {user.firstName} {user.lastName}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Location:</span> {user.location || 'N/A'}
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 text-white rounded transition-opacity hover:opacity-90 uppercase font-semibold tracking-wider text-xs"
          style={{
            backgroundColor: '#3D0C1F',
            fontFamily: 'var(--font-montserrat)',
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
