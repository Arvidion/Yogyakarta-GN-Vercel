import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminShell from '../components/AdminShell'
import {
  BidangMultiSelect,
  Field,
  FormActions,
  FormSection,
  Input,
  Modal,
  NegaraCombobox,
  PartnerCombobox,
  Select,
  Textarea,
} from '../components/admin/FormControls'
import {
  MultiDocumentInput,
  MultiImageInput,
  PartnerLogoInput,
  useDocumentItems,
  useMediaItems,
} from '../components/admin/MediaInputs'
import { PARTNER_TIPES, STATUS_OPTIONS } from '../data/adminConstants'
import { menuItems } from '../data/adminMenu'
import { api } from '../lib/api'
import {
  finalizeMediaItems,
  parseDocumentList,
  parseImageList,
  serializeDocuments,
  serializeImages,
} from '../lib/mediaUtils'
import { tableCellTextClass, textClamp2, textSafe, textTruncate } from '../lib/textUtils'

const emptyPartner = {
  nama: '',
  tipe: PARTNER_TIPES[0],
  negara_id: '',
  kota: '',
  jenis: '',
  status: 'Aktif',
  deskripsi: '',
  situs1: '',
}

const emptyProgram = {
  nama: '',
  partner_id: '',
  negara_id: '',
  tanggal: '',
  lokasi: '',
  status: 'Aktif',
  deskripsi: '',
  situs: '',
}

function resolveNegaraId(item, negaraList) {
  if (item?.negara_id) return item.negara_id
  const nama = item?.negara || item?.Negara?.nama
  if (!nama) return ''
  return negaraList.find((negara) => negara.nama === nama)?.id || ''
}

function formatLocation(city, country) {
  const parts = [city, country].filter(Boolean)
  return parts.length ? parts.join(', ') : '-'
}

function Overview({ data, setTab }) {
  const cards = [
    { label: 'Program aktif', value: data.programs.length, tab: 'programs', tone: 'bg-[#731822] text-white' },
    { label: 'Partner tercatat', value: data.partners.length, tab: 'partners', tone: 'bg-white text-[#171717]' },
    { label: 'Bidang kerja sama', value: data.bidangs.length, tab: 'bidangs', tone: 'bg-[#e18624] text-[#241713]' },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#731822]">Ringkasan</p>
        <h1 className="mt-2 text-3xl font-semibold">Halo, admin.</h1>
        <p className="mt-2 text-[#70675f]">Pantau dan perbarui isi platform dari sini.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => setTab(card.tab)}
            className={`min-h-36 rounded-[1.25rem] p-6 text-left shadow-sm transition hover:-translate-y-0.5 ${card.tone}`}
          >
            <p className="text-sm opacity-70">{card.label}</p>
            <p className="mt-7 text-4xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm opacity-70">Kelola data →</p>
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-[1.25rem] border border-[#e7ddcf] bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e18624]">Alur kerja</p>
        <h2 className="mt-2 text-xl font-semibold">Jaga informasi tetap aktual</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#70675f]">
          Gunakan menu di samping untuk menambah, memperbarui, atau menghapus program, partner, dan bidang.
          Perubahan akan langsung tersimpan di database.
        </p>
      </div>
    </div>
  )
}

function Table({ headers, colWidths, children, emptyMessage = 'Tidak ada data.' }) {
  return (
    <div className="relative max-h-[calc(90vh-230px)] min-h-[300px] overflow-auto rounded-[1.25rem] border border-[#e7ddcf] bg-white shadow-sm">
      <table className="w-full min-w-[750px] text-left text-sm" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {colWidths && colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <thead className="sticky top-0 z-10 border-b border-[#eee6dc] bg-[#fcfaf7] text-xs uppercase tracking-[0.16em] text-[#8a7c6d] shadow-sm">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-4 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0e9e0]">
          {children}
        </tbody>
      </table>
    </div>
  )
}

function Cell({ children, className = '' }) {
  return (
    <td className={`px-5 py-4 ${className}`}>
      <div className="overflow-hidden">
        <div className="truncate">{children}</div>
      </div>
    </td>
  )
}

