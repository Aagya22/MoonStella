'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/app/components/shared/navbar'
import Footer from '@/app/components/shared/footer'
import Reveal from '@/app/components/shared/Reveal'

const FILTERS = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bangles', 'Gemstones'] as const
type Filter = (typeof FILTERS)[number]

interface Product {
  id: number
  name: string
  category: Exclude<Filter, 'All'>
  materials: string
  price: string
  image: string
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Solitaire Halo Ring', category: 'Rings', materials: '18k Rose Gold · Natural Diamond', price: 'Rs. 85,000', image: '/rings.png' },
  { id: 2, name: 'Cascade Diamond Necklace', category: 'Necklaces', materials: '18k White Gold · Pavé', price: 'Rs. 1,20,000', image: '/necklaces.png' },
  { id: 3, name: 'Petal Drop Earrings', category: 'Earrings', materials: '14k Yellow Gold · Morganite', price: 'Rs. 42,000', image: '/earrings.png' },
  { id: 4, name: 'Heritage Filigree Bangle', category: 'Bangles', materials: '22k Yellow Gold', price: 'Rs. 96,000', image: '/newbangle.jpg' },
  { id: 5, name: 'Astrid Sapphire Pendant', category: 'Gemstones', materials: 'Platinum 950 · Royal Blue Sapphire', price: 'Rs. 74,000', image: '/astrid_pendant.png' },
  { id: 6, name: 'Elara Emerald Pendant', category: 'Gemstones', materials: '18k Gold · Colombian Emerald', price: 'Rs. 68,000', image: '/elara_pendant.png' },
  { id: 7, name: 'Pavé Tennis Bracelet', category: 'Bangles', materials: '18k Rose Gold · Natural Diamond', price: 'Rs. 1,10,000', image: '/bracelet.png' },
  { id: 8, name: 'Botanical Choker', category: 'Necklaces', materials: 'Sterling Silver 925 · Nephrite Jade', price: 'Rs. 38,000', image: '/wish_choker.png' },
  { id: 9, name: 'Rose Cuff', category: 'Bangles', materials: '14k Rose Gold', price: 'Rs. 52,000', image: '/wish_cuff.png' },
  { id: 10, name: 'Pink Tourmaline Studs', category: 'Earrings', materials: '18k Gold · Pink Tourmaline', price: 'Rs. 33,000', image: '/recom_earrings.png' },
  { id: 11, name: 'Aurora Gemstone Ring', category: 'Rings', materials: 'Platinum 950 · Aquamarine', price: 'Rs. 61,000', image: '/pink_gemstone.png' },
  { id: 12, name: 'Bespoke Signature Set', category: 'Rings', materials: 'Made to order', price: 'On Request', image: '/custom.png' },
]

function ProductCard({ item }: { item: Product }) {
  return (
    <Link href="/get-started" className="group block">
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl mb-4 bg-[#F5F2EF]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="absolute top-3 left-3 text-[9px] font-semibold tracking-widest uppercase text-[#5F3041] bg-white/85 backdrop-blur px-2.5 py-1 rounded-full"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          {item.category}
        </span>
      </div>
      <h3
        className="text-lg font-semibold text-gray-900 leading-tight"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {item.name}
      </h3>
      <p
        className="text-[11px] tracking-wide uppercase text-gray-400 mt-1"
        style={{ fontFamily: 'var(--font-montserrat)' }}
      >
        {item.materials}
      </p>
      <p
        className="text-sm font-semibold text-[#5F3041] mt-2"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {item.price}
      </p>
    </Link>
  )
}

export default function ProductPage() {
  const [active, setActive] = useState<Filter>('All')
  const shown = active === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === active)

  return (
    <>
      <Navbar />

      {/* Page intro */}
      <section className="bg-[#FCF9F8] pt-20 pb-10">
        <div className="w-full px-16">
          <Reveal className="pb-6 border-b border-gray-200">
            <p
              className="text-xs font-semibold tracking-widest mb-2"
              style={{ color: '#5F3041', fontFamily: 'var(--font-montserrat)' }}
            >
              THE COLLECTION
            </p>
            <h1
              className="text-3xl md:text-5xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Curated Pieces &amp; Bespoke Commissions
            </h1>
            <p
              className="text-sm text-gray-500 mt-4 max-w-2xl leading-relaxed"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              A selection of fine jewellery from our master artisans. Every piece can be
              worn as shown or reimagined as a one-of-a-kind commission, made to your brief.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="bg-[#FCF9F8] pt-10 pb-24">
        <div className="w-full px-16">

          <div className="flex flex-wrap gap-2.5 mb-16 pb-9">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
                  active === f
                    ? 'bg-[#5F3041] text-white border-[#5F3041]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#5F3041]/40 hover:text-[#5F3041]'
                }`}
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {shown.map((item, i) => (
              // re-key on the active filter so cards re-reveal when the filter changes
              <Reveal key={`${active}-${item.id}`} delay={(i % 4) * 0.08}>
                <ProductCard item={item} />
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* Commission CTA — own section so it can never ride over the grid */}
      <section className="bg-[#FCF9F8] pb-24">
        <div className="w-full px-16">
          <Reveal className="rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgba(61,12,31,0.03)] px-8 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-gray-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Can&apos;t find quite the right piece?
              </h2>
              <p
                className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                Post a brief and our artisans will craft something made entirely for you.
              </p>
            </div>
            <Link
              href="/get-started"
              className="shrink-0 bg-[#5F3041] hover:bg-[#4A2231] text-white text-[11px] font-bold tracking-widest uppercase px-8 py-4 rounded-full transition-all duration-300 active:scale-95"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              Start a Commission
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
