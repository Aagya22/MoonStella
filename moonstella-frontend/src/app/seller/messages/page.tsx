'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useSellerContext } from '../SellerContext'

interface Message {
  sender: 'user' | 'buyer'
  text: string
  time: string
}

interface Chat {
  id: string
  name: string
  specialty: string
  avatar: string
  online: boolean
  messages: Message[]
}

export default function SellerMessagesPage() {
  const searchParams = useSearchParams()
  const chatWithParam = searchParams.get('chatWith')
  const { user } = useSellerContext()

  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize conversations
  useEffect(() => {
    const stored = localStorage.getItem('ms_seller_chats')
    let currentChats: Chat[] = stored ? JSON.parse(stored) : []

    if (currentChats.some((c) => c.id === 'anya_stella' || c.id === 'liam_vance')) {
      currentChats = []
      localStorage.removeItem('ms_seller_chats')
    }

    if (chatWithParam) {
      const existing = currentChats.find(
        (c) => c.name.toLowerCase() === chatWithParam.toLowerCase()
      )
      if (existing) {
        setActiveChatId(existing.id)
      } else {
        const newId = chatWithParam.toLowerCase().replace(/\s+/g, '_')
        const newChat: Chat = {
          id: newId,
          name: chatWithParam,
          specialty: 'Connoisseur Buyer',
          avatar: '/buyersignup.png',
          online: true,
          messages: []
        }
        currentChats = [newChat, ...currentChats]
        localStorage.setItem('ms_seller_chats', JSON.stringify(currentChats))
        setActiveChatId(newId)
      }
    }

    setChats(currentChats)
    if (currentChats.length > 0 && !activeChatId) {
      setActiveChatId(currentChats[0].id)
    }
  }, [chatWithParam])

  // Scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChatId, chats])

  const activeChat = chats.find((c) => c.id === activeChatId)

  // Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !activeChatId) return

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newMsg: Message = {
      sender: 'user',
      text: chatInput,
      time: timeStr
    }

    const updatedChats = chats.map((c) => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        }
      }
      return c
    })

    setChats(updatedChats)
    localStorage.setItem('ms_seller_chats', JSON.stringify(updatedChats))
    setChatInput('')

    // Soft response
    setTimeout(() => {
      const replyMsg: Message = {
        sender: 'buyer',
        text: "Thank you for the update. I will review this design details and get back to you shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const finalChats = updatedChats.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, replyMsg]
          }
        }
        return c
      })
      setChats(finalChats)
      localStorage.setItem('ms_seller_chats', JSON.stringify(finalChats))
    }, 1500)
  }

  // Filter conversations
  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex bg-white overflow-hidden">
      
      {/* Left conversations list */}
      <div className="w-80 border-r border-[#5F3041]/10 flex flex-col bg-[#FAF8F5]/30 shrink-0">
        <div className="p-6 pb-4 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#5F3041] font-playfair select-none" style={{ fontFamily: 'var(--font-playfair)' }}>
            Messages
          </h2>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#5F3041]/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#5F3041]/10 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-700 placeholder-[#5F3041]/40 focus:outline-none focus:border-[#5F3041]/25 transition-all duration-300"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredChats.map((c) => {
            const lastMsg = c.messages[c.messages.length - 1]
            const isActive = c.id === activeChatId
            return (
              <div
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                className={`flex gap-3.5 items-center p-3.5 rounded-2xl cursor-pointer transition-all duration-200 mb-1 select-none hover:bg-[#FAF0F3]/40 ${
                  isActive ? 'bg-[#FAF0F3]' : 'bg-transparent'
                }`}
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white">
                  <Image src={c.avatar} alt={c.name} fill className="object-cover" />
                  {c.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 tracking-wide truncate">{c.name}</h4>
                    <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                      {lastMsg ? lastMsg.time : ''}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-550 truncate mt-0.5">{c.specialty}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-1">
                    {lastMsg ? lastMsg.text : 'Start your client chat...'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right message pane */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#5F3041]/10 flex justify-between items-center bg-[#FAF8F5]/40 select-none">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white">
                <Image src={activeChat.avatar} alt={activeChat.name} fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800 tracking-wide leading-tight">{activeChat.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Active Now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-gradient-to-b from-[#FAF8F5]/30 to-white">
            {activeChat.messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none my-auto">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041]/40 mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-gray-700" style={{ fontFamily: 'var(--font-montserrat)' }}>No Messages Yet</h4>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[240px] leading-relaxed">
                  Start your conversation by typing a message below to coordinate details with this buyer.
                </p>
              </div>
            ) : (
              activeChat.messages.map((m, index) => {
                const isUser = m.sender === 'user'
                return (
                  <div key={index} className={`flex gap-3 max-w-[75%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white mt-1 select-none">
                      <Image src={isUser ? (user?.avatar || '/suggested_botanical.png') : activeChat.avatar} alt="Avatar" fill className="object-cover" />
                    </div>

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#5F3041] text-[#FAF8F5] rounded-tr-none shadow-xs'
                            : 'bg-[#FAF8F5] text-gray-700 border border-[#5F3041]/10 rounded-tl-none'
                        }`}
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        {m.text}
                      </div>
                      <span className="text-[8px] font-bold text-gray-400 mt-1.5 px-1 uppercase tracking-wide select-none">
                        {m.time}
                      </span>
                    </div>

                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-[#5F3041]/10 flex gap-3 items-center bg-white shrink-0">
            
            <div className="flex items-center gap-1.5 shrink-0 px-1 select-none">
              <button
                type="button"
                title="Attach File"
                onClick={() => alert("File attachment will be supported in Sprint 4.")}
                className="text-[#5F3041]/60 hover:text-[#5F3041] p-2 hover:bg-[#5F3041]/5 rounded-full transition-all cursor-pointer border-none bg-transparent"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <button
                type="button"
                title="Attach Image"
                onClick={() => alert("Image attachment will be supported in Sprint 4.")}
                className="text-[#5F3041]/60 hover:text-[#5F3041] p-2 hover:bg-[#5F3041]/5 rounded-full transition-all cursor-pointer border-none bg-transparent"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-full px-5 py-2.5 text-xs text-gray-700 placeholder-[#5F3041]/40 focus:outline-none focus:bg-white focus:border-[#5F3041]/25 transition-all"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            />

            <button
              type="submit"
              className="bg-[#5F3041] text-white rounded-full hover:bg-[#4A2231] transition-all duration-300 cursor-pointer flex items-center justify-center w-9 h-9 shrink-0 shadow-sm active:scale-95 border-none"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform rotate-45 -translate-x-[1px] translate-y-[0.5px]">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>

          </form>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#FAF8F5]/20 select-none">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041]/50 mb-3 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-805" style={{ fontFamily: 'var(--font-montserrat)' }}>No Active Workspace Chat</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
            Select a conversation from the sidebar list, or tap co-create to start a custom discussion thread.
          </p>
        </div>
      )}

    </div>
  )
}
