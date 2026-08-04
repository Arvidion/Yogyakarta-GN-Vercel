import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, normalizePartner, normalizeProgram } from '../lib/api'
import worldTxtRaw from '../data/world.txt?raw'

// Peta nama negara: nama database (Indonesia/Inggris) → nama persis di world.txt SVG
// world.txt menggunakan dua format: name="..." dan class="..."
// Keduanya ditangkap oleh getPathCountryKeys()
const COUNTRY_NAME_MAP = {
  // ── A ──
  'Afghanistan': 'Afghanistan',
  'Albania': 'Albania',
  'Aljazair': 'Algeria',
  'Algeria': 'Algeria',
  'Angola': 'Angola',
  'Antigua dan Barbuda': 'Antigua and Barbuda',
  'Antigua and Barbuda': 'Antigua and Barbuda',
  'Argentina': 'Argentina',
  'Armenia': 'Armenia',
  'Australia': 'Australia',
  'Austria': 'Austria',
  'Azerbaijan': 'Azerbaijan',
  // ── B ──
  'Bahama': 'Bahamas',
  'Bahamas': 'Bahamas',
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
  'Cape Verde': 'Cape Verde',
  'Kamboja': 'Cambodia',
  'Cambodia': 'Cambodia',
  'Kamerun': 'Cameroon',
  'Cameroon': 'Cameroon',
  'Kanada': 'Canada',
  'Canada': 'Canada',
  'Republik Afrika Tengah': 'Central African Republic',
  'Central African Republic': 'Central African Republic',
  'Chad': 'Chad',
  'Chili': 'Chile',
  'Chile': 'Chile',
  'Cina': 'China',
  'Tiongkok': 'China',
  'China': 'China',
  'Kolombia': 'Colombia',
  'Colombia': 'Colombia',
  'Komoro': 'Comoros',
  'Comoros': 'Comoros',
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
  'Cyprus': 'Cyprus',
  'Ceko': 'Czech Republic',
  'Republik Ceko': 'Czech Republic',
  'Czech Republic': 'Czech Republic',
  // ── D ──
  'Denmark': 'Denmark',
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
  'Fiji': 'Fiji',
  'Finlandia': 'Finland',
  'Finland': 'Finland',
  'Prancis': 'France',
  'Perancis': 'France',
  'France': 'France',
  // ── G ──
  'Gabon': 'Gabon',
  'Gambia': 'The Gambia',
  'The Gambia': 'The Gambia',
  'Georgia': 'Georgia',
  'Jerman': 'Germany',
  'Germany': 'Germany',
  'Ghana': 'Ghana',
  'Yunani': 'Greece',
  'Greece': 'Greece',
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
  'Indonesia': 'Indonesia',
  'Iran': 'Iran',
  'Irak': 'Iraq',
  'Iraq': 'Iraq',
  'Irlandia': 'Ireland',
  'Ireland': 'Ireland',
  'Israel': 'Israel',
  'Italia': 'Italy',
  'Italy': 'Italy',
  // ── J ──
  'Jamaika': 'Jamaica',
  'Jamaica': 'Jamaica',
  'Jepang': 'Japan',
  'Japan': 'Japan',
  'Yordania': 'Jordan',
  'Jordan': 'Jordan',
  // ── K ──
  'Kazakhstan': 'Kazakhstan',
  'Kenya': 'Kenya',
  'Kiribati': 'Kiribati',
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
  'Liechtenstein': 'Liechtenstein',
  'Lituania': 'Lithuania',
  'Lithuania': 'Lithuania',
  'Luksemburg': 'Luxembourg',
  'Luxembourg': 'Luxembourg',
  // ── M ──
  'Madagaskar': 'Madagascar',
  'Madagascar': 'Madagascar',
  'Malawi': 'Malawi',
  'Malaysia': 'Malaysia',
  'Maladewa': 'Maldives',
  'Maldives': 'Maldives',
  'Mali': 'Mali',
  'Malta': 'Malta',
  'Kepulauan Marshall': 'Marshall Islands',
  'Marshall Islands': 'Marshall Islands',
  'Mauritania': 'Mauritania',
  'Mauritius': 'Mauritius',
  'Meksiko': 'Mexico',
  'Mexico': 'Mexico',
  'Mikronesia': 'Federated States of Micronesia',
  'Micronesia': 'Federated States of Micronesia',
  'Federated States of Micronesia': 'Federated States of Micronesia',
  'Moldova': 'Moldova',
  'Monako': 'Monaco',
  'Monaco': 'Monaco',
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
  'Kaledonia Baru': 'New Caledonia',
  'New Caledonia': 'New Caledonia',
  'Selandia Baru': 'New Zealand',
  'New Zealand': 'New Zealand',
  'Nikaragua': 'Nicaragua',
  'Nicaragua': 'Nicaragua',
  'Niger': 'Niger',
  'Nigeria': 'Nigeria',
  'Makedonia Utara': 'Macedonia',
  'North Macedonia': 'Macedonia',
  'Macedonia': 'Macedonia',
  'Norwegia': 'Norway',
  'Norway': 'Norway',
  // ── O ──
  'Oman': 'Oman',
  // ── P ──
  'Pakistan': 'Pakistan',
  'Palau': 'Palau',
  'Palestina': 'Palestine',
  'Palestine': 'Palestine',
  'Panama': 'Panama',
  'Papua Nugini': 'Papua New Guinea',
  'Papua New Guinea': 'Papua New Guinea',
  'Paraguay': 'Paraguay',
  'Peru': 'Peru',
  'Filipina': 'Philippines',
  'Philippines': 'Philippines',
  'Polandia': 'Poland',
  'Poland': 'Poland',
  'Portugal': 'Portugal',
  'Qatar': 'Qatar',
  // ── R ──
  'Rumania': 'Romania',
  'Romania': 'Romania',
  // Russia di world.txt menggunakan class="Russian Federation"
  'Rusia': 'Russian Federation',
  'Russia': 'Russian Federation',
  'Russian Federation': 'Russian Federation',
  'Rwanda': 'Rwanda',
  // ── S ──
  'Saint Kitts dan Nevis': 'Saint Kitts and Nevis',
  'Saint Kitts and Nevis': 'Saint Kitts and Nevis',
  'Saint Lucia': 'Saint Lucia',
  'Saint Vincent dan Grenadines': 'Saint Vincent and the Grenadines',
  'Saint Vincent and the Grenadines': 'Saint Vincent and the Grenadines',
  'Samoa': 'Samoa',
  'San Marino': 'San Marino',
  'São Tomé dan Príncipe': 'Sao Tomé and Principe',
  'Sao Tome and Principe': 'Sao Tomé and Principe',
  'Arab Saudi': 'Saudi Arabia',
  'Saudi Arabia': 'Saudi Arabia',
  'Senegal': 'Senegal',
  'Serbia': 'Serbia',
  'Seychelles': 'Seychelles',
  'Sierra Leone': 'Sierra Leone',
  'Singapura': 'Singapore',
  'Singapore': 'Singapore',
  'Slovakia': 'Slovakia',
  'Slovenia': 'Slovenia',
  'Kepulauan Solomon': 'Solomon Islands',
  'Solomon Islands': 'Solomon Islands',
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
  'Tonga': 'Tonga',
  'Trinidad dan Tobago': 'Trinidad and Tobago',
  'Trinidad and Tobago': 'Trinidad and Tobago',
  'Tunisia': 'Tunisia',
  'Turki': 'Turkey',
  'Turkey': 'Turkey',
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
  'United Kingdom': 'United Kingdom',
  'Amerika Serikat': 'United States',
  'United States': 'United States',
  'Uruguay': 'Uruguay',
  'Uzbekistan': 'Uzbekistan',
  // ── V ──
  'Vanuatu': 'Vanuatu',
  'Vatikan': 'Vatican City',
  'Vatican City': 'Vatican City',
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

function highlightActiveCountries(keys) {
  const world = document.querySelector('.world-map-section')
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

export default function MapSection() {
  const navigate = useNavigate()
  const [activeCountryKeys, setActiveCountryKeys] = useState(new Set())

  const worldHtml = useMemo(() => {
    return worldTxtRaw.replace(/<\?xml[\s\S]*?>\s*/g, '').trim()
  }, [])

  const handleMapClick = () => {
    navigate('/network-map')
  }

  // Fetch partners and programs, collect unique countries
  useEffect(() => {
    Promise.all([api.getPartners(), api.getPrograms()])
      .then(([partnersRaw, programsRaw]) => {
        const partners = partnersRaw.map(normalizePartner)
        const programs = programsRaw.map(normalizeProgram)

        const countrySet = new Set()

        partners.forEach((partner) => {
          const countryKey = normalizeCountryKey(partner.country)
          if (countryKey) countrySet.add(countryKey)
        })

        programs.forEach((program) => {
          const countryKey = normalizeCountryKey(program.country)
          if (countryKey) countrySet.add(countryKey)
        })

        setActiveCountryKeys(countrySet)
      })
      .catch(() => {})
  }, [])

  // Highlight active countries when data changes
  useEffect(() => {
    if (activeCountryKeys.size > 0) {
      highlightActiveCountries(activeCountryKeys)
    }
  }, [activeCountryKeys])

  // Add hover effects
  useEffect(() => {
    const world = document.querySelector('.world-map-section')
    if (!world) return

    const handleHover = (event) => {
      const path = event.target.closest('path')
      if (!path) return

      if (path.style.fill === '#c32b2b') {
        path.style.opacity = '0.85'
        path.style.cursor = 'pointer'
        path.style.filter = 'brightness(1.15)'
      }
    }

    const handleHoverLeave = (event) => {
      const path = event.target.closest('path')
      if (!path) return
      path.style.opacity = '1'
      path.style.filter = 'brightness(1)'
    }

    world.addEventListener('mouseover', handleHover)
    world.addEventListener('mouseout', handleHoverLeave)

    return () => {
      world.removeEventListener('mouseover', handleHover)
      world.removeEventListener('mouseout', handleHoverLeave)
    }
  }, [])

  return (
    <section id="map" className="bg-[#f4f3ee] px-5 py-[72px] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-7 flex flex-col gap-3">
          <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#7a6850]">Peta Wilayah</p>
          <h2 className="m-0 text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.1] tracking-[-0.04em] text-[#111]">
            Jangkauan kemitraan dan dukungan program kami secara global.
          </h2>
        </div>

        <div>
          {/* Map */}
          <div
            className="world-map-section cursor-pointer transition-all duration-300 max-h-[450px] w-full overflow-hidden flex items-center justify-center"
            onClick={handleMapClick}
            dangerouslySetInnerHTML={{ __html: worldHtml }}
          />

          {/* Legend */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#c32b2b]" />
              <span className="text-sm text-[#4d4d4d]">Negara dengan hubungan kemitraan/program</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#e8e5de]" />
              <span className="text-sm text-[#4d4d4d]">Negara lainnya</span>
            </div>
          </div>

          {/* Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleMapClick}
              className="inline-flex items-center gap-2 rounded-full bg-[#c32b2b] px-6 py-3 font-medium text-white transition-all hover:bg-[#a02424] active:scale-95"
            >
              Jelajahi Peta Interaktif
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
