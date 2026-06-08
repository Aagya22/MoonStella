import Image from 'next/image'
import Link from 'next/link'

export default function ShopByCategory() {
  return (
    <section className="py-20 px-8 md:px-16 bg-white">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold tracking-widest mb-3"
            style={{ color: '#3D0C1F', fontFamily: 'var(--font-montserrat)' }}
          >
            CURATION
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-gray-900"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Shop by Category
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-12 md:h-[680px]">

          {/* Custom Creations — large left panel */}
          <Link
            href="#"
            className="relative overflow-hidden rounded-2xl group md:col-span-6 min-h-[360px] md:h-full"
          >
            <Image
              src="/custom.png"
              alt="Custom Creations"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-6 left-6">
              <h3
                className="text-xl md:text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Custom Creations
              </h3>
            </div>
          </Link>

          {/* Right column */}
          <div className="grid gap-4 md:col-span-6 md:grid-rows-2 md:h-full">

            {/* Ready-Made and Gemstones */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="#" className="relative overflow-hidden rounded-2xl group aspect-[4/5]">
                <Image
                  src="/ready-made.png"
                  alt="Ready-Made"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-3 left-3">
                  <h3
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    Ready-Made
                  </h3>
                </div>
              </Link>

              <Link href="#" className="relative overflow-hidden rounded-2xl group aspect-[4/5]">
                <Image
                  src="/gemstones.png"
                  alt="Gemstones"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-3 left-3">
                  <h3
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    Gemstones
                  </h3>
                </div>
              </Link>
            </div>

            {/* High Jewellery */}
            <Link href="#" className="relative overflow-hidden rounded-2xl group min-h-[240px] md:h-full">
              {/* <Image
                src="/high-jewellery.png"
                alt="High Jewellery"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              /> */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-4 left-5">
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  High Jewellery
                </h3>
              </div>
            </Link>

          </div>

        </div>

      </div>
    </section>
  )
}