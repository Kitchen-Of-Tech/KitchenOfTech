import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";
import { ServicesCatalog } from "@/components/services/ServicesCatalog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { sanityFetch } from "@/lib/sanity/client";
import { 
  SERVICES_QUERY, 
  SERVICE_CATEGORIES_QUERY,
  SERVICE_SUBCATEGORIES_QUERY,
  BRANDING_QUERY 
} from "@/lib/sanity/queries";
import type { Service, ServiceCategory, ServiceSubcategory, Branding } from "@/types";

export async function generateMetadata() {
  const branding = await sanityFetch<Branding>({ query: BRANDING_QUERY });
  
  return {
    title: `Services | ${branding?.siteName || "Kitchen of Tech"}`,
    description: branding?.description || "Comprehensive IT and creative solutions for your business. From web development to mobile apps, design, and digital marketing.",
    openGraph: {
      title: `Services | ${branding?.siteName || "Kitchen of Tech"}`,
      description: "Explore our comprehensive range of digital services",
      type: "website",
    },
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function ServicesPage() {
  // Fetch all data in parallel
  const [services, categories, subcategories] = await Promise.all([
    sanityFetch<Service[]>({ 
      query: SERVICES_QUERY,
      tags: ["service"],
    }),
    sanityFetch<ServiceCategory[]>({
      query: SERVICE_CATEGORIES_QUERY,
      tags: ["serviceCategory"],
    }),
    sanityFetch<ServiceSubcategory[]>({
      query: SERVICE_SUBCATEGORIES_QUERY,
      tags: ["serviceSubcategory"],
    }),
  ]);

  // Ensure we have at least empty arrays
  const displayServices = services || [];
  const displayCategories = categories || [];
  const displaySubcategories = subcategories || [];

  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-transparent" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400">
                    Comprehensive Solutions
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Transform Your Business With </span>
                  <span className="text-gradient">Our Services</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
                  From strategy to execution, we deliver cutting-edge solutions tailored to your unique needs
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-8 justify-center pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient mb-1">
                      {displayServices.length}+
                    </div>
                    <div className="text-sm text-white/60">Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient mb-1">
                      {displayCategories.length}+
                    </div>
                    <div className="text-sm text-white/60">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gradient mb-1">100%</div>
                    <div className="text-sm text-white/60">Customized</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Services Catalog */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            {displayServices.length > 0 ? (
              <ServicesCatalog
                services={displayServices}
                categories={displayCategories}
                subcategories={displaySubcategories}
              />
            ) : (
              <div className="text-center py-20">
                <GlassCard className="p-12 max-w-2xl mx-auto">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">Services Coming Soon</h3>
                    <p className="text-white/60">
                      We&apos;re currently setting up our services catalog. Check back soon!
                    </p>
                    <Link href="/meeting">
                      <GradientButton variant="primary" size="lg">
                        Schedule a Consultation
                      </GradientButton>
                    </Link>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal animation="scale-in">
              <GlassCard className="p-8 md:p-16 text-center relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
                
                <div className="relative z-10 space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Not Sure Which Service You Need?
                  </h2>
                  <p className="text-lg text-white/70 max-w-2xl mx-auto">
                    Schedule a free consultation with our team and we&apos;ll help you find the perfect solution for your business goals
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link href="/meeting">
                      <GradientButton variant="primary" size="lg">
                        Schedule Free Consultation
                      </GradientButton>
                    </Link>
                    <Link href="/contact">
                      <GradientButton variant="outline" size="lg">
                        Contact Us
                      </GradientButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>
      </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
