import { API_BASE_URL } from './config'
import { getDefaultProgramImage, parseDocumentList, parseImageList, resolveMediaUrl } from './mediaUtils'

function getAuthHeader() {
  try {
    const adminUser = JSON.parse(localStorage.getItem('adminUser'))
    if (adminUser && adminUser.token) {
      return { Authorization: `Bearer ${adminUser.token}` }
    }
  } catch {}
  return {}
}

async function request(path, options = {}) {
  const authHeader = getAuthHeader()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers || {}),
    },
    ...options,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Jika token tidak valid / kedaluwarsa, hapus session dan bisa throw error
      localStorage.removeItem('adminUser')
    }
    throw new Error(payload.error || 'Permintaan ke server gagal')
  }

  return payload
}

export const api = {
  getBidangs: () => request('/bidangs'),
  createBidang: (data) => request('/bidangs', { method: 'POST', body: JSON.stringify(data) }),
  updateBidang: (id, data) => request(`/bidangs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBidang: (id) => request(`/bidangs/${id}`, { method: 'DELETE' }),
  getPartners: () => request('/partners'),
  createPartner: (data) => request('/partners', { method: 'POST', body: JSON.stringify(data) }),
  updatePartner: (id, data) => request(`/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePartner: (id) => request(`/partners/${id}`, { method: 'DELETE' }),
  getPrograms: () => request('/programs'),
  createProgram: (data) => request('/programs', { method: 'POST', body: JSON.stringify(data) }),
  updateProgram: (id, data) => request(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProgram: (id) => request(`/programs/${id}`, { method: 'DELETE' }),
  getNegara: () => request('/negara'),
  uploadFiles: async (formData) => {
    const authHeader = getAuthHeader()
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...authHeader,
      },
      body: formData,
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminUser')
      }
      throw new Error(payload.error || 'Gagal mengunggah file')
    }
    return payload
  },
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function normalizePartner(partner) {
  const images = parseImageList(partner.gambar).map(resolveMediaUrl)
  return {
    ...partner,
    name: partner.nama,
    type: partner.tipe,
    city: partner.kota,
    country: partner.negara || partner.Negara?.nama || '',
    description: partner.deskripsi || '',
    link: partner.situs1,
    logo: images[0] || null,
  }
}

export function normalizeProgram(program) {
  const fields = Array.isArray(program.bidang)
    ? program.bidang
    : (program.Bidangs || []).map((field) => field.jenis)
  let images = parseImageList(program.gambar).map(resolveMediaUrl)
  const isDefaultImage = images.length === 0
  if (isDefaultImage) {
    images = [getDefaultProgramImage(fields)]
  }

  const documents = parseDocumentList(program.dokumen).map((doc) => ({
    ...doc,
    url: resolveMediaUrl(doc.url),
  }))
  const partnerImages = parseImageList(program.Partner?.gambar).map(resolveMediaUrl)

  const webDoc = documents.find(
    (d) => d.isWebsite || d.name?.toLowerCase().includes('website') || d.name?.toLowerCase().includes('situs')
  )
  const programSitus = program.situs || webDoc?.url || null
  const partnerSitus = program.Partner?.situs1 || program.Partner?.situs2 || null
  const newsUrl = programSitus || partnerSitus || null

  return {
    ...program,
    title: program.nama || program.title || '',
    slug: `${slugify(program.nama || program.title || '')}-${program.id || ''}`,
    bidang: fields,
    date: program.tanggal,
    city: program.lokasi || '',
    country: program.negara || program.Negara?.nama || '',
    partner: program.Partner?.nama || '-',
    partnerLogo: partnerImages[0] || null,
    description: program.deskripsi || '',
    details: program.deskripsi || '',
    status: program.status || 'Aktif',
    images,
    isDefaultImage,
    documents,
    situs: programSitus,
    partnerSitus,
    newsUrl,
  }
}