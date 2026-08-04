import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'
import { api, normalizePartner, normalizeProgram } from '../lib/api'
import { textClamp1, textClamp2, textSafe } from '../lib/textUtils'
import worldTxtRaw from '../data/world.txt?raw'

// Nama negara di world.txt (SVG) yang digunakan sebagai acuan highlight peta
const COUNTRY_NAME_MAP = {
  // ── A ──
  'Afghanistan': 'Afghanistan',
  'Albania': 'Albania',
  'Aljazair': 'Algeria',
  'Algeria': 'Algeria',
  'Angola': 'Angola',           // tidak ada di world.txt, tetap dipetakan
  'Antigua dan Barbuda': 'Antigua and Barbuda',
  'Antigua and Barbuda': 'Antigua and Barbuda',
  'Argentina': 'Argentina',     // tidak ada di world.txt
  'Armenia': 'Armenia',
  'Australia': 'Australia',     // tidak ada di world.txt
  'Austria': 'Austria',
  'Azerbaijan': 'Azerbaijan',   // tidak ada di world.txt
  // ── B ──
  'Bahama': 'Bahamas',
  'Bahamas': 'Bahamas',         // tidak ada di world.txt
  'Bahrain': 'Bahrain',
  'Bangladesh': 'Bangladesh',
  'Barbados': 'Barbados',
  'Belarusia': 'Belarus',
  'Belarus': 'Belarus',
  'Belgia': 'Belgium',
  'Belgium': 'Belgium',
  'Belize': 'Belize',
  'Benin': 'Benin',
  'Bhutan': 'Bhutan',
  'Bolivia': 'Bolivia',
  'Bosnia dan Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Botswana': 'Botswana',
  'Brasil': 'Brazil',
  'Brazil': 'Brazil',
  'Brunei': 'Brunei Darussalam',
  'Brunei Darussalam': 'Brunei Darussalam',
  'Bulgaria': 'Bulgaria',
  'Burkina Faso': 'Burkina Faso',
  'Burundi': 'Burundi',
  // ── C ──
  'Tanjung Verde': 'Cape Verde',
  'Cape Verde': 'Cape Verde',   // tidak ada di world.txt
  'Kamboja': 'Cambodia',
  'Cambodia': 'Cambodia',
  'Kamerun': 'Cameroon',
  'Cameroon': 'Cameroon',
  'Kanada': 'Canada',
  'Canada': 'Canada',           // tidak ada di world.txt
  'Republik Afrika Tengah': 'Central African Republic',
  'Central African Republic': 'Central African Republic',
  'Chad': 'Chad',
  'Chili': 'Chile',
  'Chile': 'Chile',             // tidak ada di world.txt
  'Cina': 'China',
  'Tiongkok': 'China',
  'China': 'China',             // tidak ada di world.txt
  'Kolombia': 'Colombia',
  'Colombia': 'Colombia',
  'Komoro': 'Comoros',
  'Comoros': 'Comoros',         // tidak ada di world.txt
  'Republik Kongo': 'Republic of Congo',
  'Kongo': 'Republic of Congo',
  'Republic of Congo': 'Republic of Congo',
  'Republik Demokratik Kongo': 'Democratic Republic of the Congo',
  'Democratic Republic of the Congo': 'Democratic Republic of the Congo',
  'Kosta Rika': 'Costa Rica',
  'Costa Rica': 'Costa Rica',
  "Pantai Gading": "Côte d'Ivoire",
  "Cote d'Ivoire": "Côte d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire",
  'Kroasia': 'Croatia',
  'Croatia': 'Croatia',
  'Kuba': 'Cuba',
  'Cuba': 'Cuba',
  'Siprus': 'Cyprus',
  'Cyprus': 'Cyprus',           // tidak ada di world.txt
  'Ceko': 'Czech Republic',
  'Republik Ceko': 'Czech Republic',
  'Czech Republic': 'Czech Republic',
  // ── D ──
  'Denmark': 'Denmark',         // tidak ada di world.txt
  'Djibouti': 'Djibouti',
  'Dominika': 'Dominica',
  'Dominica': 'Dominica',
  'Republik Dominika': 'Dominican Republic',
  'Dominican Republic': 'Dominican Republic',
  // ── E ──
  'Ekuador': 'Ecuador',
  'Ecuador': 'Ecuador',
  'Mesir': 'Egypt',
  'Egypt': 'Egypt',
  'El Salvador': 'El Salvador',
  'Guinea Khatulistiwa': 'Equatorial Guinea',
  'Equatorial Guinea': 'Equatorial Guinea',
  'Eritrea': 'Eritrea',
  'Estonia': 'Estonia',
  'Eswatini': 'Swaziland',
  'Swaziland': 'Swaziland',
  'Etiopia': 'Ethiopia',
  'Ethiopia': 'Ethiopia',
  // ── F ──
  'Fiji': 'Fiji',               // tidak ada di world.txt
  'Finlandia': 'Finland',
  'Finland': 'Finland',
  'Prancis': 'France',
  'Perancis': 'France',
  'France': 'France',           // tidak ada di world.txt
  // ── G ──
  'Gabon': 'Gabon',
  'Gambia': 'The Gambia',
  'The Gambia': 'The Gambia',
  'Georgia': 'Georgia',
  'Jerman': 'Germany',
  'Germany': 'Germany',
  'Ghana': 'Ghana',
  'Yunani': 'Greece',
  'Greece': 'Greece',           // tidak ada di world.txt
  'Grenada': 'Grenada',
  'Guatemala': 'Guatemala',
  'Guinea': 'Guinea',
  'Guinea-Bissau': 'Guinea-Bissau',
  'Guyana': 'Guyana',
  // ── H ──
  'Haiti': 'Haiti',
  'Honduras': 'Honduras',
  'Hungaria': 'Hungary',
  'Hungary': 'Hungary',
  // ── I ──
  'Islandia': 'Iceland',
  'Iceland': 'Iceland',
  'India': 'India',
  'Indonesia': 'Indonesia',     // tidak ada di world.txt (SVG terpisah)
  'Iran': 'Iran',
  'Irak': 'Iraq',
  'Iraq': 'Iraq',
  'Irlandia': 'Ireland',
  'Ireland': 'Ireland',
  'Israel': 'Israel',
  'Italia': 'Italy',
  'Italy': 'Italy',             // tidak ada di world.txt
  // ── J ──
  'Jamaika': 'Jamaica',
  'Jamaica': 'Jamaica',
  'Jepang': 'Japan',
  'Japan': 'Japan',             // tidak ada di world.txt
  'Yordania': 'Jordan',
  'Jordan': 'Jordan',
  // ── K ──
  'Kazakhstan': 'Kazakhstan',
  'Kenya': 'Kenya',
  'Kiribati': 'Kiribati',       // tidak ada di world.txt
  'Korea Utara': 'Dem. Rep. Korea',
  'North Korea': 'Dem. Rep. Korea',
  'Dem. Rep. Korea': 'Dem. Rep. Korea',
  'Korea Selatan': 'Republic of Korea',
  'South Korea': 'Republic of Korea',
  'Republic of Korea': 'Republic of Korea',
  'Kuwait': 'Kuwait',
  'Kirgizstan': 'Kyrgyzstan',
  'Kyrgyzstan': 'Kyrgyzstan',
  // ── L ──
  'Laos': 'Lao PDR',
  'Lao PDR': 'Lao PDR',
  'Latvia': 'Latvia',
  'Lebanon': 'Lebanon',
  'Lesotho': 'Lesotho',
  'Liberia': 'Liberia',
  'Libya': 'Libya',
  'Liechtenstein': 'Liechtenstein', // tidak ada di world.txt
  'Lituania': 'Lithuania',
  'Lithuania': 'Lithuania',
  'Luksemburg': 'Luxembourg',
  'Luxembourg': 'Luxembourg',
  // ── M ──
  'Madagaskar': 'Madagascar',
  'Madagascar': 'Madagascar',
  'Malawi': 'Malawi',
  'Malaysia': 'Malaysia',       // tidak ada di world.txt
  'Maladewa': 'Maldives',
  'Maldives': 'Maldives',
  'Mali': 'Mali',
  'Malta': 'Malta',             // tidak ada di world.txt
  'Kepulauan Marshall': 'Marshall Islands',
  'Marshall Islands': 'Marshall Islands',
  'Mauritania': 'Mauritania',
  'Mauritius': 'Mauritius',     // tidak ada di world.txt
  'Meksiko': 'Mexico',
  'Mexico': 'Mexico',
  'Mikronesia': 'Federated States of Micronesia',
  'Micronesia': 'Federated States of Micronesia', // tidak ada di world.txt
  'Federated States of Micronesia': 'Federated States of Micronesia',
  'Moldova': 'Moldova',
  'Monako': 'Monaco',
  'Monaco': 'Monaco',           // tidak ada di world.txt
  'Mongolia': 'Mongolia',
  'Montenegro': 'Montenegro',
  'Maroko': 'Morocco',
  'Morocco': 'Morocco',
  'Mozambik': 'Mozambique',
  'Mozambique': 'Mozambique',
  'Myanmar': 'Myanmar',
  // ── N ──
  'Namibia': 'Namibia',
  'Nauru': 'Nauru',
  'Nepal': 'Nepal',
  'Belanda': 'Netherlands',
  'Netherlands': 'Netherlands',
  'Selandia Baru': 'New Zealand', // tidak ada di world.txt
  'New Zealand': 'New Zealand',
  'Nikaragua': 'Nicaragua',
  'Nicaragua': 'Nicaragua',
  'Niger': 'Niger',
  'Nigeria': 'Nigeria',
  'Makedonia Utara': 'Macedonia',
  'North Macedonia': 'Macedonia',
  'Macedonia': 'Macedonia',
  'Norwegia': 'Norway',
  'Norway': 'Norway',           // tidak ada di world.txt
  // ── O ──
  'Oman': 'Oman',               // tidak ada di world.txt
  // ── P ──
  'Pakistan': 'Pakistan',
  'Palau': 'Palau',
  'Palestina': 'Palestine',
  'Palestine': 'Palestine',
  'Panama': 'Panama',
  'Papua Nugini': 'Papua New Guinea',
  'Papua New Guinea': 'Papua New Guinea', // tidak ada di world.txt
  'Paraguay': 'Paraguay',
  'Peru': 'Peru',
  'Filipina': 'Philippines',
  'Philippines': 'Philippines', // tidak ada di world.txt
  'Polandia': 'Poland',
  'Poland': 'Poland',
  'Portugal': 'Portugal',
  'Qatar': 'Qatar',
  // ── R ──
  'Rumania': 'Romania',
  'Romania': 'Romania',
  'Rusia': 'Russia',
  'Russia': 'Russia',           // tidak ada di world.txt
  'Rwanda': 'Rwanda',
  // ── S ──
  'Saint Kitts dan Nevis': 'Saint Kitts and Nevis',
  'Saint Kitts and Nevis': 'Saint Kitts and Nevis', // tidak ada di world.txt
  'Saint Lucia': 'Saint Lucia',
  'Saint Vincent dan Grenadines': 'Saint Vincent and the Grenadines',
  'Saint Vincent and the Grenadines': 'Saint Vincent and the Grenadines',
  'Samoa': 'Samoa',             // tidak ada di world.txt
  'San Marino': 'San Marino',   // tidak ada di world.txt
  'São Tomé dan Príncipe': 'Sao Tomé and Principe',
  'Sao Tome and Principe': 'Sao Tomé and Principe', // tidak ada di world.txt
  'Arab Saudi': 'Saudi Arabia',
  'Saudi Arabia': 'Saudi Arabia',
  'Senegal': 'Senegal',
  'Serbia': 'Serbia',
  'Seychelles': 'Seychelles',   // tidak ada di world.txt
  'Sierra Leone': 'Sierra Leone',
  'Singapura': 'Singapore',
  'Singapore': 'Singapore',     // tidak ada di world.txt
  'Slovakia': 'Slovakia',
  'Slovenia': 'Slovenia',
  'Kepulauan Solomon': 'Solomon Islands',
  'Solomon Islands': 'Solomon Islands', // tidak ada di world.txt
  'Somalia': 'Somalia',
  'Afrika Selatan': 'South Africa',
  'South Africa': 'South Africa',
  'Sudan Selatan': 'South Sudan',
  'South Sudan': 'South Sudan',
  'Spanyol': 'Spain',
  'Spain': 'Spain',
  'Sri Lanka': 'Sri Lanka',
  'Sudan': 'Sudan',
  'Suriname': 'Suriname',
  'Swedia': 'Sweden',
  'Sweden': 'Sweden',
  'Swiss': 'Switzerland',
  'Switzerland': 'Switzerland',
  'Suriah': 'Syria',
  'Syria': 'Syria',
  // ── T ──
  'Taiwan': 'Taiwan',
  'Tajikistan': 'Tajikistan',
  'Tanzania': 'Tanzania',
  'Thailand': 'Thailand',
  'Timor-Leste': 'Timor-Leste',
  'Timor Leste': 'Timor-Leste',
  'Togo': 'Togo',
  'Tonga': 'Tonga',             // tidak ada di world.txt
  'Trinidad dan Tobago': 'Trinidad and Tobago',
  'Trinidad and Tobago': 'Trinidad and Tobago', // tidak ada di world.txt
  'Tunisia': 'Tunisia',
  'Turki': 'Turkey',
  'Turkey': 'Turkey',           // tidak ada di world.txt
  'Turkmenistan': 'Turkmenistan',
  'Tuvalu': 'Tuvalu',
  // ── U ──
  'Uganda': 'Uganda',
  'Ukraina': 'Ukraine',
  'Ukraine': 'Ukraine',
  'Uni Emirat Arab': 'United Arab Emirates',
  'United Arab Emirates': 'United Arab Emirates',
  'Inggris': 'United Kingdom',
  'Britania Raya': 'United Kingdom',
  'United Kingdom': 'United Kingdom', // tidak ada di world.txt
  'Amerika Serikat': 'United States',
  'United States': 'United States',   // tidak ada di world.txt
  'Uruguay': 'Uruguay',
  'Uzbekistan': 'Uzbekistan',
  // ── V ──
  'Vanuatu': 'Vanuatu',         // tidak ada di world.txt
  'Vatikan': 'Vatican City',
  'Vatican City': 'Vatican City', // tidak ada di world.txt
  'Venezuela': 'Venezuela',
  'Vietnam': 'Vietnam',
  // ── Y ──
  'Yaman': 'Yemen',
  'Yemen': 'Yemen',
  // ── Z ──
  'Zambia': 'Zambia',
  'Zimbabwe': 'Zimbabwe',
  // ── Lainnya ──
  'Kosovo': 'Kosovo',
  'Sahara Barat': 'Western Sahara',
  'Western Sahara': 'Western Sahara',
}

