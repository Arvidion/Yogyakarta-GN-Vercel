import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, normalizePartner } from '../lib/api'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function slugify(value = '') {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const STATUS_ORDER = {
  aktif: 1,
  selesai: 2,
  'tidak aktif': 3,
}

function getStatusPriority(status) {
  const norm = (status || '').toString().toLowerCase().trim()
  return STATUS_ORDER[norm] || 99
}

function sortPartners(items) {
  return [...items].sort((a, b) => {
    const pA = getStatusPriority(a.status)
    const pB = getStatusPriority(b.status)
    if (pA !== pB) return pA - pB
    const idA = Number(a.id) || 0
    const idB = Number(b.id) || 0
    return idB - idA
  })
}

export default function PartnerSection() {
  const [partners, setPartners] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const isPausedRef = useRef(false)

  useEffect(() => {
    api.getPartners()
      .then((items) => {
        const normalized = items.map(normalizePartner)
        setPartners(sortPartners(normalized))
      })
      .catch(() => {})
  }, [])

  const displayedPartners = partners.slice(0, 15)

  useEffect(() => {
    if (displayedPartners.length === 0) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return
    const interval = setInterval(() => {
      if (isPausedRef.current) return
      setActiveIndex((prev) => (prev + 1) % displayedPartners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [displayedPartners.length])

  const active = displayedPartners[activeIndex] || partners[0]

  return (
    <>
      <style>{`
        @keyframes pnFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .pn-spotlight-anim {
          animation: pnFadeIn 0.4s ease;
        }
        .pn-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          align-content: start;
        }
        @media (min-width: 640px) {
          .pn-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .pn-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        .pn-chip-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.6rem; text-align: center;
          background: rgba(115,24,34,0.035);
          border: 1px solid rgba(115,24,34,0.12);
          border-radius: 1rem;
          padding: 1.1rem 0.75rem;
          font-family: inherit;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
          text-decoration: none;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .pn-chip-btn:hover, .pn-chip-btn.pn-chip-active {
          transform: translateY(-3px);
          border-color: rgba(225,134,36,0.6);
          background: rgba(225,134,36,0.09);
        }
        .pn-chip-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(115,24,34,0.08);
          color: rgba(115,24,34,0.75);
          font-weight: 600; font-size: 0.8rem;
          overflow: hidden;
          transition: background 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }
        .pn-chip-btn:hover .pn-chip-avatar,
        .pn-chip-btn.pn-chip-active .pn-chip-avatar {
          background: #e18624; color: #731822;
        }
        .pn-chip-more {
          background: rgba(115,24,34,0.02);
          border: 1px dashed rgba(115,24,34,0.25);
        }
        .pn-chip-more:hover {
          background: rgba(115,24,34,0.08);
          border-color: #731822;
          transform: translateY(-3px);
        }
        .pn-chip-more .pn-chip-avatar {
          background: #731822;
          color: #ffffff;
        }
        .pn-chip-more:hover .pn-chip-avatar {
          background: #e18624;
          color: #731822;
        }
        .pn-chip-name {
          font-size: 0.72rem;
          line-height: 1.35;
          width: 100%;
          color: rgba(46,15,20,0.6);
          transition: color 0.2s ease;
          overflow-wrap: anywhere;
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pn-chip-btn:hover .pn-chip-name,
        .pn-chip-btn.pn-chip-active .pn-chip-name {
          color: #731822;
        }
        .pn-dot-btn {
          width: 8px; height: 8px; border-radius: 999px;
          background: rgba(115,24,34,0.18);
          border: none; padding: 0; cursor: pointer;
          transition: background 0.2s ease, width 0.2s ease;
          flex-shrink: 0;
        }
        .pn-dot-btn.pn-dot-active { background: #e18624; width: 20px; }
        .pn-dot-btn:hover { background: rgba(225,134,36,0.75); }
      `}</style>

      <section
        id="partners"
        className="relative overflow-hidden bg-white px-5 py-[72px] sm:px-6 lg:px-8"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', system-ui, sans-serif" }}
        onMouseEnter={() => { isPausedRef.current = true }}
        onMouseLeave={() => { isPausedRef.current = false }}
      >
        {/* Glow decorations */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '-96px', left: '-96px',
            width: '420px', height: '420px', borderRadius: '50%',
            background: 'rgba(225,134,36,0.14)', filter: 'blur(90px)', pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: '-60px', right: '-100px',
            width: '360px', height: '360px', borderRadius: '50%',
            background: 'rgba(115,24,34,0.07)', filter: 'blur(90px)', pointerEvents: 'none',
          }}
        />

        <div className="relative mx-auto max-w-[1280px]">
          {/* Header */}
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#e18624]">
                Mitra &amp; Kolaborator
              </p>
              <h2
                className="m-0 mt-3 font-normal leading-[1.15] tracking-[-0.02em] text-[#2E0F14]"
                style={{ fontSize: 'clamp(1.6rem,2.6vw,2.2rem)', maxWidth: '34ch' }}
              >
                Didukung oleh mitra dari berbagai sektor dan negara.
              </h2>
            </div>
            <Link
              to="/partners"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#731822] px-4 py-2 text-sm font-semibold text-[#731822] transition hover:bg-[#731822] hover:text-white"
            >
              Lihat semua partner →
            </Link>
          </div>

          {/* Main layout */}
          {partners.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-[#a3988c]">
              Memuat data partner…
            </div>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
              {/* Spotlight card */}
              <Link
                to={`/partners/${slugify(active?.name || '')}-${active?.id || ''}`}
                className="pn-spotlight-anim flex flex-col rounded-[1.4rem] border border-[rgba(115,24,34,0.14)] bg-[#FBF3EC] p-8 no-underline transition hover:border-[#e18624] lg:w-[320px] lg:shrink-0 min-w-0"
                key={activeIndex}
                aria-live="polite"
              >
                {/* Avatar / Logo */}
                {active?.logo ? (
                  <div className="mb-5 flex h-16 w-auto max-w-[160px] items-center justify-start shrink-0">
                    <img src={active.logo} alt={active.name || ''} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div
                    className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full shrink-0 bg-[#731822] text-white"
                    style={{ boxShadow: '0 0 0 3px rgba(225,134,36,0.55)', fontWeight: 700, fontSize: '1.15rem' }}
                  >
                    <span>{getInitials(active?.name)}</span>
                  </div>
                )}

                {/* Meta */}
                <p className="m-0 mb-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[#e18624] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                  {active?.type}{active?.country ? ` · ${active.country}` : ''}
                </p>
                <h3 className="m-0 mb-2 text-[1.25rem] font-semibold leading-[1.3] text-[#2E0F14] min-w-0 break-words [overflow-wrap:anywhere] line-clamp-2">
                  {active?.name}
                </h3>
                <p className="m-0 flex-1 text-[0.9rem] leading-[1.55] text-[rgba(46,15,20,0.68)] min-w-0 break-words [overflow-wrap:anywhere] line-clamp-4">
                  {active?.description || 'Mitra aktif dalam jaringan kerja sama kami.'}
                </p>          
                {/* Dots nav */}
                <div className="mt-6 flex flex-wrap gap-1.5 pt-2">
                  {displayedPartners.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-label={`Tampilkan ${p.name}`}
                      className={`pn-dot-btn${i === activeIndex ? ' pn-dot-active' : ''}`}
                      onClick={(e) => { e.preventDefault(); setActiveIndex(i) }}
                    />
                  ))}
                </div>
              </Link>

              {/* Chip grid (4 cols x 4 rows = 16 items) */}
              <div className="pn-grid min-w-0">
                {displayedPartners.map((partner, i) => (
                  <button
                    key={partner.id}
                    type="button"
                    className={`pn-chip-btn${i === activeIndex ? ' pn-chip-active' : ''}`}
                    onClick={() => setActiveIndex(i)}
                    title={partner.name}
                  >
                    <span className={`pn-chip-avatar ${partner.logo ? '!bg-transparent !border-0 !rounded-none' : ''}`}>
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt=""
                          className="h-full w-full object-contain"
                          style={{
                            filter: i === activeIndex ? 'none' : 'grayscale(1) opacity(0.7)',
                            transition: 'filter 0.2s ease',
                          }}
                        />
                      ) : (
                        getInitials(partner.name)
                      )}
                    </span>
                    <span className="pn-chip-name">
                      {partner.name}
                    </span>
                  </button>
                ))}

                {/* 16th Item: Card to view more partners */}
                <Link
                  to="/partners"
                  className="pn-chip-btn pn-chip-more"
                  title="Lihat Partner Lainnya"
                >
                  <span className="pn-chip-avatar">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                  <span className="pn-chip-name" style={{ color: '#731822', fontWeight: 600 }}>
                    Partner Lainnya
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
