'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const collections = [
  { id: 1, title: 'Rings', subtitle: 'Signature Fluidity', image: '/rings.png', href: '#' },
  { id: 2, title: 'Earrings', subtitle: 'Rare Gemstones', image: '/earrings.png', href: '#' },
  { id: 3, title: 'Necklaces', subtitle: 'Modern Minimalism', image: '/necklaces.png', href: '#' },
]

function CollectionCard({ item, index }: { item: typeof collections[0], index: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <Link
      ref={ref}
      key={item.id}
      href={item.href}
      className="group block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease, transform 0.6s ease`,
        transitionDelay: `${index * 0.15}s`,
      }}
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-4">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1"
        style={{ fontFamily: 'var(--font-playfair)' }}>
        {item.title}
      </h3>
      <p className="text-sm text-gray-500"
        style={{ fontFamily: 'var(--font-montserrat)' }}>
        {item.subtitle}
      </p>
    </Link>
  )
}

export default function FeaturedCollections() {
  return (
    <section className="py-20 bg-[#FCF9F8]">
      <div className="w-full px-16">

        {/* Header */}
        <div className="flex items-end justify-between pb-6 border-b border-gray-200 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest mb-2"
              style={{ color: '#3D0C1F', fontFamily: 'var(--font-montserrat)' }}>
              CURATED SELECTION
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}>
              Featured Collections
            </h2>
          </div>
          <Link href="#"
            className="text-xs font-semibold tracking-widest text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-4"
            style={{ fontFamily: 'var(--font-montserrat)' }}>
            SEE ALL COLLECTIONS
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((item, index) => (
            <CollectionCard key={item.id} item={item} index={index} />
          ))}
        </div>

      </div>
    </section>
  )
}