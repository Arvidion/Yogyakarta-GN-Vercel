import { useEffect, useState } from 'react'
import { Input } from './FormControls'
import {
  DOCUMENT_ACCEPT,
  IMAGE_ACCEPT,
  MAX_FILE_SIZE,
  createMediaItemFromFile,
  createMediaItemFromUrl,
  formatFileSize,
  prepareImageFile,
  resolveMediaUrl,
  validateFileSize,
} from '../../lib/mediaUtils'

const tabClass = (active) =>
  `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
    active ? 'bg-[#731822] text-white' : 'bg-white text-[#70675f] hover:bg-[#f7f2ea]'
  }`

function MediaPreview({ item, kind }) {
  if (kind === 'image' && (item.preview || item.url)) {
    return (
      <img
        src={resolveMediaUrl(item.preview || item.url)}
        alt={item.name}
        className="h-16 w-16 rounded-lg border border-[#ded5ca] object-cover"
      />
    )
  }

  return (
    <div className="grid h-16 w-16 place-items-center rounded-lg border border-[#ded5ca] bg-[#f7f2ea] text-[10px] font-bold uppercase tracking-wide text-[#731822]">
      DOC
    </div>
  )
}

function MediaItemRow({ item, kind, onRemove }) {
  const subtitle =
    item.source === 'file'
      ? `${formatFileSize(item.size)} · siap diunggah`
      : 'Tautan eksternal'

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#ded5ca] bg-white p-3">
      <MediaPreview item={item} kind={kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#403a35]">{item.name}</p>
        <p className="mt-0.5 text-xs text-[#8a7c6d]">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="rounded-lg bg-[#fff1ed] px-3 py-1.5 text-xs font-semibold text-[#a32929] transition hover:bg-[#ffe4dc]"
      >
        Hapus
      </button>
    </div>
  )
}

function MediaPicker({
  items,
  onChange,
  maxItems,
  kind,
  label,
  hint,
  allowMultiple = true,
}) {
  const [mode, setMode] = useState('file')
  const [urlInput, setUrlInput] = useState('')
  const [localError, setLocalError] = useState('')

  const atLimit = items.length >= maxItems

  function addItems(nextItems) {
    if (maxItems === 1) {
      items.forEach((item) => {
        if (item.preview?.startsWith('blob:')) URL.revokeObjectURL(item.preview)
      })
      onChange(nextItems.slice(0, 1))
      return
    }
    const merged = [...items, ...nextItems].slice(0, maxItems)
    onChange(merged)
  }

  async function handleFileChange(event) {
    setLocalError('')
    const selected = Array.from(event.target.files || [])
    event.target.value = ''

    if (!selected.length) return
    if (items.length + selected.length > maxItems) {
      setLocalError(`Maksimal ${maxItems} ${kind === 'image' ? 'gambar' : 'dokumen'}.`)
      return
    }

    try {
      const prepared = []
      for (const file of selected) {
        validateFileSize(file)
        if (kind === 'image') {
          prepared.push(createMediaItemFromFile(await prepareImageFile(file), kind))
        } else {
          prepared.push(createMediaItemFromFile(file, kind))
        }
      }
      addItems(prepared)
    } catch (error) {
      setLocalError(error.message)
    }
  }

  function handleAddUrl() {
    setLocalError('')
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (atLimit) {
      setLocalError(`Maksimal ${maxItems} item.`)
      return
    }

    try {
      const parsed = new URL(trimmed)
      if (kind === 'image' && !/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(parsed.pathname) && !trimmed.startsWith('data:image/')) {
        // still allow any http url for images
      }
      addItems([createMediaItemFromUrl(trimmed, kind)])
      setUrlInput('')
    } catch {
      setLocalError('URL tidak valid.')
    }
  }

  function removeItem(id) {
    const target = items.find((item) => item.id === id)
    if (target?.preview?.startsWith('blob:')) URL.revokeObjectURL(target.preview)
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabClass(mode === 'file')} onClick={() => setMode('file')}>
          Upload file
        </button>
        <button type="button" className={tabClass(mode === 'url')} onClick={() => setMode('url')}>
          Tautan URL
        </button>
      </div>

      {mode === 'file' ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8ccc0] bg-[#fcfaf7] px-4 py-6 text-center transition hover:border-[#731822] hover:bg-[#fff8f2]">
          <span className="text-sm font-semibold text-[#403a35]">{label}</span>
          <span className="mt-1 text-xs text-[#8a7c6d]">
            {hint} · maks. {formatFileSize(MAX_FILE_SIZE)}
            {kind === 'image' ? ' · gambar dikompres otomatis' : ''}
          </span>
          <span className="mt-3 rounded-lg bg-[#731822] px-3 py-1.5 text-xs font-semibold text-white">
            Pilih file
          </span>
          <input
            type="file"
            accept={kind === 'image' ? IMAGE_ACCEPT : DOCUMENT_ACCEPT}
            multiple={allowMultiple && maxItems > 1}
            disabled={atLimit}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder={kind === 'image' ? 'https://contoh.com/gambar.jpg' : 'https://contoh.com/dokumen.pdf'}
            className="mt-0"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={atLimit}
            className="rounded-xl bg-[#731822] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c121b] disabled:opacity-50"
          >
            Tambah URL
          </button>
        </div>
      )}

      {localError && <p className="text-xs text-[#a32929]">{localError}</p>}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <MediaItemRow key={item.id} item={item} kind={kind} onRemove={removeItem} />
          ))}
        </div>
      )}

      <p className="text-xs text-[#8a7c6d]">
        {items.length}/{maxItems} {kind === 'image' ? 'gambar' : 'dokumen'} dipilih
      </p>
    </div>
  )
}

