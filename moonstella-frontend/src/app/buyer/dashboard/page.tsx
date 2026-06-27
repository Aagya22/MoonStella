'use client'

import { useBuyerContext } from '../BuyerContext'

export default function BuyerDashboardPage() {
  const { user, wishlist, setWishlist, openChatWith, setTimelineOpen } = useBuyerContext()

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 md:px-12 md:py-8 flex flex-col gap-8 animate-fade-in">
      
      {/* Dashboard Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 
            className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Welcome back, {user.firstName}
          </h1>
          <p 
            className="text-xs text-gray-500 font-medium tracking-wide flex items-center gap-2"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Active Bespoke Workspace. Ready for your custom requests.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-montserrat)' }}>Active Design</span>
            <span className="text-sm font-extrabold text-gray-400" style={{ fontFamily: 'var(--font-playfair)' }}>0 Projects</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-montserrat)' }}>Vault Saves</span>
            <span className="text-sm font-extrabold text-[#3D0C1F]" style={{ fontFamily: 'var(--font-playfair)' }}>{wishlist.length} Items</span>
          </div>
        </div>
      </div>

      {/* Grid Split: Dashboard Left Content, Dashboard Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* Premium Empty State: Ongoing Orders */}
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8 min-h-[260px]">
            <div className="w-24 h-24 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#3D0C1F]/40 flex-shrink-0 border border-gray-50 shadow-inner">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l-7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[9px] font-extrabold tracking-[0.25em] text-amber-600 uppercase block mb-1">Ongoing Orders</span>
              <h3 className="text-xl font-bold text-[#3D0C1F] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>No Active Bespoke Commissions</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-5" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Collaborate with a master artisan to custom craft a one-of-a-kind jewelry piece. You will be able to track every stage of design drawings, gemstone handpicking, goldsmithing, and delivery here in real time.
              </p>
              <button 
                onClick={() => openChatWith('Julian Thorne')}
                className="bg-[#3D0C1F] text-white hover:bg-[#2A0714] text-[10px] font-bold tracking-widest px-5 py-3 rounded uppercase transition-all duration-200 cursor-pointer shadow active:scale-95"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Post a Request / Brief
              </button>
            </div>
          </div>

          {/* Premium Empty State: Recommended Ring Gallery */}
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-gray-900 tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>Recommended Gems</h3>
            <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center flex flex-col items-center justify-center gap-3 min-h-[220px]">
              <span className="text-[10px] font-bold tracking-widest text-[#3D0C1F] uppercase" style={{ fontFamily: 'var(--font-montserrat)' }}>Curating Custom Showcase</span>
              <p className="text-xs text-gray-400 max-w-sm leading-normal">
                There are no custom recommended designs at the moment. Update your onboarding preferences to feed our artisan algorithms!
              </p>
            </div>
          </div>

        </div>

        {/* Right Column Sidebar (1/3 width) */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* Vault Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
            
            {/* Wishlist Section */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-[#3D0C1F] uppercase mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Bespoke Vault ({wishlist.length})
              </h3>
              <div className="py-6 border border-dashed border-gray-100 rounded-xl text-center text-gray-400 text-xs bg-[#FAF8F5]/50 flex flex-col items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                <span className="text-[10px] font-medium tracking-wide">Your Vault is Empty</span>
              </div>
            </div>

            <div className="h-[1px] bg-gray-100 w-full" />

            {/* Saved Sellers Section */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-[#3D0C1F] uppercase mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Partner Artisans
              </h3>
              <div className="py-4 text-center text-gray-400 text-[10px] font-medium tracking-wide">
                No Saved Artisans yet.
              </div>
            </div>

          </div>

          {/* Recent Inquiries List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold tracking-widest text-[#3D0C1F] uppercase" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Recent Inquiries
            </h3>
            <div className="py-6 text-center text-gray-400 text-[10px] font-medium tracking-wide border border-dashed border-gray-100 rounded-xl bg-[#FAF8F5]/50">
              No Active Conversations.
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
