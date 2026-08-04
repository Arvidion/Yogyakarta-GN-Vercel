import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'
import { api, normalizeProgram } from '../lib/api'
import { getDefaultProgramImage } from '../lib/mediaUtils'
import { textClamp1, textClamp2, textSafe } from '../lib/textUtils'

function formatProgramYear(value) {
  if (!value) return '-'
  const dateObj = new Date(value)
  if (!isNaN(dateObj.getTime())) {
    return dateObj.getFullYear().toString()
  }
  const yearMatch = String(value).match(/\b(19|20)\d{2}\b/)
  return yearMatch ? yearMatch[0] : String(value)
}

const timeOptions = [
  { value: 'all', label: 'Semua waktu' },
  { value: 'week', label: '1 minggu terakhir' },
  { value: 'month', label: '1 bulan terakhir' },
  { value: 'year', label: '1 tahun terakhir' },
]

function getTimeFiltered(programsToFilter, range) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return programsToFilter.filter((program) => {
    const targetDate = new Date(program.date)

    if (range === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      return targetDate >= weekAgo
    }

    if (range === 'month') {
      const monthAgo = new Date(today)
      monthAgo.setMonth(today.getMonth() - 1)
      return targetDate >= monthAgo
    }

    if (range === 'year') {
      const yearAgo = new Date(today)
      yearAgo.setFullYear(today.getFullYear() - 1)
      return targetDate >= yearAgo
    }

    return true
  })
}

