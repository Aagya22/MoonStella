'use client'

import React, { Suspense } from 'react'
import { useSellerContext } from '../SellerContext'
import SearchPageContent from '@/app/components/search/SearchPageContent'
import api from '@/lib/api/axios'
import { useSnackbar } from '@/context/SnackbarContext'

function SellerSearchWrapper() {
  const { user, setUser, wishlist = [], setWishlist, openChatWith } = useSellerContext()
  const { showSnackbar } = useSnackbar()

  const toggleFollow = async (targetId: string) => {
    try {
      const token = localStorage.getItem('ms_token')
      if (!token || token === 'mock_token_for_preview') {
        showSnackbar("Please log in to follow other users.", "error")
        return
      }

      const res = await api.post(`/api/auth/follow/${targetId}`)
      const following = res.data?.data?.following || res.data?.following || []

      const updatedUser = { ...user, following }
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      showSnackbar("Follow status updated.", "success")
    } catch (err) {
      console.error('Failed to toggle follow status:', err)
    }
  }

  const followedPeople = user?.following || []

  return (
    <SearchPageContent
      user={user}
      setUser={setUser}
      wishlist={wishlist}
      setWishlist={setWishlist}
      openChatWith={openChatWith}
      followedPeople={followedPeople}
      toggleFollow={toggleFollow}
      role="seller"
    />
  )
}

export default function SellerSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[400px] text-xs font-bold text-gray-400 tracking-widest uppercase">
        Loading Search Gallery...
      </div>
    }>
      <SellerSearchWrapper />
    </Suspense>
  )
}