function normalizeCountryName(value) {
  if (!value) return ''
  const cleaned = value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s&\s/g, ' and ')
  return COUNTRY_NAME_MAP[cleaned] || cleaned
}

function normalizeCountryKey(value) {
  return normalizeCountryName(value).toLowerCase()
}

function getPathCountryKeys(path) {
  const names = []
  const pathName = path.getAttribute('name')
  if (pathName) names.push(pathName)
  if (path.id) names.push(path.id)
  // Use raw class attribute string so multi-word names like "United States" are not split
  const rawClass = path.getAttribute('class')
  if (rawClass && rawClass.trim()) names.push(rawClass.trim())
  return names.map(normalizeCountryKey).filter(Boolean)
}

function highlightAllCountries(keys) {
  const world = document.querySelector('.world-map-detail')
  if (!world) return

  world.querySelectorAll('path').forEach((path) => {
    const pathKeys = getPathCountryKeys(path)
    const isActive = pathKeys.some((pathKey) => keys.has(pathKey))

    if (isActive) {
      path.style.fill = '#c32b2b'
      path.style.stroke = '#7f1313'
      path.style.opacity = '1'
    } else {
      path.style.fill = '#e8e5de'
      path.style.stroke = '#d7cfc3'
      path.style.opacity = '1'
    }
  })
}