function SearchBar({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#e7ddcf] bg-white px-4 py-2.5 shadow-sm focus-within:border-[#731822] focus-within:ring-2 focus-within:ring-[#731822]/10 transition">
      <svg className="h-4 w-4 shrink-0 text-[#8a7c6d]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-[#241713] outline-none placeholder:text-[#a3988c]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-[#8a7c6d] hover:text-[#731822] text-lg leading-none"
          aria-label="Hapus pencarian"
        >
          ×
        </button>
      )}
    </div>
  )
}

function Actions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg bg-[#f7f2ea] px-3 py-1.5 text-xs font-semibold text-[#731822] transition hover:bg-[#eee6dc]"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg bg-[#fff1ed] px-3 py-1.5 text-xs font-semibold text-[#a32929] transition hover:bg-[#ffe4dc]"
      >
        Hapus
      </button>
    </div>
  )
}

const STATUS_PRIORITY = {
  aktif: 1,
  selesai: 2,
  'tidak aktif': 3,
}

function getStatusPriority(status) {
  const norm = (status || '').toString().toLowerCase().trim()
  return STATUS_PRIORITY[norm] || 99
}

function ProgramTable({ data, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const term = search.trim().toLowerCase()
  const filtered = term
    ? data.programs.filter(
      (p) =>
        p.nama?.toLowerCase().includes(term) ||
        p.Partner?.nama?.toLowerCase().includes(term) ||
        (p.negara || p.Negara?.nama || '').toLowerCase().includes(term) ||
        p.lokasi?.toLowerCase().includes(term) ||
        (p.Bidangs || []).some((b) => b.jenis?.toLowerCase().includes(term))
    )
    : data.programs

  const sortedPrograms = [...(filtered || [])].sort((a, b) => {
    const priorityA = getStatusPriority(a.status)
    const priorityB = getStatusPriority(b.status)
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    const dateA = a.tanggal ? new Date(a.tanggal).getTime() : 0
    const dateB = b.tanggal ? new Date(b.tanggal).getTime() : 0
    return dateB - dateA
  })

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Cari program, partner, negara..." />
      <Table
        headers={['Program', 'Bidang', 'Tanggal', 'Status', 'Aksi']}
        colWidths={['25%', '12%', '10%', '9%', '9%']}
      >
        {sortedPrograms.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-5 py-10 text-center text-sm text-[#8a7c6d]">
              Tidak ada program yang cocok.
            </td>
          </tr>
        ) : (
          sortedPrograms.map((item) => (
            <tr key={item.id} className="hover:bg-[#fcfaf7] transition-colors">
              <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate font-semibold text-[#241713]" title={item.nama}>{item.nama}</div>
                </div>
              </td>
              {/* <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate text-[#70675f]" title={item.Partner?.nama || '-'}>{item.Partner?.nama || '-'}</div>
                </div>
              </td> */}
              {/* <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate text-[#70675f]" title={item.negara || item.Negara?.nama || '-'}>
                    {item.negara || item.Negara?.nama || '-'}
                  </div>
                </div>
              </td> */}
              <td className="px-5 py-4">
                {item.Bidangs && item.Bidangs.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.Bidangs.map((b) => (
                      <span key={b.id} className="inline-block whitespace-nowrap rounded-md bg-[#f7f2ea] px-2 py-0.5 text-xs font-semibold text-[#731822]">
                        {b.jenis}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[#a3988c]" style={{ fontStyle: 'normal' }}>-</span>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate text-xs text-[#70675f]">
                    {item.tanggal ? item.tanggal.slice(0, 10) : '-'}
                  </div>
                </div>
              </td>
              {/* <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate text-[#70675f]" title={item.lokasi || '-'}>{item.lokasi || '-'}</div>
                </div>
              </td> */}
              <td className="px-5 py-4">
                <span
                  className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${(item.status || '').toLowerCase() === 'aktif'
                      ? 'bg-[#edf7ed] text-[#1e6b24]'
                      : (item.status || '').toLowerCase() === 'selesai'
                        ? 'bg-[#e3f2fd] text-[#1565c0]'
                        : 'bg-[#ffebee] text-[#c62828]'
                    }`}
                >
                  {item.status || '-'}
                </span>
              </td>
              <td className="px-5 py-4">
                <Actions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  )
}

function PartnerTable({ data, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const term = search.trim().toLowerCase()
  const filtered = term
    ? data.partners.filter(
      (p) =>
        p.nama?.toLowerCase().includes(term) ||
        p.tipe?.toLowerCase().includes(term) ||
        p.kota?.toLowerCase().includes(term) ||
        (p.negara || p.Negara?.nama || '').toLowerCase().includes(term) ||
        (p.Bidangs || []).some((b) => b.jenis?.toLowerCase().includes(term))
    )
    : data.partners

  const sortedPartners = [...(filtered || [])].sort((a, b) => {
    const priorityA = getStatusPriority(a.status)
    const priorityB = getStatusPriority(b.status)
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    return (a.nama || '').localeCompare(b.nama || '')
  })

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Cari partner, kota, negara, bidang..." />
      <Table
        headers={['Partner', 'Tipe', 'Kota / Negara', 'Status', 'Aksi']}
        colWidths={['25%', '10%', '18%', '8%', '9%']}
      >
        {sortedPartners.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#8a7c6d]">
              Tidak ada partner yang cocok.
            </td>
          </tr>
        ) : (
          sortedPartners.map((item) => (
            <tr key={item.id} className="hover:bg-[#fcfaf7] transition-colors">
              <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate font-semibold text-[#241713]" title={item.nama}>{item.nama}</div>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate text-[#70675f]">{item.tipe}</div>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate text-[#70675f]">
                    {formatLocation(item.kota, item.negara || item.Negara?.nama)}
                  </div>
                </div>
              </td>
              {/* <td className="px-5 py-4">
                {item.Bidangs && item.Bidangs.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.Bidangs.map((b) => (
                      <span key={b.id} className="inline-block whitespace-nowrap rounded-md bg-[#fcf5eb] px-2 py-0.5 text-xs font-semibold text-[#8a5314]">
                        {b.jenis}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[#a3988c]">-</span>
                )}
              </td> */}
              <td className="px-5 py-4">
                <span
                  className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${(item.status || '').toLowerCase() === 'aktif'
                      ? 'bg-[#edf7ed] text-[#1e6b24]'
                      : (item.status || '').toLowerCase() === 'selesai'
                        ? 'bg-[#e3f2fd] text-[#1565c0]'
                        : 'bg-[#ffebee] text-[#c62828]'
                    }`}
                >
                  {item.status || '-'}
                </span>
              </td>
              <td className="px-5 py-4">
                <Actions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  )
}

function BidangTable({ items, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const term = search.trim().toLowerCase()
  const filtered = term
    ? items.filter((b) => b.jenis?.toLowerCase().includes(term))
    : items

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Cari bidang kerja sama..." />
      <Table
        headers={['ID', 'Nama bidang', 'Aksi']}
        colWidths={['40px', '550px', '120px']}
      >
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-5 py-10 text-center text-sm text-[#8a7c6d]">
              Tidak ada bidang yang cocok.
            </td>
          </tr>
        ) : (
          filtered.map((item) => (
            <tr key={item.id} className="hover:bg-[#fcfaf7] transition-colors">
              <td className="px-5 py-4 font-mono text-xs font-semibold text-[#8a7c6d]">#{item.id}</td>
              <td className="px-5 py-4">
                <div className="overflow-hidden">
                  <div className="truncate font-semibold text-[#241713]">{item.jenis}</div>
                </div>
              </td>
              <td className="px-5 py-4">
                <Actions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  )
}

function BidangForm({ item, onClose, onSaved, onError }) {
  const [jenis, setJenis] = useState(item?.jenis || '')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      if (item) await api.updateBidang(item.id, { jenis })
      else await api.createBidang({ jenis })
      onSaved()
    } catch (error) {
      onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={item ? 'Edit bidang' : 'Tambah bidang'} onClose={onClose}>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <Field label="Nama bidang" required>
          <Input
            value={jenis}
            onChange={(event) => setJenis(event.target.value)}
            required
            placeholder="Contoh: Lingkungan"
          />
        </Field>
        <FormActions onClose={onClose} loading={loading} />
      </form>
    </Modal>
  )
}

function PartnerForm({ item, data, negaraList, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() =>
    item
      ? {
        nama: item.nama || '',
        tipe: item.tipe || PARTNER_TIPES[0],
        negara_id: resolveNegaraId(item, negaraList),
        kota: item.kota || '',
        jenis: item.jenis || '',
        status: item.status || 'Aktif',
        deskripsi: item.deskripsi || '',
        situs1: item.situs1 || '',
      }
      : emptyPartner,
  )
  const [selectedBidangs, setSelectedBidangs] = useState(() =>
    item?.Bidangs ? item.Bidangs.map((b) => b.id) : []
  )
  const [logoItems, setLogoItems] = useMediaItems(parseImageList(item?.gambar).slice(0, 1))
  const [loading, setLoading] = useState(false)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const logos = await finalizeMediaItems(logoItems)
      const payload = {
        nama: form.nama,
        tipe: form.tipe,
        negara_id: Number(form.negara_id),
        kota: form.kota,
        jenis: form.jenis || null,
        status: form.status,
        deskripsi: form.deskripsi,
        situs1: form.situs1,
        gambar: serializeImages(logos),
        bidangIds: selectedBidangs,
      }
      if (item) await api.updatePartner(item.id, payload)
      else await api.createPartner(payload)
      onSaved()
    } catch (error) {
      onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={item ? 'Edit partner' : 'Tambah partner'} onClose={onClose}>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <FormSection title="Informasi partner" description="Data identitas dan klasifikasi mitra.">
          <Field label="Nama partner" required className="sm:col-span-2">
            <Input
              value={form.nama}
              onChange={(event) => update('nama', event.target.value)}
              required
              placeholder="Nama institusi atau organisasi"
            />
          </Field>
          <Field label="Tipe mitra" required>
            <Select value={form.tipe} onChange={(event) => update('tipe', event.target.value)} required>
              {PARTNER_TIPES.map((tipe) => (
                <option key={tipe} value={tipe}>
                  {tipe}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" required>
            <Select value={form.status} onChange={(event) => update('status', event.target.value)} required>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Bidang kerja sama" hint="Pilih satu atau beberapa bidang yang relevan." className="sm:col-span-2">
            <BidangMultiSelect
              value={selectedBidangs}
              onChange={setSelectedBidangs}
              bidangs={data?.bidangs || []}
              placeholder="Pilih bidang..."
            />
          </Field>
          <Field label="Jenis" hint="Opsional. Contoh: universitas, lembaga pemerintah, NGO." className="sm:col-span-2">
            <Input
              value={form.jenis}
              onChange={(event) => update('jenis', event.target.value)}
              placeholder="Jenis organisasi"
            />
          </Field>
        </FormSection>

        <FormSection title="Lokasi" description="Negara dan kota asal partner.">
          <Field label="Negara" required>
            <NegaraCombobox
              value={form.negara_id}
              onChange={(value) => update('negara_id', value)}
              negaraList={negaraList}
              required
            />
          </Field>
          <Field label="Kota" required>
            <Input
              value={form.kota}
              onChange={(event) => update('kota', event.target.value)}
              required
              placeholder="Contoh: Yogyakarta"
            />
          </Field>
        </FormSection>

        <FormSection title="Kontak" description="Tautan website resmi partner.">
          <Field label="Situs utama" required className="sm:col-span-2">
            <Input
              type="url"
              value={form.situs1}
              onChange={(event) => update('situs1', event.target.value)}
              required
              placeholder="https://"
            />
          </Field>
        </FormSection>

        <FormSection title="Logo & deskripsi" description="Logo partner dan ringkasan profil.">
          <Field label="Logo partner" hint="Satu gambar saja. Upload file atau tempel URL." className="sm:col-span-2">
            <PartnerLogoInput items={logoItems} onChange={setLogoItems} />
          </Field>
          <Field label="Deskripsi" className="sm:col-span-2">
            <Textarea
              value={form.deskripsi}
              onChange={(event) => update('deskripsi', event.target.value)}
              placeholder="Ringkasan profil partner"
            />
          </Field>
        </FormSection>

        <FormActions onClose={onClose} loading={loading} />
      </form>
    </Modal>
  )
}

function ProgramForm({ item, data, negaraList, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() =>
    item
      ? {
        nama: item.nama || '',
        partner_id: item.partner_id || item.Partner?.id || '',
        negara_id: resolveNegaraId(item, negaraList),
        tanggal: item.tanggal ? item.tanggal.slice(0, 10) : '',
        lokasi: item.lokasi || '',
        status: item.status || 'Aktif',
        deskripsi: item.deskripsi || '',
      }
      : emptyProgram,
  )
  const [situs, setSitus] = useState(() => {
    if (item?.situs) return item.situs
    if (!item?.dokumen) return ''
    const docs = parseDocumentList(item.dokumen)
    const webDoc = docs.find((d) => d.isWebsite || d.name?.toLowerCase().includes('website') || d.name?.toLowerCase().includes('situs'))
    if (webDoc) return webDoc.url
    try {
      const parsed = typeof item.dokumen === 'string' ? JSON.parse(item.dokumen) : item.dokumen
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.website) {
        return parsed.website
      }
    } catch { }
    return ''
  })
  const [selectedBidangs, setSelectedBidangs] = useState(() =>
    item?.Bidangs ? item.Bidangs.map((b) => b.id) : []
  )
  const [imageItems, setImageItems] = useMediaItems(parseImageList(item?.gambar))
  const [documentItems, setDocumentItems] = useDocumentItems(
    parseDocumentList(item?.dokumen).filter(
      (d) => !d.isWebsite && !d.name?.toLowerCase().includes('website') && !d.name?.toLowerCase().includes('situs')
    )
  )
  const [loading, setLoading] = useState(false)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const images = await finalizeMediaItems(imageItems)
      const documents = await finalizeMediaItems(documentItems)

      const payload = {
        nama: form.nama,
        partner_id: form.partner_id ? Number(form.partner_id) : null,
        negara_id: Number(form.negara_id),
        tanggal: form.tanggal || null,
        lokasi: form.lokasi,
        status: form.status,
        deskripsi: form.deskripsi,
        situs: situs.trim() || null,
        gambar: serializeImages(images),
        dokumen: serializeDocuments(documents),
        bidangIds: selectedBidangs,
      }
      if (item) await api.updateProgram(item.id, payload)
      else await api.createProgram(payload)
      onSaved()
    } catch (error) {
      onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={item ? 'Edit program' : 'Tambah program'} onClose={onClose}>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <FormSection title="Informasi program" description="Judul, mitra, bidang, dan status kegiatan.">
          <Field label="Nama program" required className="sm:col-span-2">
            <Input
              value={form.nama}
              onChange={(event) => update('nama', event.target.value)}
              required
              placeholder="Nama kegiatan kerja sama"
            />
          </Field>
          <Field label="Partner" required hint="Cari & pilih partner penyelenggara.">
            <PartnerCombobox
              value={form.partner_id}
              onChange={(value) => update('partner_id', value)}
              partnerList={data.partners}
              required
              placeholder="Cari partner..."
            />
          </Field>
          <Field label="Status" required>
            <Select value={form.status} onChange={(event) => update('status', event.target.value)} required>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Bidang kerja sama" hint="Pilih satu atau lebih bidang untuk program ini." className="sm:col-span-2">
            <BidangMultiSelect
              value={selectedBidangs}
              onChange={setSelectedBidangs}
              bidangs={data?.bidangs || []}
              placeholder="Pilih bidang kerja sama..."
            />
          </Field>
        </FormSection>

        <FormSection title="Waktu & lokasi" description="Negara dan detail pelaksanaan program.">
          <Field label="Negara" required hint="Pilih negara tempat program dilaksanakan.">
            <NegaraCombobox
              value={form.negara_id}
              onChange={(value) => update('negara_id', value)}
              negaraList={negaraList}
              required
            />
          </Field>
          <Field label="Tanggal">
            <Input
              type="date"
              value={form.tanggal}
              onChange={(event) => update('tanggal', event.target.value)}
            />
          </Field>
          <Field label="Lokasi" className="sm:col-span-2">
            <Input
              value={form.lokasi}
              onChange={(event) => update('lokasi', event.target.value)}
              placeholder="Contoh: Sleman, Yogyakarta"
            />
          </Field>
        </FormSection>

        <FormSection title="Media, situs & dokumen" description="Tautan website, gambar program, dan dokumen pendukung.">
          <Field label="Situs / Website Program" hint="Opsional. Tautan web resmi atau rujukan berita/informasi program." className="sm:col-span-2">
            <Input
              type="url"
              value={situs}
              onChange={(event) => setSitus(event.target.value)}
              placeholder="https://"
            />
          </Field>
          <Field label="Gambar program" hint="Maksimal 5 gambar. Upload file atau tambah URL." className="sm:col-span-2">
            <MultiImageInput items={imageItems} onChange={setImageItems} maxItems={5} />
          </Field>
          <Field label="Dokumen pendukung" hint="Upload file atau tambah URL. Ukuran maks. 10 MB per file." className="sm:col-span-2">
            <MultiDocumentInput items={documentItems} onChange={setDocumentItems} />
          </Field>
          <Field label="Deskripsi" className="sm:col-span-2">
            <Textarea
              value={form.deskripsi}
              onChange={(event) => update('deskripsi', event.target.value)}
              placeholder="Ringkasan kegiatan program"
            />
          </Field>
        </FormSection>

        <FormActions onClose={onClose} loading={loading} />
      </form>
    </Modal>
  )
}

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState({ programs: [], partners: [], bidangs: [], negara: [] })
  const [modal, setModal] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const [programs, partners, bidangs, negara] = await Promise.all([
        api.getPrograms(),
        api.getPartners(),
        api.getBidangs(),
        api.getNegara(),
      ])
      setData({ programs, partners, bidangs, negara })
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([api.getPrograms(), api.getPartners(), api.getBidangs(), api.getNegara()])
      .then(([programs, partners, bidangs, negara]) => {
        if (!cancelled) setData({ programs, partners, bidangs, negara })
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function remove(type, id) {
    if (!window.confirm('Hapus data ini? Tindakan ini tidak dapat dibatalkan.')) return
    try {
      if (type === 'program') await api.deleteProgram(id)
      if (type === 'partner') await api.deletePartner(id)
      if (type === 'bidang') await api.deleteBidang(id)
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const activeLabel = menuItems.find((item) => item.id === activeTab)?.label

  return (
    <AdminShell activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="mb-5 flex items-center gap-2 overflow-x-auto rounded-2xl border border-[#e7ddcf] bg-white p-2 lg:hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold ${activeTab === item.id ? 'bg-[#731822] text-white' : 'text-[#6b625a]'
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#7a7066]">Dashboard / {activeLabel}</p>
          <p className="mt-1 text-sm font-semibold text-[#731822]">
            Masuk sebagai {user.nama || 'admin'}
          </p>
        </div>
        {activeTab !== 'overview' && (
          <button
            type="button"
            onClick={() => setModal({ type: activeTab, item: null })}
            className="rounded-xl bg-[#731822] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c121b]"
          >
            + Tambah {activeLabel}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-[#e7b5b5] bg-[#fff6f6] px-4 py-3 text-sm text-[#a32929] break-words [overflow-wrap:anywhere]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[1.25rem] bg-white p-10 text-center text-[#70675f]">Memuat data...</div>
      ) : activeTab === 'overview' ? (
        <Overview data={data} setTab={setActiveTab} />
      ) : activeTab === 'programs' ? (
        <ProgramTable
          data={data}
          onEdit={(item) => setModal({ type: 'programs', item })}
          onDelete={(id) => remove('program', id)}
        />
      ) : activeTab === 'partners' ? (
        <PartnerTable
          data={data}
          onEdit={(item) => setModal({ type: 'partners', item })}
          onDelete={(id) => remove('partner', id)}
        />
      ) : (
        <BidangTable
          items={data.bidangs}
          onEdit={(item) => setModal({ type: 'bidangs', item })}
          onDelete={(id) => remove('bidang', id)}
        />
      )}

      {modal?.type === 'programs' && (
        <ProgramForm
          item={modal.item}
          data={data}
          negaraList={data.negara}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            loadData()
          }}
          onError={setError}
        />
      )}
      {modal?.type === 'partners' && (
        <PartnerForm
          item={modal.item}
          data={data}
          negaraList={data.negara}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            loadData()
          }}
          onError={setError}
        />
      )}
      {modal?.type === 'bidangs' && (
        <BidangForm
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            loadData()
          }}
          onError={setError}
        />
      )}
    </AdminShell>
  )
}

export default function AdminPage() {
  if (!localStorage.getItem('adminUser')) return <Navigate to="/admin/login" replace />
  return <AdminDashboardPage />
}
