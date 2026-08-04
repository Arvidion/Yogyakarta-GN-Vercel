import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'

export default function ReadingPage() {
  const driveViewUrl = 'https://drive.google.com/file/d/1jAjHXCxZOcw6XCFiy4NL-a6xSNwZDHsw/view?usp=sharing'
  const drivePreviewUrl = 'https://drive.google.com/file/d/1jAjHXCxZOcw6XCFiy4NL-a6xSNwZDHsw/preview'
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f1e8]">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="mb-8 rounded-3xl border border-[#e7ddcf] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-block rounded-full bg-[#731822]/10 px-3.5 py-1 font-poppins text-xs font-bold uppercase tracking-wider text-[#731822]">
                  Dokumen Resmi &amp; E-Book
                </span>
                <h1 className="font-poppins mt-2 text-2xl font-bold tracking-tight text-[#111] sm:text-3xl lg:text-4xl">
                  Buku Profil &amp; Panduan Kerja Sama Global Yogyakarta
                </h1>
                <p className="font-sans mt-2 text-sm text-[#69615a] sm:text-base">
                  Dokumen publikasi resmi Pemerintah Daerah Istimewa Yogyakarta mengenai pedoman, tata cara, dan profil kemitraan internasional.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#731822] bg-transparent px-5 py-2.5 font-poppins text-xs font-bold text-[#731822] transition hover:bg-[#731822] hover:text-white active:scale-95"
                >
                  <span>Buka di Google Drive</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* PDF Reader Container */}
          <div className="relative overflow-hidden rounded-3xl border border-[#ded5ca] bg-[#161314] shadow-xl">
            {/* Toolbar Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#211b1d] px-4 py-3 sm:px-6 text-white">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 font-poppins text-xs font-medium text-white/70 hidden sm:inline">
                  Reader PDF Online
                </span>
              </div>
              <span className="font-poppins text-xs font-semibold text-[#e18624]">
                Yogyakarta Global Network
              </span>
            </div>

            {/* Main PDF Viewer */}
            <div className="relative h-[82vh] min-h-[600px] w-full bg-[#120f10]">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#120f10] text-white">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#e18624]" />
                  <p className="font-poppins text-sm font-medium text-white/70">Memuat Buku Panduan PDF...</p>
                </div>
              )}

              <iframe
                src={drivePreviewUrl}
                title="Buku Profil & Panduan Kerja Sama Global Yogyakarta"
                className="h-full w-full border-none"
                onLoad={() => setIsLoading(false)}
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
