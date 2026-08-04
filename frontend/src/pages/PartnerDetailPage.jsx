import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'
import { api, normalizePartner, normalizeProgram } from '../lib/api'
import { textClamp1, textClamp2, textSafe } from '../lib/textUtils'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function slugify(value = '') {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function PartnerDetailPage() {
  const { slug } = useParams()
  const [partner, setPartner] = useState(null)
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getPartners(), api.getPrograms()])
      .then(([partnersRaw, programsRaw]) => {
        const partners = partnersRaw.map(normalizePartner)
        const normalizedPrograms = programsRaw.map(normalizeProgram)

        // Match by slug: "{slugified-name}-{id}"
        const found = partners.find((p) => {
          const pSlug = `${slugify(p.name)}-${p.id}`
          return pSlug === slug
        })

        if (!found) {
          setError('Partner tidak ditemukan.')
          return
        }

        setPartner(found)
        setPrograms(normalizedPrograms.filter((prog) => prog.Partner?.id === found.id || prog.partner === found.name))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  const bidangs = partner?.Bidangs?.map((b) => b.jenis) || []

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f2ea] pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-8">
            {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#8a7c6d]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e7ddcf] border-t-[#731822]" />
              <p className="text-sm">Memuat data partner…</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-[1.5rem] border border-[#e7b5b5] bg-[#fff6f6] p-8 text-center text-[#731822]">
              <p className="text-lg font-semibold">{error}</p>
              <Link to="/partners" className="mt-4 inline-block text-sm font-semibold underline">
                ← Kembali ke daftar partner
              </Link>
            </div>
          )}

          {!loading && !error && partner && (
            <>
              {/* Hero card */}
              <div className="mb-6 overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-white shadow-sm">

                <div className="p-8 sm:p-10">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    {/* Avatar / Logo */}
                    {partner.logo ? (
                      <div className="flex h-24 w-auto max-w-[200px] shrink-0 items-center justify-start">
                        <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div
                        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#731822] text-white text-2xl font-bold shadow-md"
                        style={{ boxShadow: '0 0 0 4px rgba(225,134,36,0.3)' }}
                      >
                        <span>{getInitials(partner.name)}</span>
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {/* Type badge */}
                      <span className="inline-block rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#731822]">
                        {partner.type}
                      </span>

                      <h1 className={`mt-3 text-3xl font-bold leading-tight text-[#241713] sm:text-4xl ${textSafe}`}>
                        {partner.name}
                      </h1>

                      {/* Location */}
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-[#8a7c6d]">
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {[partner.city, partner.country].filter(Boolean).join(', ')}
                      </p>

                      {/* Bidang tags */}
                      {bidangs.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {bidangs.map((b) => (
                            <span
                              key={b}
                              className="inline-block rounded-full bg-[#f0e6d9] px-3 py-1 text-xs font-semibold text-[#731822]"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA links */}
                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      {partner.situs1 && (
                        <a
                          href={partner.situs1}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[#731822] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#591016] active:scale-95"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Kunjungi Website
                        </a>
                      )}
                      {partner.situs2 && (
                        <a
                          href={partner.situs2}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[#e7ddcf] bg-[#f7f2ea] px-5 py-2.5 text-sm font-semibold text-[#731822] transition hover:border-[#731822] hover:bg-white"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Website Lainnya
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description + Programs grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* About */}
                <div className="rounded-[1.5rem] border border-[#e7ddcf] bg-white p-8 shadow-sm lg:col-span-1">
                  <h2 className="mb-4 text-base font-bold uppercase tracking-[0.12em] text-[#731822]">
                    Tentang Partner
                  </h2>
                  <p className="text-sm leading-[1.75] text-[#4d4d4d]">
                    {partner.description || 'Tidak ada deskripsi tersedia.'}
                  </p>

                  {/* Info list */}
                  <ul className="mt-6 space-y-3">
                    {partner.country && (
                      <li className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f7f2ea] text-[#731822]">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                          </svg>
                        </span>
                        <span className="text-[#4d4d4d]"><span className="font-semibold text-[#241713]">Negara:</span> {partner.country}</span>
                      </li>
                    )}
                    {partner.city && (
                      <li className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f7f2ea] text-[#731822]">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <span className="text-[#4d4d4d]"><span className="font-semibold text-[#241713]">Kota:</span> {partner.city}</span>
                      </li>
                    )}
                    <li className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f7f2ea] text-[#731822]">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
                        </svg>
                      </span>
                      <span className="text-[#4d4d4d]">
                        <span className="font-semibold text-[#241713]">Tipe:</span> {partner.type}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f7f2ea] text-[#731822]">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </span>
                      <span className="text-[#4d4d4d]">
                        <span className="font-semibold text-[#241713]">Program bersama:</span> {programs.length}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Programs */}
                <div className="rounded-[1.5rem] border border-[#e7ddcf] bg-white p-8 shadow-sm lg:col-span-2">
                  <h2 className="mb-6 text-base font-bold uppercase tracking-[0.12em] text-[#731822]">
                    Program Bersama ({programs.length})
                  </h2>

                  {programs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e7ddcf] bg-[#fafaf8] py-12">
                      <svg className="mb-3 h-12 w-12 text-[#d7cfc3]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm text-[#8a7c6d]">Belum ada program yang tercatat.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {programs.map((prog) => (
                        <Link
                          key={prog.id}
                          to={`/programs/${prog.slug}`}
                          className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e7ddcf] bg-[#fafaf8] transition hover:-translate-y-0.5 hover:border-[#731822] hover:shadow-md"
                        >
                          {/* Program image */}
                          {prog.images?.[0] && (
                            <div className="h-36 w-full overflow-hidden bg-[#fcfaf7] flex items-center justify-center">
                              <img
                                src={prog.images[0]}
                                alt={prog.title}
                                className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${
                                  prog.isDefaultImage ? 'object-contain p-4' : 'object-cover'
                                }`}
                              />
                            </div>
                          )}
                          <div className="flex flex-1 flex-col gap-2 p-4">
                            {/* Bidang tags */}
                            {prog.bidang?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {prog.bidang.slice(0, 3).map((b) => (
                                  <span
                                    key={b}
                                    className="inline-block rounded-full bg-[#f0e6d9] px-2.5 py-0.5 text-[0.65rem] font-semibold text-[#731822]"
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            )}
                            <h3 className={`text-sm font-semibold leading-snug text-[#241713] ${textClamp2}`}>
                              {prog.title}
                            </h3>
                            <div className="mt-auto flex items-center justify-between">
                              <span className={`text-xs text-[#8a7c6d] ${textClamp1}`}>
                                {prog.city || '-'}
                              </span>
                              {prog.date && (
                                <span className="text-xs font-mono text-[#a3988c]">
                                  {new Date(prog.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {programs.length > 0 && (
                    <div className="mt-6 text-right">
                      <Link
                        to="/programs"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#731822] transition hover:underline"
                      >
                        Lihat semua program
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Back link */}
              <div className="mt-8">
                <Link
                  to="/partners"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#731822] transition hover:underline"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali ke semua partner
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
