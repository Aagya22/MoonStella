'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useSellerContext } from '../SellerContext'
import api from '@/lib/api/axios'
import { io, Socket } from 'socket.io-client'
import InspectPostModal from '@/app/components/seller/feed/InspectPostModal'
import AudioPlayer from '@/app/components/chat/AudioPlayer'
import ReportModal from '@/app/components/ReportModal'

interface Message {
  _id: string
  threadId: string
  senderId: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
    role: string
  } | string
  text: string
  postId?: {
    _id: string
    description: string
    category: string
    budget?: number | null
    price?: string | null
    images?: string[]
  }
  image?: string | null
  voice?: string | null
  createdAt: string
}

interface Thread {
  _id: string
  participants: Array<{
    _id: string
    firstName: string
    lastName: string
    email: string
    role: string
    avatar?: string
    bio?: string
    averageResponseTime?: string
  }>
  lastMessageText?: string
  lastMessageAt?: string
}

// Openers offered while a conversation is still empty
const QUICK_MESSAGES = [
  'Thank you for reaching out. How may I help with your piece?',
  'I can craft this to order, may I know your budget and timeline?',
  'Happy to share more photographs and details of my work.',
]

export default function SellerMessagesPage() {
  const searchParams = useSearchParams()
  const chatWithParam = searchParams.get('chatWith')
  const userIdParam = searchParams.get('userId')
  const initialMsgParam = searchParams.get('initialMsg')
  const postIdParam = searchParams.get('postId')
  const { user, wishlist = [] } = useSellerContext()

  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [chatInput, setChatInput] = useState('')
  
  const [attachedPost, setAttachedPost] = useState<{
    _id: string
    description: string
    category: string
    budget?: number | null
    images?: string[]
  } | null>(null)
  
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadingVoice, setUploadingVoice] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null)
  
  // Conversation Menu state
  const [conversationMenuOpen, setConversationMenuOpen] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  // Typing indicator, cleared on a timer since there is no stop event
  const [peerTyping, setPeerTyping] = useState(false)
  const peerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingEmitRef = useRef(0)

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('ms_token')
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const socket = io(socketUrl, {
      auth: { token }
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected successfully')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Close dropdown on thread change
  useEffect(() => {
    setConversationMenuOpen(false)
  }, [activeThreadId])

  // Listen for socket events
  useEffect(() => {
    if (!socketRef.current) return

    const handleNewMessage = (msg: Message) => {
      if (msg.threadId === activeThreadId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }

      setThreads((prev) =>
        prev.map((t) => {
          if (t._id === msg.threadId) {
            return {
              ...t,
              lastMessageText: msg.text || (msg.voice ? '[Voice Message]' : '[Image]'),
              lastMessageAt: msg.createdAt
            }
          }
          return t
        }).sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
      )
    }

    const handleTyping = ({ threadId }: { threadId: string }) => {
      if (threadId !== activeThreadId) return
      setPeerTyping(true)
      if (peerTypingTimeoutRef.current) clearTimeout(peerTypingTimeoutRef.current)
      peerTypingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 3000)
    }

    socketRef.current.on('new_message', handleNewMessage)
    socketRef.current.on('typing', handleTyping)

    return () => {
      socketRef.current?.off('new_message', handleNewMessage)
      socketRef.current?.off('typing', handleTyping)
    }
  }, [activeThreadId])

  // Drop the indicator when switching threads so it can't leak across chats
  useEffect(() => {
    setPeerTyping(false)
    if (peerTypingTimeoutRef.current) clearTimeout(peerTypingTimeoutRef.current)
  }, [activeThreadId])

  // Ping at most once per 1.5s while typing
  const handleChatInputChange = (value: string) => {
    setChatInput(value)
    if (!socketRef.current || !activeThreadId) return
    const now = Date.now()
    if (now - lastTypingEmitRef.current < 1500) return
    lastTypingEmitRef.current = now
    socketRef.current.emit('typing', activeThreadId)
  }

  // Load threads on mount / query param update
  useEffect(() => {
    const loadOrStartChat = async () => {
      try {
        const res = await api.get('/api/chat/threads')
        if (res.data && res.data.success) {
          const fetchedThreads = res.data.data
          // Deduplicate threads list by unique ID to prevent React Strict Mode duplicate renders
          const uniqueThreads = fetchedThreads.filter((t: Thread, idx: number, self: Thread[]) =>
            self.findIndex((temp) => temp._id === t._id) === idx
          )
          setThreads(uniqueThreads)

          if (chatWithParam) {
            let existing = uniqueThreads.find((t: Thread) => {
              const other = t.participants.find((p) => String(p._id) !== String(user?.id || user?._id))
              if (userIdParam) {
                return String(other?._id) === String(userIdParam)
              }
              return `${other?.firstName} ${other?.lastName}`.toLowerCase() === chatWithParam.toLowerCase()
            })

            if (existing) {
              setActiveThreadId(existing._id)
            } else {
              const initRes = await api.post('/api/chat/threads', {
                participantId: userIdParam,
                participantName: chatWithParam
              })
              if (initRes.data && initRes.data.success) {
                const newThread = initRes.data.data
                setThreads((prev) => {
                  if (prev.some((t) => t._id === newThread._id)) return prev
                  return [newThread, ...prev]
                })
                setActiveThreadId(newThread._id)
              }
            }
          } else if (uniqueThreads.length > 0 && !activeThreadId) {
            setActiveThreadId(uniqueThreads[0]._id)
          }
        }
      } catch (err) {
        console.error('Failed to load threads:', err)
      }
    }

    if (user) {
      loadOrStartChat()
    }
  }, [chatWithParam, userIdParam, user])

  // Join WebSocket thread and load messages history
  useEffect(() => {
    if (!activeThreadId) return

    const joinRoom = () => {
      if (socketRef.current) {
        socketRef.current.emit('join_thread', activeThreadId)
      }
    }

    joinRoom()

    if (socketRef.current) {
      socketRef.current.on('connect', joinRoom)
    }

    api.get(`/api/chat/threads/${activeThreadId}/messages`)
      .then((res) => {
        if (res.data && res.data.success) {
          setMessages(res.data.data)
        }
      })
      .catch((err) => console.error('Failed to load messages:', err))

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', joinRoom)
      }
    }
  }, [activeThreadId])

  // Handle auto-populating initial inquiry message if present
  useEffect(() => {
    if (!activeThreadId) return

    if (initialMsgParam) {
      setChatInput(initialMsgParam)
    }

    if (postIdParam) {
      setAttachedPost({
        _id: postIdParam,
        description: searchParams.get('postDesc') || '',
        category: searchParams.get('postCategory') || 'Bespoke Request',
        budget: searchParams.get('postBudget') ? Number(searchParams.get('postBudget')) : null,
        images: searchParams.get('postImage') ? [searchParams.get('postImage')!] : []
      })
    }

    // Instantly clean the query params from URL so they don't persist on refresh
    const url = new URL(window.location.href)
    url.searchParams.delete('initialMsg')
    url.searchParams.delete('postId')
    url.searchParams.delete('postDesc')
    url.searchParams.delete('postCategory')
    url.searchParams.delete('postBudget')
    url.searchParams.delete('postImage')
    window.history.replaceState({}, '', url.pathname + url.search)
  }, [activeThreadId, initialMsgParam, postIdParam])

  // Scroll chat window to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const activeThread = threads.find((t) => t._id === activeThreadId)
  const otherParticipant = activeThread
    ? activeThread.participants.find((p) => String(p._id) !== String(user?.id || user?._id))
    : null

  // Handle image attachment upload to Cloudinary via backend REST upload endpoint
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Enforce that only image files are uploaded
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.')
      return
    }

    setUploadingImage(true)
    setAttachedImage(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await api.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (res.data && res.data.success) {
        setAttachedImage(res.data.data.url)
      } else {
        alert('Failed to upload image')
      }
    } catch (err) {
      console.error('Image upload error:', err)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  // Audio Recording Methods
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
      alert('Microphone permission denied or device is not available.')
    }
  }

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setRecordingTime(0)
    audioChunksRef.current = []
  }

  const stopAndSendRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return

    if (timerRef.current) clearInterval(timerRef.current)

    setUploadingVoice(true)

    mediaRecorderRef.current.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const file = new File([audioBlob], 'voice.webm', { type: 'audio/webm' })

        const formData = new FormData()
        formData.append('audio', file)

        const res = await api.post('/api/upload/audio', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (res.data && res.data.success) {
          const voiceUrl = res.data.data.url
          await api.post(`/api/chat/threads/${activeThreadId}/messages`, {
            text: '',
            voice: voiceUrl
          })
        } else {
          alert('Failed to upload voice message')
        }
      } catch (err) {
        console.error('Audio upload error:', err)
        alert('Failed to upload voice message.')
      } finally {
        setUploadingVoice(false)
        setIsRecording(false)
        setRecordingTime(0)
        audioChunksRef.current = []
      }
    }

    mediaRecorderRef.current.stop()
  }

  // Delete Conversation (Clear thread for current side)
  const handleDeleteConversation = async () => {
    if (!activeThreadId) return
    const confirmed = window.confirm("Are you sure you want to delete this conversation? This will clear all messages on your side.")
    if (!confirmed) {
      setConversationMenuOpen(false)
      return
    }

    try {
      const res = await api.delete(`/api/chat/threads/${activeThreadId}`)
      if (res.data && res.data.success) {
        setMessages([])
        setThreads((prev) => prev.filter((t) => t._id !== activeThreadId))
        setActiveThreadId('')
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err)
      alert('Failed to delete conversation. Please try again.')
    } finally {
      setConversationMenuOpen(false)
    }
  }

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadingImage) return
    if (!chatInput.trim() && !attachedImage) return
    if (!activeThreadId) return

    try {
      const text = chatInput.trim()
      const postId = attachedPost?._id || undefined
      const image = attachedImage || undefined

      setChatInput('')
      setAttachedPost(null)
      setAttachedImage(null)

      await api.post(`/api/chat/threads/${activeThreadId}/messages`, { text, postId, image })
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Filter conversations
  const filteredThreads = threads.filter((t) => {
    const other = t.participants.find((p) => String(p._id) !== String(user?.id || user?._id))
    const name = other ? `${other.firstName} ${other.lastName}` : ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Map backend Post format to local variables needed by InspectPostModal
  const getMappedPostForModal = (post: any) => {
    if (!post) return null

    const postUser = post.userId && typeof post.userId === 'object' ? post.userId : null
    const artisanFirstName = postUser?.firstName || ''
    const artisanLastName = postUser?.lastName || ''
    const artisanName = postUser ? `${artisanFirstName} ${artisanLastName}` : (post.artisanName || 'Bespoke Request Owner')
    const avatar = postUser?.avatar || post.avatar || ''
    const artisanTitle = postUser?.role === 'seller' ? 'MASTER ARTISAN' : 'Connoisseur Client'
    
    let priceStr = post.price
    if (!priceStr && post.budget !== undefined && post.budget !== null) {
      priceStr = `Rs. ${Number(post.budget).toLocaleString()}`
    }
    if (!priceStr) priceStr = 'Contact'

    return {
      ...post,
      id: post.id || post._id,
      artisanName,
      avatar,
      artisanTitle,
      price: priceStr,
      materials: post.materials || [],
      images: post.images || (post.image ? [post.image] : [])
    }
  }

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex bg-white overflow-hidden relative">
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

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
              className="w-full bg-white border border-[#5F3041]/10 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-707 placeholder-[#5F3041]/40 focus:outline-none focus:border-[#5F3041]/25 transition-all duration-300"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredThreads.map((t) => {
            const other = t.participants.find((p) => String(p._id) !== String(user?.id || user?._id))
            if (!other) return null

            const name = `${other.firstName} ${other.lastName}`
            const avatar = other.avatar || '/buyersignup.png'
            const specialty = other.role === 'seller' ? (other.bio || 'Master Artisan') : 'Buyer'
            const isActive = t._id === activeThreadId

            return (
              <div
                key={t._id}
                onClick={() => setActiveThreadId(t._id)}
                className={`flex gap-3.5 items-center p-3.5 rounded-2xl cursor-pointer transition-all duration-200 mb-1 select-none hover:bg-[#FAF0F3]/40 ${
                  isActive ? 'bg-[#FAF0F3]' : 'bg-transparent'
                }`}
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white">
                  <Image src={avatar} alt={name} fill className="object-cover" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 tracking-wide truncate">{name}</h4>
                    <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                      {formatTime(t.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-555 truncate mt-0.5">{specialty}</p>
                  <p className="text-[10px] text-gray-555 truncate mt-1">
                    {t.lastMessageText || 'Start co-creating details...'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right message pane */}
      {activeThread && otherParticipant ? (
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#5F3041]/10 flex justify-between items-center bg-[#FAF8F5]/40 select-none">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white">
                <Image src={otherParticipant.avatar || '/buyersignup.png'} alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`} fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800 tracking-wide leading-tight">{otherParticipant.firstName} {otherParticipant.lastName}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Active Now</span>
                </div>
              </div>
            </div>

            {/* 3-Dot Conversation Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setConversationMenuOpen(!conversationMenuOpen)}
                className="text-gray-400 hover:text-[#5F3041] hover:bg-[#5F3041]/5 p-2 rounded-full cursor-pointer transition-all border-none bg-transparent flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {conversationMenuOpen && (
                <div className="absolute right-0 mt-1.5 bg-white border border-[#5F3041]/10 rounded-xl shadow-lg py-1.5 w-40 z-50 flex flex-col text-left">
                  <button
                    type="button"
                    onClick={handleDeleteConversation}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-655 hover:bg-red-50 border-none bg-transparent cursor-pointer transition-colors"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Delete Conversation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConversationMenuOpen(false)
                      setShowReportModal(true)
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border-none bg-transparent cursor-pointer transition-colors flex items-center gap-1.5"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                    Report Chat
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-gradient-to-b from-[#FAF8F5]/30 to-white">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none my-auto">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041]/40 mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-gray-700" style={{ fontFamily: 'var(--font-montserrat)' }}>No Messages Yet</h4>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[240px] leading-relaxed">
                  Start your conversation below, or open with one of these.
                </p>

                <div className="flex flex-col gap-2 mt-4 w-full max-w-[280px]">
                  {QUICK_MESSAGES.map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => handleChatInputChange(text)}
                      className="text-[10px] leading-snug text-[#5F3041] bg-white border border-[#5F3041]/15 rounded-full px-4 py-2.5 hover:bg-[#FAF8F5] hover:border-[#5F3041]/35 transition-all duration-300 cursor-pointer"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = String(typeof m.senderId === 'object' ? m.senderId?._id : m.senderId) === String(user?.id || user?._id)
                const senderAvatar = isUser
                  ? (user?.avatar || '/suggested_botanical.png')
                  : (otherParticipant.avatar || '/buyersignup.png')

                return (
                  <div key={m._id} className={`flex gap-3 max-w-[75%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
                    
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-gradient-to-tr from-[#E9D7C3] to-white mt-1 select-none">
                      <Image src={senderAvatar} alt="Avatar" fill className="object-cover" />
                    </div>

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Embedded Shared Post Card */}
                      {m.postId && (
                        <div
                          onClick={() => setSelectedPost(m.postId)}
                          className="mb-2.5 p-3.5 bg-white/70 backdrop-blur-md border border-[#5F3041]/10 rounded-2xl flex gap-3.5 max-w-sm overflow-hidden select-none cursor-pointer hover:border-[#5F3041]/35 hover:shadow-[0_4px_16px_rgba(95,48,65,0.06)] transition-all duration-300 group animate-fade-in"
                        >
                          {m.postId.images && m.postId.images.length > 0 && (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-150 bg-gray-50 shadow-xs">
                              <Image src={m.postId.images[0]} alt="Post Preview" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-extrabold uppercase bg-[#5F3041]/10 text-[#5F3041] px-2 py-0.5 rounded-md w-max tracking-wider">
                                {m.postId.category}
                              </span>
                              <span className="text-[7px] text-[#5F3041]/60 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-[#5F3041] transition-colors">
                                View Info &rarr;
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-600 line-clamp-2 mt-1.5 font-medium leading-normal">
                              {m.postId.description}
                            </p>
                            {m.postId.budget !== undefined && m.postId.budget !== null && (
                              <span className="text-[9px] font-bold text-[#b49876] mt-1 font-montserrat">
                                Budget: ${m.postId.budget}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sent Image Preview Bubble Attachment */}
                      {m.image && (
                        <div
                          onClick={() => setActiveLightboxImage(m.image || null)}
                          className="mb-2 rounded-2xl overflow-hidden cursor-zoom-in relative w-48 h-48 border border-[#5F3041]/10 shadow-xs bg-[#FAF8F5]/80 flex-shrink-0 group hover:scale-[1.01] hover:shadow-sm transition-all duration-300 animate-fade-in"
                        >
                          <Image src={m.image} alt="Sent attachment" fill className="object-cover" />
                        </div>
                      )}

                      {/* Sent Voice Attachment Custom Player */}
                      {m.voice && (
                        <div className="mb-2 shrink-0 animate-fade-in">
                          <AudioPlayer src={m.voice} />
                        </div>
                      )}

                      {m.text && (
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isUser
                              ? 'bg-[#5F3041] text-[#FAF8F5] rounded-tr-none shadow-xs'
                              : 'bg-[#FAF8F5] text-gray-707 border border-[#5F3041]/10 rounded-tl-none'
                          }`}
                          style={{ fontFamily: 'var(--font-montserrat)' }}
                        >
                          {m.text}
                        </div>
                      )}
                      
                      <span className="text-[8px] font-bold text-gray-400 mt-1.5 px-1 uppercase tracking-wide select-none">
                        {formatTime(m.createdAt)}
                      </span>
                    </div>

                  </div>
                )
              })
            )}
            {peerTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-full px-4 py-2.5 flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 bg-[#5F3041]/45 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#5F3041]/45 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#5F3041]/45 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Embedded Post Preview Attachment Composer */}
          {attachedPost && (
            <div className="mx-6 mb-2 p-3 bg-[#FAF8F5]/90 border border-[#5F3041]/10 rounded-2xl flex gap-3.5 max-w-sm items-center relative select-none animate-fade-in shadow-xs shrink-0">
              {attachedPost.images && attachedPost.images.length > 0 && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-150 bg-gray-50 shadow-xs">
                  <Image src={attachedPost.images[0]} alt="Post Preview" fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[7px] font-extrabold uppercase bg-[#5F3041]/10 text-[#5F3041] px-1.5 py-0.5 rounded-md w-max tracking-wider">
                  {attachedPost.category}
                </span>
                <p className="text-[9px] text-gray-550 truncate mt-1">
                  {attachedPost.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttachedPost(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] rounded-full flex items-center justify-center cursor-pointer border-none shadow-sm hover:scale-105 active:scale-95 transition-all text-xs font-bold font-sans"
                title="Remove Post Attachment"
              >
                &times;
              </button>
            </div>
          )}

          {/* Image preview in composer */}
          {(attachedImage || uploadingImage) && (
            <div className="mx-6 mb-2 p-3 bg-[#FAF8F5]/90 border border-[#5F3041]/10 rounded-2xl flex gap-3.5 max-w-sm items-center relative select-none animate-fade-in shadow-xs shrink-0">
              <div
                onClick={() => attachedImage && setActiveLightboxImage(attachedImage)}
                className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#5F3041]/10 bg-gray-50 flex items-center justify-center shadow-xs ${attachedImage ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
              >
                {uploadingImage ? (
                  <div className="w-5 h-5 border-2 border-[#5F3041] border-t-transparent rounded-full animate-spin" />
                ) : attachedImage ? (
                  <Image src={attachedImage} alt="Attachment Preview" fill className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[8px] font-extrabold uppercase text-[#5F3041] tracking-wider">
                  {uploadingImage ? 'Wait a min...' : 'Image Attached'}
                </span>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                  {uploadingImage ? 'Uploading image...' : 'Ready to send'}
                </p>
              </div>
              {!uploadingImage && (
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] rounded-full flex items-center justify-center cursor-pointer border-none shadow-sm hover:scale-105 active:scale-95 transition-all text-xs font-bold font-sans"
                  title="Remove Image Attachment"
                >
                  &times;
                </button>
              )}
            </div>
          )}

          {/* Input Footer form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-[#5F3041]/10 flex gap-3 items-center bg-white shrink-0">
            
            <div className="flex items-center gap-1.5 shrink-0 px-1 select-none">
              <button
                type="button"
                title="Voice Message"
                disabled={uploadingVoice}
                onClick={startRecording}
                className="text-[#5F3041]/60 hover:text-[#5F3041] p-2 hover:bg-[#5F3041]/5 rounded-full transition-all cursor-pointer border-none bg-transparent disabled:opacity-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
              <button
                type="button"
                title="Attach Image"
                disabled={isRecording}
                onClick={() => fileInputRef.current?.click()}
                className="text-[#5F3041]/65 hover:text-[#5F3041] p-2 hover:bg-[#5F3041]/5 rounded-full transition-all cursor-pointer border-none bg-transparent disabled:opacity-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
            </div>

            {isRecording ? (
              <div className="flex-1 flex items-center justify-between bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-full px-5 py-2.5 text-xs text-gray-707 select-none animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse" />
                  <span className="font-bold text-[#5F3041]" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {uploadingVoice ? 'Wait a min... Sending voice' : `Recording... ${Math.floor(recordingTime / 60)}:${recordingTime % 60 < 10 ? '0' : ''}${recordingTime % 60}`}
                  </span>
                </div>
                {!uploadingVoice && (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      title="Discard Recording"
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1 rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendRecording}
                      title="Send Voice Message"
                      className="text-emerald-500 hover:text-emerald-700 transition-colors p-1 rounded-full border-none bg-transparent cursor-pointer flex items-center justify-center font-bold"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => handleChatInputChange(e.target.value)}
                className="flex-1 bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-full px-5 py-2.5 text-xs text-gray-707 placeholder-[#5F3041]/40 focus:outline-none focus:bg-white focus:border-[#5F3041]/25 transition-all"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              />
            )}

            <button
              type="submit"
              disabled={uploadingImage || isRecording}
              className="bg-[#5F3041] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full hover:bg-[#4A2231] transition-all duration-300 cursor-pointer flex items-center justify-center w-9 h-9 shrink-0 shadow-sm active:scale-95 border-none"
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
          <h3 className="text-sm font-bold text-gray-855" style={{ fontFamily: 'var(--font-montserrat)' }}>No Active Workspace Chat</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
            Select a conversation from the sidebar list, or tap co-create to start a custom discussion thread.
          </p>
        </div>
      )}

      {/* Shared Post Detail Split Inspect Modal */}
      {selectedPost && (
        <InspectPostModal
          selectedInspectPost={getMappedPostForModal(selectedPost)}
          onClose={() => setSelectedPost(null)}
          user={user}
          wishlist={wishlist}
          openChatWith={() => setSelectedPost(null)}
          handleDeletePost={async () => {}}
          handleUpdatePost={async () => {}}
        />
      )}

      {/* Image Fullscreen Lightbox Overlay */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out select-none animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <Image src={activeLightboxImage} alt="Fullscreen View" fill className="object-contain" />
          </div>
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-6 right-6 text-[#E9D7C3] hover:text-white cursor-pointer p-3.5 hover:bg-white/10 rounded-full transition-all border-none bg-transparent flex items-center justify-center"
            title="Close Overlay"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Report Chat Modal Overlay */}
      {activeThreadId && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          type="chat"
          reportedId={activeThreadId}
          title="Report Conversation"
        />
      )}

    </div>
  )
}
