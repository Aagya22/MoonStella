'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/axios'
import { nepalLocations, districts } from '@/lib/nepal-locations/location'
import { MapPin, CreditCard, Banknote, Smartphone, Check, ArrowRight, ArrowLeft } from 'lucide-react'

interface BespokeOrderModalProps {
  isOpen: boolean
  onClose: () => void
  sellerId: string
  sellerName: string
  postId?: string
  postCategory?: string
  postBudget?: number | null
  postDescription?: string
  postImage?: string | null
  buyerLocation?: string | null
  sellerLocation?: string | null
  postPrice?: string | number | null
}

type PaymentMethodType = 'Cash on Delivery' | 'eSewa' | 'Khalti' | 'Card Payment'

export default function BespokeOrderModal({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  postId,
  postCategory,
  postBudget,
  postDescription,
  postImage,
  buyerLocation,
  sellerLocation,
  postPrice,
}: BespokeOrderModalProps) {
  const router = useRouter()
  
  // Wizard Step State
  const [step, setStep] = useState(1) // 1: Fill details, 2: Finalize & Confirm

  // Delivery address fields
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedLocality, setSelectedLocality] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [paymentOption, setPaymentOption] = useState<PaymentMethodType>('Cash on Delivery')
  const [submitting, setSubmitting] = useState(false)

  // Robust parser for pricing strings (e.g. "Rs. 8,200" or "8200" or numeric)
  const parseNumericPrice = (val: any): number => {
    if (!val) return 0
    if (typeof val === 'number') return val
    const cleaned = String(val).replace(/Rs\./i, '').replace(/Rs/i, '').replace(/,/g, '').trim()
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const basePrice = parseNumericPrice(postBudget) || parseNumericPrice(postPrice) || 0

  const getCityOrDistrict = (loc: string) => {
    if (!loc) return ''
    const parts = loc.split(',').map(p => p.trim().toLowerCase())
    if (parts.length >= 2) {
      if (parts[parts.length - 1] === 'nepal') {
        return parts[parts.length - 2]
      }
      return parts[parts.length - 1]
    }
    return parts[0] || ''
  }

  const sellerCity = getCityOrDistrict(sellerLocation || '')
  
  // Dynamic delivery charge calculation (finalized on Step 2 based on district match)
  const isSameCity = selectedDistrict && sellerCity && selectedDistrict.toLowerCase() === sellerCity.toLowerCase()
  const deliveryCharge = selectedDistrict ? (isSameCity ? 100 : 200) : 200
  const totalPrice = basePrice + deliveryCharge

  // Pre-fill / reset states
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      if (buyerLocation) {
        const parts = buyerLocation.split(',').map(p => p.trim())
        if (parts.length >= 2) {
          const matchedDistrict = districts.find(d => d.toLowerCase() === parts[1].toLowerCase())
          if (matchedDistrict) {
            setSelectedDistrict(matchedDistrict)
            const matchedLocality = (nepalLocations[matchedDistrict] || []).find(l => l.toLowerCase() === parts[0].toLowerCase())
            setSelectedLocality(matchedLocality || parts[0])
          }
        }
      } else {
        setSelectedDistrict('')
        setSelectedLocality('')
      }
      
      setAddress('')
      setLandmark('')
      setDeliveryNotes('')
      setPaymentOption('Cash on Delivery')
    }
  }, [isOpen, buyerLocation])

  if (!isOpen) return null

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDistrict) {
      alert('Please select a City / District.')
      return
    }
    if (!selectedLocality) {
      alert('Please select an Area / Locality.')
      return
    }
    if (!address.trim()) {
      alert('Please provide a street address.')
      return
    }
    setStep(2)
  }

  const handleSubmitOrder = async () => {
    setSubmitting(true)
    try {
      const orderTitle = postCategory ? `Order: ${postCategory}` : 'Bespoke Order'
      const finalDesc = `${postDescription || 'Bespoke Commission Item'}\n\n[Delivery Notes]: ${deliveryNotes.trim() || 'None'}`
      const fullLocationString = `${address.trim()}, ${selectedLocality}, ${selectedDistrict}${landmark.trim() ? ` (Landmark: ${landmark.trim()})` : ''}`

      const res = await api.post('/api/orders', {
        sellerId,
        postId: postId || undefined,
        title: orderTitle,
        description: finalDesc,
        budget: totalPrice,
        deliveryLocation: fullLocationString,
        paymentMethod: paymentOption,
      })

      if (res.data && res.data.success) {
        alert('Order placed successfully!')
        onClose()
        router.push('/buyer/orders')
      }
    } catch (err: any) {
      console.error('Failed to place order:', err)
      alert(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const paymentMethods = [
    {
      type: 'Cash on Delivery' as PaymentMethodType,
      name: 'Cash on Delivery',
      desc: 'Pay with cash upon delivery',
      icon: Banknote,
    },
    {
      type: 'eSewa' as PaymentMethodType,
      name: 'eSewa Wallet',
      desc: 'Instant digital wallet payout',
      icon: Smartphone,
    },
    {
      type: 'Khalti' as PaymentMethodType,
      name: 'Khalti Wallet',
      desc: 'Pay with Khalti secure gateway',
      icon: Smartphone,
    },
    {
      type: 'Card Payment' as PaymentMethodType,
      name: 'Card Payment',
      desc: 'Visa, MasterCard or UnionPay',
      icon: CreditCard,
    },
  ]

  return (
    <div className="fixed inset-0 bg-[#3D0C1F]/45 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-[0_25px_60px_rgba(61,12,31,0.18)] border border-[#5F3041]/10 flex flex-col relative animate-scale-up max-h-[90vh]">
        
        {/* Header Ribbon */}
        <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-[#FAF8F5]/80 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex flex-col text-left">
            <h2 className="text-lg font-bold text-gray-900 tracking-wide font-serif" style={{ fontFamily: 'var(--font-playfair)' }}>
              {step === 1 ? 'Checkout Details' : 'Finalize & Confirm'}
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
              Step {step} of 2
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[#5F3041] cursor-pointer p-2 hover:bg-[#5F3041]/5 rounded-full transition-all border-none bg-transparent flex items-center justify-center"
            title="Close Checkout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Wizard Forms */}
        {step === 1 ? (
          /* STEP 1: Fill shipping and payment options */
          <form onSubmit={handleNextStep} className="p-8 overflow-y-auto flex flex-col gap-6 text-left">
            
            {/* Product Summary & Fixed Price */}
            <div className="flex gap-4 bg-[#FAF8F5] border border-[#5F3041]/5 p-5 rounded-3xl items-center">
              <div className="relative w-16 aspect-square rounded-2xl overflow-hidden border border-[#5F3041]/10 bg-white shrink-0 shadow-xs">
                <Image
                  src={postImage || '/buyersignup.png'}
                  alt="Product Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col text-left">
                <span className="text-[9px] font-extrabold text-[#5F3041] uppercase tracking-widest font-sans">
                  {postCategory || 'Bespoke Masterpiece'}
                </span>
                <h4 className="text-xs font-bold text-gray-800 tracking-wide truncate font-sans">
                  Item by {sellerName}
                </h4>
                <p className="text-xs font-extrabold text-[#5F3041] mt-1 font-serif">
                  Price: Rs. {basePrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Delivery address details */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-extrabold text-[#5F3041] uppercase tracking-wider font-sans border-b border-gray-50 pb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#5F3041]" />
                Shipping Address Details
              </h3>

              {/* City / District Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">
                  City / District *
                </label>
                <select
                  required
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value)
                    setSelectedLocality('')
                  }}
                  className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-xl px-4 py-2.5 text-xs text-gray-807 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans cursor-pointer"
                >
                  <option value="">-- Choose your City / District --</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area / Locality Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">
                  Area / Locality *
                </label>
                <select
                  required
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-xl px-4 py-2.5 text-xs text-gray-807 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedDistrict ? '-- Choose your Locality --' : '-- Choose District First --'}
                  </option>
                  {(selectedDistrict ? nepalLocations[selectedDistrict] || [] : []).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Where they live */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">
                  Street Address / Home Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Apartment 4B, Maitidevi Marg"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-xl px-4 py-2.5 text-xs text-gray-707 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Landmark */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Near Nepal Bank / Temple"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-xl px-4 py-2.5 text-xs text-gray-707 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans transition-all"
                  />
                </div>

                {/* Delivery Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-sans">
                    Delivery Notes
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Leave with guard, call first"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full bg-[#FAF8F5]/85 border border-[#5F3041]/10 rounded-xl px-4 py-2.5 text-xs text-gray-707 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#5F3041]/35 font-sans transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Cards */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-extrabold text-[#5F3041] uppercase tracking-wider font-sans border-b border-gray-50 pb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#5F3041]" />
                Select Payment Option
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {paymentMethods.map((pm) => {
                  const isSelected = paymentOption === pm.type
                  const IconComp = pm.icon
                  return (
                    <div
                      key={pm.type}
                      onClick={() => setPaymentOption(pm.type)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex gap-3.5 items-center transition-all duration-200 ${
                        isSelected
                          ? 'border-[#5F3041] bg-[#FAF0F3]/30 shadow-xs'
                          : 'border-gray-200 hover:border-[#5F3041]/30 bg-white'
                      }`}
                    >
                      <IconComp className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[#5F3041]' : 'text-gray-400'}`} />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-gray-800 font-sans tracking-wide">
                          {pm.name}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5 leading-tight font-sans">
                          {pm.desc}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end pt-5 border-t border-gray-100 mt-2 sticky bottom-0 bg-white pb-1">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 text-[10px] font-bold tracking-widest rounded-xl uppercase cursor-pointer hover:bg-gray-50 text-gray-500 font-sans bg-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest rounded-xl uppercase cursor-pointer border-none font-sans transition-all active:scale-97 shadow-md flex items-center gap-1.5"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </form>
        ) : (
          /* STEP 2: Finalize pricing based on matching city & confirm order */
          <div className="p-8 overflow-y-auto flex flex-col gap-6 text-left">
            
            {/* Price Finalization breakdown block */}
            <div className="bg-[#FAF8F5] border border-[#5F3041]/5 p-6 rounded-3xl flex flex-col gap-3">
              <h3 className="text-xs font-bold text-gray-800 tracking-wide uppercase border-b border-gray-200/50 pb-2">
                Order Invoice Summary
              </h3>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Item Price:</span>
                <span className="font-bold">Rs. {basePrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  Delivery Charge ({isSameCity ? 'Same City' : 'Different City'}):
                </span>
                <span className="font-bold">Rs. {deliveryCharge.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-900 font-extrabold pt-3 border-t border-dashed border-gray-200">
                <span>Total Payment:</span>
                <span className="text-[#5F3041] font-serif">Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Summary details review panel */}
            <div className="border border-gray-100 p-5 rounded-3xl flex flex-col gap-3.5">
              <h3 className="text-[10px] font-extrabold text-[#5F3041] uppercase tracking-wider font-sans border-b border-gray-50 pb-1.5">
                Delivery Details
              </h3>

              <div className="flex flex-col text-xs gap-1.5 text-gray-700">
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-semibold text-gray-400">Recipient Address:</span>
                  <span className="font-medium">{address}, {selectedLocality}, {selectedDistrict}</span>
                </div>
                {landmark.trim() && (
                  <div className="grid grid-cols-[110px_1fr] gap-2">
                    <span className="font-semibold text-gray-400">Landmark:</span>
                    <span className="font-medium">{landmark}</span>
                  </div>
                )}
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-semibold text-gray-400">Payment Option:</span>
                  <span className="font-bold text-[#5F3041]">{paymentOption}</span>
                </div>
                {deliveryNotes.trim() && (
                  <div className="grid grid-cols-[110px_1fr] gap-2">
                    <span className="font-semibold text-gray-400">Special Instructions:</span>
                    <span className="font-medium text-gray-500 italic">"{deliveryNotes}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 buttons */}
            <div className="flex gap-4 justify-end pt-5 border-t border-gray-100 mt-2 sticky bottom-0 bg-white pb-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-200 text-[10px] font-bold tracking-widest rounded-xl uppercase cursor-pointer hover:bg-gray-50 text-gray-500 font-sans bg-transparent flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Go Back
              </button>
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="px-8 py-3 bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] hover:text-white text-[10px] font-bold tracking-widest rounded-xl uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none font-sans transition-all active:scale-97 shadow-md flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {submitting ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