function highlightCountry(countryKey, activeKeys) {
  const world = document.querySelector('.world-map-detail')
  if (!world) return

  world.querySelectorAll('path').forEach((path) => {
    const pathKeys = getPathCountryKeys(path)
    const isSelectedCountry = pathKeys.some((pathKey) => pathKey === countryKey)

    if (isSelectedCountry) {
      // Only selected country stays red
      path.style.fill = '#c32b2b'
      path.style.stroke = '#7f1313'
      path.style.opacity = '1'
    } else {
      // All other countries dim
      path.style.fill = '#e8e5de'
      path.style.stroke = '#d7cfc3'
      path.style.opacity = '1'
    }
  })

  // Collect ALL paths that belong to this country (handles archipelagos like Indonesia, US, etc.)
  const matchingPaths = []
  world.querySelectorAll('path').forEach((p) => {
    const pathKeys = getPathCountryKeys(p)
    if (pathKeys.some((k) => k === countryKey)) {
      matchingPaths.push(p)
    }
  })

  if (matchingPaths.length === 0) return

  const svg = matchingPaths[0].closest('svg')
  if (!svg) return

  // Compute union bounding box across all matching paths
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  matchingPaths.forEach((p) => {
    try {
      const bbox = p.getBBox()
      if (bbox.width === 0 && bbox.height === 0) return
      if (bbox.x < minX) minX = bbox.x
      if (bbox.y < minY) minY = bbox.y
      if (bbox.x + bbox.width > maxX) maxX = bbox.x + bbox.width
      if (bbox.y + bbox.height > maxY) maxY = bbox.y + bbox.height
    } catch {
      // getBBox may fail for hidden elements, skip
    }
  })

  if (minX === Infinity) return

  const totalW = maxX - minX
  const totalH = maxY - minY
  const padding = Math.max(totalW, totalH) * 0.9

  svg.setAttribute(
    'viewBox',
    `${minX - padding} ${minY - padding} ${totalW + padding * 2} ${totalH + padding * 2}`,
  )
}


