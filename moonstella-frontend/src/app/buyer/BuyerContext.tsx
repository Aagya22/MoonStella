'use client'

import { createContext, useContext } from 'react'

export interface BuyerContextType {
  user: any
  wishlist: any[]
  setWishlist: React.Dispatch<React.SetStateAction<any[]>>
  openChatWith: (name: string) => void
  setTimelineOpen: (open: boolean) => void
  timelineOpen: boolean
}

export const BuyerContext = createContext<BuyerContextType | null>(null)

export function useBuyerContext() {
  const context = useContext(BuyerContext)
  if (!context) {
    throw new Error('useBuyerContext must be used within a BuyerLayout provider')
  }
  return context
}
