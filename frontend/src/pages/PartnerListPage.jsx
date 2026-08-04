import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'
import { api, normalizePartner, normalizeProgram } from '../lib/api'
import { textClamp1, textClamp2, textClamp3, textSafe } from '../lib/textUtils'

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

export default function PartnerListPage() {
  const [partners, setPartners] = useState([])
  const [programs, setPrograms] = useState([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [fieldFilter, setFieldFilter] = useState('Semua')

  // Fetch partners and programs
  useEffect(() => {
    Promise.all([api.getPartners(), api.getPrograms()])
      .then(([partnersRaw, programsRaw]) => {
        const normalizedPartners = partnersRaw.map(normalizePartner)
        const normalizedPrograms = programsRaw.map(normalizeProgram)
        setPartners(normalizedPartners)
        setPrograms(normalizedPrograms)
      })
      .catch((requestError) => setError(requestError.message))
  }, [])

  // Get bidang for each partner from programs
  const getPartnerBidang = (partnerName) => {
    const bidangSet = new Set()
    programs.forEach((program) => {
      if (program.partner === partnerName) {
        program.bidang.forEach((b) => bidangSet.add(b))
      }
    })
    return Array.from(bidangSet)
  }

  // Get all unique types and fields for filtering
  const allTypes = ['Semua', ...new Set(partners.map((p) => p.type))]
  const allFields = ['Semua', ...new Set(programs.flatMap((p) => p.bidang))]

const STATUS_ORDER = {
  aktif: 1,
  selesai: 2,
  'tidak aktif': 3,
}

function getStatusPriority(status) {
  const norm = (status || '').toString().toLowerCase().trim()
  return STATUS_ORDER[norm] || 99
}

  // Filter partners
  const filteredPartners = useMemo(() => {
    let result = partners.filter((partner) => {
      const haystack = `${partner.name} ${partner.city} ${partner.country} ${partner.description}`.toLowerCase()
      return haystack.includes(query.toLowerCase())
    })

    if (typeFilter !== 'Semua') {
      result = result.filter((partner) => partner.type === typeFilter)
    }

    if (fieldFilter !== 'Semua') {
      result = result.filter((partner) => {
        const bidang = getPartnerBidang(partner.name)
        return bidang.includes(fieldFilter)
      })
    }

    return [...result].sort((a, b) => {
      const pA = getStatusPriority(a.status)
      const pB = getStatusPriority(b.status)
      if (pA !== pB) return pA - pB
      const idA = Number(a.id) || 0
      const idB = Number(b.id) || 0
      return idB - idA
    })
  }, [query, typeFilter, fieldFilter, partners, programs])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f2ea] pt-24 pb-10">
        <section className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#731822]">Semua partner</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#111] sm:text-4xl">Daftar mitra dan kolaborator yang aktif mendukung program.</h1>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex flex-col text-sm font-medium text-[#4d4d4d]">
                  <span className="mb-1">Cari partner</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Nama, kota, negara"
                    className="rounded-full border border-[#d7cfc3] bg-[#f9f7f3] px-4 py-2 outline-none ring-0"
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-[#4d4d4d]">
                  <span className="mb-1">Tipe</span>
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="rounded-full border border-[#d7cfc3] bg-[#f9f7f3] px-4 py-2 outline-none"
                  >
                    {allTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-medium text-[#4d4d4d]">
                  <span className="mb-1">Bidang</span>
                  <select
                    value={fieldFilter}
                    onChange={(event) => setFieldFilter(event.target.value)}
                    className="rounded-full border border-[#d7cfc3] bg-[#f9f7f3] px-4 py-2 outline-none"
                  >
                    {allFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <p className="text-sm text-[#999]">
              Menampilkan <span className="font-semibold text-[#111]">{filteredPartners.length}</span> dari{' '}
              <span className="font-semibold text-[#111]">{partners.length}</span> partner
            </p>
          </div>

          {/* Partners Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {error && <div className={`col-span-full rounded-[1.2rem] border border-[#e7b5b5] bg-[#fff6f6] p-6 text-[#731822] ${textSafe}`}>{error}</div>}
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => {
                const bidang = getPartnerBidang(partner.name)
                const partnerSlug = `${slugify(partner.name)}-${partner.id}`
                return (
                  <Link
                    key={partner.id}
                    to={`/partners/${partnerSlug}`}
                    className="group min-w-0 overflow-hidden rounded-[1.25rem] border border-[#e7ddcf] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#731822] hover:shadow-md"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                          partner.logo ? 'bg-transparent' : 'bg-[#731822] text-white font-bold text-sm'
                        }`}
                      >
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{getInitials(partner.name)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold uppercase tracking-[0.2em] text-[#e18624] ${textClamp1}`}>
                          {partner.type}
                        </p>
                        <h2 className={`mt-1 text-lg font-semibold text-[#111] ${textClamp2}`} title={partner.name}>
                          {partner.name}
                        </h2>
                      </div>
                    </div>
                    <p className={`mt-4 text-sm leading-6 text-[#5d5d5d] ${textClamp3}`}>{partner.description}</p>
                    <p className={`mt-3 text-sm font-medium text-[#731822] ${textClamp2}`}>
                      {partner.city}{partner.country ? `, ${partner.country}` : ''}
                    </p>
                    {bidang.length > 0 && (
                      <div className="mt-4 flex max-w-full flex-wrap gap-2 overflow-hidden">
                        {bidang.map((b) => (
                          <span
                            key={b}
                            className={`inline-block max-w-full rounded-full bg-[#f0e6e1] px-3 py-1 text-xs font-medium text-[#731822] ${textClamp1}`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#731822] opacity-0 transition group-hover:opacity-100">
                      Lihat detail
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full rounded-[1.2rem] border border-[#e2dcd0] bg-[#f9f7f3] p-8 text-center text-[#666]">
                <p className="text-lg">Tidak ada partner yang cocok dengan kriteria pencarian.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
