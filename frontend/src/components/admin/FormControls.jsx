import { useEffect, useId, useRef, useState } from 'react'

const fieldClass =
  'mt-2 w-full rounded-xl border border-[#ded5ca] bg-[#fcfaf7] px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-[#731822] focus:ring-2 focus:ring-[#731822]/10'

export function Field({ label, hint, required, children, className = '' }) {
  return (
    <label className={`block text-sm font-semibold text-[#403a35] ${className}`}>
      <span>
        {label}
        {required && <span className="ml-1 text-[#731822]">*</span>}
      </span>
      {hint && <span className="mt-0.5 block text-xs font-normal text-[#8a7c6d]">{hint}</span>}
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input {...props} className={`${fieldClass} ${className}`} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select {...props} className={`${fieldClass} cursor-pointer ${className}`}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={`min-h-28 resize-y ${fieldClass} ${className}`}
    />
  )
}

export function FormSection({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-[#eee6dc] bg-[#fcfaf7]/60 p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#403a35]">{title}</h3>
        {description && <p className="mt-1 text-xs leading-5 text-[#8a7c6d]">{description}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241713]/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-[#eee6dc] pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e18624]">
              {subtitle || 'Editor data'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#171717]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f7f2ea] text-lg text-[#731822] transition hover:bg-[#eee6dc]"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function FormActions({ onClose, loading, submitLabel = 'Simpan data' }) {
  return (
    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#eee6dc] pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#70675f] transition hover:bg-[#f7f2ea]"
      >
        Batal
      </button>
      <button
        disabled={loading}
        className="rounded-xl bg-[#731822] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c121b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Menyimpan...' : submitLabel}
      </button>
    </div>
  )
}

export function NegaraCombobox({ value, onChange, negaraList, required }) {
  const listId = useId()
  const rootRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = negaraList.find((negara) => String(negara.id) === String(value))

  useEffect(() => {
    setQuery(selected?.nama || '')
  }, [selected?.id, selected?.nama])

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
        setQuery(selected?.nama || '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selected?.nama])

  const filtered = negaraList.filter((negara) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return (
      negara.nama.toLowerCase().includes(term) ||
      negara.kode_iso.toLowerCase().includes(term)
    )
  })

  function pick(negara) {
    onChange(negara.id)
    setQuery(negara.nama)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative mt-2">
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          if (!event.target.value.trim()) onChange('')
        }}
        onFocus={() => setOpen(true)}
        placeholder="Cari negara..."
        required={required && !value}
        className={fieldClass}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
      />
      {open && (
        <ul
          id={listId}
          className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[#ded5ca] bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-[#8a7c6d]">Negara tidak ditemukan.</li>
          ) : (
            filtered.map((negara) => (
              <li key={negara.id}>
                <button
                  type="button"
                  onClick={() => pick(negara)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition hover:bg-[#f7f2ea] ${String(negara.id) === String(value) ? 'bg-[#fff7f0] text-[#731822]' : 'text-[#403a35]'
                    }`}
                >
                  <span>{negara.nama}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#8a7c6d]">
                    {negara.kode_iso}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export function PartnerCombobox({ value, onChange, partnerList = [], required, placeholder = 'Cari partner...' }) {
  const listId = useId()
  const rootRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = partnerList.find((p) => String(p.id) === String(value))

  useEffect(() => {
    setQuery(selected?.nama || '')
  }, [selected?.id, selected?.nama])

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
        setQuery(selected?.nama || '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selected?.nama])

  const filtered = partnerList.filter((partner) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    const countryName = partner.negara || partner.Negara?.nama || ''
    return (
      partner.nama.toLowerCase().includes(term) ||
      (partner.kota || '').toLowerCase().includes(term) ||
      (partner.tipe || '').toLowerCase().includes(term) ||
      countryName.toLowerCase().includes(term)
    )
  })

  function pick(partner) {
    onChange(partner.id)
    setQuery(partner.nama)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative mt-2">
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          if (!event.target.value.trim()) onChange('')
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required && !value}
        className={fieldClass}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
      />
      {open && (
        <ul
          id={listId}
          className="absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[#ded5ca] bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-[#8a7c6d]">Partner tidak ditemukan.</li>
          ) : (
            filtered.map((partner) => {
              const isSelected = String(partner.id) === String(value)
              const location = [partner.kota, partner.negara || partner.Negara?.nama].filter(Boolean).join(', ')
              return (
                <li key={partner.id}>
                  <button
                    type="button"
                    onClick={() => pick(partner)}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition hover:bg-[#f7f2ea] ${
                      isSelected ? 'bg-[#fff7f0] font-semibold text-[#731822]' : 'text-[#403a35]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{partner.nama}</p>
                      {location && <p className="truncate text-xs font-normal text-[#8a7c6d]">{location}</p>}
                    </div>
                    {partner.tipe && (
                      <span className="shrink-0 rounded-md bg-[#f7f2ea] px-2 py-0.5 text-[11px] font-semibold text-[#731822]">
                        {partner.tipe}
                      </span>
                    )}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}

export function BidangMultiSelect({ value = [], onChange, bidangs = [], placeholder = 'Pilih bidang kerja sama...' }) {
  const listId = useId()
  const rootRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selectedIds = new Set((value || []).map(Number))

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = (id) => {
    const numId = Number(id)
    if (selectedIds.has(numId)) {
      onChange(value.filter((val) => Number(val) !== numId))
    } else {
      onChange([...value, numId])
    }
  }

  const selectedList = bidangs.filter((b) => selectedIds.has(Number(b.id)))
  const filtered = bidangs.filter((b) =>
    b.jenis.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div ref={rootRef} className="relative mt-2">
      <div
        onClick={() => setOpen(true)}
        className={`${fieldClass} flex min-h-[46px] cursor-pointer flex-wrap items-center gap-1.5 py-1.5`}
      >
        {selectedList.map((b) => (
          <span
            key={b.id}
            className="inline-flex items-center gap-1 rounded-lg bg-[#731822] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[#5c121b]"
          >
            <span>{b.jenis}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggle(b.id)
              }}
              className="ml-0.5 rounded text-white/80 hover:text-white"
              title="Hapus"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={selectedList.length === 0 ? placeholder : 'Cari lagi...'}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-[#403a35] outline-none placeholder:text-[#8a7c6d]"
          aria-expanded={open}
          aria-controls={listId}
        />
      </div>

      {open && (
        <div
          id={listId}
          className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[#ded5ca] bg-white py-1 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-[#eee6dc] px-3.5 py-2 text-xs font-semibold text-[#8a7c6d]">
            <span>BIDANG KERJA SAMA ({selectedList.length} DIPILIH)</span>
            {selectedList.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[#731822] hover:underline text-[11px]"
              >
                Hapus semua
              </button>
            )}
          </div>
          {filtered.length === 0 ? (
            <div className="px-3.5 py-2.5 text-sm text-[#8a7c6d]">Bidang tidak ditemukan.</div>
          ) : (
            filtered.map((b) => {
              const isSelected = selectedIds.has(Number(b.id))
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggle(b.id)}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition hover:bg-[#f7f2ea] ${isSelected ? 'bg-[#fff7f0] font-semibold text-[#731822]' : 'text-[#403a35]'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] font-bold ${isSelected ? 'border-[#731822] bg-[#731822] text-white' : 'border-[#ded5ca] bg-white'
                        }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span>{b.jenis}</span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
