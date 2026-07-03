import React, { useState } from 'react'
import Image from 'next/image'
import { METALS, GEMSTONES } from '@/lib/materials/material'

interface CreatePostModalProps {
  user: any
  onClose: () => void
  onSubmit: (data: {
    description: string
    category: string
    budget: string
    materials: string[]
    imageFiles: File[]
  }) => Promise<void>
}

export default function CreatePostModal({
  user,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const [description, setDescription] = useState('')
  const [categories, setCategories] = useState<string[]>(['Rings'])
  const [budget, setBudget] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [uploadedImageFiles, setUploadedImageFiles] = useState<File[]>([])
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState<string[]>([])

  const [metalsDropdownOpen, setMetalsDropdownOpen] = useState(false)
  const [gemsDropdownOpen, setGemsDropdownOpen] = useState(false)
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null)

  const extendedMetals = [...METALS, 'Other']
  const extendedGemstones = [...GEMSTONES, 'Other']

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setUploadedImageFiles((prev) => [...prev, ...files])
    setUploadedImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setUploadedImageFiles((prev) => prev.filter((_, i) => i !== index))
    setUploadedImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    )
  }

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || categories.length === 0) return

    await onSubmit({
      description,
      category: categories.join(', '),
      budget,
      materials: selectedMaterials,
      imageFiles: uploadedImageFiles,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100/70 animate-scale-up flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#FAF0F3] p-6 relative flex-shrink-0 text-center border-b border-[#5F3041]/10">
          <h3 className="text-xl font-bold tracking-wide text-[#5F3041]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Post Design Sketch
          </h3>
          <p className="text-[10px] text-[#5F3041]/60 font-semibold uppercase tracking-widest mt-1">
            Publish a custom jewelry design to the community feed
          </p>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#5F3041]/70 hover:text-[#5F3041] cursor-pointer bg-transparent border-none transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form - 2 Columns */}
        <form onSubmit={handleFormSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#FDFBFB]">
          
          {/* Left Column */}
          <div className="flex flex-col gap-5">
            {/* Description */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[9px] font-bold text-[#5F3041]/60 uppercase tracking-[0.15em]"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Design Details & Story
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the gemstone cuts, custom settings, and inspiration behind this design sketch..."
                className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl p-4 text-xs text-gray-707 focus:outline-none focus:bg-white focus:border-[#5F3041]/40 focus:ring-1 focus:ring-[#5F3041]/10 resize-none leading-relaxed transition-all duration-300 font-medium"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              />
            </div>

            {/* Design Images / Sketch Upload */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[9px] font-bold text-[#5F3041]/60 uppercase tracking-[0.15em]"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Design Sketch or Illustration
              </label>

              {uploadedImagePreviews.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {/* Collage display */}
                  <div className="relative w-full h-[180px] rounded-2xl overflow-hidden border border-gray-200 bg-[#FAF8F5]">
                    {uploadedImagePreviews.length === 1 && (
                      <div
                        onClick={() => setPreviewZoomImage(uploadedImagePreviews[0])}
                        className="relative w-full h-full group animate-fade-in cursor-pointer hover:opacity-95 transition-opacity"
                      >
                        <Image src={uploadedImagePreviews[0]} alt="Sketch" fill className="object-contain bg-[#FAF8F5]" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(0)
                          }}
                          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 cursor-pointer shadow-md z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                          title="Remove image"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {uploadedImagePreviews.length === 2 && (
                      <div className="grid grid-cols-2 gap-1 w-full h-full animate-fade-in">
                        {uploadedImagePreviews.map((preview, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewZoomImage(preview)}
                            className="relative h-full group cursor-pointer hover:opacity-95 transition-opacity"
                          >
                            <Image src={preview} alt={`Sketch ${idx + 1}`} fill className="object-contain bg-[#FAF8F5]" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(idx)
                              }}
                              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                              title="Remove image"
                            >
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadedImagePreviews.length === 3 && (
                      <div className="grid grid-cols-3 gap-1 w-full h-full animate-fade-in">
                        <div
                          onClick={() => setPreviewZoomImage(uploadedImagePreviews[0])}
                          className="relative col-span-2 h-full group cursor-pointer hover:opacity-95 transition-opacity"
                        >
                          <Image src={uploadedImagePreviews[0]} alt="Sketch 1" fill className="object-contain bg-[#FAF8F5]" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(0)
                            }}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                            title="Remove image"
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex flex-col gap-1 h-full col-span-1">
                          {[1, 2].map((idx) => (
                            <div
                              key={idx}
                              onClick={() => setPreviewZoomImage(uploadedImagePreviews[idx])}
                              className="relative flex-1 group cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              <Image src={uploadedImagePreviews[idx]} alt={`Sketch ${idx + 1}`} fill className="object-contain bg-[#FAF8F5]" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeImage(idx)
                                }}
                                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                                title="Remove image"
                              >
                                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {uploadedImagePreviews.length >= 4 && (
                      <div className="grid grid-cols-2 gap-1 w-full h-full animate-fade-in">
                        {[0, 1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewZoomImage(uploadedImagePreviews[idx])}
                            className="relative h-full group cursor-pointer hover:opacity-95 transition-opacity"
                          >
                            <Image src={uploadedImagePreviews[idx]} alt={`Sketch ${idx + 1}`} fill className="object-contain bg-[#FAF8F5]" />
                            <button
                              type="button"
                              onClick={(e) => {
                                  e.stopPropagation()
                                  removeImage(idx)
                              }}
                              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer shadow z-20 transition-all active:scale-90 border-none flex items-center justify-center"
                              title="Remove image"
                            >
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                            {idx === 3 && uploadedImagePreviews.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 text-white font-extrabold flex items-center justify-center text-xs z-10 select-none">
                                +{uploadedImagePreviews.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails row */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {uploadedImagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image src={preview} alt="Thumb" fill className="object-contain bg-[#FAF8F5]" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black cursor-pointer shadow z-10 border-none flex items-center justify-center"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {/* Add more photo card */}
                    <label className="w-12 h-12 rounded-lg border border-dashed border-[#5F3041]/20 hover:border-[#5F3041] flex items-center justify-center cursor-pointer flex-shrink-0 bg-[#FAF0F3]/20 hover:bg-[#FAF0F3]/40 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#5F3041]/60">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center border-2 border-dashed border-[#5F3041]/20 hover:border-[#5F3041] rounded-2xl p-6 cursor-pointer transition-all bg-[#FAF0F3]/20 hover:bg-[#FAF0F3]/40 h-[160px] text-center flex-col gap-2 group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#5F3041]/60 group-hover:text-[#5F3041] transition-colors">
                    <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5A2.25 2.25 0 006.75 19.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[10px] font-bold text-[#5F3041]/70 group-hover:text-[#5F3041] tracking-widest uppercase transition-colors" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    Upload Design Sketches
                  </span>
                  <span className="text-[9px] text-[#5F3041]/50" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    Select multiple images (PNG, JPG, WEBP)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[9px] font-bold text-[#5F3041]/60 uppercase tracking-[0.15em]"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Jewelry Category (Multi-select)
                </label>
                <div className="grid grid-cols-2 gap-2 select-none">
                  {['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Tiaras', 'Bespoke Sets'].map((cat) => {
                    const isSelected = categories.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="py-2 px-3 rounded-xl text-[10px] font-bold tracking-wider uppercase border text-center cursor-pointer transition-all active:scale-95 duration-200"
                        style={{
                          fontFamily: 'var(--font-montserrat)',
                          backgroundColor: isSelected ? '#5F3041' : 'white',
                          borderColor: isSelected ? '#5F3041' : '#E5E7EB',
                          color: isSelected ? 'white' : '#4B5563',
                          boxShadow: isSelected ? '0 4px 12px rgba(61, 12, 31, 0.12)' : 'none',
                        }}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price / Budget Estimate */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[9px] font-bold text-[#5F3041]/60 uppercase tracking-[0.15em]"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Price Estimate (Rs. - Optional)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl px-4 py-3 text-xs text-gray-700 focus:outline-none focus:bg-white focus:border-[#5F3041]/40 focus:ring-1 focus:ring-[#5F3041]/10 transition-all duration-300 font-semibold"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                />
              </div>

              {/* Materials Dropdowns with Checkbox Lists */}
              <div className="flex flex-col gap-2 relative">
                <label
                  className="text-[9px] font-bold text-[#5F3041]/60 uppercase tracking-[0.15em]"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Materials Used / Setting Options
                </label>
                <div className="flex flex-col gap-3">
                  
                  {/* Metals Checklist Dropdown */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        setMetalsDropdownOpen(!metalsDropdownOpen)
                        setGemsDropdownOpen(false)
                      }}
                      className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl px-4 py-3 text-xs text-gray-700 flex justify-between items-center cursor-pointer select-none hover:border-gray-300 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      <span className="truncate">
                        {selectedMaterials.filter((m) => extendedMetals.includes(m)).length > 0
                          ? selectedMaterials.filter((m) => extendedMetals.includes(m)).join(', ')
                          : 'Select Metals / Base Materials'}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform duration-200 ${metalsDropdownOpen ? 'transform rotate-180' : ''}`}>
                        <path d="M1 3.5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {metalsDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-[#5F3041]/10 rounded-2xl shadow-xl z-30 max-h-40 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
                        {extendedMetals.map((metal) => {
                          const isChecked = selectedMaterials.includes(metal)
                          return (
                            <label key={metal} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF0F3]/40 rounded-xl cursor-pointer select-none transition-colors">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMaterial(metal)}
                                className="accent-[#5F3041] cursor-pointer w-3.5 h-3.5 rounded border-gray-300 text-[#5F3041] focus:ring-[#5F3041]"
                              />
                              <span className="text-gray-700 font-medium">{metal}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Gemstones Checklist Dropdown */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        setGemsDropdownOpen(!gemsDropdownOpen)
                        setMetalsDropdownOpen(false)
                      }}
                      className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl px-4 py-3 text-xs text-gray-700 flex justify-between items-center cursor-pointer select-none hover:border-gray-300 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-montserrat)' }}
                    >
                      <span className="truncate">
                        {selectedMaterials.filter((m) => extendedGemstones.includes(m)).length > 0
                          ? selectedMaterials.filter((m) => extendedGemstones.includes(m)).join(', ')
                          : 'Select Gemstones'}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform duration-200 ${gemsDropdownOpen ? 'transform rotate-180' : ''}`}>
                        <path d="M1 3.5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {gemsDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-[#5F3041]/10 rounded-2xl shadow-xl z-30 max-h-40 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
                        {extendedGemstones.map((gem) => {
                          const isChecked = selectedMaterials.includes(gem)
                          return (
                            <label key={gem} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF0F3]/40 rounded-xl cursor-pointer select-none transition-colors">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMaterial(gem)}
                                className="accent-[#5F3041] cursor-pointer w-3.5 h-3.5 rounded border-gray-300 text-[#5F3041] focus:ring-[#5F3041]"
                              />
                              <span className="text-gray-700 font-medium">{gem}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* Submit Actions */}
            <div className="flex gap-3 justify-end pt-5 mt-auto border-t border-[#5F3041]/10 select-none">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-[#FAF0F3]/30 transition-all duration-300 cursor-pointer bg-white"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#5F3041] hover:bg-[#4A2231] text-[#FAF8F5] hover:text-white text-xs font-bold tracking-widest px-8 py-3 rounded-full uppercase cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(61,12,31,0.15)] active:scale-95 border-none"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Publish Design
              </button>
            </div>

          </div>

        </form>
      </div>

      {/* Image Preview zoom modal */}
      {previewZoomImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <Image src={previewZoomImage} alt="Zoom Preview" fill className="object-contain" />
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 cursor-pointer border-none flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
