import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoJogja from '../assets/logo-jogja.png'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Peta Jaringan', href: '/network-map' },
    { label: 'Program', href: '/programs' },
    { label: 'Partner', href: '/partners' },
    { label: 'Bacaan', href: '/bacaan' },
  ]

  return (
    <div className="fixed inset-x-0 top-4 z-30 px-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#ececec] bg-white px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)] sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoJogja} alt="Logo Jogja" className="h-10 w-auto object-contain" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const content = (
              <span className="flex items-center gap-1 text-[0.95rem] font-medium text-[#1a1a1a] transition hover:text-[#731822]">
                {link.label}
                {link.hasChevron && (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                    <path d="M5 7.5l5 5 5-5" />
                  </svg>
                )}
              </span>
            )

            if (link.href.startsWith('/') && !link.href.includes('#')) {
              return (
                <Link key={link.label} to={link.href} className="text-[0.95rem] font-medium text-[#1a1a1a] transition hover:text-[#731822]">
                  {content}
                </Link>
              )
            }

            return (
              <a key={link.label} href={link.href} className="text-[0.95rem] font-medium text-[#1a1a1a] transition hover:text-[#731822]">
                {content}
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/login"
            className="rounded-full bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2f2f2f]"
          >
            Login
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5e5] text-[#1a1a1a] lg:hidden"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="mx-auto mt-3 flex max-w-7xl flex-col gap-3 rounded-[24px] border border-[#ececec] bg-white p-4 shadow-[0_10px_35px_rgba(0,0,0,0.08)] lg:hidden">
          {navLinks.map((link) => {
            const content = (
              <span className="flex items-center gap-1 text-[0.95rem] font-medium text-[#1a1a1a]">
                {link.label}
                {link.hasChevron && (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                    <path d="M5 7.5l5 5 5-5" />
                  </svg>
                )}
              </span>
            )

            if (link.href.startsWith('/') && !link.href.includes('#')) {
              return (
                <Link key={link.label} to={link.href} onClick={() => setIsMobileMenuOpen(false)} className="rounded-full px-3 py-2 hover:bg-[#f7f3eb]">
                  {content}
                </Link>
              )
            }

            return (
              <a key={link.label} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="rounded-full px-3 py-2 hover:bg-[#f7f3eb]">
                {content}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
