import { Header } from './components/landing/Header';
import { Hero } from './components/landing/Hero';
import { LogoCloud } from './components/landing/LogoCloud';
import { Features } from './components/landing/Features';
import { DashboardPreview } from './components/landing/DashboardPreview';
import { Attribution } from './components/landing/Attribution';
import { Testimonials } from './components/landing/Testimonials';
import { Pricing } from './components/landing/Pricing';
import { CTA } from './components/landing/CTA';
import { Footer } from './components/landing/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <Hero />
      <LogoCloud />
      <Features />
      <DashboardPreview />
      <Attribution />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
