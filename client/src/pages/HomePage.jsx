import HeroSection   from '../components/home/HeroSection'
import FeaturesStrip from '../components/home/FeaturesStrip'
import CategoryGrid  from '../components/home/CategoryGrid'
import HowItWorks    from '../components/home/HowItWorks'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesStrip />
      <CategoryGrid />
      <HowItWorks />
    </>
  )
}
