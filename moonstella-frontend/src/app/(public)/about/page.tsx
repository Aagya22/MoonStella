'use client'

import Image from 'next/image'
import Navbar from '@/app/components/shared/navbar'
import Footer from '@/app/components/shared/footer'
import Reveal from '@/app/components/shared/Reveal'

const VALUES = [
  {
    title: 'Heritage Craftsmanship',
    body: 'Every piece is made by hand at the bench by master goldsmiths.',
  },
  {
    title: 'Defined by You',
    body: 'Bring a brief, a sketch, or a stone — we craft it into one-of-a-kind.',
  },
  {
    title: 'Honest Provenance',
    body: 'Ethically sourced metals and stones, with transparent pricing.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ height: '460px' }}>
        <Image
          src="/artisan.png"
          alt="Artisan at the bench"
          fill
          sizes="100vw"
          priority
          className="object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(46,8,32,0.85) 0%, rgba(46,8,32,0.55) 45%, rgba(46,8,32,0.12) 82%, transparent 100%)',
          }}
        />
        <div className="relative z-10 h-full flex items-center">
          <div className="px-16 max-w-3xl">
            <p
              className="animate-fade-in text-xs font-semibold tracking-widest mb-4 text-[#E9D7C3]"
              style={{ fontFamily: 'var(--font-montserrat)', animationDelay: '0.1s' }}
            >
              OUR STORY
            </p>
            <h1
              className="animate-fade-in text-4xl md:text-6xl font-bold text-white leading-[1.05]"
              style={{ fontFamily: 'var(--font-playfair)', animationDelay: '0.25s' }}
            >
              Exquisite Artistry,
              <br />
              Defined by You
            </h1>
            <p
              className="animate-fade-in text-base md:text-lg text-white/85 mt-5 leading-relaxed max-w-lg"
              style={{ fontFamily: 'var(--font-montserrat)', animationDelay: '0.4s' }}
            >
              A marketplace where heritage craftsmanship meets the person it is made for.
            </p>
          </div>
        </div>
      </section>

      {/* Story + values — one balanced two-column section */}
      <section className="bg-[#FCF9F8] py-24">
        <div className="w-full px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — words */}
            <Reveal from="up">
              <p
                className="text-xs font-semibold tracking-widest mb-4"
                style={{ color: '#5F3041', fontFamily: 'var(--font-montserrat)' }}
              >
                THE HOUSE
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                A quieter kind of luxury — one that begins with a conversation.
              </h2>
              <p
                className="text-base text-gray-500 mt-5 leading-relaxed"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                MoonStella gives independent goldsmiths a home online, and gives collectors a
                way to commission jewellery the way it was always meant to be made —
                personally, patiently, and to the highest standard.
              </p>

              {/* Values, folded in */}
              <div className="mt-10 flex flex-col gap-6">
                {VALUES.map((v) => (
                  <div key={v.title} className="flex gap-4">
                    <div
                      aria-hidden
                      className="mt-2 h-px w-8 shrink-0"
                      style={{ backgroundColor: '#B78A3C' }}
                    />
                    <div>
                      <h3
                        className="text-lg font-bold text-gray-900"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {v.title}
                      </h3>
                      <p
                        className="text-sm text-gray-500 mt-0.5 leading-relaxed"
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        {v.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Right — image */}
            <Reveal from="right" delay={0.15} className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_50px_-20px_rgba(46,8,32,0.4)]">
              <Image
                src="/elara_pendant.png"
                alt="A finished bespoke piece"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </Reveal>

          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
