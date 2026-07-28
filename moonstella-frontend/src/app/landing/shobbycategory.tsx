'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const categories = [
  { id: 1, title: 'Custom Creations', image: '/custom.png', href: '#' },
  { id: 2, title: 'Ready-Made', image: '/ready-made.png', href: '#' },
  { id: 3, title: 'Gemstones', image: '/gemstones.png', href: '#' },
  { id: 4, title: 'Ethnics', image: '/newbangle.jpg', href: '#' },
]

function CategoryCard({ item, index }: { item: typeof categories[0], index: number }) {
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
      href={item.href}
      className="group flex-shrink-0 block"
      style={{
        width: '320px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(60px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        transitionDelay: `${index * 0.15}s`,
      }}
    >
      <div className="relative overflow-hidden rounded-2xl mb-4" style={{ height: '420px' }}>
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        <div className="absolute bottom-5 left-5">
          <h3
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {item.title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

export default function ShopByCategory() {
  return (
    <section className="pt-4 pb-20 bg-[#FCF9F8] w-full">

      {/* Header — left-aligned, in the same px-16 frame as the cards below */}
      <div className="w-full px-16">
        <div className="pb-6 border-b border-gray-200 mb-12">
          <p
            className="text-xs font-semibold tracking-widest mb-2"
            style={{ color: '#5F3041', fontFamily: 'var(--font-montserrat)' }}
          >
            CURATION
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Shop by Category
          </h2>
        </div>
      </div>

      {/* Horizontal scroll — full width */}
      <div
        className="flex gap-5 overflow-x-auto px-16 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((item, index) => (
          <CategoryCard key={item.id} item={item} index={index} />
        ))}
      </div>

    </section>
  )
}