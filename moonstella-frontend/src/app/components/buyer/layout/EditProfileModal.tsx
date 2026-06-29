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
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-155 p-8 relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Cross Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-650 cursor-pointer border-none bg-transparent"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Form wrapper */}
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
          
          {/* Header Row */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-5 pr-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-playfair" style={{ fontFamily: 'var(--font-playfair)' }}>Public Profile</h2>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-1.5" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Update your personal information and how others see you.
              </p>
            </div>
            <button
              type="submit"
              className="bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest px-7 py-3 rounded-full uppercase cursor-pointer transition-all shadow border-none active:scale-95"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Save Changes
            </button>
          </div>

          {/* Main Split Grid */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left Column (Avatar & Change Password) */}
            <div className="w-full md:w-1/3 flex flex-col items-center gap-4 text-center">
              
              {/* Avatar circle */}
              <div 
                onClick={() => editAvatarInputRef.current?.click()}
                className="w-32 h-32 rounded-full overflow-hidden border border-gray-200 bg-[#3D0C1F] text-[#E9D7C3] flex items-center justify-center font-extrabold text-4xl select-none relative cursor-pointer group shadow-sm transition-transform active:scale-98"
              >
                {editAvatarPreview ? (
                  <Image src={editAvatarPreview} alt="Profile Preview" fill className="object-cover animate-fade-in" />
                ) : (
                  <span>{editFirstName ? editFirstName[0].toUpperCase() : 'A'}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
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

              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide select-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                JPG, GIF or PNG. Max size of 800K
              </span>

              {/* Change Password Button */}
              <button
                type="button"
                onClick={() => setChangePwOpen(!changePwOpen)}
                className="w-full bg-white border border-[#E05D6E] text-[#E05D6E] hover:bg-[#E05D6E]/5 text-[9px] font-bold tracking-widest py-3 rounded uppercase cursor-pointer transition-all active:scale-95 text-center mt-3"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {changePwOpen ? "Hide Password Panel" : "Change Password"}
              </button>

              {/* Change Password Inline Fields */}
              {changePwOpen && (
                <div className="w-full flex flex-col gap-3 p-4 border border-gray-150 rounded-2xl bg-[#FAF8F5]/30 mt-2 text-left animate-fade-in text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F5] border border-gray-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full bg-[#FAF8F5] border border-gray-155 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F5] border border-gray-155 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-gray-200"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePassword}
                    className="w-full bg-[#3D0C1F] hover:bg-[#2A0714] text-[#E9D7C3] hover:text-white text-[9px] font-bold tracking-widest py-2 rounded uppercase cursor-pointer transition-all border-none mt-1 active:scale-95 text-center font-semibold"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  >
                    Update Password
                  </button>
                </div>
              )}

            </div>

            {/* Right Column (Inputs) */}
            <div className="flex-1 w-full flex flex-col gap-4">
              
              {/* Bio field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Biography</label>
                <textarea
                  value={editBio}
                  onChange={(e) => {
                    if (e.target.value.length <= 240) {
                      setEditBio(e.target.value)
                    }
                  }}
                  rows={3}
                  className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/10 resize-none font-medium leading-relaxed"
                  placeholder="Tell the master artisans about your preferences, style, or collection vision..."
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                />
                <span className="text-right text-[8px] font-semibold text-gray-400 uppercase tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {editBio.length}/240 characters
                </span>
              </div>

              {/* Names row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/10"
                    placeholder="Your name"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/10"
                    placeholder="Your name"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                    required
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/10"
                  placeholder="Your email"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                  required
                />
              </div>

              {/* Phone field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/10"
                  placeholder="Your number"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                />
              </div>

              {/* Location Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>District</label>
                  <select
                    value={editDistrict}
                    onChange={(e) => {
                      setEditDistrict(e.target.value)
                      setEditLocality('')
                    }}
                    className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/10 cursor-pointer appearance-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Locality</label>
                  <select
                    value={editLocality}
                    onChange={(e) => setEditLocality(e.target.value)}
                    disabled={!editDistrict}
                    className="w-full bg-[#FAF8F5] border border-gray-155 rounded-2xl px-4 py-3 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/10 cursor-pointer disabled:opacity-60 appearance-none"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                    required
                  >
                    <option value="">Select Locality</option>
                    {(editDistrict ? nepalLocations[editDistrict] || [] : []).map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

          </div>

          {/* Divider Line */}
          <hr className="border-t border-gray-150 my-2" />

          {/* Danger Zone Panel */}
          <div className="border border-[#FFE5E5] rounded-3xl p-6 bg-[#FFF8F8] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left select-none">
              <h4 className="text-sm font-bold text-[#D1475A]" style={{ fontFamily: 'var(--font-montserrat)' }}>Danger Zone</h4>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-1 leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Deleting your account is permanent. This will remove all your order history, bespoke designs, and artisan connections.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
                  showSnackbar("Account deletion is restricted in the preview environment.", "error")
                }
              }}
              className="bg-white border border-[#D1475A] hover:bg-[#D1475A]/5 text-[#D1475A] text-[9px] font-bold tracking-widest px-6 py-3 rounded uppercase cursor-pointer transition-all active:scale-95 text-center shrink-0"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Delete Account
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
