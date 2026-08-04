import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'
import { api, normalizeProgram } from '../lib/api'
import { formatFileSize } from '../lib/mediaUtils'
import { textClamp2, textSafe } from '../lib/textUtils'

function formatProgramYear(value) {
  if (!value) return '-'
  const dateObj = new Date(value)
  if (!isNaN(dateObj.getTime())) {
    return dateObj.getFullYear().toString()
  }
  const yearMatch = String(value).match(/\b(19|20)\d{2}\b/)
  return yearMatch ? yearMatch[0] : String(value)
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getFileExtension(filename = '') {
  const parts = filename.split('.')
  if (parts.length <= 1) return 'FILE'
  return parts.pop().toUpperCase()
}

function DocumentIcon({ ext }) {
  const extension = (ext || '').toUpperCase()
  if (extension === 'PDF') {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 font-bold text-xs">
        PDF
      </span>
    )
  }
  if (['DOC', 'DOCX'].includes(extension)) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
        DOC
      </span>
    )
  }
  if (['XLS', 'XLSX'].includes(extension)) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs">
        XLS
      </span>
    )
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-xs">
      {extension.slice(0, 4)}
    </span>
  )
}

export default function ProgramDetailPage() {
  const { slug } = useParams()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Lightbox state for multi-image viewing
  const [activeImageIndex, setActiveImageIndex] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    api
      .getPrograms()
      .then((items) => {
        setPrograms(items.map(normalizeProgram))
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat detail program')
      })
      .finally(() => setLoading(false))
  }, [])

  const program = programs.find((item) => item.slug === slug)

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeImageIndex === null || !program?.images?.length) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveImageIndex(null)
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % program.images.length)
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + program.images.length) % program.images.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeImageIndex, program])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f7f2ea] pt-28 pb-16 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-[#731822]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e7ddcf] border-t-[#731822]" />
            <p className="text-sm font-medium">Memuat detail program…</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !program) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f7f2ea] pt-24 px-5 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1080px] rounded-[1.5rem] border border-[#e7ddcf] bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-semibold text-[#111]">Program tidak ditemukan</h1>
            <p className="mt-3 text-[#5b5b5b]">{error || 'Silakan kembali ke daftar program untuk memilih agenda yang tersedia.'}</p>
            <Link
              to="/programs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#731822] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#59121a]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke daftar program
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const images = program.images || []
  const documents = program.documents || []
  const yearText = formatProgramYear(program.date)
  const partnerSlug = program.Partner?.id ? `${slugify(program.partner)}-${program.Partner.id}` : null

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f2ea] pb-16">
        {/* Header / Hero Section with Solid Burgundy (No Gradient) */}
        <section className="bg-[#731822] px-5 pt-28 pb-12 text-white sm:px-6 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                {/* Bidang Badges */}
                {program.bidang && program.bidang.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {program.bidang.map((b, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                <h1 className={`text-2xl font-bold sm:text-3xl lg:text-4xl text-white leading-snug ${textSafe}`}>
                  {program.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                  {/* Status badge */}
                  {program.status && (
                    <div className="flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold text-white">
                      <span className={`inline-block h-2 w-2 rounded-full ${program.status === 'Aktif' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span>Status: {program.status}</span>
                    </div>
                  )}

                  {/* Location badge */}
                  {(program.city || program.country) && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 shrink-0 text-[#e18624]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        {program.city}
                        {program.country ? `, ${program.country}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Partner badge */}
                  {program.partner && program.partner !== '-' && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 shrink-0 text-[#e18624]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                      </svg>
                      <span>{program.partner}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Year Badge (Year only requirement) */}
              <div className="shrink-0 flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-white backdrop-blur-sm">
                <svg className="h-5 w-5 text-[#e18624]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 3V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">Tahun</span>
                  <span className="text-lg font-bold text-white leading-tight">{yearText}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="mx-auto mt-8 grid max-w-[1280px] gap-8 px-5 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          {/* Left Column: Description, Multi-Image Gallery, Multi-Document Attachments */}
          <div className="space-y-8 min-w-0">
            {/* About / Description Card (With Images directly under description text) */}
            <div className="rounded-[1.5rem] border border-[#e7ddcf] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#111] border-b border-[#f0e6d8] pb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#731822]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Deskripsi Program
                </h2>
                <div className="mt-4">
                  <p className={`whitespace-pre-line leading-relaxed text-[#3d3d3d] ${textSafe}`}>
                    {program.description || 'Belum ada deskripsi detail untuk program ini.'}
                  </p>
                </div>
              </div>

              {/* Gambar Program (Di bawah teks deskripsi) */}
              {images.length > 0 && (
                <div className="pt-6 border-t border-[#f0e6d8]">
                  {/* <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[#111] flex items-center gap-2">
                      <svg className="h-5 w-5 text-[#731822]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Dokumentasi &amp; Galeri Foto
                    </h3>
                    <span className="text-xs font-semibold text-[#8a7c6d] bg-[#f7f2ea] px-3 py-1 rounded-full">
                      {images.length} Foto
                    </span>
                  </div> */}

                  {/* <p className="mb-4 text-xs text-[#8a7c6d]">
                    Klik pada gambar untuk memperbesar tampilan foto.
                  </p> */}

                  {/* Single Image view vs Grid view for multiple images */}
                  {images.length === 1 ? (
                    <div className="overflow-hidden rounded-2xl border border-[#e7ddcf] bg-[#fcfaf7]">
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex(0)}
                        className="group relative block w-full text-left overflow-hidden"
                      >
                        <img
                          src={images[0]}
                          alt={`${program.title}`}
                          className={`h-80 sm:h-96 w-full transition duration-300 group-hover:scale-105 ${program.isDefaultImage ? 'object-contain p-8 sm:p-12' : 'object-cover'
                            }`}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold gap-2">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          Perbesar Gambar
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {images.map((image, index) => (
                        <button
                          key={`${program.slug}-img-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className="group relative h-48 w-full overflow-hidden rounded-2xl border border-[#e7ddcf] bg-[#fcfaf7] text-left transition hover:shadow-md"
                        >
                          <img
                            src={image}
                            alt={`${program.title} - Foto ${index + 1}`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5 p-2 text-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                            Lihat foto {index + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Documents Section - Supports Multiple Documents */}
            <div className="rounded-[1.5rem] border border-[#e7ddcf] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f0e6d8] pb-4">
                <h2 className="text-xl font-bold text-[#111] flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#731822]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Dokumen &amp; Lampiran Tambahan
                </h2>
                <span className="text-xs font-semibold text-[#8a7c6d] bg-[#f7f2ea] px-3 py-1 rounded-full">
                  {documents.length} Dokumen
                </span>
              </div>

              {documents.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {documents.map((doc, idx) => {
                    const ext = getFileExtension(doc.name || doc.url)
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#e7ddcf] bg-[#fcfaf7] p-4 transition hover:border-[#731822] hover:bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <DocumentIcon ext={ext} />
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-semibold text-[#111] ${textClamp2}`} title={doc.name || 'Dokumen'}>
                              {doc.name || 'Dokumen Lampiran'}
                            </p>
                            {doc.size ? (
                              <p className="text-xs text-[#8a7c6d] mt-0.5">{formatFileSize(doc.size)}</p>
                            ) : (
                              <p className="text-xs text-[#8a7c6d] mt-0.5">{ext} File</p>
                            )}
                          </div>
                        </div>

                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[#731822]/30 px-3 py-2 text-xs font-semibold text-[#731822] transition hover:bg-[#731822] hover:text-white"
                          title="Buka atau unduh dokumen"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Buka</span>
                        </a>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e7ddcf] bg-[#fcfaf7] p-8 text-center text-[#8a7c6d]">
                  <svg className="h-10 w-10 text-[#c7bcae] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm font-medium text-[#5b5b5b]">Tidak ada dokumen tambahan yang terlampir</p>
                  <p className="text-xs text-[#8a7c6d] mt-1">Dokumen teknis atau berkas lampiran belum diunggah untuk program ini.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Summary & Navigation */}
          <aside className="space-y-6 min-w-0">
            {/* Sidebar Card */}
            <div className="rounded-[1.5rem] border border-[#e7ddcf] bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#111] border-b border-[#f0e6d8] pb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-[#731822]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informasi Detail
              </h3>

              <div className="mt-5 space-y-5 text-sm">
                {/* Status Program */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] text-[#731822]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#8a7c6d] uppercase tracking-wider">Status Program</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold text-white ${program.status === 'Aktif' ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                    >
                      {program.status || 'Aktif'}
                    </span>
                  </div>
                </div>

                {/* Tahun */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] text-[#731822]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 3V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#8a7c6d] uppercase tracking-wider">Tahun Pelaksanaan</p>
                    <p className="mt-0.5 text-base font-bold text-[#111]">{yearText}</p>
                  </div>
                </div>

                {/* Bidang */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] text-[#731822]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#8a7c6d] uppercase tracking-wider">Bidang Kerja Sama</p>
                    <p className={`mt-0.5 font-medium text-[#111] ${textSafe}`}>
                      {program.bidang?.length ? program.bidang.join(', ') : '-'}
                    </p>
                  </div>
                </div>

                {/* Partner Name */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] text-[#731822]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#8a7c6d] uppercase tracking-wider">Mitra / Partner</p>
                    {partnerSlug ? (
                      <Link
                        to={`/partners/${partnerSlug}`}
                        className={`mt-0.5 block font-semibold text-[#731822] hover:underline ${textSafe}`}
                      >
                        {program.partner} →
                      </Link>
                    ) : (
                      <p className={`mt-0.5 font-medium text-[#111] ${textSafe}`}>{program.partner}</p>
                    )}
                  </div>
                </div>

                {/* Lokasi */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] text-[#731822]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#8a7c6d] uppercase tracking-wider">Lokasi</p>
                    <p className={`mt-0.5 font-medium text-[#111] ${textSafe}`}>
                      {program.city}
                      {program.country ? `, ${program.country}` : ''}
                      {!program.city && !program.country && '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[#f0e6d8] space-y-3">
                {(program.situs || program.websiteUrl || program.newsUrl || program.Partner?.situs1 || program.Partner?.situs2) && (
                  <a
                    href={program.situs || program.websiteUrl || program.newsUrl || program.Partner?.situs1 || program.Partner?.situs2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e18624] px-4 py-2.5 text-xs font-bold text-[#241713] transition hover:bg-[#d07513] shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Baca Berita Di Sini
                  </a>
                )}

                <Link
                  to="/programs"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#731822] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#59121a]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali ke Daftar Program
                </Link>
              </div>
            </div>
          </aside>
        </section>

        {/* Modal Lightbox Preview for Multi-Image Gallery */}
        {activeImageIndex !== null && images.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/30"
              title="Tutup (Esc)"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
              Foto {activeImageIndex + 1} dari {images.length}
            </div>

            {/* Main Image View */}
            <div className="relative flex max-h-[85vh] max-w-[90vw] items-center justify-center">
              <img
                src={images[activeImageIndex]}
                alt={`Foto ${activeImageIndex + 1}`}
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>

            {/* Navigation Arrows if > 1 images */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/30"
                  title="Foto Sebelumnya (Panah Kiri)"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/30"
                  title="Foto Selanjutnya (Panah Kanan)"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

