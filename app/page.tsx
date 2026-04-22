import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { AIAnalystDemo } from '@/components/landing/AIAnalystDemo';
import { StickyStory } from '@/components/landing/StickyStory';
import { InvestmentCalculator } from '@/components/landing/InvestmentCalculator';
import { SocialProof } from '@/components/landing/SocialProof';
import { Security } from '@/components/landing/Security';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
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
