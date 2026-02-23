import { Footer } from '@/components/layout/Footer';
import { Hero3D } from '@/components/landing/Hero3D';
import { ServicesGrid } from '@/components/landing/ServicesGrid';
import { BrandLogoBar } from '@/components/landing/BrandLogoBar';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { SocialMediaFloat } from '@/components/landing/SocialMediaFloat';
import { MeetingRequestSection } from '@/components/landing/MeetingRequestSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <SocialMediaFloat />
      <main>
        <Hero3D />
        <ServicesGrid />
        <BrandLogoBar />
        <TestimonialsSection />
        <MeetingRequestSection />
      </main>
      <Footer />
    </div>
  );
}
