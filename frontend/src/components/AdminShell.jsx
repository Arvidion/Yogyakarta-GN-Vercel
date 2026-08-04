import { Link, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { menuItems } from '../data/adminMenu'

export default function AdminShell({ activeTab, onTabChange, children }) {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#f7f2ea] text-[#171717]">
      <Navbar />
      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 rounded-[1.5rem] bg-[#731822] p-4 text-white shadow-[0_18px_40px_rgba(115,24,34,0.16)] lg:block">
          <div className="border-b border-white/15 px-3 pb-5 pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e18624]">Admin area</p>
            <h2 className="mt-2 text-xl font-semibold">Ruang kendali</h2>
            <p className="mt-1 text-sm text-white/60">Kelola data kolaborasi Jogja.</p>
          </div>
          <nav className="mt-5 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeTab === item.id ? 'bg-white text-[#731822]' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 border-t border-white/15 pt-4">
            <Link to="/" className="block rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">Lihat website</Link>
            <button type="button" onClick={logout} className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-[#f5c5a0] hover:bg-white/10">Keluar</button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
