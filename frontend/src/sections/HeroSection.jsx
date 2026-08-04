import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import { api, normalizePartner, normalizeProgram } from '../lib/api'

// Import semua gambar dari folder assets/hero
import hero1 from '../assets/hero/20260710173621-4aa81753-images.jpeg'
import hero2 from '../assets/hero/20260710173626-35e1d3d2-kygfxCWZIQ.jpg'
import hero3 from '../assets/hero/20260710173631-2d0180fe-5e931d94dc081.jpg'
import hero4 from '../assets/hero/20260710173636-e7f0ee52-5e4e6891abe99.jpg'
import hero5 from '../assets/hero/20260710211625-db01cb49-images-8.jpeg'
import hero6 from '../assets/hero/20260710211639-8ca7732b-images-7.jpeg'
import hero7 from '../assets/hero/20260710221621-c77d96ff-019A2787.jpg'

const heroImages = [hero1, hero2, hero3, hero4, hero5, hero6, hero7]

function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [stats, setStats] = useState({ countries: 0, partners: 0, programs: 0 })

  const isPausedRef = useRef(false)
  isPausedRef.current = isPaused

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    Promise.all([api.getPartners(), api.getPrograms()])
      .then(([partnersRaw, programsRaw]) => {
        const partners = Array.isArray(partnersRaw) ? partnersRaw.map(normalizePartner) : []
        const programs = Array.isArray(programsRaw) ? programsRaw.map(normalizeProgram) : []

        // Kumpulkan semua negara unik dari partner DAN program
        // partner.country → field "negara" dari backend (nama string)
        // program.country → field "negara" dari backend (nama string, bisa beda dari negara partner-nya)
        const countrySet = new Set()

        partners.forEach((p) => {
          const name = (p.country || '').trim()
          if (name) countrySet.add(name.toLowerCase())
        })

        programs.forEach((pr) => {
          const name = (pr.country || '').trim()
          if (name) countrySet.add(name.toLowerCase())
        })

        setStats({
          // Jumlah negara unik yang benar-benar terhubung
          countries: countrySet.size,
          // Jumlah total partner & kolaborator (semua tipe)
          partners: partners.length,
          // Jumlah total program
          programs: programs.length,
        })
      })
      .catch(() => { })
  }, [])

  const handlePrevSlide = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  const handleNextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
  }

  return (
    <>
      <Navbar />
      <section
        className="relative flex min-h-[92vh] flex-col justify-between overflow-hidden pt-20 sm:pt-24 lg:pt-28"
        id="hero-section"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Image Slideshow */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Yogyakarta Global Network - Slide ${index + 1}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              style={{ transitionProperty: 'opacity, transform', transitionDuration: '1000ms' }}
            />
          ))}
          {/* Solid dark overlay (No Gradient) */}
          <div className="absolute inset-0 bg-[#12080a]/75" />
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 items-center px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-[920px] text-center">

            {/* Headline */}
            <h1 className="text-[clamp(2.4rem,4.8vw,4.2rem)] font-extrabold leading-[1.12] tracking-tight text-white">
              Yogyakarta Global Network
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-[760px] text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed text-white/85">
              Menghubungkan Yogyakarta dengan negara, mitra, dan program kerja sama di seluruh dunia — dari pendidikan dan budaya, hingga ekonomi dan riset.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/programs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#731822] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition duration-200 hover:bg-[#591016] hover:scale-105 active:scale-95"
              >
                <span>Jelajahi Program</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href="/partners"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition duration-200 hover:bg-white hover:text-[#731822] hover:scale-105 active:scale-95"
              >
                <span>Jelajahi Partner</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                </svg>
              </a>
            </div>

            {/* Slideshow Controls (Dots & Arrows) */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Slide sebelumnya"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    aria-label={`Ke slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-200 ${idx === currentImageIndex ? 'w-8 bg-[#e18624]' : 'w-2.5 bg-white/40 hover:bg-white/70'
                      }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Slide selanjutnya"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Banner Section at Bottom */}
        <div className="relative z-10 w-full py-6 pb-10">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {/* Card 1: Negara */}
              <div className="flex items-start gap-4 rounded-2xl border border-[#e7ddcf] bg-white p-6 shadow-lg transition hover:border-[#731822]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] text-[#731822]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8a7c6d]">Negara Terhubung</p>
                  <h3 className="mt-1 text-3xl font-extrabold text-[#111]">{stats.countries}</h3>
                  <p className="mt-1 text-xs text-[#5b5b5b] leading-relaxed">
                    Negara sahabat yang terjalin dalam kerja sama daerah Yogyakarta.
                  </p>
                </div>
              </div>

              {/* Card 2: Mitra Aktif */}
              <div className="flex items-start gap-4 rounded-2xl border border-[#e7ddcf] bg-white p-6 shadow-lg transition hover:border-[#731822]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] text-[#e18624]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8a7c6d]">Mitra &amp; Kolaborator</p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-[#111]">{stats.partners}</span>
                    <span className="text-xs font-semibold text-[#8a7c6d]">Mitra</span>
                    {stats.nonPartners > 0 && (
                      <span className="text-xs text-[#8a7c6d]">({stats.nonPartners} Non-Mitra)</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#5b5b5b] leading-relaxed">
                    Instansi pemerintah, universitas, &amp; organisasi internasional.
                  </p>
                </div>
              </div>

              {/* Card 3: Program Aktif */}
              <div className="flex items-start gap-4 rounded-2xl border border-[#e7ddcf] bg-white p-6 shadow-lg transition hover:border-[#731822] sm:col-span-2 md:col-span-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] text-[#731822]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8a7c6d]">Program</p>
                  <h3 className="mt-1 text-3xl font-extrabold text-[#111]">{stats.programs}</h3>
                  <p className="mt-1 text-xs text-[#5b5b5b] leading-relaxed">
                    Program kerja sama di bidang pendidikan, budaya, &amp; ekonomi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default function Hero() {
  return <HeroSection />
}