export default function ProgramListPage() {
  const [query, setQuery] = useState('')
  const [fieldFilter, setFieldFilter] = useState('Semua')
  const [timeFilter, setTimeFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .getPrograms()
      .then((items) => setPrograms(items.map(normalizeProgram)))
      .catch((requestError) => setError(requestError.message || 'Gagal memuat daftar program'))
      .finally(() => setLoading(false))
  }, [])

  const filteredPrograms = useMemo(() => {
    let nextPrograms = programs.filter((program) => {
      const haystack = `${program.title} ${program.country || ''} ${program.partner}`.toLowerCase()
      return haystack.includes(query.toLowerCase())
    })

    if (fieldFilter !== 'Semua') {
      nextPrograms = nextPrograms.filter((program) => program.bidang.includes(fieldFilter))
    }

    const timeFiltered = getTimeFiltered(nextPrograms, timeFilter)

    return timeFiltered.sort((a, b) => {
      const aAktif = a.status === 'Aktif' ? 1 : 0
      const bAktif = b.status === 'Aktif' ? 1 : 0
      if (aAktif !== bAktif) return bAktif - aAktif

      const dateA = new Date(a.date || 0).getTime()
      const dateB = new Date(b.date || 0).getTime()
      return dateB - dateA
    })
  }, [fieldFilter, programs, query, timeFilter])

  const fields = ['Semua', ...new Set(programs.flatMap((program) => program.bidang))]

  const handleResetFilters = () => {
    setQuery('')
    setFieldFilter('Semua')
    setTimeFilter('all')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f2ea] pt-24 pb-16">
        <section className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8">
          {/* Header & Filter Card */}
          <div className="mb-8 rounded-[1.5rem] border border-[#e7ddcf] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 border-b border-[#f0e6d8] pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#731822]">
                    Semua Program Kerja Sama
                  </span>
                  <h1 className="mt-2 text-2xl font-bold text-[#111] sm:text-3xl lg:text-4xl">
                    Cari &amp; Jelajahi Program Kerja Sama
                  </h1>
                </div>
                <p className="text-xs text-[#8a7c6d]">
                  Menampilkan <strong className="text-[#731822]">{filteredPrograms.length}</strong> dari {programs.length} program
                </p>
              </div>

              {/* Controls & Search Inputs */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Search Bar */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#8a7c6d]">
                    Cari Kata Kunci
                  </label>
                  <div className="relative flex items-center">
                    <svg className="absolute left-3.5 h-4 w-4 text-[#8a7c6d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Judul program, negara, atau mitra..."
                      className="w-full rounded-xl border border-[#d7cfc3] bg-[#f9f7f3] pl-10 pr-4 py-2.5 text-sm text-[#111] outline-none transition focus:border-[#731822] focus:bg-white"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-3 text-xs text-[#8a7c6d] hover:text-[#111]"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Bidang Select */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#8a7c6d]">
                    Bidang Kerja Sama
                  </label>
                  <select
                    value={fieldFilter}
                    onChange={(event) => setFieldFilter(event.target.value)}
                    className="w-full rounded-xl border border-[#d7cfc3] bg-[#f9f7f3] px-3.5 py-2.5 text-sm text-[#111] outline-none transition focus:border-[#731822] focus:bg-white"
                  >
                    {fields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Filter Select */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#8a7c6d]">
                    Rentang Waktu
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(event) => setTimeFilter(event.target.value)}
                    className="w-full rounded-xl border border-[#d7cfc3] bg-[#f9f7f3] px-3.5 py-2.5 text-sm text-[#111] outline-none transition focus:border-[#731822] focus:bg-white"
                  >
                    {timeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secondary Toolbar: Reset & Grid/List Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                {(query || fieldFilter !== 'Semua' || timeFilter !== 'all') ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#731822] hover:underline"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Filter
                  </button>
                ) : <span />}

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 rounded-xl border border-[#d7cfc3] bg-[#f9f7f3] p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      viewMode === 'grid'
                        ? 'bg-[#731822] text-white shadow-sm'
                        : 'text-[#5b5b5b] hover:text-[#111]'
                    }`}
                    title="Tampilan Grid"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      viewMode === 'list'
                        ? 'bg-[#731822] text-white shadow-sm'
                        : 'text-[#5b5b5b] hover:text-[#111]'
                    }`}
                    title="Tampilan List"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-[#731822]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e7ddcf] border-t-[#731822]" />
              <p className="mt-4 text-sm font-medium">Memuat daftar program…</p>
            </div>
          )}

          {error && !loading && (
            <div className={`rounded-[1.5rem] border border-[#e7b5b5] bg-[#fff6f6] p-6 text-center text-[#731822] ${textSafe}`}>
              {error}
            </div>
          )}

          {/* Program Listing - Grid or List Layout */}
          {!loading && !error && filteredPrograms.length > 0 && (
            viewMode === 'grid' ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredPrograms.map((program) => {
                  const yearText = formatProgramYear(program.date)
                  const isDefault = program.isDefaultImage || !program.images?.length
                  const imageUrl = program.images?.[0] || getDefaultProgramImage(program.bidang)

                  return (
                    <Link
                      key={program.slug}
                      to={`/programs/${program.slug}`}
                      className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-[#e7ddcf] bg-white transition duration-300 hover:border-[#731822] hover:shadow-md"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-48 w-full overflow-hidden bg-[#fcfaf7] flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt={program.title}
                          className={`h-full w-full transition duration-300 group-hover:scale-105 ${
                            isDefault ? 'object-contain p-6' : 'object-cover'
                          }`}
                        />

                        {/* Status Badge overlay */}
                        {program.status && (
                          <div
                            className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${
                              program.status === 'Aktif' ? 'bg-emerald-600' : 'bg-amber-600'
                            }`}
                          >
                            {program.status}
                          </div>
                        )}

                        {/* Year Badge overlay */}
                        <div className="absolute top-3 right-3 rounded-full bg-[#731822] px-3 py-1 text-xs font-bold text-white shadow-sm">
                          {yearText}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          {/* Bidang Badges */}
                          {program.bidang && program.bidang.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-1.5">
                              {program.bidang.slice(0, 2).map((b, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block rounded-full bg-[#f4e1e5] px-2.5 py-0.5 text-[0.7rem] font-semibold text-[#731822]"
                                >
                                  {b}
                                </span>
                              ))}
                              {program.bidang.length > 2 && (
                                <span className="inline-block rounded-full bg-[#f7f2ea] px-2 py-0.5 text-[0.68rem] font-semibold text-[#8a7c6d]">
                                  +{program.bidang.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Title */}
                          <h3
                            className={`text-lg font-bold leading-snug text-[#111] transition group-hover:text-[#731822] ${textClamp2}`}
                            title={program.title}
                          >
                            {program.title}
                          </h3>
                        </div>

                        {/* Card Meta & Footer */}
                        <div className="mt-6 pt-4 border-t border-[#f0e6d8] space-y-2 text-xs text-[#5b5b5b]">
                          {/* Partner */}
                          {program.partner && program.partner !== '-' && (
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 shrink-0 text-[#e18624]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                              </svg>
                              <span className={`font-medium text-[#241713] ${textClamp1}`}>{program.partner}</span>
                            </div>
                          )}

                          {/* Location */}
                          {(program.city || program.country) && (
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 shrink-0 text-[#731822]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className={textClamp1}>
                                {program.city}
                                {program.country ? `, ${program.country}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* Horizontal List Layout */
              <div className="space-y-4">
                {filteredPrograms.map((program) => {
                  const yearText = formatProgramYear(program.date)
                  const isDefault = program.isDefaultImage || !program.images?.length
                  const imageUrl = program.images?.[0] || getDefaultProgramImage(program.bidang)

                  return (
                    <Link
                      key={program.slug}
                      to={`/programs/${program.slug}`}
                      className="group flex flex-col sm:flex-row min-w-0 overflow-hidden rounded-[1.4rem] border border-[#e7ddcf] bg-white transition duration-300 hover:border-[#731822] hover:shadow-md"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-44 sm:h-auto sm:w-56 shrink-0 overflow-hidden bg-[#fcfaf7] flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt={program.title}
                          className={`h-full w-full transition duration-300 group-hover:scale-105 ${
                            isDefault ? 'object-contain p-6' : 'object-cover'
                          }`}
                        />
                      </div>

                      {/* Content Right */}
                      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            {/* Bidang Badges */}
                            {program.bidang && program.bidang.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {program.bidang.map((b, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block rounded-full bg-[#f4e1e5] px-2.5 py-0.5 text-[0.7rem] font-semibold text-[#731822]"
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Year & Status */}
                            <div className="flex items-center gap-2">
                              {program.status && (
                                <span
                                  className={`shrink-0 text-xs font-bold text-white px-2.5 py-0.5 rounded-full ${
                                    program.status === 'Aktif' ? 'bg-emerald-600' : 'bg-amber-600'
                                  }`}
                                >
                                  {program.status}
                                </span>
                              )}
                              <span className="shrink-0 text-xs font-bold text-[#731822] bg-[#f7f2ea] px-3 py-1 rounded-full">
                                Tahun {yearText}
                              </span>
                            </div>
                          </div>

                          <h3
                            className={`text-lg font-bold text-[#111] transition group-hover:text-[#731822] ${textClamp2}`}
                            title={program.title}
                          >
                            {program.title}
                          </h3>

                          {program.description && (
                            <p className={`mt-2 text-xs text-[#5b5b5b] ${textClamp2}`}>
                              {program.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f0e6d8] text-xs text-[#5b5b5b]">
                          <div className="flex flex-wrap items-center gap-4">
                            {/* Partner */}
                            {program.partner && program.partner !== '-' && (
                              <span className="flex items-center gap-1.5 font-medium text-[#241713]">
                                <svg className="h-4 w-4 text-[#e18624]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                                </svg>
                                {program.partner}
                              </span>
                            )}

                            {/* Location */}
                            {(program.city || program.country) && (
                              <span className="flex items-center gap-1.5">
                                <svg className="h-4 w-4 text-[#731822]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {program.city}
                                {program.country ? `, ${program.country}` : ''}
                              </span>
                            )}
                          </div>

                          <span className="font-semibold text-[#731822] flex items-center gap-1">
                            Lihat Detail →
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          )}

          {/* Empty State */}
          {!loading && !error && filteredPrograms.length === 0 && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#d7cfc3] bg-white p-12 text-center text-[#5b5b5b]">
              <svg className="h-12 w-12 text-[#c7bcae] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-bold text-[#111]">Program Tidak Ditemukan</h3>
              <p className="mt-1 text-sm text-[#8a7c6d]">
                Tidak ada program kerja sama yang sesuai dengan pencarian atau filter yang Anda pilih.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#731822] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#591016]"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

