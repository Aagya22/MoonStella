'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SellerOnboarding from '@/app/components/seller-onboarding'
import { updateProfileApi } from '@/lib/api/auth'
import { useSnackbar } from '@/context/SnackbarContext'

export default function SellerFeedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    const storedUser = localStorage.getItem('ms_user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUser(parsed)
      if (!parsed.onboarded) {
        setShowOnboarding(true)
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const handleOnboardingComplete = async (specialty: string, responseTime: string) => {
    try {
      const token = localStorage.getItem('ms_token')
      if (token && user) {
        const updatedUser = await updateProfileApi({
          onboarded: true,
          studioSpecialty: specialty,
          averageResponseTime: responseTime
        }, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        showSnackbar('Artisan profile launched successfully!', 'success')
      }
    } catch (err) {
      console.error('Failed to complete seller onboarding', err)
      showSnackbar('Failed to launch profile in database.', 'error')
    } finally {
      setShowOnboarding(false)
    }
  }

  const handleOnboardingSkip = async () => {
    try {
      const token = localStorage.getItem('ms_token')
      if (token && user) {
        const updatedUser = await updateProfileApi({
          onboarded: true,
          studioSpecialty: 'both',
          averageResponseTime: 'Within 24 Hours'
        }, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        showSnackbar('Onboarding skipped.', 'info')
      }
    } catch (err) {
      console.error('Failed to skip seller onboarding', err)
      showSnackbar('Failed to update onboarding settings.', 'error')
    } finally {
      setShowOnboarding(false)
    }
  }

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
    showSnackbar('Logged out successfully.', 'success')
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
          Seller Workspace
        </h1>
        <p
          className="text-sm text-gray-500 mb-6"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Your creative studio feed is coming soon.
        </p>

        {/* User Details */}
        <div className="bg-[#FAF8F5] p-4 rounded text-left mb-6 text-sm flex flex-col gap-2">
          <div>
            <span className="font-semibold text-gray-700">Studio:</span> {user.studioName || 'N/A'}
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
          {user.studioSpecialty && (
            <div>
              <span className="font-semibold text-gray-700">Specialty:</span>{' '}
              <span className="capitalize">{user.studioSpecialty === 'both' ? 'Custom & Ready-made' : user.studioSpecialty}</span>
            </div>
          )}
          {user.averageResponseTime && (
            <div>
              <span className="font-semibold text-gray-700">Response Time:</span> {user.averageResponseTime}
            </div>
          )}
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

      {showOnboarding && (
        <SellerOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  )
}
