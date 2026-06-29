import React from 'react'

interface ChatDrawerProps {
  activeChat: any
  setActiveChat: (chat: any) => void
  chatMessageInput: string
  setChatMessageInput: (input: string) => void
  sendChatMessage: (e: React.FormEvent) => void
  chatEndRef: React.RefObject<HTMLDivElement | null>
}

export default function ChatDrawer({
  activeChat,
  setActiveChat,
  chatMessageInput,
  setChatMessageInput,
  sendChatMessage,
  chatEndRef,
}: ChatDrawerProps) {
  if (!activeChat) return null

  return (
    <div className="fixed bottom-0 right-4 sm:right-10 w-[340px] sm:w-[380px] bg-white rounded-t-3xl shadow-2xl border-t border-x border-gray-100 z-50 overflow-hidden flex flex-col animate-slide-up select-none">
      
      {/* Header */}
      <div className="bg-[#3D0C1F] text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center font-bold text-xs relative flex-shrink-0">
            {activeChat.initials}
            {activeChat.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#3D0C1F]" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight">{activeChat.name}</h4>
            <p className="text-[9px] text-[#E9D7C3] tracking-wide truncate max-w-[200px]">{activeChat.specialty}</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveChat(null)} 
          className="text-white/70 hover:text-white cursor-pointer bg-transparent border-none flex items-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3.5 bg-[#FAF8F5]/50">
        {activeChat.messages.map((m: any, idx: number) => {
          const isUser = m.sender === 'user'
          return (
            <div key={idx} className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${isUser
                  ? 'bg-[#3D0C1F] text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                  }`}
              >
                {m.text}
              </div>
              <span className="text-[8px] text-gray-400 mt-1 font-medium px-1 uppercase tracking-wide">{m.time}</span>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Form */}
      <form onSubmit={sendChatMessage} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
        <input
          type="text"
          placeholder="Type your design inquiry..."
          value={chatMessageInput}
          onChange={(e) => setChatMessageInput(e.target.value)}
          className="flex-1 border border-gray-100 bg-gray-55 rounded-full px-4 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-[#3D0C1F]/20"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        />
        <button
          type="submit"
          className="bg-[#3D0C1F] text-white p-2 rounded-full hover:bg-[#2A0714] transition-colors cursor-pointer flex items-center justify-center w-8 h-8 flex-shrink-0 shadow border-none"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform rotate-45 -translate-x-[1px] translate-y-[0.5px]">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

    </div>
  )
}
