import HeroSection from '../sections/HeroSection'
import MapSection from '../sections/MapSection'
import ProgramSection from '../sections/ProgramSection'
import PartnerSection from '../sections/PartnerSection'
import ReadingSection from '../sections/ReadingSection'
import Footer from '../sections/Footer'

export default function HomePage() {
  return (
    <main className="home-page">
      <HeroSection />
      <MapSection />
      <ProgramSection />
      <PartnerSection />
      <ReadingSection />
      <Footer />
    </main>
  )
}
