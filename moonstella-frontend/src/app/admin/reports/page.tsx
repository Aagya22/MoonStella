'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import api from '@/lib/api/axios'
import { 
  ShieldAlert, 
  User, 
  MessageSquare, 
  FileText, 
  Ban, 
  Check, 
  Trash2, 
  ArrowLeft,
  Calendar,
  AlertOctagon
} from 'lucide-react'

interface MessageSnapshot {
  senderId: string
  senderName: string
  text: string
  createdAt: string
}

interface Report {
  _id: string
  reporterId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    role: string
  }
  reportedId: string
  reportedUserId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    role: string
    isApproved: boolean
    isSuspended: boolean
  }
  type: 'user' | 'post' | 'chat'
  reason: string
  explanation: string
  chatSnapshot: MessageSnapshot[]
  status: 'pending' | 'resolved'
  reportedItemDetails?: {
    _id: string
    category: string
    description: string
    budget?: number | null
    price?: string | null
    images?: string[]
  }
  createdAt: string
  updatedAt: string
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const fetchReports = async () => {
    try {
      const res = await api.get('/api/reports/admin')
      setReports(res.data?.data || res.data)
    } catch (e) {
      console.error('Failed to load reports:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleResolveReport = async (reportId: string, action: 'resolve' | 'suspend' | 'delete_post') => {
    let msg = 'Are you sure you want to resolve this report?'
    if (action === 'suspend') {
      msg = 'Are you sure you want to resolve this report and SUSPEND the reported user?'
    } else if (action === 'delete_post') {
      msg = 'Are you sure you want to resolve this report and DELETE the reported post listing?'
    }

    if (!window.confirm(msg)) return

    try {
      await api.patch(`/api/reports/admin/${reportId}/resolve`, { action })
      alert(`Report resolved successfully with action: ${action}`)
      setSelectedReportId(null)
      fetchReports()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve report')
    }
  }

  const selectedReport = reports.find((r) => r._id === selectedReportId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs text-[#5F3041]/75 font-sans uppercase tracking-widest">
        Loading Report Logs...
      </div>
    )
  }

  return (
    <div className="flex-1 w-full text-left select-none font-sans">
      
      {selectedReport ? (
        /* REPORT DETAIL VIEW & TIMELINE SNAPSHOT AUDIT */
        <div className="bg-white border border-[#5F3041]/10 p-8 sm:p-12 rounded-[2.5rem] flex flex-col gap-8 shadow-[0_20px_50px_rgba(61,12,31,0.03)] text-left">
          
          {/* Back trigger */}
          <button
            onClick={() => setSelectedReportId(null)}
            className="self-start text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#5F3041] transition-colors flex items-center gap-1 border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Reported Issues
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-100 pb-7 gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 tracking-wide font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Audit Ticket: {selectedReport.reason.toUpperCase()}
                </h2>
                <span className={`text-[9px] font-bold border px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase ${
                  selectedReport.status === 'pending'
                    ? 'bg-rose-50 text-rose-800 border-rose-200/50'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                }`}>
                  {selectedReport.status === 'pending' ? <AlertOctagon className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                  {selectedReport.status}
                </span>
              </div>
              
              <div className="flex gap-2 bg-[#FAF8F5] border border-gray-100 p-4 rounded-2xl max-w-2xl">
                <FileText className="w-4 h-4 text-[#5F3041]/50 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Reporter Explanation</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                    {selectedReport.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Plaque */}
            <div className="flex flex-col md:items-end gap-1 shrink-0 bg-gradient-to-br from-[#FAF8F5] to-white border border-[#E9D7C3]/50 p-5 rounded-2xl min-w-[200px] shadow-2xs">
              <span className="text-[9px] font-extrabold text-gray-450 tracking-wider uppercase">
                Report Type
              </span>
              <span className="text-lg font-bold text-[#5F3041] font-serif uppercase">
                {selectedReport.type}
              </span>
              <span className="text-[9px] text-gray-400 mt-1">
                Reason: {selectedReport.reason}
              </span>
            </div>
          </div>

          {/* Action Resolution banner */}
          {selectedReport.status === 'pending' && (
            <div className="bg-[#FAF0F3]/40 border border-[#5F3041]/15 p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#5F3041]" />
                  Moderator Action Controls
                </h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Choose the appropriate moderation action below. Dismissing the report will simply mark it resolved. Suspending the user locks their account. Removing the listing deletes it.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleResolveReport(selectedReport._id, 'resolve')}
                  className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer border-none shadow-xs flex items-center gap-1.5"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Dismiss & Resolve Report
                </button>
                
                <button
                  onClick={() => handleResolveReport(selectedReport._id, 'suspend')}
                  className="bg-transparent border border-rose-300 hover:bg-rose-50 text-rose-600 px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all flex items-center gap-1.5"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  <Ban className="w-3.5 h-3.5" />
                  Suspend Reported User
                </button>

                {selectedReport.type === 'post' && selectedReport.reportedItemDetails && (
                  <button
                    onClick={() => handleResolveReport(selectedReport._id, 'delete_post')}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all flex items-center gap-1.5"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Reported Post
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Participants Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Reporter Profile */}
            <div className="flex items-center gap-4 bg-[#FAF8F5]/30 border border-[#5F3041]/5 p-5 rounded-2xl">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-white">
                <Image src={selectedReport.reporterId?.avatar || '/buyersignup.png'} alt="Reporter" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Reporter Info</span>
                <span className="text-xs font-bold text-gray-800 block mt-0.5 truncate">
                  {selectedReport.reporterId?.firstName} {selectedReport.reporterId?.lastName}
                </span>
                <span className="text-[10px] text-gray-450 block truncate">
                  {selectedReport.reporterId?.email} ({selectedReport.reporterId?.role})
                </span>
              </div>
            </div>

            {/* Reported User Profile */}
            <div className="flex items-center gap-4 bg-[#FAF8F5]/30 border border-[#5F3041]/5 p-5 rounded-2xl">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#5F3041]/10 shrink-0 bg-white">
                <Image src={selectedReport.reportedUserId?.avatar || '/buyersignup.png'} alt="Reported User" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-extrabold text-rose-405 uppercase tracking-widest">Reported User Info</span>
                <span className="text-xs font-bold text-rose-800 block mt-0.5 truncate">
                  {selectedReport.reportedUserId?.firstName} {selectedReport.reportedUserId?.lastName}
                </span>
                <span className="text-[10px] text-gray-450 block truncate">
                  {selectedReport.reportedUserId?.email} ({selectedReport.reportedUserId?.role})
                </span>
                {selectedReport.reportedUserId?.isSuspended && (
                  <span className="text-[8px] font-extrabold bg-rose-50 text-rose-800 px-2 py-0.5 rounded mt-1 inline-block uppercase">
                    Suspended
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Snapshot Content (Chat message snapshot or post design metadata) */}
          {selectedReport.type === 'chat' && (
            <div className="flex flex-col gap-5 pt-2">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                Chat Snapshot at Time of Report (Last 15 Messages)
              </h3>
              
              <div className="bg-[#FAF8F5]/70 border border-[#5F3041]/5 p-6 rounded-[2rem] flex flex-col gap-4 max-h-[350px] overflow-y-auto">
                {selectedReport.chatSnapshot.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">No message history captured</p>
                ) : (
                  selectedReport.chatSnapshot.map((msg, idx) => {
                    const isReportedUser = String(msg.senderId) === String(selectedReport.reportedUserId?._id)
                    return (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[80%] ${
                          isReportedUser ? 'mr-auto items-start' : 'ml-auto items-end'
                        }`}
                      >
                        <span className="text-[8px] font-bold text-gray-400 mb-0.5 uppercase">
                          {msg.senderName}
                        </span>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isReportedUser
                            ? 'bg-rose-50 text-rose-900 border border-rose-100 rounded-tl-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none shadow-2xs'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-gray-400 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {selectedReport.type === 'post' && (
            <div className="flex flex-col gap-5 pt-2">
              <h3 className="text-xs font-extrabold text-gray-400 tracking-widest uppercase border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-400" />
                Reported Listing Details
              </h3>

              {selectedReport.reportedItemDetails ? (
                <div className="border border-[#5F3041]/10 rounded-[2rem] bg-white overflow-hidden p-6 flex flex-col sm:flex-row gap-6">
                  {selectedReport.reportedItemDetails.images && selectedReport.reportedItemDetails.images[0] && (
                    <div className="relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden shrink-0 border border-[#5F3041]/5 bg-[#FAF8F5]">
                      <Image src={selectedReport.reportedItemDetails.images[0]} alt="Post detail" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between text-left gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="bg-[#FAF0F3] text-[8px] font-extrabold text-[#5F3041] border border-[#5F3041]/10 px-2.5 py-1 rounded-full uppercase tracking-wider self-start">
                        Category: {selectedReport.reportedItemDetails.category}
                      </span>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {selectedReport.reportedItemDetails.description}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 font-serif">
                      Rs. {selectedReport.reportedItemDetails.budget || selectedReport.reportedItemDetails.price || 'Bespoke Quote'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAF8F5]/50 border border-gray-100 p-6 rounded-2xl text-center text-xs text-gray-400 italic">
                  [Post listing has already been deleted or resolved]
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* REPORTS LIST OVERVIEW */
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
              Reported Issues Board
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Review user safety complaints, chat logs, and listings
            </p>
          </div>

          <div className="bg-white border border-[#5F3041]/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_15px_45px_rgba(61,12,31,0.02)] min-h-[350px]">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase font-sans border-b border-gray-100 pb-3.5">
              Active Abuse & Spam Reports ({reports.length})
            </h3>

            {reports.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                  Clean dashboard. Zero reported violations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                {reports.map((r) => {
                  const isPending = r.status === 'pending'
                  return (
                    <div 
                      key={r._id} 
                      onClick={() => setSelectedReportId(r._id)}
                      className={`border p-6 rounded-3xl cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[170px] ${
                        isPending
                          ? 'border-rose-100 hover:border-rose-350 bg-rose-50/5 hover:bg-rose-50/15'
                          : 'border-[#5F3041]/10 hover:border-[#5F3041]/25 bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/30'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-3">
                          <span className={`text-[8px] font-extrabold border px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            r.type === 'chat' ? 'bg-sky-50 text-sky-850 border-sky-100' :
                            r.type === 'post' ? 'bg-amber-50 text-amber-850 border-amber-100' :
                            'bg-violet-50 text-violet-850 border-violet-100'
                          }`}>
                            {r.type} report
                          </span>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isPending ? 'bg-rose-50 text-rose-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        
                        <h4 className="text-xs font-bold text-gray-800 tracking-wide mt-1">
                          Reason: {r.reason}
                        </h4>
                        <p className="text-[10px] text-gray-450 line-clamp-2 leading-relaxed">
                          "{r.explanation}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest">
                            Reported User
                          </span>
                          <span className="text-[10px] text-[#5F3041] font-bold truncate max-w-[130px]">
                            {r.reportedUserId?.firstName} {r.reportedUserId?.lastName}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 flex items-center gap-1 font-sans">
                          <Calendar className="w-3 h-3 text-gray-300" />
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}
