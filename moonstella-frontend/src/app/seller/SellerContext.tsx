'use client'

import { createContext, useContext } from 'react'

export interface SellerContextType {
  user: any
  openChatWith: (name: string) => void
  triggerProfileEdit?: () => void
}

export const SellerContext = createContext<SellerContextType | null>(null)

export function useSellerContext() {
  const context = useContext(SellerContext)
  if (!context) {
    throw new Error('useSellerContext must be used within a SellerLayout provider')
  }
  return context
}
