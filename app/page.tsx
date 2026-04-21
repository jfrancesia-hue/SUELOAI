import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />

      {/* CTA Final */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-surface-50 to-surface-100" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-surface-900 mb-4">
            Empezá a construir tu<br />
            <span className="gradient-text">portafolio inmobiliario</span>
          </h2>
          <p className="text-lg text-surface-600 mb-8 max-w-xl mx-auto">
            Uníte a una nueva generación de inversores que acceden a activos reales con total transparencia.
          </p>
          <a href="/register" className="btn-primary text-base px-10 py-4">
            Crear Cuenta Gratis
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
