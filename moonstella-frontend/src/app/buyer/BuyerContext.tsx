'use client'

import { createContext, useContext } from 'react'

export interface BuyerContextType {
  user: any
  setUser: React.Dispatch<React.SetStateAction<any>>
  wishlist: any[]
  setWishlist: React.Dispatch<React.SetStateAction<any[]>>
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
  setTimelineOpen: (open: boolean) => void
  timelineOpen: boolean
  triggerProfileEdit?: () => void
  followedArtisans?: string[]
  setFollowedArtisans?: React.Dispatch<React.SetStateAction<string[]>>
}

export const BuyerContext = createContext<BuyerContextType | null>(null)

export function useBuyerContext() {
  const context = useContext(BuyerContext)
  if (!context) {
    throw new Error('useBuyerContext must be used within a BuyerLayout provider')
  }
  return context
}
