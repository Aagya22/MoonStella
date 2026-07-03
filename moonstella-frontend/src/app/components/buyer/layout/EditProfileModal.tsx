import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import api from '@/lib/api/axios'
import { updateProfileApi, changePasswordApi } from '@/lib/api/auth'
import { nepalLocations, districts } from '@/lib/nepal-locations/location'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  setUser: (user: any) => void
  showSnackbar: (msg: string, type: 'success' | 'error' | 'info') => void
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  setUser,
  showSnackbar,
}: EditProfileModalProps) {
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editLocality, setEditLocality] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBio, setEditBio] = useState('')

  const [changePwOpen, setChangePwOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null)
  const editAvatarInputRef = useRef<HTMLInputElement>(null)

  // Sync profile details when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setEditFirstName(user.firstName || '')
      setEditLastName(user.lastName || '')
      setEditLocation(user.location || '')
      if (user.location) {
        const parts = user.location.split(', ')
        if (parts.length >= 2) {
          setEditLocality(parts[0] || '')
          setEditDistrict(parts[1] || '')
        } else {
          setEditLocality(user.location)
          setEditDistrict('')
        }
      } else {
        setEditLocality('')
        setEditDistrict('')
      }
      setEditEmail(user.email || '')
      setEditPhone(user.phoneNumber || '')
      setEditBio(user.bio || '')
      setEditAvatarFile(null)
      setEditAvatarPreview(user.avatar || null)
      setChangePwOpen(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditAvatarFile(file)
    setEditAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFirstName.trim() || !editLastName.trim()) {
      showSnackbar("First Name and Last Name are required.", "error")
      return
    }
    if (!editDistrict || !editLocality) {
      showSnackbar("Location is required. Please select your district and locality.", "error")
      return
    }
    try {
      const token = localStorage.getItem('ms_token')
      let avatarUrl = editAvatarPreview

      if (editAvatarFile && token && token !== 'mock_token_for_preview') {
        const formData = new FormData()
        formData.append('image', editAvatarFile)
        const uploadRes = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        avatarUrl = uploadRes.data?.data?.url
      } else if (editAvatarFile) {
        avatarUrl = URL.createObjectURL(editAvatarFile)
      }

      const finalLocation = `${editLocality}, ${editDistrict}, Nepal`
      const updateData = {
        firstName: editFirstName,
        lastName: editLastName,
        location: finalLocation,
        email: editEmail,
        phoneNumber: editPhone,
        bio: editBio,
        avatar: avatarUrl
      }
      if (token && token !== 'mock_token_for_preview') {
        const updatedUser = await updateProfileApi(updateData, token)
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      } else {
        const updatedUser = { ...user, ...updateData }
        localStorage.setItem('ms_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
      showSnackbar('Profile updated successfully!', 'success')
      onClose()
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      showSnackbar(err?.response?.data?.message || 'Failed to update profile. Please try again.', 'error')
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword) {
      showSnackbar("Please enter your current password.", "error")
      return
    }
    if (newPassword.length < 8) {
      showSnackbar("New password must be at least 8 characters.", "error")
      return
    }
    if (newPassword !== confirmNewPassword) {
      showSnackbar("New passwords do not match.", "error")
      return
    }

    try {
      const token = localStorage.getItem('ms_token')
      if (token && token !== 'mock_token_for_preview') {
        await changePasswordApi({ oldPassword, newPassword }, token)
        showSnackbar("Password updated successfully!", "success")
      } else {
        showSnackbar("Password updated locally.", "success")
      }
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setChangePwOpen(false)
    } catch (err: any) {
      console.error('Failed to change password:', err)
      showSnackbar(err?.response?.data?.message || "Failed to change password. Ensure old password is correct.", "error")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl p-6 relative max-h-[95vh] flex flex-col overflow-hidden border border-[#5F3041]/10">

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#5F3041]/50 hover:text-[#5F3041] transition-all cursor-pointer p-1.5 rounded-full hover:bg-[#5F3041]/5 flex items-center justify-center border-none bg-transparent z-10"
          title="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <form onSubmit={handleSaveProfile} className="flex flex-col h-full">

          <div className="flex justify-between items-center border-b border-[#5F3041]/10 pb-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#5F3041] font-playfair" style={{ fontFamily: 'var(--font-playfair)' }}>Public Profile</h2>
              <p className="text-[9px] text-gray-400 font-semibold tracking-wider uppercase mt-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Update your personal info & settings
              </p>
            </div>
            <button
              type="submit"
              className="bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[9px] font-bold tracking-widest px-6 py-2.5 rounded-full uppercase cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(95,48,65,0.15)] hover:shadow-[0_6px_16px_rgba(95,48,65,0.25)] border-none active:scale-95 mr-8"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Save Changes
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start overflow-y-auto pr-2 pb-2 h-full">

            <div className="w-full lg:w-[280px] flex flex-col gap-5 shrink-0 select-none">

              <div className="bg-[#FAF8F5]/80 border border-[#5F3041]/10 p-5 rounded-2xl flex flex-col items-center gap-3 text-center">
                <div 
                  onClick={() => editAvatarInputRef.current?.click()}
                  className="w-28 h-28 rounded-full overflow-hidden border border-[#5F3041]/15 bg-[#5F3041] text-[#E9D7C3] flex items-center justify-center font-extrabold text-3xl relative cursor-pointer group shadow-sm transition-transform active:scale-98"
                >
                  {editAvatarPreview ? (
                    <Image src={editAvatarPreview} alt="Profile Preview" fill className="object-cover animate-fade-in" />
                  ) : (
                    <span>{editFirstName ? editFirstName[0].toUpperCase() : 'A'}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </div>

                <input
                  type="file"
                  ref={editAvatarInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditAvatarChange}
                />

                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  JPG, GIF or PNG. Max 800K
                </span>

                <button
                  type="button"
                  onClick={() => setChangePwOpen(!changePwOpen)}
                  className="w-full bg-transparent border border-[#5F3041]/30 hover:border-[#5F3041] text-[#5F3041] hover:bg-[#5F3041]/5 text-[9px] font-bold tracking-widest py-2 rounded-full uppercase cursor-pointer transition-all duration-300 active:scale-95 text-center mt-1"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  {changePwOpen ? "Hide Security" : "Change Password"}
                </button>
              </div>

              {changePwOpen && (
                <div className="w-full flex flex-col gap-3 p-4 border border-[#5F3041]/10 rounded-2xl bg-[#FAF8F5]/85 text-left animate-fade-in text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#5F3041]/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full bg-white border border-[#5F3041]/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#5F3041]/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePassword}
                    className="w-full bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[9px] font-bold tracking-widest py-2 rounded-full uppercase cursor-pointer transition-all border-none mt-1 active:scale-95 text-center"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Update Password
                  </button>
                </div>
              )}

              <div className="border border-red-100 rounded-2xl p-4 bg-red-50/30 flex flex-col gap-2.5 text-left">
                <div>
                  <h4 className="text-[9px] font-extrabold text-[#D1475A] uppercase tracking-widest pl-0.5" style={{ fontFamily: 'var(--font-montserrat)' }}>Danger Zone</h4>
                  <p className="text-[8px] text-gray-500 font-semibold tracking-wide mt-1 leading-normal" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    Deleting your account is permanent. This removes all history, designs, and connections.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
                      showSnackbar("Account deletion is restricted in the preview environment.", "error")
                    }
                  }}
                  className="w-full bg-transparent border border-red-200 hover:border-red-500 text-red-500 hover:bg-red-50 text-[9px] font-bold tracking-widest py-2 rounded-full uppercase cursor-pointer transition-all duration-300 active:scale-95 text-center"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Delete Account
                </button>
              </div>

            </div>

            <div className="flex-1 w-full flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Biography</label>
                <textarea
                  value={editBio}
                  onChange={(e) => {
                    if (e.target.value.length <= 240) {
                      setEditBio(e.target.value)
                    }
                  }}
                  rows={3}
                  className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-2xl px-4 py-2.5 text-xs text-gray-700 placeholder-[#5F3041]/40 focus:outline-none focus:bg-white focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 transition-all duration-300 resize-none font-medium leading-relaxed"
                  placeholder="Tell the master artisans about your preferences, style, or collection vision..."
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                />
                <span className="text-right text-[8px] font-semibold text-gray-400 uppercase tracking-wide pr-1">
                  {editBio.length}/240 characters
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-2xl px-4 py-2.5 text-xs text-gray-700 placeholder-[#5F3041]/40 focus:outline-none focus:bg-white focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 transition-all duration-300"
                    placeholder="Your first name"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-2xl px-4 py-2.5 text-xs text-gray-700 placeholder-[#5F3041]/40 focus:outline-none focus:bg-white focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 transition-all duration-300"
                    placeholder="Your last name"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-2xl px-4 py-2.5 text-xs text-gray-700 placeholder-[#5F3041]/40 focus:outline-none focus:bg-white focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 transition-all duration-300"
                  placeholder="Your email"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-2xl px-4 py-2.5 text-xs text-gray-700 placeholder-[#5F3041]/40 focus:outline-none focus:bg-white focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 transition-all duration-300"
                  placeholder="Your phone number"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>District</label>
                  <div className="relative">
                    <select
                      value={editDistrict}
                      onChange={(e) => {
                        setEditDistrict(e.target.value)
                        setEditLocality('')
                      }}
                      className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-2xl px-4 py-2.5 pr-10 text-xs text-gray-700 focus:outline-none focus:bg-white focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 cursor-pointer appearance-none"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#5F3041]/50">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[8px] font-extrabold text-[#5F3041]/60 uppercase tracking-widest pl-1" style={{ fontFamily: 'var(--font-montserrat)' }}>Locality</label>
                  <div className="relative">
                    <select
                      value={editLocality}
                      onChange={(e) => setEditLocality(e.target.value)}
                      disabled={!editDistrict}
                      className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-2xl px-4 py-2.5 pr-10 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#5F3041] focus:ring-4 focus:ring-[#5F3041]/5 cursor-pointer disabled:opacity-60 appearance-none"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                      required
                    >
                      <option value="">Select Locality</option>
                      {(editDistrict ? nepalLocations[editDistrict] || [] : []).map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#5F3041]/50">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </form>
      </div>
    </div>
  )
}
