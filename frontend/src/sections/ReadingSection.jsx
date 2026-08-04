import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReadingModal from '../components/ReadingModal'

export default function ReadingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const driveViewUrl = 'https://drive.google.com/file/d/1jAjHXCxZOcw6XCFiy4NL-a6xSNwZDHsw/view?usp=sharing'
  const drivePreviewUrl = 'https://drive.google.com/file/d/1jAjHXCxZOcw6XCFiy4NL-a6xSNwZDHsw/preview'
  const bookTitle = 'Buku Profil & Panduan Kerja Sama Global Yogyakarta'

  return (
    <>
      <section id="bacaan" className="section relative overflow-hidden bg-[#f4f3ee] py-16 sm:py-24">
        {/* Subtle decorative background gradient */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#731822]/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-[#e18624]/5 blur-3xl" />

        <div className="section-shell relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <div className="section-heading-row mb-10 text-center sm:text-left">
            <p className="eyebrow font-poppins text-xs font-bold uppercase tracking-[0.22em] text-[#e18624]">
              Bacaan Publik &amp; Dokumen Resmi
            </p>
            <h2 className="font-poppins mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-[1.2] tracking-tight text-[#111]">
              Panduan &amp; Profil Kerja Sama Yogyakarta
            </h2>
          </div>

          {/* Main Card Grid */}
          <div className="grid grid-cols-1 gap-8 rounded-3xl border border-[#ece7de] bg-white p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">

            {/* Left Column: Book Preview Mockup Card */}
            <div className="relative mx-auto flex w-full max-w-[380px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#731822] via-[#561017] to-[#2e090d] p-8 text-white shadow-2xl transition duration-300 hover:scale-[1.02]">
              {/* Badge */}
              <div className="absolute top-4 right-4 rounded-full bg-[#e18624] px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-[#2e090d]">
                E-Book / PDF
              </div>

              {/* Book Spine / Cover Icon Graphic */}
              <div className="my-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 text-[#e18624] shadow-inner backdrop-blur-md">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              {/* Cover Title */}
              <h3 className="font-poppins text-center text-xl font-bold leading-tight text-white sm:text-2xl">
                Buku Profil &amp; Panduan Kerja Sama Global
              </h3>

              <div className="my-4 h-0.5 w-12 rounded-full bg-[#e18624]/60" />

              <p className="font-poppins text-center text-xs font-semibold uppercase tracking-wider text-white/80">
                Bunga Rampai Kerja Sama Luar Negeri
              </p>

              {/* Read Action Button inside Card */}
              <Link
                to="/bacaan"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e18624] px-6 py-3 font-poppins text-sm font-bold text-[#2e090d] shadow-md transition hover:bg-[#f29a38] active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Baca Sekarang</span>
              </Link>
            </div>

            {/* Right Column: Description & Metadata */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="font-poppins mt-3 text-2xl font-bold leading-snug text-[#111] sm:text-3xl">
                  {bookTitle}
                </h3>

                <p className="font-sans mt-4 text-base leading-relaxed text-[#4a4540]">
                  Dokumen publikasi resmi Yogyakarta Global Network yang memuat pedoman, panduan kerja sama internasional, profil jaringan kemitraan daerah, serta strategi kolaborasi global Daerah Istimewa Yogyakarta.
                </p>

                {/* Key Features List */}
                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e18624]/20 text-[#e18624]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-poppins text-sm font-semibold text-[#111]">
                      Panduan &amp; Tata Cara Kerja Sama Luar Negeri
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e18624]/20 text-[#e18624]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-poppins text-sm font-semibold text-[#111]">
                      Dapat Dibaca Langsung Tanpa Perlu Diunduh
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e18624]/20 text-[#e18624]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-poppins text-sm font-semibold text-[#111]">
                      Akses Terbuka untuk Umum &amp; Calon Mitra
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/bacaan"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#731822] px-7 py-3.5 font-poppins text-sm font-bold text-white shadow-lg transition hover:bg-[#591016] hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Buka Bacaan</span>
                </Link>

                <a
                  href={driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#731822] bg-transparent px-6 py-3.5 font-poppins text-sm font-bold text-[#731822] transition hover:bg-[#731822] hover:text-white active:scale-95"
                >
                  <span>Buka di Google Drive</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Modal Reader */}
      <ReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pdfUrl={drivePreviewUrl}
        driveUrl={driveViewUrl}
        title={bookTitle}
      />
    </>
  )
}
