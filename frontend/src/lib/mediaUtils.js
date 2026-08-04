import { SERVER_BASE_URL } from './config'

export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
export const DOCUMENT_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export function getApiOrigin() {
  return SERVER_BASE_URL
}

export function resolveMediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  return `${getApiOrigin()}${url.startsWith('/') ? url : `/${url}`}`
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function parseJsonList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return [value]
  try {
    let parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed)
      } catch {}
    }
    if (Array.isArray(parsed)) return parsed
    if (typeof parsed === 'object' && parsed !== null) return [parsed]
    return parsed ? [parsed] : []
  } catch {
    return value ? [value] : []
  }
}

export function parseImageList(value) {
  return parseJsonList(value)
    .map((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) return item.url || item.preview || item.website || item.bukti_mou
      return null
    })
    .filter(Boolean)
}

export function parseDocumentList(value) {
  const items = parseJsonList(value)
  const result = []

  for (const item of items) {
    if (typeof item === 'string') {
      const name = item.split('/').pop() || 'Dokumen'
      result.push({ url: item, name })
    } else if (typeof item === 'object' && item !== null) {
      if (item.website) {
        result.push({ url: item.website, name: 'Situs / Website Program', isWebsite: true })
      }
      if (item.bukti_mou) {
        result.push({ url: item.bukti_mou, name: 'Bukti MoU' })
      }
      if (item.url) {
        result.push({
          url: item.url,
          name: item.name || item.url?.split('/')?.pop() || 'Dokumen',
          isWebsite: item.name?.toLowerCase().includes('website') || item.name?.toLowerCase().includes('situs'),
        })
      }
    }
  }

  return result.filter((item) => item?.url)
}

export function createMediaItemFromUrl(input, kind = 'image') {
  if (!input) return null
  const urlStr = typeof input === 'string' ? input : (input.url || input.preview || input.website || input.bukti_mou || '')
  const trimmed = String(urlStr).trim()
  if (!trimmed) return null

  const nameStr = typeof input === 'object' && input.name
    ? input.name
    : (trimmed.split('/').pop() || (kind === 'image' ? 'Gambar' : 'Dokumen'))

  return {
    id: crypto.randomUUID(),
    source: 'url',
    url: trimmed,
    name: nameStr,
    preview: kind === 'image' ? trimmed : null,
  }
}

export function createMediaItemFromFile(file, kind = 'image') {
  return {
    id: crypto.randomUUID(),
    source: 'file',
    file,
    name: file.name,
    size: file.size,
    preview: kind === 'image' ? URL.createObjectURL(file) : null,
  }
}

export function validateFileSize(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" melebihi batas maksimal 10 MB`)
  }
}

export async function compressImage(file, { maxWidth = 1920, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/gif') return file

  validateFileSize(file)

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) reject(new Error('Gagal mengompresi gambar'))
        else resolve(result)
      },
      'image/jpeg',
      quality,
    )
  })

  const compressedName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], compressedName, { type: 'image/jpeg' })
}

export async function prepareImageFile(file) {
  validateFileSize(file)
  const compressed = await compressImage(file)
  validateFileSize(compressed)
  return compressed
}

export async function finalizeMediaItems(items) {
  const pendingFiles = items.filter((item) => item.source === 'file' && item.file)
  const readyItems = items.filter((item) => item.source === 'url' && item.url)

  if (!pendingFiles.length) {
    return readyItems.map((item) => ({
      url: item.url,
      name: item.name,
    }))
  }

  const formData = new FormData()
  for (const item of pendingFiles) {
    validateFileSize(item.file)
    formData.append('files', item.file, item.file.name)
  }

  const { api } = await import('./api')
  const response = await api.uploadFiles(formData)
  const uploaded = response.files.map((file) => ({ url: file.url, name: file.name }))

  return [
    ...readyItems.map((item) => ({ url: item.url, name: item.name })),
    ...uploaded,
  ]
}

export function serializeImages(items) {
  return JSON.stringify(items.map((item) => item.url))
}

export function serializeDocuments(items) {
  return JSON.stringify(items.map((item) => ({ url: item.url, name: item.name })))
}

export function revokeMediaPreviews(items) {
  items.forEach((item) => {
    if (item.preview?.startsWith('blob:')) URL.revokeObjectURL(item.preview)
  })
}

export const BIDANG_DEFAULT_IMAGES = {
  pendidikan: 'https://cdn-icons-png.flaticon.com/128/9316/9316744.png',
  ekonomi: 'https://cdn-icons-png.flaticon.com/128/126/126191.png',
  sosial: 'https://cdn-icons-png.flaticon.com/128/17531/17531057.png',
  pariwisata: 'https://cdn-icons-png.flaticon.com/128/9417/9417291.png',
  'tata kota': 'https://cdn-icons-png.flaticon.com/128/269/269947.png',
  pertanian: 'https://cdn-icons-png.flaticon.com/128/5021/5021861.png',
  perikanan: 'https://cdn-icons-png.flaticon.com/128/811/811643.png',
  'lain-lain': 'https://cdn-icons-png.flaticon.com/128/7710/7710488.png',
}

export function getDefaultProgramImage(bidangInput) {
  const DEFAULT_IMAGE = BIDANG_DEFAULT_IMAGES['lain-lain']
  if (!bidangInput) return DEFAULT_IMAGE

  let bidangList = []
  if (Array.isArray(bidangInput)) {
    bidangList = bidangInput
  } else if (typeof bidangInput === 'string') {
    bidangList = [bidangInput]
  } else if (typeof bidangInput === 'object' && bidangInput !== null) {
    if (bidangInput.jenis) bidangList = [bidangInput.jenis]
  }

  for (const item of bidangList) {
    if (!item || typeof item !== 'string') continue
    const norm = item.trim().toLowerCase()
    if (norm.includes('pendidikan')) return BIDANG_DEFAULT_IMAGES.pendidikan
    if (norm.includes('ekonomi')) return BIDANG_DEFAULT_IMAGES.ekonomi
    if (norm.includes('sosial')) return BIDANG_DEFAULT_IMAGES.sosial
    if (norm.includes('pariwisata')) return BIDANG_DEFAULT_IMAGES.pariwisata
    if (norm.includes('tata') || norm.includes('kota')) return BIDANG_DEFAULT_IMAGES['tata kota']
    if (norm.includes('tani') || norm.includes('pertanian')) return BIDANG_DEFAULT_IMAGES.pertanian
    if (norm.includes('ikan') || norm.includes('perikanan')) return BIDANG_DEFAULT_IMAGES.perikanan
    if (norm.includes('lain')) return BIDANG_DEFAULT_IMAGES['lain-lain']
  }

  return DEFAULT_IMAGE
}

