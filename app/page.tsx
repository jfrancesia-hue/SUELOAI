import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';

// Below-the-fold: lazy load. Reduce ~40-50kB del first-load JS.
// Los componentes con animaciones pesadas (ScrollTrigger, chat mock) se difieren
// hasta que el usuario scrollea. SSR se mantiene para SEO.
const AIAnalystDemo = dynamic(
  () => import('@/components/landing/AIAnalystDemo').then((m) => m.AIAnalystDemo),
  { ssr: true }
);
const FeaturedProjects = dynamic(
  () => import('@/components/landing/FeaturedProjects').then((m) => m.FeaturedProjects),
  { ssr: true }
);
const TrustExperience = dynamic(
  () => import('@/components/landing/TrustExperience').then((m) => m.TrustExperience),
  { ssr: true }
);
const StickyStory = dynamic(
  () => import('@/components/landing/StickyStory').then((m) => m.StickyStory),
  { ssr: true }
);
const InvestmentCalculator = dynamic(
  () => import('@/components/landing/InvestmentCalculator').then((m) => m.InvestmentCalculator),
  { ssr: true }
);
const SocialProof = dynamic(
  () => import('@/components/landing/SocialProof').then((m) => m.SocialProof),
  { ssr: true }
);
const Security = dynamic(
  () => import('@/components/landing/Security').then((m) => m.Security),
  { ssr: true }
);
const FAQ = dynamic(
  () => import('@/components/landing/FAQ').then((m) => m.FAQ),
  { ssr: true }
);
const FinalCTA = dynamic(
  () => import('@/components/landing/FinalCTA').then((m) => m.FinalCTA),
  { ssr: true }
);

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedProjects />
      <TrustExperience />
      <Features />
      <AIAnalystDemo />
      <StickyStory />
      <InvestmentCalculator />
      <SocialProof />
      <Security />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
