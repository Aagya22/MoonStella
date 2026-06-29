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
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 animate-scale-up flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#3D0C1F] text-white p-6 relative flex-shrink-0">
          <h3 className="text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
            Post Design Sketch
          </h3>
          <p className="text-[10px] text-[#E9D7C3] font-semibold uppercase tracking-widest mt-1">
            Publish a custom jewelry design to the community feed
          </p>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white cursor-pointer bg-transparent border-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form - 2 Columns */}
        <form onSubmit={handleFormSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white overflow-y-auto max-h-[80vh]">
          
          {/* Left Column */}
          <div className="flex flex-col gap-5">
            {/* Description */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
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
                className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl p-4 text-xs focus:outline-none focus:bg-white focus:border-[#3D0C1F] focus:ring-1 focus:ring-[#3D0C1F]/15 resize-none leading-relaxed font-medium"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              />
            </div>

            {/* Design Images / Sketch Upload */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Design Images / Sketches
              </label>
              
              <div className="grid grid-cols-4 gap-3">
                {uploadedImagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-[#FAF8F5] group shadow-2xs">
                    <Image
                      src={preview}
                      alt="Sketch Thumb"
                      fill
                      className="object-cover cursor-zoom-in"
                      onClick={() => setPreviewZoomImage(preview)}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 cursor-pointer border-none flex items-center justify-center w-5 h-5 shadow"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}

                {uploadedImagePreviews.length < 4 && (
                  <label className="aspect-square rounded-xl border border-dashed border-gray-300 bg-[#FAF8F5] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50/50 hover:border-gray-400 transition-all select-none">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Sketches</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
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
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold tracking-wider uppercase border text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#3D0C1F] text-white border-[#3D0C1F]'
                            : 'bg-[#FAF8F5] text-gray-600 border-gray-150 hover:bg-gray-50'
                        }`}
                        style={{ fontFamily: 'var(--font-montserrat)' }}
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
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  Price Estimate (Rs. - Optional)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:bg-white focus:border-[#3D0C1F] font-semibold"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                />
              </div>

              {/* Materials Dropdowns with Checkbox Lists */}
              <div className="flex flex-col gap-2 relative">
                <label
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
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
                      className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl px-4 py-3 text-xs text-gray-700 flex justify-between items-center cursor-pointer select-none"
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
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-150 rounded-2xl shadow-xl z-30 max-h-40 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
                        {extendedMetals.map((metal) => {
                          const isChecked = selectedMaterials.includes(metal)
                          return (
                            <label key={metal} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF8F5] rounded-xl cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMaterial(metal)}
                                className="accent-[#3D0C1F] cursor-pointer"
                              />
                              <span className="text-gray-700 font-semibold">{metal}</span>
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
                      className="w-full bg-[#FAF8F5] border border-gray-150 rounded-2xl px-4 py-3 text-xs text-gray-700 flex justify-between items-center cursor-pointer select-none"
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
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-150 rounded-2xl shadow-xl z-30 max-h-40 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
                        {extendedGemstones.map((gem) => {
                          const isChecked = selectedMaterials.includes(gem)
                          return (
                            <label key={gem} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAF8F5] rounded-xl cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMaterial(gem)}
                                className="accent-[#3D0C1F] cursor-pointer"
                              />
                              <span className="text-gray-700 font-semibold">{gem}</span>
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
            <div className="flex gap-3 justify-end pt-5 mt-auto border-t border-gray-100 select-none">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer bg-white"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#3D0C1F] hover:bg-[#2A0714] text-white text-xs font-bold tracking-widest px-8 py-3 rounded-full uppercase cursor-pointer border-none shadow-md active:scale-95"
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
