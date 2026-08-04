import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ nama: 'admin', password: '1234' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Jika sudah login, langsung ke admin
  if (localStorage.getItem('adminUser')) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await api.login(form)
      localStorage.setItem('adminUser', JSON.stringify(user))
      // Kembali ke halaman yang dituju sebelum redirect login, atau ke /admin
      const from = location.state?.from?.pathname || '/admin'
      navigate(from, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f2ea]">
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-5 pb-12 pt-28">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_70px_rgba(44,25,16,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden overflow-hidden bg-[#731822] p-10 text-white lg:block">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[32px] border-[#e18624]/30" />
            <p className="relative text-xs font-bold uppercase tracking-[0.24em] text-[#e18624]">Yogyakarta NGO</p>
            <h1 className="relative mt-20 max-w-xs text-4xl font-semibold leading-tight">Kelola kolaborasi dengan lebih terarah.</h1>
            <p className="relative mt-5 max-w-xs leading-7 text-white/70">Perbarui program, partner, dan bidang kerja sama dari satu ruang kerja.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-7 sm:p-10 lg:p-14">
            <Link to="/" className="text-sm font-semibold text-[#731822]">← Kembali ke website</Link>
            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.22em] text-[#e18624]">Admin login</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#171717]">Selamat datang kembali.</h2>
            <p className="mt-3 text-sm leading-6 text-[#69615a]">Masuk untuk mengelola konten kolaborasi Yogyakarta.</p>
            <label className="mt-8 block text-sm font-semibold text-[#3d3834]">Nama pengguna
              <input value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} className="mt-2 w-full rounded-xl border border-[#ded5ca] bg-[#fcfaf7] px-4 py-3 outline-none focus:border-[#731822]" required />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[#3d3834]">Password
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-[#ded5ca] bg-[#fcfaf7] px-4 py-3 outline-none focus:border-[#731822]" required />
            </label>
            {error && <p className="mt-4 rounded-xl bg-[#fff2f0] px-4 py-3 text-sm text-[#a32929]">{error}</p>}
            <button disabled={loading} className="mt-7 w-full rounded-xl bg-[#731822] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5c121b] disabled:cursor-wait disabled:opacity-60">{loading ? 'Memeriksa...' : 'Masuk ke dashboard'}</button>
          </form>
        </div>
      </main>
    </div>
  )
}