export function MultiImageInput({ items, onChange, maxItems = 5 }) {
  return (
    <MediaPicker
      items={items}
      onChange={onChange}
      maxItems={maxItems}
      kind="image"
      label="Tambah gambar program"
      hint={`Hingga ${maxItems} gambar`}
      allowMultiple
    />
  )
}

export function MultiDocumentInput({ items, onChange }) {
  return (
    <MediaPicker
      items={items}
      onChange={onChange}
      maxItems={20}
      kind="document"
      label="Tambah dokumen pendukung"
      hint="PDF, Word, Excel, PowerPoint, atau TXT"
      allowMultiple
    />
  )
}

export function PartnerLogoInput({ items, onChange }) {
  return (
    <MediaPicker
      items={items}
      onChange={(nextItems) => onChange(nextItems.slice(0, 1))}
      maxItems={1}
      kind="image"
      label="Unggah logo partner"
      hint="Satu logo saja"
      allowMultiple={false}
    />
  )
}

export function useMediaItems(initialUrls = [], kind = 'image') {
  const [items, setItems] = useState(() => {
    const urls = Array.isArray(initialUrls) ? initialUrls : [initialUrls]
    return urls.map((u) => createMediaItemFromUrl(u, kind)).filter(Boolean)
  })

  useEffect(() => {
    const urls = Array.isArray(initialUrls) ? initialUrls : [initialUrls]
    setItems(urls.map((u) => createMediaItemFromUrl(u, kind)).filter(Boolean))
  }, [JSON.stringify(initialUrls)])

  return [items, setItems]
}

export function useDocumentItems(initialDocs = []) {
  const [items, setItems] = useState(() => {
    const docs = Array.isArray(initialDocs) ? initialDocs : [initialDocs]
    return docs.map((d) => createMediaItemFromUrl(d, 'document')).filter(Boolean)
  })

  useEffect(() => {
    const docs = Array.isArray(initialDocs) ? initialDocs : [initialDocs]
    setItems(docs.map((d) => createMediaItemFromUrl(d, 'document')).filter(Boolean))
  }, [JSON.stringify(initialDocs)])

  return [items, setItems]
}
