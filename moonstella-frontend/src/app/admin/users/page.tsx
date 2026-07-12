'use client'

import React, { useState, useEffect } from 'react'
import api from '@/lib/api/axios'
import { 
  Users, 
  Search, 
  Check, 
  Ban, 
  RotateCcw, 
  ShieldAlert, 
  BadgeHelp 
} from 'lucide-react'
import Pagination from '@/app/components/Pagination'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`)
      const data = res.data?.data || res.data
      setUsers(data?.docs || [])
      setTotalPages(data?.totalPages || 1)
    } catch (e) {
      console.error('Failed to fetch admin users:', e)
    } finally {
      setLoading(false)
    }
  }

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    fetchUsers()
  }, [page])

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this artisan profile?')) return
    try {
      const res = await api.patch(`/api/admin/users/${id}/approve`)
      alert('Artisan approved successfully! System notification sent.')
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve artisan')
    }
  }

  const handleToggleSuspend = async (id: string, suspended: boolean) => {
    const action = suspended ? 'restore' : 'suspend'
    if (!window.confirm(`Are you sure you want to ${action} this user account?`)) return
    try {
      const res = await api.patch(`/api/admin/users/${id}/suspend`)
      alert(`User account ${suspended ? 'restored' : 'suspended'} successfully!`)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status')
    }
  }

  const filteredUsers = users

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-xs text-[#5F3041]/75 font-sans uppercase tracking-widest">
        Loading User Registry...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 text-left select-none font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-gray-900 font-serif tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
            User Registry
          </h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Verify artisans, audit credentials, and manage suspensions
          </p>
        </div>

        {/* Search Input bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or studio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#5F3041]/10 rounded-full pl-11 pr-4 py-2.5 text-xs text-gray-805 focus:outline-none focus:border-[#5F3041]/35 shadow-xs"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-[#5F3041]/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_15px_45px_rgba(61,12,31,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-150">
                <th className="py-3 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="py-3 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="py-3 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Specialty & Studio</th>
                <th className="py-3 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-3 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-gray-450 italic">No users found matching search parameters</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b border-gray-100/50 hover:bg-[#FAF8F5]/35 transition-colors">
                    
                    {/* User profile details */}
                    <td className="py-4.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5F3041]/10 flex items-center justify-center text-xs font-bold text-[#5F3041] uppercase shrink-0">
                        {u.firstName?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-800">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="text-[10px] text-gray-450 truncate">
                          {u.email}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                          Tel: {u.phoneNumber}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                      {u.role}
                    </td>

                    {/* Specialty & studio */}
                    <td className="py-4.5 text-xs text-gray-600">
                      {u.role === 'seller' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#5F3041]">{u.studioName || 'Independent Artisan'}</span>
                          <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
                            Spec: {u.studioSpecialty || 'Bespoke Design'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 text-xs">
                      {u.isSuspended ? (
                        <span className="text-[8px] font-extrabold bg-rose-50 text-rose-800 border border-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          Suspended
                        </span>
                      ) : u.role === 'seller' && !u.isApproved ? (
                        <span className="text-[8px] font-extrabold bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                          <BadgeHelp className="w-2.5 h-2.5" />
                          Pending Review
                        </span>
                      ) : (
                        <span className="text-[8px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        
                        {/* Artisan verification approval */}
                        {u.role === 'seller' && !u.isApproved && !u.isSuspended && (
                          <button
                            onClick={() => handleApprove(u._id)}
                            className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white px-3.5 py-2 rounded-xl text-[9px] font-bold tracking-widest uppercase cursor-pointer border-none transition-all flex items-center gap-1 shadow-xs"
                            title="Verify Artisan Profile"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        )}

                        {/* Suspension control */}
                        <button
                          onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                          className={`px-3.5 py-2 rounded-xl text-[9px] font-bold tracking-widest uppercase cursor-pointer border transition-all flex items-center gap-1 ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                              : 'bg-transparent hover:bg-rose-50 text-rose-600 border-rose-200/50 hover:border-rose-300'
                          }`}
                          title={u.isSuspended ? 'Lift Account Suspension' : 'Suspend User Account'}
                        >
                          {u.isSuspended ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restore
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              Suspend
                            </>
                          )}
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

    </div>
  )
}