function resetMapView() {
  const world = document.querySelector('.world-map-detail')
  if (!world) {
    return
  }
  const svg = world.querySelector('svg')
  if (svg) {
    // Reset to default viewBox
    svg.removeAttribute('viewBox')
  }
}

export default function MapDetailPage() {
  const [data, setData] = useState({ cities: [], partners: [], programs: [] })
  const [activeCountryKeys, setActiveCountryKeys] = useState(new Set())
  const [selectedCountry, setSelectedCountry] = useState(null)

  const uniqueCountries = useMemo(() => {
    if (!data.cities || data.cities.length === 0) return []
    const countryMap = new Map()
    data.cities.forEach((city) => {
      if (!countryMap.has(city.countryKey)) {
        countryMap.set(city.countryKey, {
          country: city.country,
          countryKey: city.countryKey,
          count: 0,
        })
      }
      countryMap.get(city.countryKey).count += 1
    })
    return Array.from(countryMap.values()).sort((a, b) => a.country.localeCompare(b.country))
  }, [data.cities])

  const selectedCountryData = useMemo(() => {
    if (!selectedCountry) return { partners: [], programs: [] }
    const countryName = selectedCountry.country
    const partners = data.partners.filter((p) => normalizeCountryName(p.country) === countryName)
    const programs = data.programs.filter((p) => normalizeCountryName(p.country) === countryName)
    return { partners, programs }
  }, [selectedCountry, data.partners, data.programs])

  const worldHtml = useMemo(() => {
    return worldTxtRaw.replace(/<\?xml[\s\S]*?>\s*/g, '').trim()
  }, [])

  // Fetch data
  useEffect(() => {
    Promise.all([api.getPartners(), api.getPrograms()])
      .then(([partnersRaw, programsRaw]) => {
        const partners = partnersRaw.map(normalizePartner)
        const programs = programsRaw.map(normalizeProgram)

        // Collect unique cities with their countries and sources
        const cityMap = new Map()
        const countrySet = new Set()

        partners.forEach((partner) => {
          const countryKey = normalizeCountryKey(partner.country)
          const countryName = normalizeCountryName(partner.country)
          countrySet.add(countryKey)

          const cityKey = `${partner.city}-${countryName}`
          if (!cityMap.has(cityKey)) {
            cityMap.set(cityKey, {
              city: partner.city,
              country: countryName,
              countryKey,
              types: new Set(),
            })
          }
          const cityData = cityMap.get(cityKey)
          cityData.types.add('Partner')
        })

        programs.forEach((program) => {
          const countryKey = normalizeCountryKey(program.country)
          const countryName = normalizeCountryName(program.country)
          countrySet.add(countryKey)

          const cityKey = `${program.city}-${countryName}`
          if (!cityMap.has(cityKey)) {
            cityMap.set(cityKey, {
              city: program.city,
              country: countryName,
              countryKey,
              types: new Set(),
            })
          }
          const cityData = cityMap.get(cityKey)
          cityData.types.add('Program')
        })

        const cities = Array.from(cityMap.values())
          .map((item) => ({
            ...item,
            types: Array.from(item.types),
          }))
          .sort((a, b) => a.country.localeCompare(b.country))

        setData({ cities, partners, programs, countrySet })
        setActiveCountryKeys(countrySet)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [])

  const handleCountryClick = (country) => {
    setSelectedCountry(country)
    // Use a slight delay to ensure DOM is ready
    setTimeout(() => {
      highlightCountry(country.countryKey, activeCountryKeys)
    }, 0)
  }

  const handleResetMap = () => {
    setSelectedCountry(null)
    resetMapView()
    highlightAllCountries(activeCountryKeys)
  }

  useEffect(() => {
    if (activeCountryKeys.size > 0) {
      highlightAllCountries(activeCountryKeys)
    }
  }, [activeCountryKeys, worldHtml])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f2ea] pt-24 pb-10">
        <section className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#731822]">Jelajahi</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#111] sm:text-4xl">Peta Interaktif Jangkauan Global</h1>
              <p className="mt-2 text-lg text-[#666]">Klik pada kota di daftar untuk melihat lokasi di peta. Arahkan kursor ke negara untuk melihat detail.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="rounded-[1.5rem] border border-[#e2dcd0] bg-white p-6 shadow-sm flex flex-col max-h-[400px]">
                <div
                  className="world-map-detail flex-1 flex items-center justify-center rounded-lg overflow-hidden bg-[#fafafa]"
                  dangerouslySetInnerHTML={{ __html: worldHtml }}
                />
              </div>
            </div>

            {/* Countries List */}
            <div className="lg:col-span-2">
              <div className="rounded-[1.5rem] border border-[#e2dcd0] bg-white p-6 shadow-sm max-h-[400px] flex flex-col">
                <h2 className="mb-4 text-xl font-semibold text-[#111]">Negara Terhubung</h2>
                <p className="mb-4 text-sm text-[#666]">Total: {uniqueCountries.length} negara</p>

                <div className="max-h-[500px] space-y-2 overflow-y-auto">
                  {uniqueCountries.length > 0 ? (
                    uniqueCountries.map((country, index) => (
                      <button
                        key={index}
                        onClick={() => handleCountryClick(country)}
                        className={`w-full min-w-0 overflow-hidden rounded-lg px-4 py-3 text-left transition-all ${selectedCountry?.countryKey === country.countryKey
                            ? 'bg-[#c32b2b] text-white shadow-md'
                            : 'bg-[#f5f5f5] text-[#111] hover:bg-[#e8e8e8]'
                          }`}
                      >
                        <p className="font-semibold">{country.country}</p>
                        <p className={`text-xs ${selectedCountry?.countryKey === country.countryKey ? 'text-red-100' : 'text-[#999]'}`}>
                          {country.count} {country.count === 1 ? 'lokasi' : 'lokasi'}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-[#999]">Tidak ada data negara</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detail Country - below the grid */}
          {selectedCountry && (
            <div className="mt-6 rounded-[1.5rem] border border-[#e2dcd0] bg-white p-6 shadow-sm">
              <div className="mb-6 flex min-w-0 items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#731822]">Detail</p>
                  <h3 className={`mt-2 text-2xl font-semibold text-[#111] ${textSafe}`}>{selectedCountry.country}</h3>
                </div>
                <button
                  onClick={handleResetMap}
                  className="rounded-full bg-[#c32b2b] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#a02424]"
                >
                  Reset Peta
                </button>
              </div>

              {selectedCountryData.partners.length > 0 || selectedCountryData.programs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Partners Column */}
                  {selectedCountryData.partners.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-semibold text-[#111]">Partner ({selectedCountryData.partners.length})</h4>
                      <div className="space-y-2">
                        {selectedCountryData.partners.map((partner, idx) => (
                          <div key={idx} className="min-w-0 overflow-hidden rounded-lg border border-[#e8e5de] bg-[#fafafa] p-3">
                            <p className={`font-medium text-[#111] ${textClamp2}`} title={partner.name}>
                              {partner.name}
                            </p>
                            {partner.city && <p className={`text-xs text-[#999] ${textClamp1}`}>{partner.city}</p>}
                            {partner.type && (
                              <div className={`mt-2 inline-block max-w-full rounded-full bg-[#731822] px-3 py-1 text-xs font-medium text-white ${textClamp1}`}>
                                {partner.type}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Programs Column */}
                  {selectedCountryData.programs.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-semibold text-[#111]">Program ({selectedCountryData.programs.length})</h4>
                      <div className="space-y-2">
                        {selectedCountryData.programs.map((program, idx) => (
                          <a
                            key={idx}
                            href={`/programs/${program.slug}`}
                            className="block min-w-0 overflow-hidden rounded-lg border border-[#e8e5de] bg-[#fafafa] p-3 transition-all hover:border-[#c32b2b] hover:bg-[#fff5f5]"
                          >
                            {program.city && <p className={`text-xs text-[#999] ${textClamp1}`}>{program.city}</p>}
                            {(program.title || program.nama) && (
                              <p className={`font-medium text-[#111] ${textClamp2}`} title={program.title || program.nama}>
                                {program.title || program.nama}
                              </p>
                            )}
                            {program.bidang && program.bidang.length > 0 && (
                              <div className="mt-2 flex max-w-full flex-wrap gap-1 overflow-hidden">
                                {program.bidang.map((b, bidx) => (
                                  <span
                                    key={bidx}
                                    className={`inline-block max-w-full rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 ${textClamp1}`}
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCountryData.partners.length === 0 && (
                    <p className="col-span-full text-center text-[#999]">Tidak ada partner untuk negara ini</p>
                  )}
                  {selectedCountryData.programs.length === 0 && (
                    <p className="col-span-full text-center text-[#999]">Tidak ada program untuk negara ini</p>
                  )}
                </div>
              ) : (
                <p className="text-center text-[#999]">Tidak ada data untuk negara ini</p>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 rounded-[1.5rem] border border-[#e2dcd0] bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-[#111]">Legenda</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-[#c32b2b]" />
                <span className="text-sm text-[#4d4d4d]">Negara dengan hubungan</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-[#e8e5de]" />
                <span className="text-sm text-[#4d4d4d]">Negara tanpa hubungan</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-[#c32b2b]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" />
                </svg>
                <span className="text-sm text-[#4d4d4d]">Lokasi dipilih</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
