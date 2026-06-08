import Image from 'next/image'
import Link from 'next/link'

const collections = [
  { id: 1, title: 'Rings', subtitle: 'Signature Fluidity', image: '/rings.png', href: '#' },
  { id: 2, title: 'Earrings', subtitle: 'Rare Gemstones', image: '/earrings.png', href: '#' },
  { id: 3, title: 'Necklaces', subtitle: 'Modern Minimalism', image: '/necklaces.png', href: '#' },
]

export default function FeaturedCollections() {
  return (
    <section className="py-20 px-8 md:px-16 bg-white">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-xs font-semibold tracking-widest mb-2"
              style={{ color: '#3D0C1F', fontFamily: 'var(--font-montserrat)' }}
            >
              CURATED SELECTION
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Featured Collections
            </h2>
          </div>
          <Link
            href="#"
            className="text-xs font-semibold tracking-widest text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-4 hidden md:block"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            SEE ALL COLLECTIONS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {collections.map((item) => (
            <Link key={item.id} href={item.href} className="group block">

              {/* relative here is the fix */}
              <div className="relative w-full aspect-square overflow-hidden rounded-sm mb-4">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <h3
                className="text-lg font-semibold text-gray-900 mb-1"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                {item.subtitle}
              </p>

            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}