import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, normalizeProgram } from '../lib/api'
import { getDefaultProgramImage } from '../lib/mediaUtils'
import { textClamp1, textClamp2, textSafe, textTruncate } from '../lib/textUtils'

function formatProgramDate(value) {
  if (!value) return 'Tanggal belum diatur'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Tanggal belum diatur'
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatLocation(city, country) {
  const parts = [city, country].filter(Boolean)
  return parts.length ? parts.join(', ') : 'Lokasi belum diatur'
}

function ProgramCard({ program, featured = false }) {
  const bidangList = Array.isArray(program.bidang) ? program.bidang.filter(Boolean) : []
  const isDefault = program.isDefaultImage || !program.images?.length
  const image = program.images?.[0] || getDefaultProgramImage(bidangList)

  return (
    <Link
      to={`/programs/${program.slug}`}
      className={`group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] bg-[#fffaf5] shadow-[0_18px_45px_rgba(0,0,0,0.22)] ring-1 ring-white/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_55px_rgba(0,0,0,0.3)] ${
        featured ? 'w-[min(88vw,400px)]' : 'w-[min(76vw,200px)]'
      }`}
    >
      <div className={`relative overflow-hidden bg-[#fcfaf7] ${featured ? 'h-[200px] sm:h-[250px]' : 'h-[100px] sm:h-[150px]'}`}>
        <img
          src={image}
          alt={program.title}
          className={`h-full w-full transition duration-500 group-hover:scale-105 ${
            isDefault ? 'object-contain p-4 sm:p-6' : 'object-cover'
          }`}
        />
        <div className={`absolute inset-0 ${isDefault ? 'bg-gradient-to-t from-[#241713]/60 via-transparent to-transparent' : 'bg-gradient-to-t from-[#241713]/85 via-[#241713]/25 to-transparent'}`} />
        {featured && (
          <span className="absolute left-4 top-4 rounded-full bg-[#e18624] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#241713]">
            Terbaru
          </span>
        )}
        {program.status && (
          <span
            className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white shadow-sm backdrop-blur-md ${
              program.status === 'Aktif' ? 'bg-emerald-600/90' : 'bg-amber-600/90'
            }`}
          >
            {program.status}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="flex max-w-full flex-wrap gap-1.5 overflow-hidden">
            {(bidangList.length ? bidangList : ['Program']).slice(0, featured ? 3 : 2).map((bidang) => (
              <span
                key={bidang}
                className={`inline-flex max-w-full rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm ${textClamp1}`}
              >
                {bidang}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${featured ? 'gap-3 p-5 sm:p-6' : 'gap-2.5 p-4 sm:p-5'}`}>
        <h3
          className={`${featured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} font-semibold leading-snug text-[#171717] transition group-hover:text-[#731822] ${textClamp2}`}
          title={program.title}
        >
          {program.title}
        </h3>
        <div className="mt-auto space-y-2 border-t border-[#eee6dc] pt-3">
          <p className={`flex min-w-0 items-start gap-2 text-sm text-[#5d5d5d] ${textSafe}`}>
            <span className="mt-0.5 shrink-0 text-[#e18624]" aria-hidden="true">
              ◎
            </span>
            <span className="min-w-0">{formatLocation(program.city, program.country)}</span>
          </p>
          <p className={`flex min-w-0 items-center gap-2 text-sm font-semibold text-[#731822] ${textTruncate}`}>
            <span className="shrink-0 text-[#e18624]" aria-hidden="true">
              ◷
            </span>
            <span className="min-w-0">{formatProgramDate(program.date)}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function ProgramSection() {
  const trackRef = useRef(null)
  const [programs, setPrograms] = useState([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    api
      .getPrograms()
      .then((items) => {
        const sorted = items
          .map(normalizeProgram)
          .sort((a, b) => {
            const aAktif = a.status === 'Aktif' ? 1 : 0
            const bAktif = b.status === 'Aktif' ? 1 : 0
            if (aAktif !== bAktif) return bAktif - aAktif

            const dateA = new Date(a.date || 0).getTime()
            const dateB = new Date(b.date || 0).getTime()
            return dateB - dateA
          })
          .slice(0, 10)
        setPrograms(sorted)
      })
      .catch(() => {})
  }, [])

  function updateScrollState() {
    const track = trackRef.current
    if (!track) return
    const maxScroll = track.scrollWidth - track.clientWidth
    setCanScrollPrev(track.scrollLeft > 8)
    setCanScrollNext(track.scrollLeft < maxScroll - 8)
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    updateScrollState()
    track.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      track.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [programs])

  function scrollCarousel(direction) {
    const track = trackRef.current
    if (!track) return
    const amount = direction === 'next' ? track.clientWidth * 0.82 : track.clientWidth * -0.82
    track.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section id="programs" className="overflow-hidden bg-[#731822] px-5 py-[72px] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 mx-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#e18624]">
              Program terbaru
            </p>
            <h2 className="m-0 mt-3 text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.1] tracking-[-0.04em] text-white">
              Daftar program kerja sama yang terus berkembang.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel('prev')}
                disabled={!canScrollPrev}
                aria-label="Program sebelumnya"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('next')}
                disabled={!canScrollNext}
                aria-label="Program berikutnya"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
              >
                →
              </button>
            </div>
            <Link
              to="/programs"
              className="inline-flex items-center justify-center rounded-full border border-[#e18624] px-4 py-2 text-sm font-semibold text-[#e18624] transition hover:bg-[#e18624] hover:text-[#731822]"
            >
              Lihat semua program
            </Link>
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-6 py-12 text-center text-white/75">
            Belum ada program untuk ditampilkan.
          </div>
        ) : (
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory mx-10 gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {programs.map((program, index) => (
              <ProgramCard key={program.slug} program={program} featured={index === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
