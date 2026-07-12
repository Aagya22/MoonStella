'use client'

import { createContext, useContext } from 'react'

export interface SellerContextType {
  user: any
  setUser: React.Dispatch<React.SetStateAction<any>>
  wishlist: string[]
  setWishlist: React.Dispatch<React.SetStateAction<string[]>>
  openChatWith: (
    name: string,
    userId?: string,
    initialMsg?: string,
    postId?: string,
    postDesc?: string,
    postCategory?: string,
    postBudget?: string,
    postImage?: string
  ) => void
  triggerProfileEdit?: () => void
  notifications: any[]
  unreadNotificationsCount: number
  toggleNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearAllNotifications: () => void
}

export const SellerContext = createContext<SellerContextType | null>(null)

export function useSellerContext() {
  const context = useContext(SellerContext)
  if (!context) {
    throw new Error('useSellerContext must be used within a SellerLayout provider')
  }
  return context
}
